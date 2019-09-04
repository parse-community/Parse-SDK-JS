const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const app = express();
const CustomAuth = require('./test/CustomAuth');

const api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/integration',
  appId: 'integration',
  masterKey: 'notsosecret',
  serverURL: 'http://localhost:1337/parse',
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
      appIds: "test"
    },
    twitter: {
      consumer_key: "5QiVwxr8FQHbo5CMw46Z0jquF",
      consumer_secret: "p05FDlIRAnOtqJtjIt0xcw390jCcjj56QMdE9B52iVgOEb7LuK",
    },
  },
  verbose: false,
  silent: true,
});

app.use('/parse', api);

const TestUtils = require('parse-server').TestUtils;

app.get('/clear', (req, res) => {
  TestUtils.destroyAllDataPermanently().then(() => {
    res.send('{}');
  });
});

module.exports = {
  app
};
