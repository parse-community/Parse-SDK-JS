/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise').default;

var mockStorage = {};
var mockStorageInterface = {
  getItem(path) {
    return mockStorage[path] || null;
  },

  setItem(path, value) {
    mockStorage[path] = value;
  },

  removeItem(path) {
    delete mockStorage[path];
  },

  clear() {
    mockStorage = {};
  }
}

global.localStorage = mockStorageInterface;

var LocalStorageController = require('../LocalDatastore/LocalDatastoreController.localStorage');

describe('Local DatastoreController', () => {
  beforeEach(() => {
    LocalStorageController.clear();
  });

  it('implement functionality', () => {
    expect(typeof LocalStorageController.fromPinWithName).toBe('function');
    expect(typeof LocalStorageController.pinWithName).toBe('function');
    expect(typeof LocalStorageController.unPinWithName).toBe('function');
    expect(typeof LocalStorageController.clear).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([]);
    LocalStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', () => {
    LocalStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalStorageController.unPinWithName('myKey');
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([]);
  });
});

var DefaultStorageController = require('../LocalDatastore/LocalDatastoreController.default');

describe('Default DataController', () => {
  beforeEach(() => {
    DefaultStorageController.clear();
  });

  it('implement functionality', () => {
    expect(typeof DefaultStorageController.fromPinWithName).toBe('function');
    expect(typeof DefaultStorageController.pinWithName).toBe('function');
    expect(typeof DefaultStorageController.unPinWithName).toBe('function');
    expect(typeof DefaultStorageController.clear).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([]);
    DefaultStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', () => {
    DefaultStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    DefaultStorageController.unPinWithName('myKey');
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([]);
  });
});

var LocalDatastore = require('../LocalDatastore/LocalDatastore');

describe('LocalDatastore (Default DataStoreController)', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(require('../LocalDatastore/LocalDatastoreController.default'));
  });

  it('can store and retrieve values', () => {
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([]);
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', () => {
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalDatastore.unPinWithName('myKey');
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([]);
  });
});

describe('LocalDatastore (LocalStorage DataStoreController)', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(require('../LocalDatastore/LocalDatastoreController.localStorage'));
  });

  it('can store and retrieve values', () => {
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([]);
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', () => {
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalDatastore.unPinWithName('myKey');
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([]);
  });
});
