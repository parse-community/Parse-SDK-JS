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

const RNStorage = require('./StorageController.react-native');
import { isLocalDatastoreKey } from './LocalDatastoreUtils';

const LocalDatastoreController = {
  async fromPinWithName(name: string): Promise<Array<Object>> {
    const values = await RNStorage.getItemAsync(name);
    if (!values) {
      return [];
    }
    const objects = JSON.parse(values);
    return objects;
  },

  async pinWithName(name: string, value: any): Promise<void> {
    try {
      const values = JSON.stringify(value);
      await RNStorage.setItemAsync(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
      console.error(e.message);
    }
  },

  unPinWithName(name: string): Promise<void> {
    return RNStorage.removeItemAsync(name);
  },

  async getAllContents(): Promise<Object> {
    const keys = await RNStorage.getAllKeysAsync();
    const batch = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (isLocalDatastoreKey(key)) {
        batch.push(key);
      }
    }
    const LDS = {};
    let results = [];
    try {
      results = await RNStorage.multiGet(batch);
    } catch (error) {
      console.error('Error getAllContents: ', error);
      return {};
    }
    results.forEach((pair) => {
      const [key, value] = pair;
      try {
        LDS[key] = JSON.parse(value);
      } catch (error) {
        LDS[key] = null;
      }
    });
    return LDS;
  },

  // Used for testing
  async getRawStorage(): Promise<Object> {
    const keys = await RNStorage.getAllKeysAsync();
    const storage = {};
    const results = await RNStorage.multiGet(keys);
    results.map((pair) => {
      const [key, value] = pair;
      storage[key] = value;
    });
    return storage;
  },

  async clear(): Promise<void> {
    const keys = await RNStorage.getAllKeysAsync();
    const batch = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (isLocalDatastoreKey(key)) {
        batch.push(key);
      }
    }
    return RNStorage.multiRemove(batch).catch(error => console.error('Error clearing local datastore: ', error));
  }
};

module.exports = LocalDatastoreController;
