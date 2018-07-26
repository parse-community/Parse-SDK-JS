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

var LocalDatastore = {
  fromPinWithName(name: string): ?any {
    var controller = CoreManager.getLocalDatastoreController();
    return controller.fromPinWithName(name);
  },

  pinWithName(name: string, objects: any): void {
    var controller = CoreManager.getLocalDatastoreController();
    return controller.pinWithName(name, objects);
  },

  unPinWithName(name: string): void {
    var controller = CoreManager.getLocalDatastoreController();
    return controller.unPinWithName(name);
  },

  _getLocalDatastore(): void {
    var controller = CoreManager.getLocalDatastoreController();
    controller.getLocalDatastore();
  },

  _clear(): void {
    var controller = CoreManager.getLocalDatastoreController();
    controller.clear();
  }
};

module.exports = LocalDatastore;

try {
  localStorage.setItem('parse_is_localstorage_enabled', 'parse_is_localstorage_enabled');
  localStorage.removeItem('parse_is_localstorage_enabled');
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.localStorage'));
} catch(e) {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.default'));
}
