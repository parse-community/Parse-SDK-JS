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
  fromPinWithName(name: string): Promise {
    const values = localStorage.getItem(name);
    if (!values) {
      return Promise.resolve(null);
    }
    const objects = JSON.parse(values);
    return Promise.resolve(objects);
  },

  pinWithName(name: string, value: any): Promise {
    try {
      const values = JSON.stringify(value);
      localStorage.setItem(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
      console.log(e.message); // eslint-disable-line no-console
    }
    return Promise.resolve();
  },

  unPinWithName(name: string): Promise {
    return Promise.resolve(localStorage.removeItem(name));
  },

  getAllContents(): Promise {
    const LDS = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      LDS[key] = JSON.parse(value);
    }
    return Promise.resolve(LDS);
  },

  clear(): Promise {
    return Promise.resolve(localStorage.clear());
  }
};

module.exports = LocalDatastoreController;
