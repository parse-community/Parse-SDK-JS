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
/* weapp */
localStorage = {
  getItem(path) {
    return wx.getStorageSync(path)
  },
  setItem(path, value) {
    return wx.setStorageSync(path, value)
  },
  removeItem(path) {
    return wx.removeStorageSync(path)
  },
  clear() {
    return wx.clearStorageSync()
  }
}

/* global localStorage */
const StorageController = {
  async: 0,

  getItem(path: string): ?string {
    return localStorage.getItem(path);
  },

  setItem(path: string, value: string) {
    try {
      localStorage.setItem(path, value);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
    }
  },

  removeItem(path: string) {
    localStorage.removeItem(path);
  },

  clear() {
    localStorage.clear();
  }
};

module.exports = StorageController;
