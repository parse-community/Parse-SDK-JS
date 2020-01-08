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

const Storage = {
  async(): boolean {
    const controller = CoreManager.getStorageController();
    return !!controller.async;
  },

  getItem(path: string): ?string {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error(
        'Synchronous storage is not supported by the current storage controller'
      );
    }
    return controller.getItem(path);
  },

  getItemAsync(path: string): Promise<string> {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.getItemAsync(path);
    }
    return Promise.resolve(controller.getItem(path));
  },

  setItem(path: string, value: string): void {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error(
        'Synchronous storage is not supported by the current storage controller'
      );
    }
    return controller.setItem(path, value);
  },

  setItemAsync(path: string, value: string): Promise<void> {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.setItemAsync(path, value);
    }
    return Promise.resolve(controller.setItem(path, value));
  },

  removeItem(path: string): void {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error(
        'Synchronous storage is not supported by the current storage controller'
      );
    }
    return controller.removeItem(path);
  },

  removeItemAsync(path: string): Promise<void> {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.removeItemAsync(path);
    }
    return Promise.resolve(controller.removeItem(path));
  },

  getAllKeys(): Array<string> {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      throw new Error(
        'Synchronous storage is not supported by the current storage controller'
      );
    }
    return controller.getAllKeys();
  },

  getAllKeysAsync(): Promise<Array<string>> {
    const controller = CoreManager.getStorageController();
    if (controller.async === 1) {
      return controller.getAllKeysAsync();
    }
    return Promise.resolve(controller.getAllKeys());
  },

  generatePath(path: string): string {
    if (!CoreManager.get('APPLICATION_ID')) {
      throw new Error('You need to call Parse.initialize before using Parse.');
    }
    if (typeof path !== 'string') {
      throw new Error('Tried to get a Storage path that was not a String.');
    }
    if (path[0] === '/') {
      path = path.substr(1);
    }
    return 'Parse/' + CoreManager.get('APPLICATION_ID') + '/' + path;
  },

  _clear() {
    const controller = CoreManager.getStorageController();
    if (controller.hasOwnProperty('clear')) {
      controller.clear();
    }
  }
};

module.exports = Storage;

if (process.env.PARSE_BUILD === 'react-native') {
  CoreManager.setStorageController(require('./StorageController.react-native'));
} else if (process.env.PARSE_BUILD === 'browser') {
  CoreManager.setStorageController(require('./StorageController.browser'));
} else if (process.env.PARSE_BUILD === 'weapp') {
  CoreManager.setStorageController(require('./StorageController.weapp'));
} else {
  CoreManager.setStorageController(require('./StorageController.default'));
}
