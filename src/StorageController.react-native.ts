import CoreManager from './CoreManager';

const StorageController = {
  async: 1,

  getItemAsync(path: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.getItem(path, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value || null);
        }
      });
    });
  },

  setItemAsync(path: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.setItem(path, value, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  removeItemAsync(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.removeItem(path, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  getAllKeysAsync(): Promise<readonly string[]> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.getAllKeys((err, keys) => {
        if (err) {
          reject(err);
        } else {
          resolve(keys || []);
        }
      });
    });
  },

  multiGet(keys: Array<string>): Promise<readonly [string, string | null][] | null> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.multiGet(keys, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result || null);
        }
      });
    });
  },

  multiRemove(keys: Array<string>): Promise<Array<string>> {
    return new Promise((resolve, reject) => {
      CoreManager.getAsyncStorage()!.multiRemove(keys, err => {
        if (err) {
          reject(err);
        } else {
          resolve(keys);
        }
      });
    });
  },

  clear() {
    return CoreManager.getAsyncStorage()!.clear();
  },
};

export default StorageController;
