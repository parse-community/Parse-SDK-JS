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
import Storage from './Storage';

const LocalDatastoreController = {
  async fromPinWithName(name: string): Array<Object> {
    const values = await Storage.getItemAsync(name);
    if (!values) {
      return [];
    }
    const objects = JSON.parse(values);
    return objects;
  },

  pinWithName(name: string, value: any) {
    const values = JSON.stringify(value);
    return Storage.setItemAsync(name, values);
  },

  unPinWithName(name: string) {
    return Storage.removeItemAsync(name);
  },

  async getAllContents(): Object {
    const keys = await Storage.getAllKeysAsync();
    return keys.reduce(async (previousPromise, key) => {
      const LDS = await previousPromise;
      if (isLocalDatastoreKey(key)) {
        const value = await Storage.getItemAsync(key);
        try {
          LDS[key] = JSON.parse(value);
        } catch (error) {
          console.error('Error getAllContents: ', error);
        }
      }
      return LDS;
    }, Promise.resolve({}));
  },

  // Used for testing
  async getRawStorage(): Object {
    const keys = await Storage.getAllKeysAsync();
    return keys.reduce(async (previousPromise, key) => {
      const LDS = await previousPromise;
      const value = await Storage.getItemAsync(key);
      LDS[key] = value;
      return LDS;
    }, Promise.resolve({}));
  },

  async clear(): Promise {
    const keys = await Storage.getAllKeysAsync();

    const toRemove = [];
    for(const key of keys){
      if (isLocalDatastoreKey(key)) {
        toRemove.push(key);
      }
    }
    const promises = toRemove.map(this.unPinWithName);
    return Promise.all(promises);
  }
};

module.exports = LocalDatastoreController;
