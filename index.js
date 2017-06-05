// Export the correct version of the SDK for each platform that requires 'parse'
if (typeof window === 'undefined') {
  module.exports = require('./lib/node/Parse.js');
} else if (typeof navigator === 'object' && navigator.product === 'ReactNative') {
  module.exports = require('./lib/react-native/Parse.js');
} else {
  module.exports = require('./lib/browser/Parse.js');
}
