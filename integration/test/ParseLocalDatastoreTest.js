'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');
const TestObject = Parse.Object.extend('TestObject');
const Item = Parse.Object.extend('Item');

global.localStorage = require('./mockLocalStorage');
const mockRNStorage = require('./mockRNStorage');
const LocalDatastoreUtils = require('../../lib/node/LocalDatastoreUtils');

const DEFAULT_PIN = LocalDatastoreUtils.DEFAULT_PIN;
const PIN_PREFIX = LocalDatastoreUtils.PIN_PREFIX;

function LDS_KEY(object) {
  return Parse.LocalDatastore.getKeyForObject(object);
}
function LDS_FULL_JSON(object) {
  const json = object._toFullJSON();
  if (object._localId) {
    json._localId = object._localId;
  }
  return json;
}
function runTest(controller) {
  describe(`Parse Object Pinning (${controller.name})`, () => {
    beforeEach(async () => {
      const StorageController = require(controller.file);
      Parse.CoreManager.setAsyncStorage(mockRNStorage);
      Parse.CoreManager.setLocalDatastoreController(StorageController);
      Parse.enableLocalDatastore();
      await Parse.LocalDatastore._clear();
    });

    it(`${controller.name} can clear localDatastore`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];
      await Parse.Object.pinAll(objects);
      await Parse.Object.pinAllWithName('test_pin', objects);
      await Parse.Object.saveAll(objects);

      await Parse.LocalDatastore.pinWithName('DO_NOT_CLEAR', {});

      let storage = await Parse.LocalDatastore._getRawStorage();
      assert.equal(Object.keys(storage).length, 6);

      await Parse.LocalDatastore._clear();

      storage = await Parse.LocalDatastore._getRawStorage();
      assert.equal(Object.keys(storage).length, 1);
      assert.equal(storage['DO_NOT_CLEAR'], '{}');
      await Parse.LocalDatastore.unPinWithName('DO_NOT_CLEAR');
    });

    it(`${controller.name} can getAllContents localDatastore`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];
      await Parse.Object.pinAll(objects);
      await Parse.Object.pinAllWithName('test_pin', objects);
      await Parse.Object.saveAll(objects);

      await Parse.LocalDatastore.pinWithName('DO_NOT_FETCH', {});

      const storage = await Parse.LocalDatastore._getRawStorage();
      assert.equal(Object.keys(storage).length, 6);

      const LDS = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(LDS).length, 5);
      assert.equal(LDS['DO_NOT_FETCH'], null);
    });

    it(`${controller.name} can pin (unsaved)`, async () => {
      const object = new TestObject();
      await object.pin();
      // Since object not saved check localId
      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(object)]);
      assert.deepEqual(localDatastore[LDS_KEY(object)], [LDS_FULL_JSON(object)]);
      await object.save();
      // Check if localDatastore updated localId to objectId
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(object)]);
      assert.deepEqual(localDatastore[LDS_KEY(object)], [object._toFullJSON()]);
    });

    it(`${controller.name} can store data to pin (unsaved)`, async () => {
      const object = new TestObject();
      object.set('foo', 'bar');
      await object.pin();

      const query = new Parse.Query(TestObject);
      query.fromLocalDatastore();
      let results = await query.find();
      assert.equal(results.length, 1);

      let pinnedObject = results[0];
      assert.equal(pinnedObject.get('foo'), 'bar');
      pinnedObject.set('foo', 'baz');
      await pinnedObject.pin();

      results = await query.find();
      assert.equal(results.length, 1);
      pinnedObject = results[0];
      assert.equal(pinnedObject.get('foo'), 'baz');
    });

    it(`${controller.name} can query unsaved pin and save`, async () => {
      const object = new TestObject();
      object.set('foo', 'bar');
      await object.pin();

      const query = new Parse.Query(TestObject);
      query.fromLocalDatastore();
      let results = await query.find();

      assert.equal(results.length, 1);

      let pinnedObject = results[0];
      assert.equal(pinnedObject.get('foo'), 'bar');

      pinnedObject.set('foo', 'baz');
      await pinnedObject.save();

      assert(pinnedObject.id);
      assert.equal(pinnedObject._localId, undefined);

      results = await query.find();
      pinnedObject = results[0];

      assert.equal(pinnedObject.get('foo'), 'baz');
      assert(pinnedObject.id);
      assert.equal(pinnedObject._localId, undefined);
    });

    it(`${controller.name} cannot pin unsaved pointer`, async () => {
      try {
        const object = new TestObject();
        const pointer = new Item();
        object.set('child', pointer);
        await object.pin();
      } catch (e) {
        assert.equal(e.message, 'Cannot create a pointer to an unsaved ParseObject');
      }
    });

    it(`${controller.name} can pin user (unsaved)`, async () => {
      const user = new Parse.User();
      user.set('field', 'test');
      await user.pin();

      const json = user._toFullJSON();
      json._localId = user._localId;

      const localDatastore = await Parse.LocalDatastore._getAllContents();
      const cachedObject = localDatastore[LDS_KEY(user)][0];
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(user)]);
      assert.deepEqual(localDatastore[LDS_KEY(user)], [json]);
      assert.equal(cachedObject.objectId, user.id);
      assert.equal(cachedObject.field, 'test');
      await Parse.User.logOut();
    });

    it(`${controller.name} can pin user (saved)`, async () => {
      const user = new Parse.User();
      user.set('field', 'test');
      user.setPassword('asdf');
      user.setUsername('zxcv');
      await user.signUp()
      await user.pin();

      const json = user._toFullJSON();
      delete json.password;

      const localDatastore = await Parse.LocalDatastore._getAllContents();
      const cachedObject = localDatastore[LDS_KEY(user)][0];

      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(user)]);
      assert.deepEqual(localDatastore[LDS_KEY(user)], [json]);
      assert.equal(cachedObject.objectId, user.id);
      assert.equal(cachedObject.field, 'test');
      await Parse.User.logOut();
    });

    it(`${controller.name} can pin (saved)`, async () => {
      const object = new TestObject();
      object.set('field', 'test');
      await object.save();
      await object.pin();
      const localDatastore = await Parse.LocalDatastore._getAllContents();
      const cachedObject = localDatastore[LDS_KEY(object)][0];
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(object)]);
      assert.deepEqual(localDatastore[LDS_KEY(object)], [object._toFullJSON()]);
      assert.equal(cachedObject.objectId, object.id);
      assert.equal(cachedObject.field, 'test');
    });

    it(`${controller.name} can pin (twice saved)`, async () => {
      const object = new TestObject();
      object.set('field', 'test');
      await object.save();

      await object.pin();
      object.set('field', 'new info');
      await object.save();

      const localDatastore = await Parse.LocalDatastore._getAllContents();
      const cachedObject = localDatastore[LDS_KEY(object)][0];
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(object)]);
      assert.deepEqual(localDatastore[LDS_KEY(object)], [object._toFullJSON()]);
      assert.equal(cachedObject.objectId, object.id);
      assert.equal(cachedObject.field, 'new info');
    });

    it(`${controller.name} can check if pinned`, async () => {
      const object = new TestObject();
      object.set('field', 'test');
      await object.save();

      let isPinned = await object.isPinned();
      assert.equal(isPinned, false);

      await object.pin();
      isPinned = await object.isPinned();
      assert.equal(isPinned, true);

      await object.unPin();
      isPinned = await object.isPinned();
      assert.equal(isPinned, false);
    });

    it(`${controller.name} can pin (recursive)`, async () => {
      const parent = new TestObject();
      const child = new Item();
      const grandchild = new Item();
      child.set('grandchild', grandchild);
      parent.set('field', 'test');
      parent.set('child', child);
      await Parse.Object.saveAll([parent, child, grandchild]);
      await parent.pin();
      const localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(parent)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(child)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(grandchild)), true);
      assert.deepEqual(localDatastore[LDS_KEY(parent)], [parent._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(child)], [child._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(grandchild)], [grandchild._toFullJSON()]);
    });

    it(`${controller.name} can pin user (recursive)`, async () => {
      const parent = new TestObject();
      const child = new Parse.User();
      child.setUsername('username');
      child.setPassword('password');
      await child.signUp();
      parent.set('field', 'test');
      parent.set('child', child);
      await parent.save();
      await parent.pin();

      const parentJSON = parent._toFullJSON();
      const childJSON = child._toFullJSON();
      delete childJSON.password;
      delete parentJSON.child.password;

      const localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(parent)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(child)), true);
      assert.deepEqual(localDatastore[LDS_KEY(parent)], [parentJSON]);
      assert.deepEqual(localDatastore[LDS_KEY(child)], [childJSON]);
      await Parse.User.logOut();
    });

    it(`${controller.name} can pinAll (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can pinAll (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.saveAll(objects);

      await Parse.Object.pinAll(objects);
      const localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can pinAllWithName (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAllWithName('test_pin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can pinAllWithName (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];
      await Parse.Object.saveAll(objects);

      await Parse.Object.pinAllWithName('test_pin', objects);
      const localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPin on destroy`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      await obj1.pin();
      await obj2.pin();
      await obj1.pinWithName('test_pin');
      await obj2.pinWithName('test_pin');

      await Parse.Object.saveAll([obj1, obj2]);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 4);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj2)), true);
      assert(localDatastore[LDS_KEY(obj1)]);
      assert(localDatastore[LDS_KEY(obj2)]);

      await obj1.destroy();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 3);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj2)]);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [LDS_KEY(obj2)]);
      assert(localDatastore[LDS_KEY(obj2)]);
    });

    it(`${controller.name} can unPin on destroyAll`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];
      await Parse.Object.pinAll(objects);
      await Parse.Object.pinAllWithName('test_pin', objects);
      await Parse.Object.saveAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 5);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj3)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj3)), true);
      assert(localDatastore[LDS_KEY(obj1)]);
      assert(localDatastore[LDS_KEY(obj2)]);
      assert(localDatastore[LDS_KEY(obj3)]);

      await Parse.Object.destroyAll([obj1, obj3]);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 3);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj2)]);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_pin'], [LDS_KEY(obj2)]);
      assert(localDatastore[LDS_KEY(obj2)]);
    });

    it(`${controller.name} can unPin with pinAll (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await obj2.unPin();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPin with pinAll (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      await obj2.unPin();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);
    });

    it(`${controller.name} can unPin / unPinAll without pin (unsaved)`, async () => {
      const obj1 = new TestObject();
      await obj1.unPin();
      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 0);

      const obj2 = new TestObject();
      const obj3 = new TestObject();
      await Parse.Object.unPinAll([obj2, obj3]);
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 0);
    });

    it(`${controller.name} can unPin / unPinAll without pin (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const unPinObject = new TestObject();

      const objects = [obj1, obj2, obj3];

      await Parse.Object.saveAll(objects);

      await Parse.Object.unPinAll(objects);
      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 0);

      await unPinObject.save();
      await unPinObject.unPin();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 0);
    });

    it(`${controller.name} can unPinAll (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.unPinAll([obj1, obj2]);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAll (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      await Parse.Object.unPinAll([obj1, obj2]);
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllObjects (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.unPinAllObjects();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllObjects (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[DEFAULT_PIN], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      Parse.Object.unPinAllObjects();
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllWithName (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAllWithName('test_unpin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.unPinAllWithName('test_unpin', [obj1, obj2]);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllWithName (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAllWithName('test_unpin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      await Parse.Object.unPinAllWithName('test_unpin', [obj1, obj2]);
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 2);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllObjectsWithName (unsaved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAllWithName('test_unpin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.unPinAllObjectsWithName('test_unpin');

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPinAllObjectsWithName (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];

      await Parse.Object.pinAllWithName('test_unpin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 4);
      assert.deepEqual(localDatastore[PIN_PREFIX + 'test_unpin'], [LDS_KEY(obj1), LDS_KEY(obj2), LDS_KEY(obj3)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [LDS_FULL_JSON(obj1)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [LDS_FULL_JSON(obj2)]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [LDS_FULL_JSON(obj3)]);

      await Parse.Object.saveAll(objects);

      await Parse.Object.unPinAllObjectsWithName('test_unpin');
      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert.equal(Object.keys(localDatastore).length, 3);
      assert.deepEqual(localDatastore[LDS_KEY(obj1)], [obj1._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj2)], [obj2._toFullJSON()]);
      assert.deepEqual(localDatastore[LDS_KEY(obj3)], [obj3._toFullJSON()]);
    });

    it(`${controller.name} can unPin and save reference`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const objects = [obj1, obj2, obj3];
      await Parse.Object.pinAll(objects);
      await Parse.Object.pinAllWithName('test_pin', objects);
      await Parse.Object.saveAll(objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 5);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj3)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj3)), true);
      assert(localDatastore[LDS_KEY(obj1)]);
      assert(localDatastore[LDS_KEY(obj2)]);
      assert(localDatastore[LDS_KEY(obj3)]);

      await obj1.unPin();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(localDatastore[LDS_KEY(obj1)]);
    });

    it(`${controller.name} can unPin and save reference with children`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const obj3 = new TestObject();
      const child = new TestObject();
      obj1.set('child', child);
      const objects = [obj1, obj2, obj3];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);
      await Parse.Object.pinAllWithName('test_pin', objects);

      let localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(Object.keys(localDatastore).length === 6);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(obj3)), true);
      assert.equal(localDatastore[DEFAULT_PIN].includes(LDS_KEY(child)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj1)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj2)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(obj3)), true);
      assert.equal(localDatastore[PIN_PREFIX + 'test_pin'].includes(LDS_KEY(child)), true);
      assert(localDatastore[LDS_KEY(obj1)]);
      assert(localDatastore[LDS_KEY(obj2)]);
      assert(localDatastore[LDS_KEY(obj3)]);
      assert(localDatastore[LDS_KEY(child)]);

      await obj1.unPin();

      localDatastore = await Parse.LocalDatastore._getAllContents();
      assert(localDatastore[LDS_KEY(obj1)]);
      assert(localDatastore[LDS_KEY(child)]);
    });

    it(`${controller.name} cannot fetchFromLocalDatastore (unsaved)`, async () => {
      try {
        const object = new TestObject();
        await object.fetchFromLocalDatastore();
      } catch (e) {
        assert.equal(e.message, 'Cannot fetch an unsaved ParseObject');
      }
    });

    it(`${controller.name} cannot fetchFromLocalDatastore (pinned but not saved)`, async () => {
      try {
        const object = new TestObject();
        await object.pin();
        await object.fetchFromLocalDatastore();
      } catch (e) {
        assert.equal(e.message, 'Cannot fetch an unsaved ParseObject');
      }
    });

    it(`${controller.name} can fetchFromLocalDatastore (saved)`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();

      obj1.set('field', 'test');
      obj1.set('foo', 'bar');
      await obj1.pin();
      await obj1.save();

      obj2.id = obj1.id;
      await obj2.fetchFromLocalDatastore();
      assert.deepEqual(obj1.toJSON(), obj2.toJSON());
      assert.deepEqual(obj1._toFullJSON(), obj2._toFullJSON());

      const obj3 = TestObject.createWithoutData(obj1.id);
      await obj3.fetchFromLocalDatastore();
      assert.deepEqual(obj1.toJSON(), obj3.toJSON());
      assert.deepEqual(obj1._toFullJSON(), obj3._toFullJSON());

      const obj4 = TestObject.createWithoutData(obj1.id);
      obj4.set('field', 'will not override');
      await obj4.fetchFromLocalDatastore();
      assert.equal(obj4.get('field'), 'will not override');
      assert.equal(obj4.get('foo'), 'bar');
    });

    it(`${controller.name} can fetchFromLocalDatastore with children`, async () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      const child = new TestObject();
      const grandchild = new TestObject();

      obj1.set('field', 'test');
      obj1.set('child', child);
      await obj1.save();
      await obj1.pin();

      grandchild.set('field', 'shouldAlsoHave');
      child.set('field', 'shouldHave');
      child.set('grandchild', grandchild);
      await child.save();

      obj2.id = obj1.id;
      await obj2.fetchFromLocalDatastore();

      assert.deepEqual(obj1.toJSON(), obj2.toJSON());
      assert.deepEqual(obj1._toFullJSON(), obj2._toFullJSON());
      assert.deepEqual(obj2.toJSON().child.field, 'shouldHave');
      assert.deepEqual(obj2.toJSON().child.grandchild.field, 'shouldAlsoHave');
    });

    it(`${controller.name} can fetchFromLocalDatastore break multiple cycle`, async () => {
      const A = new TestObject({ value: 'A'});
      const B = new TestObject({ value: 'B'});
      const C = new TestObject({ value: 'C'});
      const D = new TestObject({ value: 'D'});
      const E = new TestObject({ value: 'E'});

      await Parse.Object.saveAll([A, B, C, D, E]);
      /*
        Cycles:
          A->B->A
          A->C->D->C

                A ------|
              / | \     |
             B  C  E    D
            /   |   \
           A    D    C
                |
                C
      */
      A.set('B', B);
      A.set('C', C);
      A.set('E', E);
      A.set('D', D);
      B.set('A', A);
      C.set('D', D);
      D.set('C', C);
      E.set('C', C);
      await Parse.Object.saveAll([A, B, C, D, E]);
      await A.pin();

      const object = new TestObject();

      object.id = A.id;
      await object.fetchFromLocalDatastore();
      const root = object.toJSON();

      assert.deepEqual(root.B.A.__type, 'Pointer');
      assert.deepEqual(root.C.D.C.__type, 'Pointer');
      assert.deepEqual(root.E.C.__type, 'Object');
      assert.deepEqual(root.D.__type, 'Object');
    });

    it('fetch updates LocalDatastore', async () => {
      const item = new Item({ foo: 'bar' });
      await item.save();
      await item.pin();

      const params = { id: item.id };
      await Parse.Cloud.run('TestFetchFromLocalDatastore', params);

      let localDatastore = await Parse.LocalDatastore._getAllContents();

      assert.equal(localDatastore[LDS_KEY(item)][0].foo, 'bar');

      const itemAgain = new Item();
      itemAgain.id = item.id;
      const fetchedItem = await itemAgain.fetch();

      localDatastore = await Parse.LocalDatastore._getAllContents();

      assert.equal(itemAgain.get('foo'), 'changed');
      assert.equal(fetchedItem.get('foo'), 'changed');
      assert.equal(localDatastore[LDS_KEY(item)][0].foo, 'changed');
    });

    it('fetchAll updates LocalDatastore', async () => {
      const item1 = new Item({ foo: 'bar' });
      const item2 = new Item({ foo: 'baz' });

      await Parse.Object.saveAll([item1, item2]);
      await Parse.Object.pinAll([item1, item2]);

      let params = { id: item1.id };
      await Parse.Cloud.run('TestFetchFromLocalDatastore', params);
      params = { id: item2.id };
      await Parse.Cloud.run('TestFetchFromLocalDatastore', params);

      let localDatastore = await Parse.LocalDatastore._getAllContents();

      assert.equal(localDatastore[LDS_KEY(item1)][0].foo, 'bar');
      assert.equal(localDatastore[LDS_KEY(item2)][0].foo, 'baz');

      const item1Again = new Item();
      item1Again.id = item1.id;
      const item2Again = new Item();
      item2Again.id = item2.id;

      const fetchedItems = await Parse.Object.fetchAll([item1Again, item2Again]);

      localDatastore = await Parse.LocalDatastore._getAllContents();

      assert.equal(item1Again.get('foo'), 'changed');
      assert.equal(item2Again.get('foo'), 'changed');
      assert.equal(fetchedItems[0].get('foo'), 'changed');
      assert.equal(fetchedItems[1].get('foo'), 'changed');
      assert.equal(localDatastore[LDS_KEY(fetchedItems[0])][0].foo, 'changed');
      assert.equal(localDatastore[LDS_KEY(fetchedItems[1])][0].foo, 'changed');
    });

    it(`${controller.name} can update Local Datastore from network`, async () => {
      const parent = new TestObject();
      const child = new Item();
      const grandchild = new Item();
      child.set('grandchild', grandchild);
      parent.set('field', 'test');
      parent.set('child', child);
      await Parse.Object.saveAll([parent, child, grandchild]);
      await parent.pin();

      // Updates child with { foo: 'changed' }
      const params = { id: child.id };
      await Parse.Cloud.run('TestFetchFromLocalDatastore', params);

      Parse.LocalDatastore.isSyncing = false;

      await Parse.LocalDatastore.updateFromServer();

      const updatedLDS = await Parse.LocalDatastore._getAllContents();
      const childJSON = updatedLDS[LDS_KEY(child)];
      assert.equal(childJSON.foo, 'changed');
    });

    it(`${controller.name} can update Local Datastore from network ignore unsaved`, async () => {
      const object = new TestObject();
      const item = new Item();
      await item.save();
      await Parse.Object.pinAll([object, item]);

      // Updates item with { foo: 'changed' }
      const params = { id: item.id };
      await Parse.Cloud.run('TestFetchFromLocalDatastore', params);

      Parse.LocalDatastore.isSyncing = false;

      await Parse.LocalDatastore.updateFromServer();

      const updatedLDS = await Parse.LocalDatastore._getAllContents();
      const itemJSON = updatedLDS[LDS_KEY(item)];
      assert.equal(itemJSON.foo, 'changed');
    });

    it(`${controller.name} can update Local Datastore User from network`, async () => {
      const user = new Parse.User();
      user.setUsername('asdf');
      user.setPassword('zxcv');
      await user.signUp();
      await user.pin();

      // Updates user with { foo: 'changed' }
      const params = { id: user.id };
      await Parse.Cloud.run('UpdateUser', params);

      Parse.LocalDatastore.isSyncing = false;

      await Parse.LocalDatastore.updateFromServer();

      const updatedLDS = await Parse.LocalDatastore._getAllContents();
      const userJSON = updatedLDS[LDS_KEY(user)];
      assert.equal(userJSON.foo, 'changed');
      await Parse.User.logOut();
    });
  });

  describe(`Parse Query Pinning (${controller.name})`, () => {
    beforeEach(async () => {
      const StorageController = require(controller.file);
      Parse.CoreManager.setAsyncStorage(mockRNStorage);
      Parse.CoreManager.setLocalDatastoreController(StorageController);
      Parse.enableLocalDatastore();
      Parse.LocalDatastore._clear();

      const numbers = [];
      for (let i = 0; i < 10; i++) {
        numbers[i] = new Parse.Object({ className: 'BoxedNumber', number: i });
      }
      await Parse.Object.saveAll(numbers);
      await Parse.Object.pinAll(numbers);
    });

    it(`${controller.name} can query from pin with name`, async () => {
      const obj1 = new TestObject({ field: 1 });
      const obj2 = new TestObject({ field: 2 });
      const obj3 = new TestObject({ field: 3 });
      const item = new Item();
      const objects = [obj1, obj2, obj3, item];
      await Parse.Object.saveAll(objects);

      await Parse.Object.pinAllWithName('test_pin', objects);
      const query = new Parse.Query(TestObject);
      query.greaterThan('field', 1);
      query.fromPinWithName('test_pin');
      const results = await query.find();

      assert.equal(results.length, 2);
      assert(results[0].get('field') > 1);
      assert(results[1].get('field') > 1);
    });

    it(`${controller.name} can query from local datastore`, async () => {
      const obj1 = new TestObject({ field: 1 });
      const obj2 = new TestObject({ field: 2 });
      const obj3 = new TestObject({ field: 3 });
      const objects = [obj1, obj2, obj3];
      await Parse.Object.saveAll(objects);

      await Parse.Object.pinAll(objects);
      const query = new Parse.Query(TestObject);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 3);
    });

    it(`${controller.name} can query from pin`, async () => {
      const obj1 = new TestObject({ field: 1 });
      const obj2 = new TestObject({ field: 2 });
      const obj3 = new TestObject({ field: 3 });
      const obj4 = new TestObject({ field: 4 });
      const objects = [obj1, obj2, obj3];

      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);
      await obj4.save();
      await obj4.pinWithName('DO_NOT_QUERY');

      const query = new Parse.Query(TestObject);
      query.fromPin();
      const results = await query.find();

      assert.equal(results.length, 3);
    });

    it(`${controller.name} can query user from pin`, async () => {
      const user = await Parse.User.signUp('asdf', 'zxcv', { foo: 'bar' });
      await user.pin();

      const query = new Parse.Query(Parse.User);
      query.fromPin();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].getSessionToken(), user.getSessionToken());
      await Parse.User.logOut();
    });

    it(`${controller.name} can do basic queries`, async () => {
      const baz = new TestObject({ foo: 'baz' });
      const qux = new TestObject({ foo: 'qux' });
      await Parse.Object.saveAll([baz, qux]);
      await Parse.Object.pinAll([baz, qux]);
      const query = new Parse.Query(TestObject);
      query.equalTo('foo', 'baz');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('foo'), 'baz');
    });

    it(`${controller.name} can do a query with a limit`, async () => {
      const baz = new TestObject({ foo: 'baz' });
      const qux = new TestObject({ foo: 'qux' });
      await Parse.Object.saveAll([baz, qux]);
      await Parse.Object.pinAll([baz, qux]);
      const query = new Parse.Query(TestObject);
      query.limit(1);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(['baz', 'qux'].includes(results[0].get('foo')), true);
    });

    it(`${controller.name} can do equalTo queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('number', 3);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it('can do containedBy queries with numbers', async () => {
      const objects = [
        new TestObject({ containedBy:true, numbers: [0, 1, 2] }),
        new TestObject({ containedBy:true, numbers: [2, 0] }),
        new TestObject({ containedBy:true, numbers: [1, 2, 3, 4] }),
      ];

      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query(TestObject);
      query.equalTo('containedBy', true);
      query.containedBy('numbers', [1, 2, 3, 4, 5]);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it('can do containedBy queries with pointer', async () => {
      const objects = Array.from(Array(10).keys()).map((idx) => {
        const obj = new Parse.Object('Object');
        obj.set('key', idx);
        return obj;
      });

      const parent1 = new Parse.Object('Parent');
      const parent2 = new Parse.Object('Parent');
      const parent3 = new Parse.Object('Parent');

      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      // [0, 1, 2]
      parent1.set('objects', objects.slice(0, 3));

      const shift = objects.shift();
      // [2, 0]
      parent2.set('objects', [objects[1], shift]);

      // [1, 2, 3, 4]
      parent3.set('objects', objects.slice(1, 4));

      await Parse.Object.saveAll([parent1, parent2, parent3]);
      await Parse.Object.pinAll([parent1, parent2, parent3]);

      const query = new Parse.Query('Parent');
      query.containedBy('objects', objects);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].id, parent3.id);
    });

    it(`${controller.name} can test equality with undefined`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('number', undefined);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 0);
    });

    it(`${controller.name} can perform lessThan queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.lessThan('number', 7);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 7);
    });

    it(`${controller.name} can perform lessThanOrEqualTo queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.lessThanOrEqualTo('number', 7);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 8);
    });

    it(`${controller.name} can perform greaterThan queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.greaterThan('number', 7);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 2);
    });

    it(`${controller.name} can perform greaterThanOrEqualTo queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.greaterThanOrEqualTo('number', 7);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 3);
    });

    it(`${controller.name} can combine lessThanOrEqualTo and greaterThanOrEqualTo queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.lessThanOrEqualTo('number', 7);
      query.greaterThanOrEqualTo('number', 7);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} can combine lessThan and greaterThan queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.lessThan('number', 9);
      query.greaterThan('number', 3);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 5);
    });

    it(`${controller.name} can perform notEqualTo queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.notEqualTo('number', 5);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 9);
    });

    it(`${controller.name} can perform containedIn queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.containedIn('number', [3,5,7,9,11]);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 4);
    });

    it(`${controller.name} can perform notContainedIn queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.notContainedIn('number', [3,5,7,9,11]);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 6);
    });

    it(`${controller.name} can test objectId in containedIn queries`, async () => {
      const numbers = await new Parse.Query('BoxedNumber').ascending('number').find();
      const ids = [numbers[2].id, numbers[3].id, 'nonsense'];
      const query = new Parse.Query('BoxedNumber');
      query.containedIn('objectId', ids);
      query.ascending('number');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 2);
      assert.equal(results[0].get('number'), 2);
      assert.equal(results[1].get('number'), 3);
    });

    it(`${controller.name} can test objectId in equalTo queries`, async () => {
      const numbers = await new Parse.Query('BoxedNumber').ascending('number').find();
      const id = numbers[5].id;
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('objectId', id);
      query.ascending('number');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('number'), 5);
    });

    it(`${controller.name} can find no elements`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('number', 15);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 0);
    });

    it(`${controller.name} handles when find throws errors`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('$foo', 'bar');
      query.fromLocalDatastore();
      try {
        await query.find();
        assert.equal(true, false);
      } catch (e) {
        assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      }
    });

    it(`${controller.name} can get by objectId`, async () => {
      const object = new TestObject();
      await object.pin();
      await object.save();
      const query = new Parse.Query(TestObject);
      query.fromLocalDatastore();

      const result = await query.get(object.id);
      assert.equal(result.id, object.id);
      assert(result.createdAt);
      assert(result.updatedAt);
    });

    it(`${controller.name} handles get with undefined id`, async () => {
      const object = new TestObject();
      await object.pin();
      await object.save();
      const query = new Parse.Query(TestObject);
      query.fromLocalDatastore();
      try {
        await query.get(undefined);
        assert.equal(false, true);
      } catch(e) {
        assert.equal(e.code, Parse.Error.OBJECT_NOT_FOUND);
      }
    });

    it(`${controller.name} can query for the first result`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.descending('number');
      query.fromLocalDatastore();
      const result = await query.first();
      assert.equal(result.get('number'), 9);
    });

    it(`${controller.name} can query for the first with no results`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('number', 20);
      query.fromLocalDatastore();
      const result = await query.first();
      assert.equal(result, undefined);
    });

    it(`${controller.name} can query for the first with two results`, async () => {
      const objects = [new TestObject({x: 44}), new TestObject({x: 44})];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);
      const query = new Parse.Query(TestObject);
      query.equalTo('x', 44);
      query.fromLocalDatastore();

      const result = await query.first();
      assert.equal(result.get('x'), 44);
    });

    it(`${controller.name} handles when first throws errors`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.equalTo('$foo', 'bar');
      try {
        query.fromLocalDatastore();
        await query.first();
        assert.equal(true, false);
      } catch (e) {
        assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      }
    });

    it(`${controller.name} can test object inequality`, async () => {
      const item1 = new TestObject();
      const item2 = new TestObject();
      const container1 = new Parse.Object({className: 'CoolContainer', item: item1});
      const container2 = new Parse.Object({className: 'CoolContainer', item: item2});
      const objects = [item1, item2, container1, container2];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);
      const query = new Parse.Query('CoolContainer');
      query.notEqualTo('item', item1);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} can skip`, async () => {
      const objects = [
        new TestObject({ canSkip: true }),
        new TestObject({ canSkip: true }),
        new TestObject({ canSkip: true }),
      ];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      let query = new Parse.Query(TestObject);
      query.equalTo('canSkip', true);
      query.skip(1);
      query.fromLocalDatastore();
      let results = await query.find();
      assert.equal(results.length, 2);

      query = new Parse.Query(TestObject);
      query.equalTo('canSkip', true);
      query.skip(3);
      query.fromLocalDatastore();
      results = await query.find();
      assert.equal(results.length, 0);
    });

    it(`${controller.name} does not consider skip in count queries`, async () => {
      await Parse.Object.saveAll([
        new TestObject({ skipCount: true }),
        new TestObject({ skipCount: true }),
        new TestObject({ skipCount: true })
      ]);
      let query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      query.fromLocalDatastore();
      let count = await query.count();
      assert.equal(count, 3);

      query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      query.skip(1);
      query.fromLocalDatastore();
      count = await query.count();
      assert.equal(count, 3);

      query = new Parse.Query(TestObject);
      query.equalTo('skipCount', true);
      query.skip(2);
      query.fromLocalDatastore();
      count = await query.count();
      assert.equal(count, 3);
    });

    it(`${controller.name} can perform count queries`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.greaterThan('number', 1);
      query.fromLocalDatastore();
      const count = await query.count()
      assert.equal(count, 8);
    });

    it(`${controller.name} can order by ascending numbers`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.ascending('number');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results[0].get('number'), 0);
      assert.equal(results[9].get('number'), 9);
    });

    it(`${controller.name} can order by descending numbers`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.descending('number');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results[0].get('number'), 9);
      assert.equal(results[9].get('number'), 0);
    });

    it(`${controller.name} can order by ascending number then descending string`, async () => {
      const objects = [
        new TestObject({ doubleOrder: true, number: 3, string: 'a' }),
        new TestObject({ doubleOrder: true, number: 1, string: 'b' }),
        new TestObject({ doubleOrder: true, number: 3, string: 'c' }),
        new TestObject({ doubleOrder: true, number: 2, string: 'd' }),
      ];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query(TestObject);
      query.equalTo('doubleOrder', true);
      query.ascending('number').addDescending('string');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 1);
      assert.equal(results[0].get('string'), 'b');
      assert.equal(results[1].get('number'), 2);
      assert.equal(results[1].get('string'), 'd');
      assert.equal(results[2].get('number'), 3);
      assert.equal(results[2].get('string'), 'c');
      assert.equal(results[3].get('number'), 3);
      assert.equal(results[3].get('string'), 'a');
    });

    it(`${controller.name} can order by descending number then ascending string`, async () => {
      const objects = [
        new TestObject({ otherDoubleOrder: true, number: 3, string: 'a' }),
        new TestObject({ otherDoubleOrder: true, number: 1, string: 'b' }),
        new TestObject({ otherDoubleOrder: true, number: 3, string: 'c' }),
        new TestObject({ otherDoubleOrder: true, number: 2, string: 'd' }),
      ];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query(TestObject);
      query.equalTo('otherDoubleOrder', true);
      query.descending('number').addAscending('string');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'a');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'c');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
    });

    it(`${controller.name} can order by descending number and string`, async () => {
      const objects = [
        new TestObject({ doubleDescending: true, number: 3, string: 'a' }),
        new TestObject({ doubleDescending: true, number: 1, string: 'b' }),
        new TestObject({ doubleDescending: true, number: 3, string: 'c' }),
        new TestObject({ doubleDescending: true, number: 2, string: 'd' }),
      ];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      let query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number,string');
      query.fromLocalDatastore();
      let results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');

      query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number, string');
      query.fromLocalDatastore();
      results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');

      query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending(['number', 'string']);
      query.fromLocalDatastore();
      results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');

      query = new Parse.Query(TestObject);
      query.equalTo('doubleDescending', true);
      query.descending('number', 'string');
      query.fromLocalDatastore();
      results = await query.find();

      assert.equal(results.length, 4);
      assert.equal(results[0].get('number'), 3);
      assert.equal(results[0].get('string'), 'c');
      assert.equal(results[1].get('number'), 3);
      assert.equal(results[1].get('string'), 'a');
      assert.equal(results[2].get('number'), 2);
      assert.equal(results[2].get('string'), 'd');
      assert.equal(results[3].get('number'), 1);
      assert.equal(results[3].get('string'), 'b');
    });


    it(`${controller.name} can not order by password`, async () => {
      const query = new Parse.Query('BoxedNumber');
      query.ascending('_password');
      query.fromLocalDatastore();
      try {
        await query.find();
        assert.equal(true, false);
      } catch (e) {
        assert.equal(e.code, Parse.Error.INVALID_KEY_NAME);
      }
    });

    it(`${controller.name} can order by _created_at`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', orderedDate: true}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', orderedDate: true}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', orderedDate: true}).save();
      const obj4 = await new Parse.Object({className: 'TestObject', orderedDate: true}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, obj4]);

      const query = new Parse.Query('TestObject');
      query.equalTo('orderedDate', true);
      query.ascending('_created_at');
      query.fromLocalDatastore();
      const results = await query.find();

      assert(results[0].createdAt < results[1].createdAt);
      assert(results[1].createdAt < results[2].createdAt);
      assert(results[2].createdAt < results[3].createdAt);
    });

    it(`${controller.name} can order by createdAt`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', orderedDate2: true}).save();
      const obj4 = await new Parse.Object({className: 'TestObject', orderedDate2: true}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, obj4]);

      const query = new Parse.Query('TestObject');
      query.equalTo('orderedDate2', true);
      query.descending('createdAt');
      query.fromLocalDatastore();
      const results = await query.find();

      assert(results[0].createdAt > results[1].createdAt);
      assert(results[1].createdAt > results[2].createdAt);
      assert(results[2].createdAt > results[3].createdAt);
    });

    it(`${controller.name} can order by _updated_at`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', orderedDate3: true}).save();
      const obj4 = await new Parse.Object({className: 'TestObject', orderedDate3: true}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, obj4]);

      const query = new Parse.Query('TestObject');
      query.equalTo('orderedDate3', true);
      query.ascending('_updated_at');
      query.fromLocalDatastore();
      const results = await query.find();

      assert(results[0].updatedAt < results[1].updatedAt);
      assert(results[1].updatedAt < results[2].updatedAt);
      assert(results[2].updatedAt < results[3].updatedAt);
    });

    it(`${controller.name} can order by updatedAt`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', orderedDate4: true}).save();
      const obj4 = await new Parse.Object({className: 'TestObject', orderedDate4: true}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, obj4]);

      const query = new Parse.Query('TestObject');
      query.equalTo('orderedDate4', true);
      query.ascending('updatedAt');
      query.fromLocalDatastore();
      const results = await query.find();

      assert(results[0].updatedAt < results[1].updatedAt);
      assert(results[1].updatedAt < results[2].updatedAt);
      assert(results[2].updatedAt < results[3].updatedAt);
    });

    it(`${controller.name} can test time equality`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', timed: true, name: 'item2'}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', timed: true, name: 'item1'}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', timed: true, name: 'item3'}).save();
      const last = await new Parse.Object({className: 'TestObject', timed: true, name: 'item4'}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, last]);

      const query = new Parse.Query('TestObject');
      query.equalTo('timed', true);
      query.equalTo('createdAt', last.createdAt);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'item4');
    });

    it(`${controller.name} can test time inequality`, async () => {
      const obj1 = await new Parse.Object({className: 'TestObject', timed2: true, name: 'item1'}).save();
      const obj2 = await new Parse.Object({className: 'TestObject', timed2: true, name: 'item2'}).save();
      const obj3 = await new Parse.Object({className: 'TestObject', timed2: true, name: 'item3'}).save();
      const obj4 = await new Parse.Object({className: 'TestObject', timed2: true, name: 'item4'}).save();

      await Parse.Object.pinAll([obj1, obj2, obj3, obj4]);

      let query = new Parse.Query('TestObject');
      query.equalTo('timed2', true);
      query.lessThan('createdAt', obj3.createdAt);
      query.ascending('createdAt');
      query.fromLocalDatastore();
      let results = await query.find();

      assert.equal(results.length, 2);
      assert.equal(results[0].id, obj1.id);
      assert.equal(results[1].id, obj2.id);

      query = new Parse.Query('TestObject');
      query.equalTo('timed2', true);
      query.greaterThan('createdAt', obj3.createdAt);
      query.fromLocalDatastore();
      results = await query.find();
      assert.equal(results.length, 1);
      assert.equal(results[0].id, obj4.id);
    });

    it(`${controller.name} can test string matching`, async () => {
      const obj1 = new TestObject();
      obj1.set('myString', 'football');
      const obj2 = new TestObject();
      obj2.set('myString', 'soccer');
      await Parse.Object.saveAll([obj1, obj2]);
      await Parse.Object.pinAll([obj1, obj2]);
      let query = new Parse.Query(TestObject);
      query.matches('myString', '^fo*\\wb[^o]l+$');
      query.fromLocalDatastore();
      let results = await query.find();
      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'football');

      query = new Parse.Query(TestObject);
      query.matches('myString', /^fo*\wb[^o]l+$/);
      query.fromLocalDatastore();
      results = await query.find();
      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'football');
    });

    it(`${controller.name} can test case insensitive regex`, async () => {
      const obj = new TestObject();
      obj.set('myString', 'hockey');
      await obj.save();
      await obj.pin();
      const query = new Parse.Query(TestObject);
      query.matches('myString', 'Hockey', 'i');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('myString'), 'hockey');
    });

    it(`${controller.name} fails for invalid regex options`, async () => {
      const query = new Parse.Query(TestObject);
      query.matches('myString', 'football', 'some invalid thing');
      query.fromLocalDatastore();
      try {
        await query.find();
        assert.equal(true, false);
      } catch (e) {
        assert.equal(e.code, Parse.Error.INVALID_QUERY);
      }
    });

    it(`${controller.name} can use a regex with all modifiers`, async () => {
      const obj = new TestObject();
      obj.set('website', '\n\nbuffer\n\nparse.COM');
      await obj.save();
      await obj.pin();

      const query = new Parse.Query(TestObject);
      query.matches('website',/parse\.com/,'mixs');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} can include regexp modifiers in the constructor`, async () => {
      const obj = new TestObject();
      obj.set('website', '\n\nbuffer\n\nparse.COM');
      await obj.save();
      await obj.pin();

      const query = new Parse.Query(TestObject);
      query.matches('website', /parse\.com/mi);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} can test contains`, async () => {
      const someAscii = "\\E' !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTU" +
                      "VWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'";
      const objects = [
        new TestObject({contains: true, myString: 'zax' + someAscii + 'qub'}),
        new TestObject({contains: true, myString: 'start' + someAscii}),
        new TestObject({contains: true, myString: someAscii + 'end'}),
        new TestObject({contains: true, myString: someAscii})
      ];
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      let query = new Parse.Query(TestObject);
      query.equalTo('contains', true);
      query.startsWith('myString', someAscii);
      query.fromLocalDatastore();
      let results = await query.find();

      assert.equal(results.length, 2);
      query = new Parse.Query(TestObject);
      query.equalTo('contains', true);
      query.startsWith('myString', someAscii);
      query.fromLocalDatastore();
      results = await query.find();
      assert.equal(results.length, 2);
    });

    it(`${controller.name} can test if a key exists`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const item = new TestObject();
        if (i % 2) {
          item.set('y', i + 1);
        } else {
          item.set('z', i + 1);
        }
        objects.push(item);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query(TestObject);
      query.exists('y');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('y'));
      }
    });

    it(`${controller.name} can test if a key does not exist`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const item = new TestObject({ dne: true });
        if (i % 2) {
          item.set('y', i + 1);
        } else {
          item.set('z', i + 1);
        }
        objects.push(item);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query(TestObject);
      query.equalTo('dne', true);
      query.doesNotExist('y');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('z'));
      }
    });

    it(`${controller.name} can test if a relation exists`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const container = new Parse.Object('Container', { relation_exists: true });
        if (i % 2) {
          container.set('y', i);
        } else {
          const item = new TestObject();
          item.set('x', i);
          container.set('x', item);
          objects.push(item);
        }
        objects.push(container);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query('Container');
      query.equalTo('relation_exists', true);
      query.exists('x');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('x'));
      }
    });

    it(`${controller.name} can test if a relation does not exist`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const container = new Parse.Object('Container', { relation_dne: true });
        if (i % 2) {
          container.set('y', i);
        } else {
          const item = new TestObject();
          item.set('x', i);
          container.set('x', item);
          objects.push(item);
        }
        objects.push(container);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const query = new Parse.Query('Container');
      query.equalTo('relation_dne', true);
      query.doesNotExist('x');
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 5);
      for (let i = 0; i < results.length; i++) {
        assert(results[i].has('y'));
      }
    });

    // it(`${controller.name} does not include by default`, async () => {
    //   const child = new TestObject();
    //   const parent = new Parse.Object('Container');
    //   child.set('foo', 'bar');
    //   parent.set('child', child);
    //   await Parse.Object.saveAll([child, parent]);
    //   await Parse.Object.pinAll([child, parent]);

    //   const query = new Parse.Query('Container');
    //   query.equalTo('objectId', parent.id);
    //   query.fromLocalDatastore();
    //   const results = await query.find();
    //   assert.equal(results.length, 1);
    //   const parentAgain = results[0];

    //   assert(parentAgain.get('child'));
    //   assert(parentAgain.get('child').id);
    //   assert(!parentAgain.get('child').get('foo'));
    // });

    it(`${controller.name} can include nested objects`, async () => {
      const child = new TestObject();
      const parent = new Parse.Object('Container');
      child.set('foo', 'bar');
      parent.set('child', child);
      await Parse.Object.saveAll([child, parent]);
      await Parse.Object.pinAll([child, parent]);

      const query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.include('child');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      const parentAgain = results[0];

      assert(parentAgain.get('child'));
      assert(parentAgain.get('child').id);
      assert.equal(parentAgain.get('child').get('foo'), 'bar');
    });

    it(`${controller.name} can includeAll nested objects`, async () => {
      const child1 = new TestObject({ foo: 'bar' });
      const child2 = new TestObject({ foo: 'baz' });
      const child3 = new TestObject({ foo: 'bin' });
      const parent = new Parse.Object('Container');
      parent.set('child1', child1);
      parent.set('child2', child2);
      parent.set('child3', child3);
      await Parse.Object.saveAll([child1, child2, child3, parent]);
      await Parse.Object.pinAll([child1, child2, child3, parent]);

      const query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.includeAll();
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      const parentAgain = results[0];
      assert.equal(parentAgain.get('child1').get('foo'), 'bar');
      assert.equal(parentAgain.get('child2').get('foo'), 'baz');
      assert.equal(parentAgain.get('child3').get('foo'), 'bin');
    });

    it(`${controller.name} can includeAll nested objects in .each`, async () => {
      const child1 = new TestObject({ foo: 'bar' });
      const child2 = new TestObject({ foo: 'baz' });
      const child3 = new TestObject({ foo: 'bin' });
      const parent = new Parse.Object('Container');
      parent.set('child1', child1);
      parent.set('child2', child2);
      parent.set('child3', child3);
      await Parse.Object.saveAll([child1, child2, child3, parent]);

      const query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.includeAll();
      query.fromLocalDatastore();
      await query.each((obj) => {
        assert.equal(obj.get('child1').get('foo'), 'bar');
        assert.equal(obj.get('child2').get('foo'), 'baz');
        assert.equal(obj.get('child3').get('foo'), 'bin');
      });
    });

    it(`${controller.name} can include nested objects via array`, async () => {
      const child = new TestObject();
      const parent = new Parse.Object('Container');
      child.set('foo', 'bar');
      parent.set('child', child);
      await Parse.Object.saveAll([child, parent]);
      await Parse.Object.pinAll([child, parent]);

      const query = new Parse.Query('Container');
      query.equalTo('objectId', parent.id);
      query.include(['child']);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      const parentAgain = results[0];
      assert(parentAgain.get('child'));
      assert(parentAgain.get('child').id);
      assert.equal(parentAgain.get('child').get('foo'), 'bar');
    });

    it(`${controller.name} can do a nested include`, async () => {
      const Child = Parse.Object.extend('Child');
      const Parent = Parse.Object.extend('Parent');
      const Grandparent = Parse.Object.extend('Grandparent');

      const objects = [];
      for (let i = 0; i < 5; i++) {
        const grandparent = new Grandparent({
          nested: true,
          z: i,
          parent: new Parent({
            y: i,
            child: new Child({
              x: i
            }),
          }),
        });

        objects.push(grandparent);
      }

      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const q = new Parse.Query('Grandparent');
      q.equalTo('nested', true);
      q.include('parent.child');
      q.fromLocalDatastore();
      const results = await q.find();

      assert.equal(results.length, 5);
      results.forEach((o) => {
        assert.equal(o.get('z'), o.get('parent').get('y'));
        assert.equal(o.get('z'), o.get('parent').get('child').get('x'));
      });
    });

    it(`${controller.name} can include without changing dirty`, async () => {
      const parent = new Parse.Object('ParentObject');
      const child = new Parse.Object('ChildObject');
      parent.set('child', child);
      child.set('foo', 'bar');

      await Parse.Object.saveAll([child, parent]);
      await Parse.Object.pinAll([child, parent]);

      const query = new Parse.Query('ParentObject');
      query.include('child');
      query.equalTo('objectId', parent.id);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      const parentAgain = results[0];
      const childAgain = parentAgain.get('child');
      assert.equal(child.id, childAgain.id);
      assert.equal(parent.id, parentAgain.id);
      assert.equal(childAgain.get('foo'), 'bar');
      assert(!parentAgain.dirty());
      assert(!childAgain.dirty());
    });

    it(`${controller.name} uses subclasses when creating objects`, async () => {
      const ParentObject = Parse.Object.extend({ className: 'ParentObject' });
      let ChildObject = Parse.Object.extend('ChildObject', {
        foo() {
          return 'foo';
        }
      });

      const parent = new ParentObject();
      const child = new ChildObject();
      parent.set('child', child);
      await Parse.Object.saveAll([child, parent]);
      await Parse.Object.pinAll([child, parent]);
      ChildObject = Parse.Object.extend('ChildObject', {
        bar() {
          return 'bar';
        }
      });

      const query = new Parse.Query(ParentObject);
      query.equalTo('objectId', parent.id);
      query.include('child');
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      const parentAgain = results[0];
      const childAgain = parentAgain.get('child');
      assert.equal(childAgain.foo(), 'foo');
      assert.equal(childAgain.bar(), 'bar');
    });

    it(`${controller.name} can match the results of another query`, async () => {
      const ParentObject = Parse.Object.extend('ParentObject');
      const ChildObject = Parse.Object.extend('ChildObject');
      const objects = [];
      for (let i = 0; i < 10; i++) {
        objects.push(new ParentObject({
          child: new ChildObject({x: i, qtest: true}),
          x: 10 + i,
        }));
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const subQuery = new Parse.Query(ChildObject);
      subQuery.equalTo('qtest', true);
      subQuery.greaterThan('x', 5);
      const q = new Parse.Query(ParentObject);
      q.matchesQuery('child', subQuery);
      q.fromLocalDatastore();
      const results = await q.find();

      assert.equal(results.length, 4);
      results.forEach((o) => {
        assert(o.get('x') > 15);
      });
    });

    it(`${controller.name} can not match the results of another query`, async () => {
      const ParentObject = Parse.Object.extend('ParentObject');
      const ChildObject = Parse.Object.extend('ChildObject');
      const objects = [];
      for (let i = 0; i < 10; i++) {
        objects.push(new ParentObject({
          child: new ChildObject({x: i, dneqtest: true}),
          dneqtest: true,
          x: 10 + i,
        }));
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const subQuery = new Parse.Query(ChildObject);
      subQuery.equalTo('dneqtest', true);
      subQuery.greaterThan('x', 5);
      const q = new Parse.Query(ParentObject);
      q.equalTo('dneqtest', true);
      q.doesNotMatchQuery('child', subQuery);
      q.fromLocalDatastore();
      const results = await q.find();

      assert.equal(results.length, 6);
      results.forEach((o) => {
        assert(o.get('x') >= 10);
        assert(o.get('x') <= 15);
      });
    });

    it(`${controller.name} can select keys from a matched query`, async () => {
      const Restaurant = Parse.Object.extend('Restaurant');
      const Person = Parse.Object.extend('Person');
      const objects = [
        new Restaurant({ rating: 5, location: 'Djibouti' }),
        new Restaurant({ rating: 3, location: 'Ouagadougou' }),
        new Person({ name: 'Bob', hometown: 'Djibouti' }),
        new Person({ name: 'Tom', hometown: 'Ouagadougou' }),
        new Person({ name: 'Billy', hometown: 'Detroit' }),
      ];

      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      let query = new Parse.Query(Restaurant);
      query.greaterThan('rating', 4);
      let mainQuery = new Parse.Query(Person);
      mainQuery.matchesKeyInQuery('hometown', 'location', query);
      mainQuery.fromLocalDatastore();
      let results = await mainQuery.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('name'), 'Bob');

      query = new Parse.Query(Restaurant);
      query.greaterThan('rating', 4);
      mainQuery = new Parse.Query(Person);
      mainQuery.doesNotMatchKeyInQuery('hometown', 'location', query);
      mainQuery.ascending('name');
      mainQuery.fromLocalDatastore();
      results = await mainQuery.find();

      assert.equal(results.length, 2);
      assert(['Billy', 'Tom'].includes(results[0].get('name')));
      assert(['Billy', 'Tom'].includes(results[1].get('name')));
    });

    it(`${controller.name} supports objects with length`, async () => {
      const obj = new TestObject();
      obj.set('length', 5);
      assert.equal(obj.get('length'), 5);
      await obj.save();
      await obj.pin();

      const query = new Parse.Query(TestObject);
      query.equalTo('objectId', obj.id);
      query.fromLocalDatastore();
      const results = await query.find();

      assert.equal(results.length, 1);
      assert.equal(results[0].get('length'), 5);
    });

    it(`${controller.name} can include User fields`, async () => {
      const user = await Parse.User.signUp('bob', 'password', { age: 21 });
      const obj = new TestObject();
      await obj.save({ owner: user });
      await obj.pin();

      const query = new Parse.Query(TestObject);
      query.include('owner');
      query.fromLocalDatastore();
      const objAgain = await query.get(obj.id);

      assert(objAgain.get('owner') instanceof Parse.User);
      assert.equal(objAgain.get('owner').get('age'), 21);
      try {
        await Parse.User.logOut();
      } catch(e) { /* */ }
    });

    it(`${controller.name} can build OR queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const obj = new Parse.Object('BoxedNumber');
        obj.set({ x: i, orquery: true });
        objects.push(obj);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const q1 = new Parse.Query('BoxedNumber');
      q1.equalTo('orquery', true);
      q1.lessThan('x', 2);

      const q2 = new Parse.Query('BoxedNumber');
      q2.equalTo('orquery', true);
      q2.greaterThan('x', 5);

      const orQuery = Parse.Query.or(q1, q2);
      orQuery.fromLocalDatastore();
      const results = await orQuery.find();
      assert.equal(results.length, 6);
      results.forEach((number) => {
        assert(number.get('x') < 2 || number.get('x') > 5);
      });
    });

    it(`${controller.name} can build complex OR queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const child = new Parse.Object('Child');
        child.set('x', i);
        child.set('complexor', true);
        const parent = new Parse.Object('Parent');
        parent.set('child', child);
        parent.set('complexor', true);
        parent.set('y', i);
        objects.push(parent);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const subQuery = new Parse.Query('Child');
      subQuery.equalTo('x', 4);
      subQuery.equalTo('complexor', true);

      const q1 = new Parse.Query('Parent');
      q1.matchesQuery('child', subQuery);

      const q2 = new Parse.Query('Parent');
      q2.equalTo('complexor', true);
      q2.lessThan('y', 2);

      const orQuery = Parse.Query.or(q1, q2);
      orQuery.fromLocalDatastore();
      const results = await  orQuery.find();
      assert.equal(results.length, 3);
    });

    it(`${controller.name} can build AND queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const obj = new Parse.Object('BoxedNumber');
        obj.set({ x: i, and: true });
        objects.push(obj);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const q1 = new Parse.Query('BoxedNumber');
      q1.equalTo('and', true);
      q1.greaterThan('x', 2);

      const q2 = new Parse.Query('BoxedNumber');
      q2.equalTo('and', true);
      q2.lessThan('x', 5);

      const andQuery = Parse.Query.and(q1, q2);
      andQuery.fromLocalDatastore();
      const results = await andQuery.find();
      assert.equal(results.length, 2);
      results.forEach((number) => {
        assert(number.get('x') > 2 && number.get('x') < 5);
      });
    });

    it(`${controller.name} can build complex AND queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const child = new Parse.Object('Child');
        child.set('x', i);
        child.set('and', true);
        const parent = new Parse.Object('Parent');
        parent.set('child', child);
        parent.set('and', true);
        parent.set('y', i);
        objects.push(parent);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const subQuery = new Parse.Query('Child');
      subQuery.equalTo('x', 4);
      subQuery.equalTo('and', true);

      const q1 = new Parse.Query('Parent');
      q1.matchesQuery('child', subQuery);

      const q2 = new Parse.Query('Parent');
      q2.equalTo('and', true);
      q2.equalTo('y', 4);

      const andQuery = Parse.Query.and(q1, q2);
      andQuery.fromLocalDatastore();
      const results = await andQuery.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} can build NOR queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i += 1) {
        const obj = new Parse.Object('NORTest');
        obj.set({ x: i });
        objects.push(obj);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const q1 = new Parse.Query('NORTest');
      q1.greaterThan('x', 5);
      const q2 = new Parse.Query('NORTest');
      q2.lessThan('x', 3);
      const norQuery = Parse.Query.nor(q1, q2);
      norQuery.fromLocalDatastore();
      const results = await norQuery.find();

      assert.equal(results.length, 3);
      results.forEach((number) => {
        assert(number.get('x') >= 3 && number.get('x') <= 5);
      });
    });

    it(`${controller.name} can build complex NOR queries`, async () => {
      const objects = [];
      for (let i = 0; i < 10; i += 1) {
        const child = new Parse.Object('Child');
        child.set('x', i);
        const parent = new Parse.Object('Parent');
        parent.set('child', child);
        parent.set('y', i);
        objects.push(parent);
      }
      await Parse.Object.saveAll(objects);
      await Parse.Object.pinAll(objects);

      const subQuery = new Parse.Query('Child');
      subQuery.equalTo('x', 4);
      const q1 = new Parse.Query('Parent');
      q1.matchesQuery('child', subQuery);
      const q2 = new Parse.Query('Parent');
      q2.equalTo('y', 5);
      const norQuery = Parse.Query.nor(q1, q2);
      norQuery.fromLocalDatastore();
      const results = await norQuery.find();

      assert.equal(results.length, 8);
      results.forEach((number) => {
        assert(number.get('x') !== 4 || number.get('x') !== 5);
      });
    });

    it(`${controller.name} can iterate over results with each`, async () => {
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push(new TestObject({ x: i, eachtest: true }));
      }
      const seen = [];
      await Parse.Object.saveAll(items);
      await Parse.Object.pinAll(items);

      const query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.fromLocalDatastore();
      await query.each((obj) => {
        seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
      });
      assert.equal(seen.length, 25);
      for (let i = 0; i < seen.length; i++) {
        assert.equal(seen[i], 1);
      }
    });

    it(`${controller.name} fails query.each with order`, async () => {
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push(new TestObject({ x: i, eachtest: true }));
      }
      const seen = [];
      await Parse.Object.saveAll(items);
      await Parse.Object.pinAll(items);

      const query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.ascending('x');
      query.fromLocalDatastore();
      try {
        await query.each((obj) => {
          seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
        });
      } catch (e) {
        assert.equal(e, 'Cannot iterate on a query with sort, skip, or limit.');
      }
    });

    it(`${controller.name} fails query.each with limit`, async () => {
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push(new TestObject({ x: i, eachtest: true }));
      }
      const seen = [];
      await Parse.Object.saveAll(items);
      await Parse.Object.pinAll(items);

      const query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.limit(20);
      query.fromLocalDatastore();
      try {
        await query.each((obj) => {
          seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
        });
      } catch (e) {
        assert.equal(e, 'Cannot iterate on a query with sort, skip, or limit.');
      }
    });

    it(`${controller.name} fails query.each with skip`, async () => {
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push(new TestObject({ x: i, eachtest: true }));
      }
      const seen = [];
      await Parse.Object.saveAll(items);
      await Parse.Object.pinAll(items);

      const query = new Parse.Query(TestObject);
      query.equalTo('eachtest', true);
      query.lessThan('x', 25);
      query.skip(20);
      query.fromLocalDatastore();
      try {
        await query.each((obj) => {
          seen[obj.get('x')] = (seen[obj.get('x')] || 0) + 1;
        });
      } catch (e) {
        assert.equal(e, 'Cannot iterate on a query with sort, skip, or limit.');
      }
    });

    it(`${controller.name} can select specific keys`, async () => {
      const obj = new TestObject({ foo: 'baz', bar: 1 });
      await obj.save();
      await obj.pin();

      const q = new Parse.Query(TestObject);
      q.equalTo('objectId', obj.id);
      q.select('foo');
      q.fromLocalDatastore();
      const result = await q.first();

      assert(result.id);
      assert(result.createdAt);
      assert(result.updatedAt);
      assert(!result.dirty());
      assert.equal(result.get('foo'), 'baz');
      assert.equal(result.get('bar'), undefined);
    });

    it(`${controller.name} can select specific keys with each`, async () => {
      const obj = new TestObject({ foo: 'baz', bar: 1 });
      await obj.save();
      await obj.pin();

      const q = new Parse.Query(TestObject);
      q.equalTo('objectId', obj.id);
      q.select('foo');
      q.fromLocalDatastore();
      await q.each((o) => {
        assert(o.id);
        assert.equal(o.get('foo'), 'baz');
        assert.equal(o.get('bar'), undefined);
      });
    });

    it(`${controller.name} can query from date`, async () => {
      const now = new Date();
      const obj = new TestObject({ dateField: now });
      await obj.save();
      await obj.pin();

      let q = new Parse.Query(TestObject);
      q.equalTo('dateField', now);
      q.fromLocalDatastore();
      let objects = await q.find();
      assert.equal(objects.length, 1);

      const future = new Date(now.getTime() + 1000);
      q = new Parse.Query(TestObject);
      q.lessThan('dateField', future);
      q.fromLocalDatastore();
      objects = await q.find();
      assert.equal(objects.length, 1);

      q = new Parse.Query(TestObject);
      q.lessThanOrEqualTo('dateField', now);
      q.fromLocalDatastore();
      objects = await q.find();
      assert.equal(objects.length, 1);

      const past = new Date(now.getTime() - 1000);
      q = new Parse.Query(TestObject);
      q.greaterThan('dateField', past);
      q.fromLocalDatastore();
      objects = await q.find();
      assert.equal(objects.length, 1);

      q = new Parse.Query(TestObject);
      q.greaterThanOrEqualTo('dateField', now);
      q.fromLocalDatastore();
      objects = await q.find();
      assert.equal(objects.length, 1);
    });

    it(`${controller.name} supports withinPolygon`, async () => {
      const sacramento = new TestObject();
      sacramento.set('location', new Parse.GeoPoint(38.52, -121.50));
      sacramento.set('name', 'Sacramento');

      const honolulu = new TestObject();
      honolulu.set('location', new Parse.GeoPoint(21.35, -157.93));
      honolulu.set('name', 'Honolulu');

      const sf = new TestObject();
      sf.set('location', new Parse.GeoPoint(37.75, -122.68));
      sf.set('name', 'San Francisco');

      await Parse.Object.saveAll([sacramento, honolulu, sf]);
      await Parse.Object.pinAll([sacramento, honolulu, sf]);

      const points = [
        new Parse.GeoPoint(37.85, -122.33),
        new Parse.GeoPoint(37.85, -122.90),
        new Parse.GeoPoint(37.68, -122.90),
        new Parse.GeoPoint(37.68, -122.33)
      ];
      const query = new Parse.Query(TestObject);
      query.withinPolygon('location', points);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 1);
    });

    it(`${controller.name} supports polygonContains`, async () => {
      const p1 = [[0,0], [0,1], [1,1], [1,0]];
      const p2 = [[0,0], [0,2], [2,2], [2,0]];
      const p3 = [[10,10], [10,15], [15,15], [15,10], [10,10]];

      const polygon1 = new Parse.Polygon(p1);
      const polygon2 = new Parse.Polygon(p2);
      const polygon3 = new Parse.Polygon(p3);

      const obj1 = new TestObject({ polygon: polygon1 });
      const obj2 = new TestObject({ polygon: polygon2 });
      const obj3 = new TestObject({ polygon: polygon3 });

      await Parse.Object.saveAll([obj1, obj2, obj3]);
      await Parse.Object.pinAll([obj1, obj2, obj3]);

      const point = new Parse.GeoPoint(0.5, 0.5);
      const query = new Parse.Query(TestObject);
      query.polygonContains('polygon', point);
      query.fromLocalDatastore();
      const results = await query.find();
      assert.equal(results.length, 2);
    });
  });
}

describe('Parse LocalDatastore', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.CoreManager.getInstallationController()._setInstallationIdCache('1234');
    Parse.enableLocalDatastore();
    Parse.User.enableUnsafeCurrentUser();
    Parse.Storage._clear();
    clear().then(() => {
      done()
    });
  });

  const controllers = [
    { name: 'Default', file: '../../lib/node/LocalDatastoreController' },
    { name: 'React-Native', file: '../../lib/node/LocalDatastoreController.react-native' },
  ];

  for (let i = 0; i < controllers.length; i += 1) {
    const controller = controllers[i];
    runTest(controller);
  }
});
