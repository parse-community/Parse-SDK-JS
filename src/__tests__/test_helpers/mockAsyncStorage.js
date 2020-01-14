let mockStorage = {};
const mockAsyncStorage = {
  async: 1,
  async getItemAsync(path) {
    return mockStorage[path];
  },

  async setItemAsync(path, value) {
    mockStorage[path] = value;
  },

  async removeItemAsync(path) {
    delete mockStorage[path];
  },

  async getAllKeysAsync() {
    return Object.keys(mockStorage);
  },

  clear() {
    mockStorage = {};
  },
};

module.exports = mockAsyncStorage;
