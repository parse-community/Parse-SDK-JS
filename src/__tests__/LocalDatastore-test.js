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

const mockAsyncStorage = require('./test_helpers/mockRNStorage');
const mockLocalStorageController = {
  fromPinWithName: jest.fn(),
  pinWithName: jest.fn(),
  unPinWithName: jest.fn(),
  getAllContents: jest.fn(),
  clear: jest.fn(),
};
jest.setMock('../ParseObject', MockObject);

const mockQueryFind = jest.fn();
jest.mock('../ParseQuery', () => {
  return jest.fn().mockImplementation(function () {
    this.equalTo = jest.fn();
    this.containedIn = jest.fn();
    this.limit = jest.fn();
    this.find = mockQueryFind;
  });
});

const CoreManager = require('../CoreManager');
const LocalDatastore = require('../LocalDatastore');
const ParseObject = require('../ParseObject');
const ParseQuery = require('../ParseQuery');
const RNDatastoreController = require('../LocalDatastoreController.react-native');
const BrowserDatastoreController = require('../LocalDatastoreController.browser');
const DefaultDatastoreController = require('../LocalDatastoreController.default');

const mockLocalStorage = require('./test_helpers/mockLocalStorage');

global.localStorage = mockLocalStorage;

describe('LocalDatastore', () => {
  beforeEach(() => {
    CoreManager.setLocalDatastoreController(mockLocalStorageController);
    jest.clearAllMocks();
    LocalDatastore.isEnabled = true;
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
    LocalDatastore._updateLocalIdForObject('', null);
    LocalDatastore._destroyObjectIfPinned(null);
    LocalDatastore._updateObjectIfPinned(null);
    expect(spy).toHaveBeenCalledWith('Parse.enableLocalDatastore() must be called first');
    spy.mockRestore();
  });

  it('can clear', async () => {
    await LocalDatastore._clear();
    expect(mockLocalStorageController.clear).toHaveBeenCalledTimes(1);
  });

  it('can getAllContents', async () => {
    await LocalDatastore._getAllContents();
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_handlePinWithName no children', async () => {
    const object = new ParseObject('Item');
    await LocalDatastore._handlePinWithName('test_pin', object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName default pin', async () => {
    const object = new ParseObject('Item');
    await LocalDatastore._handlePinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName unsaved children', async () => {
    const parent = new ParseObject('Item');
    const unsaved = { className: 'Item', __type: 'Object' };
    parent.set('child', unsaved);
    await LocalDatastore._handlePinWithName('test_pin', parent);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinWithName with children', async () => {
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    const grandchild = new ParseObject('Item');
    child.set('grandchild', grandchild);
    parent.set('child', child);
    await LocalDatastore._handlePinWithName('test_pin', parent);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(4);
  });

  it('_handleUnPinWithName default pin', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [`Item_${object._getId()}`, '1234'],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN, ['1234']);
  });

  it('_handleUnPinWithName specific pin', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      parsePin_test_pin: [`Item_${object._getId()}`, '1234'],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinWithName('test_pin', object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin', ['1234']);
  });

  it('_handleUnPinWithName default pin remove pinName', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinWithName(LocalDatastore.DEFAULT_PIN, object);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN);
  });

  it('_handleUnPinWithName specific pin remove pinName', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      [LocalDatastore.PIN_PREFIX + 'test_pin']: [],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinWithName('test_pin', object);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin');
  });

  it('_handleUnPinWithName remove if exist', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    const obj3 = new ParseObject('Item');
    const objects = [`Item_${obj1.id}`, `Item_${obj2.id}`, `Item_${obj3.id}`];
    const LDS = {
      [LocalDatastore.PIN_PREFIX + 'test_pin']: objects,
      [LocalDatastore.PIN_PREFIX + 'test_pin_2']: objects,
      [`Item_${obj1.id}`]: obj1._toFullJSON(),
      [`Item_${obj2.id}`]: obj2._toFullJSON(),
    }
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._handleUnPinWithName('test_pin', obj1);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.PIN_PREFIX + 'test_pin', [`Item_${obj2.id}`, `Item_${obj3.id}`]);
  });

  it('_updateObjectIfPinned not pinned', async () => {
    const object = new ParseObject('Item');
    LocalDatastore.isEnabled = true;
    LocalDatastore._updateObjectIfPinned(object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_updateObjectIfPinned if pinned', async () => {
    const object = new ParseObject('Item');
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => [object]);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._updateObjectIfPinned(object);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual([object]);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(`Item_${object.id}`, object._toFullJSON());
  });

  it('_updateLocalIdForObject not pinned', async () => {
    const object = new ParseObject('Item');
    object.id = '1234'
    await LocalDatastore._updateLocalIdForObject('local0', object);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(undefined);
  });

  it('_updateLocalIdForObject if pinned', async () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const localKey = `Item_${localId}`;
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [localKey],
      [localKey]: json,
    };
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._updateLocalIdForObject(localId, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_updateLocalIdForObject if pinned with name', async () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const localKey = `Item_${localId}`;
    const LDS = {
      [LocalDatastore.PIN_PREFIX + 'test_pin']: [localKey],
      [localKey]: json,
    };
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._updateLocalIdForObject(localId, object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_updateLocalIdForObject if pinned with new name', async () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id],
      [object.id]: json,
    };
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => json);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._updateLocalIdForObject(localId, object);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(json);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(`Item_${localId}`);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(`Item_${object.id}`, json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName no name returns all objects', async () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [object.id],
      [object.id]: json,
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = await LocalDatastore._serializeObjectsFromPinName(null);
    expect(results).toEqual([json]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName no objects', async () => {
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

    const results = await LocalDatastore._serializeObjectsFromPinName(LocalDatastore.DEFAULT_PIN);
    expect(results).toEqual([]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName with name', async () => {
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

    const results = await LocalDatastore._serializeObjectsFromPinName('testPin');
    expect(results).toEqual([obj1._toFullJSON(), obj2._toFullJSON(), obj3._toFullJSON()]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(4);
  });

  it('_serializeObject no children', async () => {
    const object = new ParseObject('Item');
    object.id = 1234;
    const json = object._toFullJSON();
    const objectKey = `Item_1234`;
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [objectKey],
      [objectKey]: json,
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const result = await LocalDatastore._serializeObject(objectKey);
    expect(result).toEqual(json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObject object does not exist', async () => {
    const object = new ParseObject('Item');
    object.id = 1234;
    const objectKey = `Item_1234`;
    const LDS = {};

    const result = await LocalDatastore._serializeObject(objectKey, LDS);
    expect(result).toEqual(null);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(0);
  });

  it('_serializeObject with children', async () => {
    const object = new ParseObject('Item');
    object.id = 1234;
    const child = new ParseObject('Item');
    child.id = 5678;
    object.set('child', child);
    const newData = child._toFullJSON();
    newData.field = 'Serialize Me';
    const LDS = {
      [LocalDatastore.DEFAULT_PIN]: [`Item_${object.id}`, `Item_${child.id}`],
      [`Item_${object.id}`]: object._toFullJSON(),
      [`Item_${child.id}`]: newData,
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const expectedResults = object._toFullJSON();
    expectedResults.child = newData;
    const result = await LocalDatastore._serializeObject(`Item_${object.id}`);
    expect(result).toEqual(expectedResults);
  });

  it('_destroyObjectIfPinned no objects found in pinName', async () => {
    const object = new ParseObject('Item');
    let LDS = {};
    LocalDatastore.isEnabled = true;
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._destroyObjectIfPinned(object);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();

    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    LDS = {
      [`Item_${obj1.id}`]: obj1._toFullJSON(),
      [`Item_${obj2.id}`]: obj2._toFullJSON(),
      [LocalDatastore.DEFAULT_PIN]: [],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(obj1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(`Item_${obj1.id}`);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned no objects found in pinName remove pinName', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    const LDS = {
      [`Item_${obj1.id}`]: obj1._toFullJSON(),
      [`Item_${obj2.id}`]: obj2._toFullJSON(),
      [LocalDatastore.PIN_PREFIX + 'Custom_Pin']: [`Item_${obj2.id}`],
      [LocalDatastore.DEFAULT_PIN]: [`Item_${obj2.id}`],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(obj2);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(3);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(`Item_${obj2.id}`);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');

    const LDS = {
      [`Item_${obj1.id}`]: obj1._toFullJSON(),
      [`Item_${obj2.id}`]: obj2._toFullJSON(),
      [LocalDatastore.DEFAULT_PIN]: [`Item_${obj1.id}`, `Item_${obj2.id}`],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(obj1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(`Item_${obj1.id}`);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(LocalDatastore.DEFAULT_PIN, [`Item_${obj2.id}`]);
  });

  it('_traverse', () => {
    // Skip if no objectId
    let object = {}
    let encountered = {};
    LocalDatastore._traverse(object, encountered);
    expect(encountered).toEqual({});

    // Set Encountered
    object = { objectId: 1234, className: 'Item' };
    encountered = {};
    LocalDatastore._traverse(object, encountered);
    expect(encountered).toEqual({ 'Item_1234': object });

    // Skip if already encountered
    object = { objectId: 1234, className: 'Item' };
    encountered = { 'Item_1234': object };
    LocalDatastore._traverse(object, encountered);
    expect(encountered).toEqual({ 'Item_1234': object });

    // Test if null field exist still encounter
    object = { objectId: 1234, className: 'Item', field: null };
    encountered = {};
    LocalDatastore._traverse(object, encountered);
    expect(encountered).toEqual({ 'Item_1234': object });
  });

  it('do not sync if disabled', async () => {
    LocalDatastore.isEnabled = false;
    jest.spyOn(mockLocalStorageController, 'getAllContents');

    await LocalDatastore.updateFromServer();
    expect(LocalDatastore.isSyncing).toBe(false);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(0);
  });

  it('do not sync if syncing', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = true;

    jest.spyOn(mockLocalStorageController, 'getAllContents');
    await LocalDatastore.updateFromServer();

    expect(LocalDatastore.isSyncing).toBe(true);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(0);
  });

  it('updateFromServer empty LDS', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;
    const LDS = {};

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    jest.spyOn(mockLocalStorageController, 'pinWithName');
    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('updateFromServer on one object', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;
    const object = new ParseObject('Item');
    const LDS = {
      [`Item_${object.id}`]: object._toFullJSON(),
      [`${LocalDatastore.PIN_PREFIX}_testPinName`]: [`Item_${object.id}`],
      [LocalDatastore.DEFAULT_PIN]: [`Item_${object.id}`],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    object.set('updatedField', 'foo');
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([object]));

    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(1);
    const mockQueryInstance = ParseQuery.mock.instances[0];

    expect(mockQueryInstance.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
  });

  it('updateFromServer handle error', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;
    const object = new ParseObject('Item');
    const LDS = {
      [`Item_${object.id}`]: object._toFullJSON(),
      [`${LocalDatastore.PIN_PREFIX}_testPinName`]: [`Item_${object.id}`],
      [LocalDatastore.DEFAULT_PIN]: [`Item_${object.id}`],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    object.set('updatedField', 'foo');
    mockQueryFind.mockImplementationOnce(() => {
      expect(LocalDatastore.isSyncing).toBe(true);
      return Promise.reject('Unable to connect to the Parse API')
    });

    jest.spyOn(console, 'log');
    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(1);
    const mockQueryInstance = ParseQuery.mock.instances[0];

    expect(mockQueryInstance.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(LocalDatastore.isSyncing).toBe(false);
  });

  it('updateFromServer on mixed object', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    const obj3 = new ParseObject('TestObject');
    const LDS = {
      [`Item_${obj1.id}`]: obj1._toFullJSON(),
      [`Item_${obj2.id}`]: obj2._toFullJSON(),
      [`TestObject_${obj3.id}`]: obj3._toFullJSON(),
      [`${LocalDatastore.PIN_PREFIX}_testPinName`]: [`Item_${obj1.id}`],
      [LocalDatastore.DEFAULT_PIN]: [`Item_${obj1.id}`],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    mockQueryFind
      .mockImplementationOnce(() => Promise.resolve([obj1, obj2]))
      .mockImplementationOnce(() => Promise.resolve([obj3]));

    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(2);

    const mockQueryInstance1 = ParseQuery.mock.instances[0];
    const mockQueryInstance2 = ParseQuery.mock.instances[1];

    expect(mockQueryInstance1.containedIn.mock.calls.length).toBe(1);
    expect(mockQueryInstance2.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(3);
  });
});

describe('BrowserDatastoreController', async () => {
  beforeEach(async () => {
    await BrowserDatastoreController.clear();
  });

  it('implement functionality', () => {
    expect(typeof BrowserDatastoreController.fromPinWithName).toBe('function');
    expect(typeof BrowserDatastoreController.pinWithName).toBe('function');
    expect(typeof BrowserDatastoreController.unPinWithName).toBe('function');
    expect(typeof BrowserDatastoreController.getAllContents).toBe('function');
    expect(typeof BrowserDatastoreController.clear).toBe('function');
  });

  it('can store and retrieve values', async () => {
    expect(await BrowserDatastoreController.fromPinWithName('myKey')).toEqual(null);
    await BrowserDatastoreController.pinWithName('myKey', [{ name: 'test' }]);
    expect(await BrowserDatastoreController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
  });

  it('can remove values', async () => {
    await BrowserDatastoreController.pinWithName('myKey', [{ name: 'test' }]);
    expect(await BrowserDatastoreController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    await BrowserDatastoreController.unPinWithName('myKey');
    expect(await BrowserDatastoreController.fromPinWithName('myKey')).toEqual(null);
  });
});

describe('DefaultDatastoreController', () => {
  beforeEach(async () => {
    await DefaultDatastoreController.clear();
  });

  it('implement functionality', () => {
    expect(typeof DefaultDatastoreController.fromPinWithName).toBe('function');
    expect(typeof DefaultDatastoreController.pinWithName).toBe('function');
    expect(typeof DefaultDatastoreController.unPinWithName).toBe('function');
    expect(typeof DefaultDatastoreController.getAllContents).toBe('function');
    expect(typeof DefaultDatastoreController.clear).toBe('function');
  });

  it('can store and retrieve values', async () => {
    expect(await DefaultDatastoreController.fromPinWithName('myKey')).toEqual(null);
    await DefaultDatastoreController.pinWithName('myKey', [{ name: 'test' }]);
    expect(await DefaultDatastoreController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(await DefaultDatastoreController.getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', async () => {
    await DefaultDatastoreController.pinWithName('myKey', [{ name: 'test' }]);
    expect(await DefaultDatastoreController.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    await DefaultDatastoreController.unPinWithName('myKey');
    expect(await DefaultDatastoreController.fromPinWithName('myKey')).toEqual(null);
    expect(await DefaultDatastoreController.getAllContents()).toEqual({});
  });
});

describe('LocalDatastore (BrowserDatastoreController)', () => {
  beforeEach(async () => {
    CoreManager.setLocalDatastoreController(BrowserDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(await LocalDatastore._getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    await LocalDatastore.unPinWithName('myKey');
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    expect(await LocalDatastore._getAllContents()).toEqual({});
  });

  it('can handle store error', async () => {
    const mockStorageError = {
      setItem() {
        throw new Error('error thrown');
      },
    };
    Object.defineProperty(window, 'localStorage', { // eslint-disable-line
      value: mockStorageError
    });
    try {
      await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    } catch (e) {
      expect(e.message).toBe('error thrown');
    }
  });
});

describe('LocalDatastore (DefaultDatastoreController)', () => {
  beforeEach(async () => {
    CoreManager.setLocalDatastoreController(DefaultDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(await LocalDatastore._getAllContents()).toEqual({ myKey: [ { name: 'test' } ] });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    await LocalDatastore.unPinWithName('myKey');
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    expect(await LocalDatastore._getAllContents()).toEqual({});
  });
});

describe('LocalDatastore (RNDatastoreController)', () => {
  beforeEach(async () => {
    CoreManager.setAsyncStorage(mockAsyncStorage);
    CoreManager.setLocalDatastoreController(RNDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    expect(await LocalDatastore._getAllContents()).toEqual({ myKey: [{ name: 'test' }] });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual([{ name: 'test' }]);
    await LocalDatastore.unPinWithName('myKey');
    expect(await LocalDatastore.fromPinWithName('myKey')).toEqual(null);
    expect(await LocalDatastore._getAllContents()).toEqual({});
  });

  it('can handle store error', async () => {
    const mockStorageError = {
      setItem() {
        throw new Error('error thrown');
      },
    };
    CoreManager.setAsyncStorage(mockStorageError);
    try {
      await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    } catch (e) {
      expect(e.message).toBe('error thrown');
    }
  });
});
