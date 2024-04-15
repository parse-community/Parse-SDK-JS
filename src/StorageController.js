if (process.env.PARSE_BUILD === 'react-native') {
  module.exports = require('./StorageController.react-native');
} else if (process.env.PARSE_BUILD === 'browser') {
  module.exports = require('./StorageController.browser');
} else if (process.env.PARSE_BUILD === 'weapp') {
  module.exports = require('./StorageController.weapp');
} else {
  module.exports = require('./StorageController.default');
}
