let mockStorage = {};
const mockLocalStorage = {
  getItem(path) {
    return mockStorage[path] || null;
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  get length() {
    return Object.keys(mockStorage).length;
  },

  key: i => {
    const keys = Object.keys(mockStorage);
    return keys[i] || null;
  },

  clear() {
    mockStorage = {};
  },
};

module.exports = mockLocalStorage;
