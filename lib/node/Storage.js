"use strict";

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
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


var Storage = {
  async()
  /*: boolean*/
  {
    var controller = _CoreManager.default.getStorageController();

    return !!controller.async;
  },

  getItem(path
  /*: string*/
  )
  /*: ?string*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }

    return controller.getItem(path);
  },

  getItemAsync(path
  /*: string*/
  )
  /*: Promise*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      return controller.getItemAsync(path);
    }

    return Promise.resolve(controller.getItem(path));
  },

  setItem(path
  /*: string*/
  , value
  /*: string*/
  )
  /*: void*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }

    return controller.setItem(path, value);
  },

  setItemAsync(path
  /*: string*/
  , value
  /*: string*/
  )
  /*: Promise*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      return controller.setItemAsync(path, value);
    }

    return Promise.resolve(controller.setItem(path, value));
  },

  removeItem(path
  /*: string*/
  )
  /*: void*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }

    return controller.removeItem(path);
  },

  removeItemAsync(path
  /*: string*/
  )
  /*: Promise*/
  {
    var controller = _CoreManager.default.getStorageController();

    if (controller.async === 1) {
      return controller.removeItemAsync(path);
    }

    return Promise.resolve(controller.removeItem(path));
  },

  generatePath(path
  /*: string*/
  )
  /*: string*/
  {
    if (!_CoreManager.default.get('APPLICATION_ID')) {
      throw new Error('You need to call Parse.initialize before using Parse.');
    }

    if (typeof path !== 'string') {
      throw new Error('Tried to get a Storage path that was not a String.');
    }

    if (path[0] === '/') {
      path = path.substr(1);
    }

    return 'Parse/' + _CoreManager.default.get('APPLICATION_ID') + '/' + path;
  },

  _clear() {
    var controller = _CoreManager.default.getStorageController();

    if (controller.hasOwnProperty('clear')) {
      controller.clear();
    }
  }

};
module.exports = Storage;

_CoreManager.default.setStorageController(require('./StorageController.default'));