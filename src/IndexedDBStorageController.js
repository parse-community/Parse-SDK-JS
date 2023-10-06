/**
 * @flow
 */
/* global window */

import { createStore, del, set, get, clear, keys } from 'idb-keyval';

if (typeof window !== 'undefined' && window.indexedDB) {
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
  } catch (_) {
    // IndexedDB not accessible
    module.exports = undefined;
  }
} else {
  // IndexedDB not supported
  module.exports = undefined;
}
