/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const encode = require('../encode').default;

let objectCount = 0;

class MockObject {
  constructor (className) {
    this.className = className;
    this.attributes = {};

    this.id = String(objectCount++);
  }

  toJSON() {
    return this.attributes;
  }

  _getServerData() {
    return this._serverData;
  }

  toPointer() {
    return 'POINTER';
  }

  dirty() {}

  _toFullJSON() {
    const json = {
      __type: 'Object',
      className: this.className
    };
    for (const attr in this.attributes) {
      if (this.attributes[attr].id) {
        json[attr] = this.attributes[attr]._toFullJSON();
      } else {
        json[attr] = encode(this.attributes[attr], false, true, null);
      }
    }
    if (this.id) {
      json.objectId = this.id;
    }
    return json;
  }

  fromJSON(json) {
    const o = new MockObject(json.className);
    o.id = json.objectId;
    for (const attr in json) {
      if (attr !== 'className' && attr !== '__type' && attr !== 'objectId') {
        o.attributes[attr] = json[attr];
      }
    }
    return o;
  }

  _getId() {
    return this.id;
  }

  set(key, value) {
    this.attributes[key] = value;
  }
}

const mockLocalStorageController = {
  fromPinWithName: jest.fn(),
  pinWithName: jest.fn(),
  unPinWithName: jest.fn(),
  getAllContents: jest.fn(),
  clear: jest.fn(),
};
jest.setMock('../ParseObject', MockObject);
const CoreManager = require('../CoreManager');
const LocalDatastore = require('../LocalDatastore');
const ParseObject = require('../ParseObject');
const LocalStorageController = require('../LocalDatastoreController.localStorage');
const DefaultStorageController = require('../LocalDatastoreController.default');

const mockLocalStorage = require('./test_helpers/mockLocalStorage');

global.localStorage = mockLocalStorage;

