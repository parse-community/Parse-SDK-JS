/* global window */

import { createStore, del, set, get, clear, keys } from 'idb-keyval';

let IndexedDBStorageController: any;

if (typeof window !== 'undefined' && window.indexedDB) {
  try {
    const ParseStore = createStore('parseDB', 'parseStore');

    IndexedDBStorageController = {
      async: 1,
      getItemAsync(path: string) {
        return get(path, ParseStore);
      },
      setItemAsync(path: string, value: string) {
        return set(path, value, ParseStore);
      },
      removeItemAsync(path: string) {
        return del(path, ParseStore);
      },
      getAllKeysAsync() {
        return keys(ParseStore);
      },
      clear() {
        return clear(ParseStore);
      },
    };
  } catch (_) {
    // IndexedDB not accessible
    IndexedDBStorageController = undefined;
  }
} else {
  // IndexedDB not supported
  IndexedDBStorageController = undefined;
}

export default IndexedDBStorageController;
