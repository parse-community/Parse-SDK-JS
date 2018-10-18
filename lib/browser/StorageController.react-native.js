"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _CoreManager = _interopRequireDefault(require("./CoreManager"));
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


var StorageController = {
  async: 1,
  getAsyncStorage: function ()
  /*: any*/
  {
    return _CoreManager.default.getAsyncStorage();
  },
  getItemAsync: function (path
  /*: string*/
  )
  /*: Promise*/
  {
    var _this = this;

    return new Promise(function (resolve, reject) {
      _this.getAsyncStorage().getItem(path, function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },
  setItemAsync: function (path
  /*: string*/
  , value
  /*: string*/
  )
  /*: Promise*/
  {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      _this2.getAsyncStorage().setItem(path, value, function (err, value) {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  },
  removeItemAsync: function (path
  /*: string*/
  )
  /*: Promise*/
  {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.getAsyncStorage().removeItem(path, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },
  clear: function () {
    this.getAsyncStorage().clear();
  }
};
module.exports = StorageController;