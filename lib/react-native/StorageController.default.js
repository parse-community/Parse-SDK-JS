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

// When there is no native storage interface, we default to an in-memory map
"use strict";

var memMap = {};

module.exports = {
  async: 0,

  getItem: function getItem(path) {
    if (memMap.hasOwnProperty(path)) {
      return memMap[path];
    }
    return null;
  },

  setItem: function setItem(path, value) {
    memMap[path] = String(value);
  },

  removeItem: function removeItem(path) {
    delete memMap[path];
  },

  clear: function clear() {
    for (var key in memMap) {
      if (memMap.hasOwnProperty(key)) {
        delete memMap[key];
      }
    }
  }
};