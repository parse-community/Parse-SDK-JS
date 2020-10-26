let mockStorage = {};
let progressCallback = () => {};

const mockWeChat = {
  getStorageSync(path) {
    return mockStorage[path];
  },

  setStorageSync(path, value) {
    mockStorage[path] = value;
  },

  removeStorageSync(path) {
    delete mockStorage[path];
  },

  getStorageInfoSync() {
    return {
      keys: Object.keys(mockStorage),
    };
  },

  clearStorageSync() {
    mockStorage = {};
  },

  request(options) {
    return {
      onProgressUpdate: (cb) => {
        progressCallback = cb;
      },
      abort: () => {
        progressCallback({
          totalBytesExpectedToWrite: 0,
          totalBytesWritten: 0,
        });
        options.success({
          statusCode: 0,
          data: {},
        });
        options.fail();
      }
    }
  }
};

module.exports = mockWeChat;
