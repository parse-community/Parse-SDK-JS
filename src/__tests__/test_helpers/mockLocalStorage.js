/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var mockStorage = {};
var mockLocalStorage = {

  getItem(path) {
    return mockStorage[path] || null;
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  get length() {
    return Object.keys(mockStorage).length;
  },

  key: function(i) {
    var keys = Object.keys(mockStorage);
    return keys[i] || null;
  },

  clear() {
    mockStorage = {};
  }
};

module.exports = mockLocalStorage;
