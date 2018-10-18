"use strict";
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

/* global localStorage */

var StorageController = {
  async: 0,

  getItem(path
  /*: string*/
  )
  /*: ?string*/
  {
    return localStorage.getItem(path);
  },

  setItem(path
  /*: string*/
  , value
  /*: string*/
  ) {
    try {
      localStorage.setItem(path, value);
    } catch (e) {// Quota exceeded, possibly due to Safari Private Browsing mode
    }
  },

  removeItem(path
  /*: string*/
  ) {
    localStorage.removeItem(path);
  },

  clear() {
    localStorage.clear();
  }

};
module.exports = StorageController;