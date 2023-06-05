/**
 * This is a simple wrapper to unify EventEmitter implementations across platforms.
 */

if (process.env.PARSE_BUILD === 'react-native') {
  let EventEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter');
  if (EventEmitter.default) {
    EventEmitter = EventEmitter.default;
  }
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  module.exports = EventEmitter;
} else {
  module.exports = require('events').EventEmitter;
}
