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

var es6PromiseToParsePromise = function(es6Promise){
  var p = new _ParsePromise2['default']();
  es6Promise.then(
    function(value) {p.resolve(value);},
    function(error) {p.reject(error);}
  );
  return p;
};

module.exports = {
  async: 1,

  getItemAsync: function getItemAsync(path) {
    return es6PromiseToParsePromise(asyncLocalStorage.getItem(path));
  },

  setItemAsync: function setItemAsync(path, value) {
    return es6PromiseToParsePromise(asyncLocalStorage.setItem(path, value));
  },

  removeItemAsync: function removeItemAsync(path) {
    return es6PromiseToParsePromise(asyncLocalStorage.removeItem(path));
  },

  clear: function clear() {
    return es6PromiseToParsePromise(asyncLocalStorage.clear());
  }
};

