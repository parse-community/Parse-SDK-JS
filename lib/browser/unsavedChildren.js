"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = unsavedChildren;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ParseFile = _interopRequireDefault(require("./ParseFile"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

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

/**
 * Return an array of unsaved children, which are either Parse Objects or Files.
 * If it encounters any dirty Objects without Ids, it will throw an exception.
 */


function unsavedChildren(obj
/*: ParseObject*/
, allowDeepUnsaved
/*:: ?: boolean*/
)
/*: Array<ParseFile | ParseObject>*/
{
  var encountered = {
    objects: {},
    files: []
  };

  var identifier = obj.className + ':' + obj._getId();

  encountered.objects[identifier] = obj.dirty() ? obj : true;
  var attributes = obj.attributes;

  for (var attr in attributes) {
    if ((0, _typeof2.default)(attributes[attr]) === 'object') {
      traverse(attributes[attr], encountered, false, !!allowDeepUnsaved);
    }
  }

  var unsaved = [];

  for (var id in encountered.objects) {
    if (id !== identifier && encountered.objects[id] !== true) {
      unsaved.push(encountered.objects[id]);
    }
  }

  return unsaved.concat(encountered.files);
}

function traverse(obj
/*: ParseObject*/
, encountered
/*: EncounterMap*/
, shouldThrow
/*: boolean*/
, allowDeepUnsaved
/*: boolean*/
) {
  if (obj instanceof _ParseObject.default) {
    if (!obj.id && shouldThrow) {
      throw new Error('Cannot create a pointer to an unsaved Object.');
    }

    var identifier = obj.className + ':' + obj._getId();

    if (!encountered.objects[identifier]) {
      encountered.objects[identifier] = obj.dirty() ? obj : true;
      var attributes = obj.attributes;

      for (var attr in attributes) {
        if ((0, _typeof2.default)(attributes[attr]) === 'object') {
          traverse(attributes[attr], encountered, !allowDeepUnsaved, allowDeepUnsaved);
        }
      }
    }

    return;
  }

  if (obj instanceof _ParseFile.default) {
    if (!obj.url() && encountered.files.indexOf(obj) < 0) {
      encountered.files.push(obj);
    }

    return;
  }

  if (obj instanceof _ParseRelation.default) {
    return;
  }

  if (Array.isArray(obj)) {
    obj.forEach(function (el) {
      if ((0, _typeof2.default)(el) === 'object') {
        traverse(el, encountered, shouldThrow, allowDeepUnsaved);
      }
    });
  }

  for (var k in obj) {
    if ((0, _typeof2.default)(obj[k]) === 'object') {
      traverse(obj[k], encountered, shouldThrow, allowDeepUnsaved);
    }
  }
}