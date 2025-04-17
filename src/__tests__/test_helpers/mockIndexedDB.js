let mockStorage = {};
const mockStorageInterface = {
  createStore() {},

  async get(path) {
    return mockStorage[path] || null;
  },

  async set(path, value) {
    mockStorage[path] = value;
  },

  async del(path) {
    delete mockStorage[path];
  },

  async keys() {
    return Object.keys(mockStorage);
  },

  async clear() {
    mockStorage = {};
  },
};

module.exports = mockStorageInterface;
