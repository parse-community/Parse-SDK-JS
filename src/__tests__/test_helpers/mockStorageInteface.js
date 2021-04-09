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
  getItem(path) {
    return mockStorage[path] || null;
  },

  getItemAsync(path) {
    return Promise.resolve(mockStorageInterface.getItem(path));
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  setItemAsync(path, value) {
    return Promise.resolve(mockStorageInterface.setItem(path, value));
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  removeItemAsync(path) {
    return Promise.resolve(mockStorageInterface.removeItem(path));
  },

  clear() {
    mockStorage = {};
  },
};
module.exports = mockStorageInterface;