describe('LocalDatastore', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(mockLocalStorageController);
    jest.clearAllMocks();
  });

  it('isLocalStorageEnabled', () => {
    expect(LocalDatastore.isLocalStorageEnabled()).toBe(true);
  });

  it('isEnabled', () => {
    LocalDatastore.isEnabled = true;
    const isEnabled = LocalDatastore.checkIfEnabled();
    expect(isEnabled).toBe(true);
  });

  it('isDisabled', () => {
    const spy = jest.spyOn(console, 'log');
    LocalDatastore.isEnabled = false;
    const isEnabled = LocalDatastore.checkIfEnabled();
    expect(isEnabled).toBe(false);
    expect(spy).toHaveBeenCalledWith('Parse.enableLocalDatastore() must be called first');
    spy.mockRestore();
  });

  it('can clear', () => {
    LocalDatastore._clear();
    expect(mockLocalStorageController.clear).toHaveBeenCalledTimes(1);
  });

  it('can getAllContents', () => {
    LocalDatastore._getAllContents();
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_handlePinWithName no children', () => {
    const object = new ParseObject('Item');
    LocalDatastore._handlePinWithName('test_pin', object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName default pin', () => {
    const object = new ParseObject('Item');
    LocalDatastore._handlePinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName unsaved children', () => {
    const parent = new ParseObject('Item');
    const unsaved = { className: 'Item', __type: 'Object' };
    parent.set('child', unsaved);
    LocalDatastore._handlePinWithName('test_pin', parent);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName with children', () => {
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    const grandchild = new ParseObject('Item');
    child.set('grandchild', grandchild);
    parent.set('child', child);
    LocalDatastore._handlePinWithName('test_pin', parent);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(4);
  });

  it('_handleUnPinWithName default pin', () => {
    const object = new ParseObject('Item');
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => [object._getId(), '1234']);
    LocalDatastore._handleUnPinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN, ['1234']);
  });

  it('_handleUnPinWithName specific pin', () => {
    const object = new ParseObject('Item');
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => [object._getId(), '1234']);
    LocalDatastore._handleUnPinWithName('test_pin', object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin', ['1234']);
  });

  it('_handleUnPinWithName default pin remove pinName', () => {
    const object = new ParseObject('Item');
    LocalDatastore._handleUnPinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN);
  });

  it('_handleUnPinWithName specific pin remove pinName', () => {
    const object = new ParseObject('Item');
    LocalDatastore._handleUnPinWithName('test_pin', object);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin');
  });

  it('_handleUnPinWithName remove if exist', () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    const obj3 = new ParseObject('Item');
    const objects = [obj1.id, obj2.id, obj3.id];
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => objects);

    LocalDatastore._handleUnPinWithName('test_pin', obj1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(objects);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin', [obj2.id, obj3.id]);
  });

  it('_updateObjectIfPinned not pinned', () => {
    const object = new ParseObject('Item');
    LocalDatastore.isEnabled = true;
    LocalDatastore._updateObjectIfPinned(object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_updateObjectIfPinned if pinned', () => {
    const object = new ParseObject('Item');
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => [object]);

    LocalDatastore.isEnabled = true;
    LocalDatastore._updateObjectIfPinned(object);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual([object]);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(object.id, object._toFullJSON());
  });

  it('_updateLocalIdForObjectId not pinned', () => {
    LocalDatastore._updateLocalIdForObjectId('local0', 'objectId0');
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(undefined);
  });

  it('_updateLocalIdForObjectId if pinned', () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => json);

    LocalDatastore._updateLocalIdForObjectId(localId, object.id);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(json);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(localId);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(object.id, json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_updateLocalIdForObjectId if pinned with name', () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id],
      [object.id]: json,
    };
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json)
      .mockImplementationOnce(() => [localId]);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore._updateLocalIdForObjectId(localId, object.id);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(json);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(localId);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(object.id, json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_updateLocalIdForObjectId if pinned with new name', () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id],
      [object.id]: json,
    };
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json)
      .mockImplementationOnce(() => null);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore._updateLocalIdForObjectId(localId, object.id);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(json);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(localId);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(object.id, json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName no name returns all objects', () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id],
      [object.id]: json,
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = LocalDatastore._serializeObjectsFromPinName(null);
    expect(results).toEqual([json]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName no objects', () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id, 'local10', 'local11'],
      [object.id]: json,
      randomName: [object.id],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = LocalDatastore._serializeObjectsFromPinName(LocalDatastore.DEFAULT_PIN);
    expect(results).toEqual([]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName with name', () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    const obj3 = new ParseObject('Item');

    const LDS = {
      [obj1.id]: obj1._toFullJSON(),
      [obj2.id]: obj2._toFullJSON(),
      [obj3.id]: obj3._toFullJSON(),
      testPin: [obj1.id, obj2.id, obj3.id],
    };

    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => LDS.testPin)
      .mockImplementationOnce(() => LDS[obj1.id])
      .mockImplementationOnce(() => LDS[obj2.id])
      .mockImplementationOnce(() => LDS[obj3.id]);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = LocalDatastore._serializeObjectsFromPinName('testPin');
    expect(results).toEqual([obj1._toFullJSON(), obj2._toFullJSON(), obj3._toFullJSON()]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(4);
  });

  it('_destroyObjectIfPinned no objects found in pinName', () => {
    const object = new ParseObject('Item');

    LocalDatastore.isEnabled = true;
    LocalDatastore._destroyObjectIfPinned(object);
    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();

    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    const LDS = {
      [obj1.id]: obj1._toFullJSON(),
      [obj2.id]: obj2._toFullJSON(),
      [LocalDatastore.DEFAULT_PIN]: [obj2.id],
    };

    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => obj1)
      .mockImplementationOnce(() => null);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    LocalDatastore._destroyObjectIfPinned(obj1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(obj1.id);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[0][0]).toEqual(obj1.id);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[1][0]).toEqual(LocalDatastore.DEFAULT_PIN);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned no objects found in pinName remove pinName', () => {
    const object = new ParseObject('Item');
    LocalDatastore.isEnabled = true;
    LocalDatastore._destroyObjectIfPinned(object);
    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();

    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    const LDS = {
      [obj1.id]: obj1._toFullJSON(),
      [obj2.id]: obj2._toFullJSON(),
      [LocalDatastore.PIN_PREFIX + 'Custom_Pin']: [obj2.id],
      [LocalDatastore.DEFAULT_PIN]: [obj2.id],
    };

    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => obj2)
      .mockImplementationOnce(() => [obj2.id]);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    LocalDatastore._destroyObjectIfPinned(obj2);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(obj2.id);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(3);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[0][0]).toEqual(obj2.id);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[1][0]).toEqual(LocalDatastore.PIN_PREFIX + 'Custom_Pin');
    expect(mockLocalStorageController.fromPinWithName.mock.calls[2][0]).toEqual(LocalDatastore.DEFAULT_PIN);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned', () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    const LDS = {
      [obj1.id]: obj1._toFullJSON(),
      [obj2.id]: obj2._toFullJSON(),
      [LocalDatastore.DEFAULT_PIN]: [obj1.id, obj2.id],
    };

    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => obj1)
      .mockImplementationOnce(() => LDS[LocalDatastore.DEFAULT_PIN]);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    LocalDatastore._destroyObjectIfPinned(obj1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(obj1.id);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[0][0]).toEqual(obj1.id);
    expect(mockLocalStorageController.fromPinWithName.mock.calls[1][0]).toEqual(LocalDatastore.DEFAULT_PIN);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN, [obj2.id]);
  });
});

