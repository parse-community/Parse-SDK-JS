/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @private
 */
import CoreManager from './CoreManager';

const StorageController = {
  async: 1,

  getItemAsync(path: string): Promise {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().getItem(path, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },

  setItemAsync(path: string, value: string): Promise {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().setItem(path, value, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },

  removeItemAsync(path: string): Promise {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().removeItem(path, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  getAllKeysAsync(): Promise {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().getAllKeys((err, keys) => {
        if (err) {
          reject(err);
        } else {
          resolve(keys);
        }
      });
    });
  },

  multiGet(keys: Array<string>): Promise<Array<Array<string>>> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().multiGet(keys, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  multiRemove(keys: Array<string>): Promise {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage().multiRemove(keys, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(keys);
        }
      });
    });
  },

  clear() {
    return CoreManager.getAsyncStorage().clear();
  },
};

module.exports = StorageController;
