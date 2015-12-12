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

module.exports = {
  async: 1,

  getItemAsync(path) {
    var p = new _ParsePromise2['default']();
    asyncLocalStorage.getItem(
      path,
      function(value) {p.resolve(value);},
      function(error) {p.reject(error);}
    );
    return p;
  },

  setItemAsync(path, value) {
    var p = new _ParsePromise2['default']();
    asyncLocalStorage.setItem(
      path,
      value,
      function()      {p.resolve(value);},
      function(error) {p.reject(error);}
    );
    return p;
  },

  removeItemAsync(path) {
    var p = new _ParsePromise2['default']();
    asyncLocalStorage.removeItem(
      path,
      function()      {p.resolve();},
      function(error) {p.reject(error);}
    );
    return p;
  },

  clear() {
    asyncLocalStorage.clear();
  }
};
