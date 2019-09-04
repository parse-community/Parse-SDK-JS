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
import { isLocalDatastoreKey } from './LocalDatastoreUtils';

const memMap = {};
const LocalDatastoreController = {
  fromPinWithName(name: string): Array<Object> {
    if (!memMap.hasOwnProperty(name)) {
      return [];
    }
    const objects = JSON.parse(memMap[name]);
    return objects;
  },

  pinWithName(name: string, value: any) {
    const values = JSON.stringify(value);
    memMap[name] = values;
  },

  unPinWithName(name: string) {
    delete memMap[name];
  },

  getAllContents() {
    const LDS = {};
    for (const key in memMap) {
      if (memMap.hasOwnProperty(key) && isLocalDatastoreKey(key)) {
        LDS[key] = JSON.parse(memMap[key]);
      }
    }
    return LDS;
  },

  getRawStorage() {
    return memMap;
  },

  clear() {
    for (const key in memMap) {
      if (memMap.hasOwnProperty(key) && isLocalDatastoreKey(key)) {
        delete memMap[key];
      }
    }
  }
};

module.exports = LocalDatastoreController;
