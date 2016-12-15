var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var app = express();

// Specify the connection string for your mongodb database
// and the location to your Parse cloud code
var api = new ParseServer({
  databaseURI: 'mongodb://localhost:27017/integration',
  appId: 'integration',
  masterKey: 'notsosecret',
  serverURL: 'http://localhost:1337/parse' // Don't forget to change to https if needed
});

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

const TestUtils = require('parse-server').TestUtils;

app.get('/clear', (req, res) => {
  TestUtils.destroyAllDataPermanently().then(() => {
    res.send('{}');
  });
});

app.listen(1337, () => {
  console.log('parse-server running on port 1337.');
});
