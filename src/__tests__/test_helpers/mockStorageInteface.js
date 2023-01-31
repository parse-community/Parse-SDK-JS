let mockStorage = {};
const mockStorageInterface = {
  getItem(path) {
    return mockStorage[path] || null;
  },

  getItemAsync(path) {
    return Promise.resolve(mockStorageInterface.getItem(path));
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  setItemAsync(path, value) {
    return Promise.resolve(mockStorageInterface.setItem(path, value));
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  removeItemAsync(path) {
    return Promise.resolve(mockStorageInterface.removeItem(path));
  },

  clear() {
    mockStorage = {};
  },
};
module.exports = mockStorageInterface;
