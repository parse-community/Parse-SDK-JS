jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

const { SpecReporter } = require('jasmine-spec-reporter');
jasmine.getEnv().addReporter(new SpecReporter());

const ParseServer = require('parse-server').default;
const CustomAuth = require('./CustomAuth');
const sleep = require('./sleep');
const { TestUtils } = require('parse-server');
const Parse = require('../../node');

const port = 1337;
const mountPath = '/parse';
const serverURL = 'http://localhost:1337/parse';
let didChangeConfiguration = false;

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
      consumer_key: '5QiVwxr8FQHbo5CMw46Z0jquF',
      consumer_secret: 'p05FDlIRAnOtqJtjIt0xcw390jCcjj56QMdE9B52iVgOEb7LuK',
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
};

const openConnections = {};
const destroyAliveConnections = function () {
  for (const socketId in openConnections) {
    try {
      openConnections[socketId].destroy();
      delete openConnections[socketId];
    } catch (e) {
      /* */
    }
  }
};
let parseServer;
let server;

const reconfigureServer = (changedConfiguration = {}) => {
  return new Promise((resolve, reject) => {
    if (server) {
      return parseServer.handleShutdown().then(() => {
        server.close(() => {
          parseServer = undefined;
          server = undefined;
          reconfigureServer(changedConfiguration).then(resolve, reject);
        });
      });
    }
    try {
      didChangeConfiguration = Object.keys(changedConfiguration).length !== 0;
      const newConfiguration = Object.assign({}, defaultConfiguration, changedConfiguration || {}, {
        serverStartComplete: error => {
          if (error) {
            reject(error);
          } else {
            resolve(parseServer);
          }
        },
        mountPath,
        port,
      });
      parseServer = ParseServer.start(newConfiguration);
      const app = parseServer.expressApp;
      app.get('/clear/:fast', (req, res) => {
        const { fast } = req.params;
        TestUtils.destroyAllDataPermanently(fast).then(() => {
          res.send('{}');
        });
      });
      server = parseServer.server;
      server.on('connection', connection => {
        const key = `${connection.remoteAddress}:${connection.remotePort}`;
        openConnections[key] = connection;
        connection.on('close', () => {
          delete openConnections[key];
        });
      });
    } catch (error) {
      reject(error);
    }
  });
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
  destroyAliveConnections();
  // Connection close events are not immediate on node 10+... wait a bit
  await sleep(0);
  if (didChangeConfiguration) {
    await reconfigureServer();
  }
});
