/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const mockRNStorageInterface = require('./test_helpers/mockRNStorage');
const mockStorageInterface = require('./test_helpers/mockStorageInteface');
const mockIndexedDB = require('./test_helpers/mockIndexedDB');
const mockWeChat = require('./test_helpers/mockWeChat');
const CoreManager = require('../CoreManager');

global.wx = mockWeChat;
global.localStorage = mockStorageInterface;
jest.mock('idb-keyval', () => {
  return mockIndexedDB;
});

const BrowserStorageController = require('../StorageController.browser');

describe('Browser StorageController', () => {
  beforeEach(() => {
    BrowserStorageController.clear();
  });

  it('is synchronous', () => {
    expect(BrowserStorageController.async).toBe(0);
    expect(typeof BrowserStorageController.getItem).toBe('function');
    expect(typeof BrowserStorageController.setItem).toBe('function');
    expect(typeof BrowserStorageController.removeItem).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(BrowserStorageController.getItem('myKey')).toBe(null);
    BrowserStorageController.setItem('myKey', 'myValue');
    expect(BrowserStorageController.getItem('myKey')).toBe('myValue');
  });

  it('can remove values', () => {
    BrowserStorageController.setItem('myKey', 'myValue');
    expect(BrowserStorageController.getItem('myKey')).toBe('myValue');
    BrowserStorageController.removeItem('myKey');
    expect(BrowserStorageController.getItem('myKey')).toBe(null);
  });
});

const RNStorageController = require('../StorageController.react-native');

