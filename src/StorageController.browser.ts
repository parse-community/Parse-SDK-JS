/* global localStorage */

const StorageController = {
  async: 0,

  getItem(path: string): string | null {
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
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      keys.push(localStorage.key(i) as string);
    }
    return keys;
  },

  clear() {
    localStorage.clear();
  },
};

export default StorageController;
