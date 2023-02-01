/**
 * @flow
 */

import Storage from './Storage';
const uuidv4 = require('./uuid');

let iidCache = null;

const InstallationController = {
  currentInstallationId(): Promise<string> {
    if (typeof iidCache === 'string') {
      return Promise.resolve(iidCache);
    }
    const path = Storage.generatePath('installationId');
    return Storage.getItemAsync(path).then(iid => {
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
  },
};

module.exports = InstallationController;
