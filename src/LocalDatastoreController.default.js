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

var memMap = {};
var LocalDatastoreController = {
  fromPinWithName(name: string): ?any {
    if (memMap.hasOwnProperty(name)) {
      return memMap[name];
    }
    return [];
  },

  pinWithName(name: string, objects: any) {
    memMap[name] = objects;
  },

  unPinWithName(name: string) {
    delete memMap[name];
  },

  getLocalDatastore() {
    return memMap;
  },

  clear() {
    for (var key in memMap) {
      if (memMap.hasOwnProperty(key)) {
        delete memMap[key];
      }
    }
  }
};

module.exports = LocalDatastoreController;
