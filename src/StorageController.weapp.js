/**
 * @flow
 * @private
 */

const StorageController = {
  async: 0,

  getItem(path: string): ?string {
    return wx.getStorageSync(path);
  },

  setItem(path: string, value: string) {
    try {
      wx.setStorageSync(path, value);
    } catch (e) {
      // Quota exceeded
    }
  },

  removeItem(path: string) {
    wx.removeStorageSync(path);
  },

  getAllKeys() {
    const res = wx.getStorageInfoSync();
    return res.keys;
  },

  clear() {
    wx.clearStorageSync();
  },
};

module.exports = StorageController;
