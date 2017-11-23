/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

module.exports = {
  async: function async() {
    var controller = _CoreManager2['default'].getStorageController();
    return !!controller.async;
  },

  getItem: function getItem(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.getItem(path);
  },

  getItemAsync: function getItemAsync(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.getItemAsync(path);
    }
    return _ParsePromise2['default'].as(controller.getItem(path));
  },

  setItem: function setItem(path, value) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.setItem(path, value);
  },

  setItemAsync: function setItemAsync(path, value) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.setItemAsync(path, value);
    }
    return _ParsePromise2['default'].as(controller.setItem(path, value));
  },

  removeItem: function removeItem(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      throw new Error('Synchronous storage is not supported by the current storage controller');
    }
    return controller.removeItem(path);
  },

  removeItemAsync: function removeItemAsync(path) {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.async === 1) {
      return controller.removeItemAsync(path);
    }
    return _ParsePromise2['default'].as(controller.removeItem(path));
  },

  generatePath: function generatePath(path) {
    if (!_CoreManager2['default'].get('APPLICATION_ID')) {
      throw new Error('You need to call Parse.initialize before using Parse.');
    }
    if (typeof path !== 'string') {
      throw new Error('Tried to get a Storage path that was not a String.');
    }
    if (path[0] === '/') {
      path = path.substr(1);
    }
    return 'Parse/' + _CoreManager2['default'].get('APPLICATION_ID') + '/' + path;
  },

  _clear: function _clear() {
    var controller = _CoreManager2['default'].getStorageController();
    if (controller.hasOwnProperty('clear')) {
      controller.clear();
    }
  }
};

_CoreManager2['default'].setStorageController(require('./StorageController.default'));