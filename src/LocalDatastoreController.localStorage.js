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

const LocalDatastoreController = {
  fromPinWithName(name: string): ?any {
    const values = localStorage.getItem(name);
    if (!values) {
      return [];
    }
    const objects = JSON.parse(values);
    return objects;
  },

  pinWithName(name: string, objects: any) {
    try {
      const values = JSON.stringify(objects);
      localStorage.setItem(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
    }
  },

  unPinWithName(name: string) {
    localStorage.removeItem(name);
  },

  getLocalDatastore() {
    return Object.keys(localStorage).reduce((obj, str) => {
      obj[str] = localStorage.getItem(str);
      return obj;
    }, {});
  },

  clear() {
    localStorage.clear();
  }
};

module.exports = LocalDatastoreController;
