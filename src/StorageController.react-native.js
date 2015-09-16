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

import ParsePromise from './ParsePromise';
import { AsyncStorage } from 'react-native';

var StorageController = {
  async: 1,

  getItemAsync(path: string): ParsePromise {
    var p = new ParsePromise();
    AsyncStorage.getItem(path, function(err, value) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  setItemAsync(path: string, value: string): ParsePromise {
    var p = new ParsePromise();
    AsyncStorage.setItem(path, value, function(err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve(value);
      }
    });
    return p;
  },

  removeItemAsync(path: string): ParsePromise {
    var p = new ParsePromise();
    AsyncStorage.removeItem(path, function(err) {
      if (err) {
        p.reject(err);
      } else {
        p.resolve();
      }
    });
    return p;
  },

  clear() {
    AsyncStorage.clear();
  }
};

module.exports = StorageController;
