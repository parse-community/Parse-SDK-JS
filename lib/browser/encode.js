"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ParseACL = _interopRequireDefault(require("./ParseACL"));

var _ParseFile = _interopRequireDefault(require("./ParseFile"));

var _ParseGeoPoint = _interopRequireDefault(require("./ParseGeoPoint"));

var _ParsePolygon = _interopRequireDefault(require("./ParsePolygon"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _ParseOp = require("./ParseOp");

var _ParseRelation = _interopRequireDefault(require("./ParseRelation"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


var toString = Object.prototype.toString;

function encode(value
/*: mixed*/
, disallowObjects
/*: boolean*/
, forcePointers
/*: boolean*/
, seen
/*: Array<mixed>*/
)
/*: any*/
{
  if (value instanceof _ParseObject.default) {
    if (disallowObjects) {
      throw new Error('Parse Objects not allowed here');
    }

    var seenEntry = value.id ? value.className + ':' + value.id : value;

    if (forcePointers || !seen || seen.indexOf(seenEntry) > -1 || value.dirty() || Object.keys(value._getServerData()).length < 1) {
      return value.toPointer();
    }

    seen = seen.concat(seenEntry);
    return value._toFullJSON(seen);
  }

  if (value instanceof _ParseOp.Op || value instanceof _ParseACL.default || value instanceof _ParseGeoPoint.default || value instanceof _ParsePolygon.default || value instanceof _ParseRelation.default) {
    return value.toJSON();
  }

  if (value instanceof _ParseFile.default) {
    if (!value.url()) {
      throw new Error('Tried to encode an unsaved file.');
    }

    return value.toJSON();
  }

  if (toString.call(value) === '[object Date]') {
    if (isNaN(value)) {
      throw new Error('Tried to encode an invalid date.');
    }

    return {
      __type: 'Date',
      iso: value
      /*: any*/
      .toJSON()
    };
  }

  if (toString.call(value) === '[object RegExp]' && typeof value.source === 'string') {
    return value.source;
  }

  if (Array.isArray(value)) {
    return value.map(function (v) {
      return encode(v, disallowObjects, forcePointers, seen);
    });
  }

  if (value && (0, _typeof2.default)(value) === 'object') {
    var output = {};

    for (var k in value) {
      output[k] = encode(value[k], disallowObjects, forcePointers, seen);
    }

    return output;
  }

  return value;
}

function _default(value
/*: mixed*/
, disallowObjects
/*:: ?: boolean*/
, forcePointers
/*:: ?: boolean*/
, seen
/*:: ?: Array<mixed>*/
)
/*: any*/
{
  return encode(value, !!disallowObjects, !!forcePointers, seen || []);
}