const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const app = express();

// Specify the connection string for your mongodb database
// and the location to your Parse cloud code
const api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/integration',
  appId: 'integration',
  masterKey: 'notsosecret',
  serverURL: 'http://localhost:1337/parse', // Don't forget to change to https if needed
  cloud: `${__dirname}/cloud/main.js`
});

// Serve the Parse API on the /parse URL prefix
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
