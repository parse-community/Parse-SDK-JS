import { isLocalDatastoreKey } from './LocalDatastoreUtils';
import RNStorage from './StorageController.react-native';

const LocalDatastoreController = {
  async fromPinWithName(name: string): Promise<Array<any>> {
    const values = await RNStorage.getItemAsync(name);
    if (!values) {
      return [];
    }
    const objects = JSON.parse(values);
    return objects;
  },

  async pinWithName(name: string, value: any): Promise<void> {
    try {
      const values = JSON.stringify(value);
      await RNStorage.setItemAsync(name, values);
    } catch (e) {
      // Quota exceeded, possibly due to Safari Private Browsing mode
      console.error(e.message);
    }
  },

  unPinWithName(name: string): Promise<void> {
    return RNStorage.removeItemAsync(name);
  },

  async getAllContents(): Promise<any> {
    const keys = await RNStorage.getAllKeysAsync();
    const batch: string[] = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (isLocalDatastoreKey(key)) {
        batch.push(key);
      }
    }
    const LDS = {};
    let results: any = [];
    try {
      results = await RNStorage.multiGet(batch);
    } catch (error) {
      console.error('Error getAllContents: ', error);
      return {};
    }
    results.forEach(pair => {
      const [key, value] = pair;
      try {
        LDS[key] = JSON.parse(value);
      } catch (_) {
        LDS[key] = null;
      }
    });
    return LDS;
  },

  // Used for testing
  async getRawStorage(): Promise<any> {
    const keys = await RNStorage.getAllKeysAsync();
    const storage = {};
    const results = await RNStorage.multiGet(keys as string[]);
    results!.map(pair => {
      const [key, value] = pair;
      storage[key] = value;
    });
    return storage;
  },

  async clear(): Promise<void> {
    const keys = await RNStorage.getAllKeysAsync();
    const batch: string[] = [];
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (isLocalDatastoreKey(key)) {
        batch.push(key);
      }
    }
    await RNStorage.multiRemove(batch).catch(error =>
      console.error('Error clearing local datastore: ', error)
    );
  },
};

export default LocalDatastoreController;
