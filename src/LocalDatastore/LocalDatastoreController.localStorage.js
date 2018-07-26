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

import ParsePromise from '../ParsePromise';

var LocalDatastoreController = {
  fromPinWithName(name: string): ?any {
    var values = localStorage.getItem(name);
    if (!values) {
      return [];
    }
    var objects = JSON.parse(values);
    return objects;
  },

  pinWithName(name: string, objects: any) {
    try {
      const values = JSON.stringify(objects);
      localStorage.setItem(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
    }
  },

  unPinWithName(name: string) {
    localStorage.removeItem(name);
  },

  clear() {
    localStorage.clear();
  }
};

module.exports = LocalDatastoreController;
