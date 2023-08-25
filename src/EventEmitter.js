/**
 * This is a simple wrapper to unify EventEmitter implementations across platforms.
 */

let EventEmitter;

try {
  if (process.env.PARSE_BUILD === 'react-native') {
    EventEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter');
    if (EventEmitter.default) {
      EventEmitter = EventEmitter.default;
    }
    EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  } else {
    EventEmitter = require('events').EventEmitter;
  }
} catch (_) {
  // EventEmitter unavailable
}
module.exports = EventEmitter;
