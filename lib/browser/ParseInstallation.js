/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var Installation = (function (_ParseObject) {
  _inherits(Installation, _ParseObject);

  function Installation(attributes) {
    _classCallCheck(this, Installation);

    _get(Object.getPrototypeOf(Installation.prototype), 'constructor', this).call(this, '_Installation');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
  }

  return Installation;
})(_ParseObject3['default']);

exports['default'] = Installation;

_ParseObject3['default'].registerSubclass('_Installation', Installation);
module.exports = exports['default'];