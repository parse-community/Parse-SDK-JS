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

/* global localStorage */

const LocalDatastoreController = {
  fromPinWithName(name: string): ?any {
    const values = localStorage.getItem(name);
    if (!values) {
      return null;
    }
    const objects = JSON.parse(values);
    return objects;
  },

  pinWithName(name: string, value: any) {
    try {
      const values = JSON.stringify(value);
      localStorage.setItem(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
    }
  },

  unPinWithName(name: string) {
    localStorage.removeItem(name);
  },

  getAllContents() {
    const LDS = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      LDS[key] = JSON.parse(value);
    }
    return LDS;
  },

  clear() {
    localStorage.clear();
  }
};

module.exports = LocalDatastoreController;
