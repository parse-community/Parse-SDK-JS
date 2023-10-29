import type { EventEmitter as EventEmitterType } from 'events';
/**
 * This is a simple wrapper to unify EventEmitter implementations across platforms.
 */

let EventEmitter: typeof EventEmitterType;

try {
  if (process.env.PARSE_BUILD === 'react-native') {
    let RNEventEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter');
    if (RNEventEmitter.default) {
      EventEmitter = RNEventEmitter.default;
    }
    else {
      EventEmitter = RNEventEmitter;
    }
    (EventEmitter as any).prototype.on = RNEventEmitter.prototype.addListener;
  } else {
    EventEmitter = require('events').EventEmitter;
  }
} catch (_) {
  // EventEmitter unavailable
}
module.exports = EventEmitter!;
export default EventEmitter!;