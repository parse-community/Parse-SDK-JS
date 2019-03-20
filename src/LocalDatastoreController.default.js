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
  fromPinWithName(name: string): Promise {
    if (!memMap.hasOwnProperty(name)) {
      return Promise.resolve(null);
    }
    const objects = JSON.parse(memMap[name]);
    return Promise.resolve(objects);
  },

  pinWithName(name: string, value: any) {
    const values = JSON.stringify(value);
    memMap[name] = values;
    return Promise.resolve();
  },

  unPinWithName(name: string): Promise {
    delete memMap[name];
    return Promise.resolve();
  },

  getAllContents(): Promise {
    const LDS = {};
    for (const key in memMap) {
      if (memMap.hasOwnProperty(key) && isLocalDatastoreKey(key)) {
        LDS[key] = JSON.parse(memMap[key]);
      }
    }
    return Promise.resolve(LDS);
  },

  getRawStorage(): Promise {
    return Promise.resolve(memMap);
  },

  clear(): Promise {
    for (const key in memMap) {
      if (memMap.hasOwnProperty(key) && isLocalDatastoreKey(key)) {
        delete memMap[key];
      }
    }
    return Promise.resolve();
  }
};

module.exports = LocalDatastoreController;
