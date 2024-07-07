jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const { SpecReporter } = require('jasmine-spec-reporter');
jasmine.getEnv().addReporter(new SpecReporter());

const ParseServer = require('parse-server').default;
const CustomAuth = require('./CustomAuth');
const { TestUtils } = require('parse-server');
const Parse = require('../../node');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
const MockEmailAdapterWithOptions = require('./support/MockEmailAdapterWithOptions');

// Ensure localhost resolves to ipv4 address first on node v17+
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const port = 1337;
const mountPath = '/parse';
const serverURL = 'http://localhost:1337/parse';
let didChangeConfiguration = false;

/*
  To generate the auth data below, the Twitter app "GitHub CI Test App" has
  been created, managed by the @ParsePlatform Twitter account. In case this
  test starts to fail because the token has become invalid, generate a new
  token according to the OAuth process described in the Twitter docs[1].

  [1] https://developer.twitter.com/en/docs/authentication/oauth-1-0a/obtaining-user-access-tokens
*/
const twitterAuthData = {
  id: '1506726799266430985',
  consumer_key: 'jeQw6luN2PEWREtoFDb0FdGYf',
  consumer_secret: 'VSFENh1X5UC4MLEuduHLtJDnf8Ydsh5KuSR4zZQufFCAGNtzcs',
  auth_token: '1506726799266430985-NKM9tqVbPXMnLhHTLYB98SNGtxxi6v',
  auth_token_secret: 'JpDVIINbqV5TK0th9nKiS1IVokZfjRj06FrXxCrkggF07',
};

const defaultConfiguration = {
  databaseURI: 'mongodb://localhost:27017/integration',
  appId: 'integration',
  masterKey: 'notsosecret',
  serverURL,
  cloud: `${__dirname}/cloud/main.js`,
  liveQuery: {
    classNames: ['TestObject', 'DiffObject'],
  },
  startLiveQueryServer: true,
  auth: {
    myAuth: {
      module: CustomAuth,
      option1: 'hello',
      option2: 'world',
    },
    facebook: {
      appIds: 'test',
    },
    twitter: {
      consumer_key: twitterAuthData.consumer_key,
      consumer_secret: twitterAuthData.consumer_secret,
      validateAuthData: () => {},
    },
  },
  verbose: false,
  silent: true,
  push: {
    android: {
      senderId: 'yolo',
      apiKey: 'yolo',
    },
  },
  idempotencyOptions: {
    paths: ['functions/CloudFunctionIdempotency', 'jobs/CloudJob1', 'classes/IdempotentTest'],
    ttl: 120,
  },
  fileUpload: {
    enableForPublic: true,
    enableForAnonymousUser: true,
    enableForAuthenticatedUser: true,
  },
  revokeSessionOnPasswordReset: false,
  allowCustomObjectId: false,
  allowClientClassCreation: true,
  encodeParseObjectInCloudFunction: true,
  emailAdapter: MockEmailAdapterWithOptions({
    fromAddress: 'parse@example.com',
    apiKey: 'k',
    domain: 'd',
  }),
};

const openConnections = {};
let parseServer;

const reconfigureServer = async (changedConfiguration = {}) => {
  if (parseServer) {
    await parseServer.handleShutdown();
    await new Promise(resolve => parseServer.server.close(resolve));
    parseServer = undefined;
    return reconfigureServer(changedConfiguration);
  }

  didChangeConfiguration = Object.keys(changedConfiguration).length !== 0;
  const newConfiguration = Object.assign({}, defaultConfiguration, changedConfiguration || {}, {
    mountPath,
    port,
  });
  parseServer = await ParseServer.startApp(newConfiguration);
  if (parseServer.config.state === 'initialized') {
    console.error('Failed to initialize Parse Server');
    return reconfigureServer(newConfiguration);
  }
  const app = parseServer.expressApp;
  for (const fileName of ['parse.js', 'parse.min.js']) {
    const file = fs.readFileSync(path.resolve(__dirname, `./../../dist/${fileName}`)).toString();
    app.get(`/${fileName}`, (_req, res) => {
      res.send(`<html><head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Parse Functionality Test</title>
          <script>${file}</script>
          <script>
            (function() {
              Parse.initialize('integration');
              Parse.serverURL = 'http://localhost:1337/parse';
            })();
          </script>
          </head>
        <body>
        </body></html>`);
    });
  }
  app.get('/clear/:fast', (req, res) => {
    const { fast } = req.params;
    TestUtils.destroyAllDataPermanently(fast).then(() => {
      res.send('{}');
    });
  });
  parseServer.server.on('connection', connection => {
    const key = `${connection.remoteAddress}:${connection.remotePort}`;
    openConnections[key] = connection;
    connection.on('close', () => {
      delete openConnections[key];
    });
  });
  return parseServer;
};
global.DiffObject = Parse.Object.extend('DiffObject');
global.Item = Parse.Object.extend('Item');
global.Parent = Parse.Object.extend('Parent');
global.Child = Parse.Object.extend('Child');
global.Container = Parse.Object.extend('Container');
global.TestPoint = Parse.Object.extend('TestPoint');
global.TestObject = Parse.Object.extend('TestObject');
global.reconfigureServer = reconfigureServer;

beforeAll(async () => {
  await reconfigureServer();
  Parse.initialize('integration');
  Parse.CoreManager.set('SERVER_URL', serverURL);
  Parse.CoreManager.set('MASTER_KEY', 'notsosecret');
});

afterEach(async () => {
  await Parse.User.logOut();
  Parse.Storage._clear();
  await TestUtils.destroyAllDataPermanently(true);
  if (didChangeConfiguration) {
    await reconfigureServer();
  }
});

afterAll(() => {
  // Jasmine process counts as one open connection
  if (Object.keys(openConnections).length > 1) {
    console.warn('There were open connections to the server left after the test finished');
  }
});

module.exports = { twitterAuthData };
