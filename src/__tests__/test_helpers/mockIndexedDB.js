/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
let mockStorage = {};
const mockStorageInterface = {
  createStore() {},

  async get(path) {
    return mockStorage[path] || null;
  },

  async set(path, value) {
    mockStorage[path] = value;
  },

  async del(path) {
    delete mockStorage[path];
  },

  async keys() {
    return Object.keys(mockStorage);
  },

  async clear() {
    mockStorage = {};
  },
};

module.exports = mockStorageInterface;
