"use strict";

var _Storage = _interopRequireDefault(require("./Storage"));

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


var iidCache = null;

function hexOctet() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function generateId() {
  return hexOctet() + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + '-' + hexOctet() + hexOctet() + hexOctet();
}

var InstallationController = {
  currentInstallationId()
  /*: Promise*/
  {
    if (typeof iidCache === 'string') {
      return Promise.resolve(iidCache);
    }

    var path = _Storage.default.generatePath('installationId');

    return _Storage.default.getItemAsync(path).then(iid => {
      if (!iid) {
        iid = generateId();
        return _Storage.default.setItemAsync(path, iid).then(() => {
          iidCache = iid;
          return iid;
        });
      }

      iidCache = iid;
      return iid;
    });
  },

  _clearCache() {
    iidCache = null;
  },

  _setInstallationIdCache(iid
  /*: string*/
  ) {
    iidCache = iid;
  }

};
module.exports = InstallationController;