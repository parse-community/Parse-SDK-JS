let mockStorage = {};
const mockRNStorage = {
  getItem(path, cb) {
    cb(undefined, mockStorage[path] || null);
  },

  setItem(path, value, cb) {
    mockStorage[path] = value;
    cb();
  },

  removeItem(path, cb) {
    delete mockStorage[path];
    cb();
  },

  getAllKeys(cb) {
    cb(undefined, Object.keys(mockStorage));
  },

  multiGet(keys, cb) {
    const objects = keys.map(key => [key, mockStorage[key]]);
    cb(undefined, objects);
  },

  multiRemove(keys, cb) {
    keys.map(key => delete mockStorage[key]);
    cb(undefined);
  },

  clear() {
    mockStorage = {};
  },
};

module.exports = mockRNStorage;
