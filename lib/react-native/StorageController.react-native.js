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
import CoreManager from './CoreManager';
var StorageController = {
  async: 1,

  getAsyncStorage()
  /*: any*/
  {
    return CoreManager.getAsyncStorage();
  },

  getItemAsync(path
  /*: string*/
  )
  /*: Promise*/
  {
    return new Promise((resolve, reject) => {
      this.getAsyncStorage().getItem(path, function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },

  setItemAsync(path
  /*: string*/
  , value
  /*: string*/
  )
  /*: Promise*/
  {
    return new Promise((resolve, reject) => {
      this.getAsyncStorage().setItem(path, value, function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },

  removeItemAsync(path
  /*: string*/
  )
  /*: Promise*/
  {
    return new Promise((resolve, reject) => {
      this.getAsyncStorage().removeItem(path, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  clear() {
    this.getAsyncStorage().clear();
  }

};
module.exports = StorageController;