describe('Local DatastoreController', () => {
  beforeEach(() => {
    LocalStorageController.clear();
  });

  it('implement functionality', () => {
    expect(typeof LocalStorageController.fromPinWithName).toBe('function');
    expect(typeof LocalStorageController.pinWithName).toBe('function');
    expect(typeof LocalStorageController.unPinWithName).toBe('function');
    expect(typeof LocalStorageController.getAllContents).toBe('function');
    expect(typeof LocalStorageController.clear).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual(null);
    LocalStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', () => {
    LocalStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalStorageController.unPinWithName('myKey');
    expect(LocalStorageController.fromPinWithName('myKey')).toEqual(null);
  });
});

describe('Default DataController', () => {
  beforeEach(() => {
    DefaultStorageController.clear();
  });

  it('implement functionality', () => {
    expect(typeof DefaultStorageController.fromPinWithName).toBe('function');
    expect(typeof DefaultStorageController.pinWithName).toBe('function');
    expect(typeof DefaultStorageController.unPinWithName).toBe('function');
    expect(typeof DefaultStorageController.getAllContents).toBe('function');
    expect(typeof DefaultStorageController.clear).toBe('function');
  });

  it('can store and retrieve values', () => {
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual(null);
    DefaultStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(DefaultStorageController.getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', () => {
    DefaultStorageController.pinWithName('myKey', [{ name: 'test' }]);
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    DefaultStorageController.unPinWithName('myKey');
    expect(DefaultStorageController.fromPinWithName('myKey')).toEqual(null);
    expect(DefaultStorageController.getAllContents()).toEqual({});
  });
});

describe('LocalDatastore (Default DataStoreController)', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(DefaultStorageController);
  });

  it('can store and retrieve values', () => {
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(LocalDatastore._getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', () => {
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalDatastore.unPinWithName('myKey');
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    expect(LocalDatastore._getAllContents()).toEqual({});
  });
});

describe('LocalDatastore (LocalStorage DataStoreController)', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(LocalStorageController);
  });

  it('can store and retrieve values', () => {
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(LocalDatastore._getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', () => {
    LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    LocalDatastore.unPinWithName('myKey');
    expect(LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    expect(LocalDatastore._getAllContents()).toEqual({});
  });
});
