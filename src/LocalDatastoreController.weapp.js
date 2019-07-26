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

const LocalDatastoreController = {
  fromPinWithName(name: string): Array<Object> {
    const values = wx.getStorageSync(name);
    if (!values) {
      return [];
    }
    return values;
  },

  pinWithName(name: string, value: any) {
    try {
      wx.setStorageSync(name, value);
    } catch (e) {
      // Quota exceeded
    }
  },

  unPinWithName(name: string) {
    wx.removeStorageSync(name);
  },

  getAllContents(): Object {
    const res = wx.getStorageInfoSync();
    const keys = res.keys;

    const LDS = {};
    for(const key of keys){
      if (isLocalDatastoreKey(key)) {
        LDS[key] = wx.getStorageSync(key);
      }
    }
    return LDS;
  },

  getRawStorage(): Object {
    const res = wx.getStorageInfoSync();
    const keys = res.keys;

    const storage = {};
    for(const key of keys){
      storage[key] = wx.getStorageSync(key);
    }
    return storage;
  },

  clear(): Promise {
    const res = wx.getStorageInfoSync();
    const keys = res.keys;

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
