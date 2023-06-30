/**
 * This is a simple wrapper to unify EventEmitter implementations across platforms.
 */

let emitter: any = null;
if (process.env.PARSE_BUILD === 'react-native') {
  let EventEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter');
  if (EventEmitter.default) {
    EventEmitter = EventEmitter.default;
  }
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  emitter = EventEmitter;
} else {
  emitter = require('events').EventEmitter;
}
module.exports = emitter;
export default emitter;
