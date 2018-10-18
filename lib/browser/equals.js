"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = equals;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ParseACL = _interopRequireDefault(require("./ParseACL"));

var _ParseFile = _interopRequireDefault(require("./ParseFile"));

var _ParseGeoPoint = _interopRequireDefault(require("./ParseGeoPoint"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */


function equals(a, b) {
  if ((0, _typeof2.default)(a) !== (0, _typeof2.default)(b)) {
    return false;
  }

  if (!a || (0, _typeof2.default)(a) !== 'object') {
    // a is a primitive
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    for (var i = a.length; i--;) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (a instanceof _ParseACL.default || a instanceof _ParseFile.default || a instanceof _ParseGeoPoint.default || a instanceof _ParseObject.default) {
    return a.equals(b);
  }

  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }

  for (var k in a) {
    if (!equals(a[k], b[k])) {
      return false;
    }
  }

  return true;
}