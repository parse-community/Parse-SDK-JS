/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/* global window */

jest.autoMockOff();
jest.unmock('../LocalDatastoreUtils');

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
    return this.id || this._localId;
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
const ParseUser = require('../ParseUser').default;
const LocalDatastoreController = require('../LocalDatastoreController');
const RNDatastoreController = require('../LocalDatastoreController.react-native');
const BrowserStorageController = require('../StorageController.browser');
const DefaultStorageController = require('../StorageController.default');

const item1 = new ParseObject('Item');
const item2 = new ParseObject('Item');
const item3 = new ParseObject('Item');

item1.id = '1';
item2.id = '2';
item3.id = '3';

const KEY1 = LocalDatastore.getKeyForObject(item1);
const KEY2 = LocalDatastore.getKeyForObject(item2);
const KEY3 = LocalDatastore.getKeyForObject(item2);

import { DEFAULT_PIN, PIN_PREFIX, OBJECT_PREFIX, isLocalDatastoreKey } from '../LocalDatastoreUtils';

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
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
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

  it('_handlePinAllWithName no children', async () => {
    const object = new ParseObject('Item');
    await LocalDatastore._handlePinAllWithName('test_pin', [object]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinAllWithName with localId', async () => {
    const object = new ParseObject('Item');
    object._localId = 'local0';
    object.id = null;
    await LocalDatastore._handlePinAllWithName('test_pin', [object]);
    expect(mockLocalStorageController.pinWithName.mock.calls[0][0]).toEqual('Parse_LDS_Item_local0');
    expect(mockLocalStorageController.pinWithName.mock.calls[0][1]).toEqual([
      { __type: 'Object', className: 'Item', _localId: 'local0' }
    ]);
  });

  it('_handlePinAllWithName default pin', async () => {
    const object = new ParseObject('Item');
    await LocalDatastore._handlePinAllWithName(DEFAULT_PIN, [object]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinAllWithName unsaved children', async () => {
    const parent = new ParseObject('Item');
    const unsaved = { className: 'Item', __type: 'Object' };
    parent.set('child', unsaved);
    await LocalDatastore._handlePinAllWithName('test_pin', [parent]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(2);
  });

  it('_handlePinAllWithName with children', async () => {
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    const grandchild = new ParseObject('Item');
    child.set('grandchild', grandchild);
    parent.set('child', child);
    await LocalDatastore._handlePinAllWithName('test_pin', [parent]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(4);
  });

  it('_handleUnPinAllWithName default pin', async () => {
    const LDS = {
      [DEFAULT_PIN]: [KEY1, KEY2],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinAllWithName(DEFAULT_PIN, [item1]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(DEFAULT_PIN, [KEY2]);
  });

  it('_handleUnPinAllWithName specific pin', async () => {
    const LDS = {
      parsePin_test_pin: [KEY1, KEY2],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinAllWithName('test_pin', [item1]);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(PIN_PREFIX + 'test_pin', [KEY2]);
  });

  it('_handleUnPinAllWithName default pin remove pinName', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      [DEFAULT_PIN]: [],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinAllWithName(DEFAULT_PIN, [object]);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(DEFAULT_PIN);
  });

  it('_handleUnPinAllWithName specific pin remove pinName', async () => {
    const object = new ParseObject('Item');
    const LDS = {
      [PIN_PREFIX + 'test_pin']: [],
    };
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);
    await LocalDatastore._handleUnPinAllWithName('test_pin', [object]);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(2);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(PIN_PREFIX + 'test_pin');
  });

  it('_handleUnPinAllWithName remove if exist', async () => {
    const objects = [KEY1, KEY2, KEY3];
    const LDS = {
      [PIN_PREFIX + 'test_pin']: objects,
      [PIN_PREFIX + 'test_pin_2']: objects,
      [KEY1]: [item1._toFullJSON()],
      [KEY2]: [item2._toFullJSON()],
    }
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._handleUnPinAllWithName('test_pin', [item1]);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(PIN_PREFIX + 'test_pin', [KEY2, KEY3]);
  });

  it('_updateObjectIfPinned not pinned', async () => {
    const object = new ParseObject('Item');
    LocalDatastore.isEnabled = true;
    LocalDatastore._updateObjectIfPinned(object);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_updateObjectIfPinned if pinned', async () => {
    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => [item1]);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._updateObjectIfPinned(item1);

    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual([item1]);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(KEY1, [item1._toFullJSON()]);
  });

  it('_updateLocalIdForObject not pinned', async () => {
    await LocalDatastore._updateLocalIdForObject('local0', item1);
    expect(mockLocalStorageController.fromPinWithName.mock.results[0].value).toEqual(undefined);
  });

  it('_updateLocalIdForObject if pinned', async () => {
    const object = new ParseObject('Item');
    const json = object._toFullJSON();
    const localId = 'local' + object.id;
    const localKey = `${OBJECT_PREFIX}Item_${localId}`;
    const LDS = {
      [DEFAULT_PIN]: [localKey],
      [localKey]: [json],
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
    const localKey = `${OBJECT_PREFIX}Item_${localId}`;
    const LDS = {
      [PIN_PREFIX + 'test_pin']: [localKey],
      [localKey]: [json],
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
      [DEFAULT_PIN]: [object.id],
      [object.id]: [json],
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
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(`${OBJECT_PREFIX}Item_${localId}`);

    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(`${OBJECT_PREFIX}Item_${object.id}`, json);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName no name returns all objects', async () => {
    const json = item1._toFullJSON();
    const LDS = {
      [DEFAULT_PIN]: [KEY1],
      [KEY1]: [json],
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
      [DEFAULT_PIN]: [object.id, 'local10', 'local11'],
      [object.id]: [json],
      randomName: [object.id],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = await LocalDatastore._serializeObjectsFromPinName(DEFAULT_PIN);
    expect(results).toEqual([]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
  });

  it('_serializeObjectsFromPinName with name', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    const obj3 = new ParseObject('Item');

    const LDS = {
      [obj1.id]: [obj1._toFullJSON()],
      [obj2.id]: [obj2._toFullJSON()],
      [obj3.id]: [obj3._toFullJSON()],
      [PIN_PREFIX + 'testPin']: [obj1.id, obj2.id, obj3.id],
    };

    mockLocalStorageController
      .fromPinWithName
      .mockImplementationOnce(() => LDS[obj1.id])
      .mockImplementationOnce(() => LDS[obj2.id])
      .mockImplementationOnce(() => LDS[obj3.id]);

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const results = await LocalDatastore._serializeObjectsFromPinName('testPin');
    expect(results).toEqual([obj1._toFullJSON(), obj2._toFullJSON(), obj3._toFullJSON()]);

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.fromPinWithName).toHaveBeenCalledTimes(3);
  });

  it('_serializeObject no children', async () => {
    const object = new ParseObject('Item');
    object.id = 1234;
    const json = object._toFullJSON();
    const objectKey = `Item_1234`;
    const LDS = {
      [DEFAULT_PIN]: [objectKey],
      [objectKey]: [json],
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
    const parent = new ParseObject('Item');
    parent.id = 1234;
    const child = new ParseObject('Item');
    child.id = 5678;
    parent.set('child', child);
    const childJSON = child._toFullJSON();
    childJSON.field = 'Serialize Me';

    const parentKey = LocalDatastore.getKeyForObject(parent);
    const childKey = LocalDatastore.getKeyForObject(child);
    const LDS = {
      [DEFAULT_PIN]: [parentKey, childKey],
      [parentKey]: [parent._toFullJSON()],
      [childKey]: [childJSON],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    const expectedResults = parent._toFullJSON();
    expectedResults.child = childJSON;
    const result = await LocalDatastore._serializeObject(parentKey);
    expect(result).toEqual(expectedResults);
  });

  it('_destroyObjectIfPinned no objects found in pinName', async () => {
    let LDS = {};
    LocalDatastore.isEnabled = true;
    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    await LocalDatastore._destroyObjectIfPinned(item1);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(0);

    jest.clearAllMocks();

    LDS = {
      [KEY1]: [item1._toFullJSON()],
      [KEY2]: [item2._toFullJSON()],
      [DEFAULT_PIN]: [],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(item1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(KEY1);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned no objects found in pinName remove pinName', async () => {
    const LDS = {
      [KEY1]: [item1._toFullJSON()],
      [KEY2]: [item2._toFullJSON()],
      [PIN_PREFIX + 'Custom_Pin']: [KEY2],
      [DEFAULT_PIN]: [KEY2],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(item2);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(3);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(KEY2);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
  });

  it('_destroyObjectIfPinned', async () => {
    const LDS = {
      [KEY1]: [item1._toFullJSON()],
      [KEY2]: [item2._toFullJSON()],
      [DEFAULT_PIN]: [KEY1, KEY2],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    LocalDatastore.isEnabled = true;
    await LocalDatastore._destroyObjectIfPinned(item1);

    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.unPinWithName).toHaveBeenCalledWith(KEY1);
    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledWith(DEFAULT_PIN, [KEY2]);
  });

  it('_traverse', () => {
    // Skip if no objectId
    const json = item1._toFullJSON();
    let encountered = {};
    LocalDatastore._traverse({}, encountered);
    expect(encountered).toEqual({});

    // Set Encountered
    encountered = {};
    LocalDatastore._traverse(json, encountered);
    expect(encountered).toEqual({ [KEY1]: item1._toFullJSON() });

    // Skip if already encountered
    encountered = { [KEY1]: item1._toFullJSON() };
    LocalDatastore._traverse(json, encountered);
    expect(encountered).toEqual({ [KEY1]: json });

    // Test if null field exist still encounter
    const object = { objectId: 1234, className: 'Item', field: null };
    encountered = {};
    LocalDatastore._traverse(object, encountered);
    expect(encountered).toEqual({ [`${OBJECT_PREFIX}Item_1234`]: object });
  });

  it('do not sync if disabled', async () => {
    LocalDatastore.isEnabled = false;
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
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
    const LDS = {
      [KEY1]: [item1._toFullJSON()],
      [`${PIN_PREFIX}_testPinName`]: [KEY1],
      [DEFAULT_PIN]: [KEY1],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    item1.set('updatedField', 'foo');
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([item1]));

    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(1);
    const mockQueryInstance = ParseQuery.mock.instances[0];

    expect(mockQueryInstance.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
  });

  it('updateFromServer on user', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;

    const user = new ParseUser();
    user.id = '1234';
    user._localId = null;

    const USER_KEY = LocalDatastore.getKeyForObject(user);
    const LDS = {
      [USER_KEY]: [user._toFullJSON()],
      [`${PIN_PREFIX}_testPinName`]: [USER_KEY],
      [DEFAULT_PIN]: [USER_KEY],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    user.set('updatedField', 'foo');
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([user]));

    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(1);
    const mockQueryInstance = ParseQuery.mock.instances[0];

    expect(mockQueryInstance.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(1);
  });

  it('updateFromServer ignore unsaved objects', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;

    const object = new ParseObject('Item');
    object._localId = 'local0';
    object.id = null;

    const OBJECT_KEY = LocalDatastore.getKeyForObject(object);
    const LDS = {
      [OBJECT_KEY]: [object._toFullJSON()],
      [KEY1]: [item1._toFullJSON()],
      [`${PIN_PREFIX}_testPinName`]: [KEY1, OBJECT_KEY],
      [DEFAULT_PIN]: [KEY1, OBJECT_KEY],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    item1.set('updatedField', 'foo');
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([item1]));

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
    const LDS = {
      [KEY1]: [item1._toFullJSON()],
      [`${PIN_PREFIX}_testPinName`]: [KEY1],
      [DEFAULT_PIN]: [KEY1],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    mockQueryFind.mockImplementationOnce(() => {
      expect(LocalDatastore.isSyncing).toBe(true);
      return Promise.reject('Unable to connect to the Parse API');
    });

    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    await LocalDatastore.updateFromServer();

    expect(mockLocalStorageController.getAllContents).toHaveBeenCalledTimes(1);
    expect(ParseQuery).toHaveBeenCalledTimes(1);
    const mockQueryInstance = ParseQuery.mock.instances[0];

    expect(mockQueryInstance.equalTo.mock.calls.length).toBe(1);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockLocalStorageController.pinWithName).toHaveBeenCalledTimes(0);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(LocalDatastore.isSyncing).toBe(false);
  });

  it('updateFromServer on mixed object', async () => {
    LocalDatastore.isEnabled = true;
    LocalDatastore.isSyncing = false;
    const testObject = new ParseObject('TestObject');
    const LDS = {
      [KEY1]: [item1._toFullJSON()],
      [KEY2]: [item2._toFullJSON()],
      [LocalDatastore.getKeyForObject(testObject)]: [testObject._toFullJSON()],
      [`${PIN_PREFIX}_testPinName`]: [KEY1],
      [DEFAULT_PIN]: [KEY1],
    };

    mockLocalStorageController
      .getAllContents
      .mockImplementationOnce(() => LDS);

    mockQueryFind
      .mockImplementationOnce(() => Promise.resolve([item1, item2]))
      .mockImplementationOnce(() => Promise.resolve([testObject]));

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

  it('isLocalDatastoreKey', () => {
    expect(isLocalDatastoreKey(null)).toBe(false);
    expect(isLocalDatastoreKey('')).toBe(false);
    expect(isLocalDatastoreKey(DEFAULT_PIN)).toBe(true);
    expect(isLocalDatastoreKey(PIN_PREFIX)).toBe(true);
    expect(isLocalDatastoreKey(OBJECT_PREFIX)).toBe(true);
  });
});

describe('LocalDatastore (BrowserStorageController)', () => {
  beforeEach(async () => {
    CoreManager.setStorageController(BrowserStorageController);
    CoreManager.setLocalDatastoreController(LocalDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    expect(await LocalDatastore._getAllContents()).toEqual({ [KEY1]: [item1._toFullJSON()] });
    expect(await LocalDatastore._getRawStorage()).toEqual({ [KEY1]: JSON.stringify([item1._toFullJSON()]) });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    await LocalDatastore.unPinWithName(KEY1);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    expect(await LocalDatastore._getAllContents()).toEqual({});
    expect(await LocalDatastore._getRawStorage()).toEqual({});
  });

  it('can handle getAllContent error', async () => {
    await LocalDatastore.pinWithName('_default', [{ value: 'WILL_BE_MOCKED' }]);
    const windowSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'getItem')
      .mockImplementationOnce(() => {
        return '[1, ]';
      });
    const spy = jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    const LDS = await LocalDatastore._getAllContents();
    expect(LDS).toEqual({});
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    windowSpy.mockRestore();
  });

  it('can handle store error', async () => {
    const windowSpy = jest.spyOn(Object.getPrototypeOf(window.localStorage), 'setItem')
      .mockImplementationOnce(() => {
        throw new Error('error thrown');
      });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
    windowSpy.mockRestore();
  });
});

describe('LocalDatastore (DefaultStorageController)', () => {
  beforeEach(async () => {
    CoreManager.setStorageController(DefaultStorageController);
    CoreManager.setLocalDatastoreController(LocalDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    expect(await LocalDatastore._getAllContents()).toEqual({ [KEY1]: [item1._toFullJSON()] });
    expect(await LocalDatastore._getRawStorage()).toEqual({ [KEY1]: JSON.stringify([item1._toFullJSON()]) });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    await LocalDatastore.unPinWithName(KEY1);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    expect(await LocalDatastore._getAllContents()).toEqual({});
    expect(await LocalDatastore._getRawStorage()).toEqual({});
  });
});

describe('LocalDatastore (RNDatastoreController)', () => {
  beforeEach(async () => {
    CoreManager.setAsyncStorage(mockAsyncStorage);
    CoreManager.setLocalDatastoreController(RNDatastoreController);
    await LocalDatastore._clear();
  });

  it('can store and retrieve values', async () => {
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    expect(await LocalDatastore._getAllContents()).toEqual({ [KEY1]: [item1._toFullJSON()] });
    expect(await LocalDatastore._getRawStorage()).toEqual({ [KEY1]: JSON.stringify([item1._toFullJSON()]) });
  });

  it('can remove values', async () => {
    await LocalDatastore.pinWithName(KEY1, [item1._toFullJSON()]);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([item1._toFullJSON()]);
    await LocalDatastore.unPinWithName(KEY1);
    expect(await LocalDatastore.fromPinWithName(KEY1)).toEqual([]);
    expect(await LocalDatastore._getAllContents()).toEqual({});
    expect(await LocalDatastore._getRawStorage()).toEqual({});
  });

  it('can handle store error', async () => {
    const mockStorageError = {
      setItem() {
        throw new Error('error thrown');
      },
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    CoreManager.setAsyncStorage(mockStorageError);
    try {
      await LocalDatastore.pinWithName('myKey', [{ name: 'test' }]);
    } catch (e) {
      expect(e.message).toBe('error thrown');
    }
  });

  it('can handle getAllContents undefined', async () => {
    await RNDatastoreController.pinWithName(KEY1, undefined);
    const contents = await RNDatastoreController.getAllContents();
    expect(contents[KEY1]).toEqual(null);
  });

  it('can handle getAllContents non-LDS object', async () => {
    await RNDatastoreController.pinWithName(KEY1, item1._toFullJSON());
    await RNDatastoreController.pinWithName('DO_NOT_FETCH', undefined);
    const contents = await RNDatastoreController.getAllContents();
    expect(contents[KEY1]).toEqual(item1._toFullJSON());
    expect(contents['DO_NOT_FETCH']).toBeUndefined();
  });

  it('can handle clear error', async () => {
    const mockStorageError = {
      multiRemove(keys, cb) {
        cb('error thrown');
      },
      getAllKeys(cb) {
        cb(undefined, [KEY1, 'DO_NOT_CLEAR']);
      }
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    CoreManager.setAsyncStorage(mockStorageError);
    await LocalDatastore._clear();
  });

  it('can handle multiget error', async () => {
    const mockStorageError = {
      multiGet(keys, cb) {
        cb('error thrown');
      },
      getAllKeys(cb) {
        cb(undefined, [KEY1, 'DO_NOT_CLEAR']);
      }
    };
    jest.spyOn(console, 'error').mockImplementationOnce(() => {});
    CoreManager.setAsyncStorage(mockStorageError);
    const LDS = await LocalDatastore._getAllContents();
    expect(LDS).toEqual({});
  });
});
