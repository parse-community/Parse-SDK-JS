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
const CoreManager = require('../CoreManager');

let mockStorage = {};
const mockStorageInterface = {
  getItem(path) {
    return mockStorage[path] || null;
  },

  getItemAsync(path) {
    return Promise.resolve(mockStorageInterface.getItem(path));
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  setItemAsync(path, value) {
    return Promise.resolve(mockStorageInterface.setItem(path, value));
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  removeItemAsync(path) {
    return Promise.resolve(mockStorageInterface.removeItem(path));
  },

  clear() {
    mockStorage = {};
  }
}

global.localStorage = mockStorageInterface;

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

  it('can store and retrieve values', (done) => {
    RNStorageController.getItemAsync('myKey').then((result) => {
      expect(result).toBe(null);
      return RNStorageController.setItemAsync('myKey', 'myValue');
    }).then(() => {
      return RNStorageController.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe('myValue');
      done();
    });
  });

  it('can remove values', (done) => {
    RNStorageController.setItemAsync('myKey', 'myValue').then(() => {
      return RNStorageController.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe('myValue');
      return RNStorageController.removeItemAsync('myKey');
    }).then(() => {
      return RNStorageController.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe(null);
      done();
    });
  });

  it('can getAllKeys', (done) => {
    RNStorageController.setItemAsync('myKey', 'myValue').then(() => {
      return RNStorageController.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe('myValue');
      return RNStorageController.getAllKeysAsync();
    }).then((keys) => {
      expect(keys[0]).toBe('myKey');
      done();
    });
  });

  it('can handle set error', (done) => {
    const mockRNError = {
      setItem(path, value, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.setItemAsync('myKey', 'myValue').catch((error) => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle get error', (done) => {
    const mockRNError = {
      getItem(path, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.getItemAsync('myKey').catch((error) => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle remove error', (done) => {
    const mockRNError = {
      removeItem(path, cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.removeItemAsync('myKey').catch((error) => {
      expect(error).toBe('Error Thrown');
      done();
    });
  });

  it('can handle getAllKeys error', (done) => {
    const mockRNError = {
      getAllKeys(cb) {
        cb('Error Thrown', undefined);
      },
    };
    CoreManager.setAsyncStorage(mockRNError);
    RNStorageController.getAllKeysAsync().catch((error) => {
      expect(error).toBe('Error Thrown');
      done();
    });
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

  it('wraps synchronous methods in async wrappers', (done) => {
    Storage.getItemAsync('myKey').then((result) => {
      expect(result).toBe(null);
      return Storage.setItemAsync('myKey', 'myValue');
    }).then(() => {
      return Storage.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe('myValue');
      return Storage.removeItemAsync('myKey');
    }).then(() => {
      return Storage.getItemAsync('myKey');
    }).then(() => {
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
});

describe('Storage (Async StorageController)', () => {
  beforeEach(() => {
    CoreManager.setAsyncStorage(mockRNStorageInterface);
    CoreManager.setStorageController(
      require('../StorageController.react-native')
    );
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

  it('wraps synchronous methods in async wrappers', (done) => {
    Storage.getItemAsync('myKey').then((result) => {
      expect(result).toBe(null);
      return Storage.setItemAsync('myKey', 'myValue');
    }).then(() => {
      return Storage.getItemAsync('myKey');
    }).then((result) => {
      expect(result).toBe('myValue');
      return Storage.getAllKeysAsync();
    }).then((result) => {
      expect(result).toEqual(['myKey']);
      return Storage.removeItemAsync('myKey');
    }).then(() => {
      return Storage.getItemAsync('myKey');
    }).then(() => {
      done();
    });
  });
});
