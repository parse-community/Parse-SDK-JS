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

import Storage from './Storage';
const uuidv4 = require('uuid/v4');

let iidCache = null;

const InstallationController = {
  currentInstallationId(): Promise<string> {
    if (typeof iidCache === 'string') {
      return Promise.resolve(iidCache);
    }
    const path = Storage.generatePath('installationId');
    return Storage.getItemAsync(path).then((iid) => {
      if (!iid) {
        iid = uuidv4();
        return Storage.setItemAsync(path, iid).then(() => {
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

  _setInstallationIdCache(iid: string) {
    iidCache = iid;
  }
};

module.exports = InstallationController;
