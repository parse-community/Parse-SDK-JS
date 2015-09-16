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

import ParsePromise from './ParsePromise';

var StorageController = {
  async: 0,

  getItem(path: string): ?string {
    return localStorage.getItem(path);
  },

  setItem(path: string, value: string) {
    localStorage.setItem(path, value);
  },

  removeItem(path: string) {
    localStorage.removeItem(path);
  },

  clear() {
    localStorage.clear();
  }
};

module.exports = StorageController;