describe('React Native StorageController', () => {
  beforeEach(() => {
    CoreManager.setAsyncStorage(mockRNStorageInterface);
    RNStorageController.clear();
  });

  it('is asynchronous', () => {
    expect(RNStorageController.async).toBe(1);
    expect(typeof RNStorageController.getItemAsync).toBe('function');
    expect(typeof RNStorageController.setItemAsync).toBe('function');
    expect(typeof RNStorageController.removeItemAsync).toBe('function');
  });

  it('can store and retrieve values', done => {
    RNStorageController.getItemAsync('myKey')
      .then(result => {
        expect(result).toBe(null);
        return RNStorageController.setItemAsync('myKey', 'myValue');
      })
      .then(() => {
        return RNStorageController.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe('myValue');
        done();
      });
  });

  it('can remove values', done => {
    RNStorageController.setItemAsync('myKey', 'myValue')
      .then(() => {
        return RNStorageController.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe('myValue');
        return RNStorageController.removeItemAsync('myKey');
      })
      .then(() => {
        return RNStorageController.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe(null);
        done();
      });
  });

  it('can getAllKeys', done => {
    RNStorageController.setItemAsync('myKey', 'myValue')
      .then(() => {
        return RNStorageController.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe('myValue');
        return RNStorageController.getAllKeysAsync();
      })
      .then(keys => {
        expect(keys[0]).toBe('myKey');
        done();
      });
  });

  it('can handle set error', done => {
    const mockRNError = {
      setItem(path, value, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.setItemAsync('myKey', 'myValue').catch(error => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle get error', done => {
    const mockRNError = {
      getItem(path, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.getItemAsync('myKey').catch(error => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle remove error', done => {
    const mockRNError = {
      removeItem(path, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.removeItemAsync('myKey').catch(error => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle getAllKeys error', done => {
    const mockRNError = {
      getAllKeys(cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.getAllKeysAsync().catch(error => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });
});

const IndexedDBStorageController = require('../IndexedDBStorageController');

describe('React Native StorageController', () => {
  beforeEach(() => {
    IndexedDBStorageController.clear();
  });

  it('is asynchronous', () => {
    expect(IndexedDBStorageController.async).toBe(1);
    expect(typeof IndexedDBStorageController.getItemAsync).toBe('function');
    expect(typeof IndexedDBStorageController.setItemAsync).toBe('function');
    expect(typeof IndexedDBStorageController.removeItemAsync).toBe('function');
  });

  it('can store and retrieve values', async () => {
    let result = await IndexedDBStorageController.getItemAsync('myKey');
    expect(result).toBe(null);
    await IndexedDBStorageController.setItemAsync('myKey', 'myValue');
    result = await IndexedDBStorageController.getItemAsync('myKey');
    expect(result).toBe('myValue');
  });

  it('can remove values', async () => {
    await IndexedDBStorageController.setItemAsync('myKey', 'myValue');
    let result = await IndexedDBStorageController.getItemAsync('myKey');
    expect(result).toBe('myValue');
    await IndexedDBStorageController.removeItemAsync('myKey');
    result = await IndexedDBStorageController.getItemAsync('myKey');
    expect(result).toBe(null);
  });

  it('can getAllKeys', async () => {
    await IndexedDBStorageController.setItemAsync('myKey', 'myValue');
    const result = await IndexedDBStorageController.getItemAsync('myKey');
    expect(result).toBe('myValue');
    const keys = await IndexedDBStorageController.getAllKeysAsync();
    expect(keys[0]).toBe('myKey');
  });
});

const DefaultStorageController = require('../StorageController.default');

describe('Default StorageController', () => {
  beforeEach(() => {
    DefaultStorageController.clear();
  });

  it('is synchronous', () => {
    expect(DefaultStorageController.async).toBe(0);
    expect(typeof DefaultStorageController.getItem).toBe('function');
    expect(typeof DefaultStorageController.setItem).toBe('function');
    expect(typeof DefaultStorageController.removeItem).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(DefaultStorageController.getItem('myKey')).toBe(null);
    DefaultStorageController.setItem('myKey', 'myValue');
    expect(DefaultStorageController.getItem('myKey')).toBe('myValue');
  });

  it('can remove values', () => {
    DefaultStorageController.setItem('myKey', 'myValue');
    expect(DefaultStorageController.getItem('myKey')).toBe('myValue');
    DefaultStorageController.removeItem('myKey');
    expect(DefaultStorageController.getItem('myKey')).toBe(null);
  });
});

const WeappStorageController = require('../StorageController.weapp');

describe('WeChat StorageController', () => {
  beforeEach(() => {
    WeappStorageController.clear();
  });

  it('is synchronous', () => {
    expect(WeappStorageController.async).toBe(0);
    expect(typeof WeappStorageController.getItem).toBe('function');
    expect(typeof WeappStorageController.setItem).toBe('function');
    expect(typeof WeappStorageController.removeItem).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(WeappStorageController.getItem('myKey')).toBe(undefined);
    WeappStorageController.setItem('myKey', 'myValue');
    expect(WeappStorageController.getItem('myKey')).toBe('myValue');
    expect(WeappStorageController.getAllKeys()).toEqual(['myKey']);
  });

  it('can remove values', () => {
    WeappStorageController.setItem('myKey', 'myValue');
    expect(WeappStorageController.getItem('myKey')).toBe('myValue');
    WeappStorageController.removeItem('myKey');
    expect(WeappStorageController.getItem('myKey')).toBe(undefined);
  });
});

const Storage = require('../Storage');

describe('Storage (Default StorageController)', () => {
  beforeEach(() => {
    CoreManager.setStorageController(require('../StorageController.default'));
  });

  it('can store and retrieve values', () => {
    expect(Storage.getItem('myKey')).toBe(null);
    Storage.setItem('myKey', 'myValue');
    expect(Storage.getItem('myKey')).toBe('myValue');
    expect(Storage.getAllKeys()).toEqual(['myKey']);
  });

  it('can remove values', () => {
    Storage.setItem('myKey', 'myValue');
    expect(Storage.getItem('myKey')).toBe('myValue');
    Storage.removeItem('myKey');
    expect(Storage.getItem('myKey')).toBe(null);
  });

  it('wraps synchronous methods in async wrappers', done => {
    Storage.getItemAsync('myKey')
      .then(result => {
        expect(result).toBe(null);
        return Storage.setItemAsync('myKey', 'myValue');
      })
      .then(() => {
        return Storage.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe('myValue');
        return Storage.removeItemAsync('myKey');
      })
      .then(() => {
        return Storage.getItemAsync('myKey');
      })
      .then(() => {
        done();
      });
  });

  it('can generate a unique storage path', () => {
    expect(Storage.generatePath.bind(null, 'hello')).toThrow(
      'You need to call Parse.initialize before using Parse.'
    );
    CoreManager.set('APPLICATION_ID', 'appid');
    expect(Storage.generatePath.bind(null, 12)).toThrow(
      'Tried to get a Storage path that was not a String.'
    );
    expect(Storage.generatePath('hello')).toBe('Parse/appid/hello');
    expect(Storage.generatePath('/hello')).toBe('Parse/appid/hello');
  });

  it('can clear if controller does not implement clear', () => {
    CoreManager.setStorageController({
      getItem: () => {},
      setItem: () => {},
      removeItem: () => {},
      getAllKeys: () => {},
    });
    Storage._clear();
  });
});

describe('Storage (Async StorageController)', () => {
  beforeEach(() => {
    CoreManager.setAsyncStorage(mockRNStorageInterface);
    CoreManager.setStorageController(require('../StorageController.react-native'));
  });

  it('throws when using a synchronous method', () => {
    expect(Storage.getItem).toThrow(
      'Synchronous storage is not supported by the current storage controller'
    );
    expect(Storage.setItem).toThrow(
      'Synchronous storage is not supported by the current storage controller'
    );
    expect(Storage.removeItem).toThrow(
      'Synchronous storage is not supported by the current storage controller'
    );
    expect(Storage.getAllKeys).toThrow(
      'Synchronous storage is not supported by the current storage controller'
    );
  });

  it('wraps synchronous methods in async wrappers', done => {
    Storage.getItemAsync('myKey')
      .then(result => {
        expect(result).toBe(null);
        return Storage.setItemAsync('myKey', 'myValue');
      })
      .then(() => {
        return Storage.getItemAsync('myKey');
      })
      .then(result => {
        expect(result).toBe('myValue');
        return Storage.getAllKeysAsync();
      })
      .then(result => {
        expect(result).toEqual(['myKey']);
        return Storage.removeItemAsync('myKey');
      })
      .then(() => {
        return Storage.getItemAsync('myKey');
      })
      .then(() => {
        done();
      });
  });
});
