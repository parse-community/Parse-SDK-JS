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

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _reactNative = require('react-native');

module.exports = {
  async: 1,

  getItemAsync: function getItemAsync(path) {
    var p = new _ParsePromise2['default']();
    _reactNative.AsyncStorage.getItem(path, function (err, value) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  setItemAsync: function setItemAsync(path, value) {
    var p = new _ParsePromise2['default']();
    _reactNative.AsyncStorage.setItem(path, value, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  removeItemAsync: function removeItemAsync(path) {
    var p = new _ParsePromise2['default']();
    _reactNative.AsyncStorage.removeItem(path, function (err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve();
      }
    });
    return p;
  },

  clear: function clear() {
    _reactNative.AsyncStorage.clear();
  }
};