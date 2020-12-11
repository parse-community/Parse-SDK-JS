/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * This is a simple wrapper to unify EventEmitter implementations across platforms.
 */

if (process.env.PARSE_BUILD === 'react-native') {
  const EventEmitter = require('../../../react-native/Libraries/vendor/emitter/EventEmitter');
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  module.exports = EventEmitter;
} else {
  module.exports = require('events').EventEmitter;
}
