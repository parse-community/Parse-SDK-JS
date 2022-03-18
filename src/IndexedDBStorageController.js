/**
 * @flow
 */

import { createStore, del, set, get, clear, keys } from 'idb-keyval';

try {
  const ParseStore = createStore('parseDB', 'parseStore');

  const IndexedDBStorageController = {
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

  module.exports = IndexedDBStorageController;
} catch (e) {
  // IndexedDB not supported
}
