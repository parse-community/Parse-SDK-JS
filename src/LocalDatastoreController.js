if (process.env.PARSE_BUILD === 'react-native') {
  module.exports = require('./LocalDatastoreController.react-native');
} else {
  module.exports = require('./LocalDatastoreController.default');
}
