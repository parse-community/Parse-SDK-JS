/**
 * @flow
 * @private
 */

// When there is no native storage interface, we default to an in-memory map
const memMap = {};
const StorageController = {
  async: 0,

  getItem(path: string): ?string {
    if (memMap.hasOwnProperty(path)) {
      return memMap[path];
    }
    return null;
  },

  setItem(path: string, value: string) {
    memMap[path] = String(value);
  },

  removeItem(path: string) {
    delete memMap[path];
  },

  getAllKeys() {
    return Object.keys(memMap);
  },

  clear() {
    for (const key in memMap) {
      if (memMap.hasOwnProperty(key)) {
        delete memMap[key];
      }
    }
  },
};

module.exports = StorageController;
