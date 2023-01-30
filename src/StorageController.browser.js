/**
 * @flow
 * @private
 */
/* global localStorage */

const StorageController = {
  async: 0,

  getItem(path: string): ?string {
    return localStorage.getItem(path);
  },

  setItem(path: string, value: string) {
    try {
      localStorage.setItem(path, value);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
      console.log(e.message);
    }
  },

  removeItem(path: string) {
    localStorage.removeItem(path);
  },

  getAllKeys() {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      keys.push(localStorage.key(i));
    }
    return keys;
  },

  clear() {
    localStorage.clear();
  },
};

module.exports = StorageController;
