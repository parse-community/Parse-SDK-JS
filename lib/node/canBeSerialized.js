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

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = canBeSerialized;

var _ParseFile = require('./ParseFile');

var _ParseFile2 = _interopRequireDefault(_ParseFile);

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseRelation = require('./ParseRelation');

var _ParseRelation2 = _interopRequireDefault(_ParseRelation);

function canBeSerialized(obj) {
  if (!(obj instanceof _ParseObject2['default'])) {
    return true;
  }
  var attributes = obj.attributes;
  for (var attr in attributes) {
    var val = attributes[attr];
    if (!canBeSerializedHelper(val)) {
      return false;
    }
  }
  return true;
}

function canBeSerializedHelper(value) {
  if (typeof value !== 'object') {
    return true;
  }
  if (value instanceof _ParseRelation2['default']) {
    return true;
  }
  if (value instanceof _ParseObject2['default']) {
    return !!value.id;
  }
  if (value instanceof _ParseFile2['default']) {
    if (value.url()) {
      return true;
    }
    return false;
  }
  if (Array.isArray(value)) {
    for (var i = 0; i < value.length; i++) {
      if (!canBeSerializedHelper(value[i])) {
        return false;
      }
    }
    return true;
  }
  for (var k in value) {
    if (!canBeSerializedHelper(value[k])) {
      return false;
    }
  }
  return true;
}
module.exports = exports['default'];