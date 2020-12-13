let mockStorage = {};
let progressCallback = () => {};
let socketOpenCallback = () => {};
let socketMessageCallback = () => {};
let socketCloseCallback = () => {};
let SocketErrorCallback = () => {};

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
      onProgressUpdate: cb => {
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
      },
    };
  },

  connectSocket() {},

  onSocketOpen(cb) {
    socketOpenCallback = cb;
  },

  onSocketMessage(cb) {
    socketMessageCallback = cb;
  },

  onSocketClose(cb) {
    socketCloseCallback = cb;
  },

  onSocketError(cb) {
    SocketErrorCallback = cb;
  },

  sendSocketMessage(data) {
    socketOpenCallback();
    socketMessageCallback(data);
  },

  closeSocket() {
    socketCloseCallback();
    SocketErrorCallback();
  },
};

module.exports = mockWeChat;
