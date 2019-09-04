/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

let mockStorage = {};
const mockRNStorage = {
  getItem(path, cb) {
    cb(undefined, mockStorage[path] || null);
  },

  setItem(path, value, cb) {
    mockStorage[path] = value;
    cb();
  },

  removeItem(path, cb) {
    delete mockStorage[path];
    cb();
  },

  getAllKeys(cb) {
    cb(undefined, Object.keys(mockStorage));
  },

  multiGet(keys, cb) {
    const objects = keys.map((key) => [key, mockStorage[key]]);
    cb(undefined, objects);
  },

  multiRemove(keys, cb) {
    keys.map((key) => delete mockStorage[key]);
    cb(undefined);
  },

  clear() {
    mockStorage = {};
  },
};

module.exports = mockRNStorage;
