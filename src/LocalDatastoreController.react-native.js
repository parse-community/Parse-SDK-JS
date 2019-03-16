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

const LocalDatastoreController = {
  async fromPinWithName(name: string): Promise {
    const values = await RNStorage.getItemAsync(name);
    if (!values) {
      return Promise.resolve(null);
    }
    const objects = JSON.parse(values);
    return Promise.resolve(objects);
  },

  async pinWithName(name: string, value: any): Promise {
    try {
      const values = JSON.stringify(value);
      await RNStorage.setItemAsync(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
      console.log(e.message); // eslint-disable-line no-console
    }
    return Promise.resolve();
  },

  async unPinWithName(name: string): Promise {
    await RNStorage.removeItemAsync(name);
    return Promise.resolve();
  },

  async getAllContents(): Promise {
    const LDS = {};
    const keys = await RNStorage.getAllKeys();
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      const value = await RNStorage.getItemAsync(key);
      LDS[key] = JSON.parse(value);
    }
    return Promise.resolve(LDS);
  },

  clear(): Promise {
    return RNStorage.clear();
  }
};

module.exports = LocalDatastoreController;
