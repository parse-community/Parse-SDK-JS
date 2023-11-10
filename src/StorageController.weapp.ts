/**
 * @flow
 * @private
 */

const StorageController = {
  async: 0,

  getItem(path: string): string | null {
    // @ts-ignore
    return wx.getStorageSync(path);
  },

  setItem(path: string, value: string) {
    try {
      // @ts-ignore
      wx.setStorageSync(path, value);
    } catch (e) {
      // Quota exceeded
    }
  },

  removeItem(path: string) {
    // @ts-ignore
    wx.removeStorageSync(path);
  },

  getAllKeys() {
    // @ts-ignore
    const res = wx.getStorageInfoSync();
    return res.keys;
  },

  clear() {
    // @ts-ignore
    wx.clearStorageSync();
  },
};

module.exports = StorageController;
