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
import { isLocalDatastoreKey } from './LocalDatastoreUtils';

const LocalDatastoreController = {
  fromPinWithName(name: string): Array<Object> {
    const values = localStorage.getItem(name);
    if (!values) {
      return [];
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
      console.log(e.message);
    }
  },

  unPinWithName(name: string) {
    localStorage.removeItem(name);
  },

  getAllContents(): Object {
    const LDS = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (isLocalDatastoreKey(key)) {
        const value = localStorage.getItem(key);
        try {
          LDS[key] = JSON.parse(value);
        } catch (error) {
          console.error('Error getAllContents: ', error);
        }
      }
    }
    return LDS;
  },

  getRawStorage(): Object {
    const storage = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      storage[key] = value;
    }
    return storage;
  },

  clear(): Promise {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (isLocalDatastoreKey(key)) {
        toRemove.push(key);
      }
    }
    const promises = toRemove.map(this.unPinWithName);
    return Promise.all(promises);
  }
};

module.exports = LocalDatastoreController;
