'use strict';

const assert = require('assert');
const Parse = require('../../node');
const sleep = require('./sleep');

describe('Parse EventuallyQueue', () => {
  beforeEach(async () => {
    await Parse.EventuallyQueue.clear();
  });

  it('can queue save object', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    object.set('foo', 'bar');
    await Parse.EventuallyQueue.save(object);
    await Parse.EventuallyQueue.sendQueue();

    const query = new Parse.Query(TestObject);
    const result = await query.get(object.id);
    assert.strictEqual(result.get('foo'), 'bar');

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
  });

  it('can queue destroy object', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    await Parse.EventuallyQueue.destroy(object);
    await Parse.EventuallyQueue.sendQueue();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const results = await query.find();
    assert.strictEqual(results.length, 0);

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
  });

  it('can queue multiple object', async () => {
    const obj1 = new TestObject({ foo: 'bar' });
    const obj2 = new TestObject({ foo: 'baz' });
    const obj3 = new TestObject({ foo: 'bag' });
    await Parse.EventuallyQueue.save(obj1);
    await Parse.EventuallyQueue.save(obj2);
    await Parse.EventuallyQueue.save(obj3);

    let length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 3);

    await Parse.EventuallyQueue.sendQueue();

    const query = new Parse.Query(TestObject);
    query.ascending('createdAt');
    const results = await query.find();
    assert.strictEqual(results.length, 3);
    assert.strictEqual(results[0].get('foo'), 'bar');
    assert.strictEqual(results[1].get('foo'), 'baz');
    assert.strictEqual(results[2].get('foo'), 'bag');

    length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);

    // TODO: Properly handle SingleInstance
    await Parse.EventuallyQueue.destroy(results[0]);
    await Parse.EventuallyQueue.destroy(results[1]);
    await Parse.EventuallyQueue.destroy(results[2]);

    length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 3);

    await Parse.EventuallyQueue.sendQueue();
    const objects = await query.find();
    assert.strictEqual(objects.length, 0);
  });

  it('can queue destroy for object that does not exist', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    await object.destroy();
    await Parse.EventuallyQueue.destroy(object);
    await Parse.EventuallyQueue.sendQueue();

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
  });

  it('can queue destroy then save', async () => {
    const object = new TestObject({ hash: 'test' });
    await Parse.EventuallyQueue.destroy(object);
    await Parse.EventuallyQueue.save(object);
    await Parse.EventuallyQueue.sendQueue();

    const query = new Parse.Query(TestObject);
    query.equalTo('hash', 'test');
    const results = await query.find();
    assert.strictEqual(results.length, 1);

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
  });

  it('can queue unsaved object with hash', async () => {
    const hash = 'secret';
    const object = new TestObject({ test: 'test' });
    object.set('hash', hash);
    await Parse.EventuallyQueue.save(object);
    await Parse.EventuallyQueue.sendQueue();

    const query = new Parse.Query(TestObject);
    query.equalTo('hash', hash);
    const results = await query.find();
    assert.strictEqual(results.length, 1);
  });

  it('can queue saved object and unsaved with hash', async () => {
    const hash = 'ransom+salt';
    const object = new TestObject({ test: 'test' });
    object.set('hash', hash);
    await Parse.EventuallyQueue.save(object);
    await Parse.EventuallyQueue.sendQueue();

    let query = new Parse.Query(TestObject);
    query.equalTo('hash', hash);
    const results = await query.find();
    assert.strictEqual(results.length, 1);

    const unsaved = new TestObject({ hash, foo: 'bar' });
    await Parse.EventuallyQueue.save(unsaved);
    await Parse.EventuallyQueue.sendQueue();

    query = new Parse.Query(TestObject);
    query.equalTo('hash', hash);
    const hashes = await query.find();
    assert.strictEqual(hashes.length, 1);
    assert.strictEqual(hashes[0].get('foo'), 'bar');
  });

  it('can queue same object but override undefined fields', async () => {
    const object = new Parse.Object('TestObject');
    object.set('foo', 'bar');
    object.set('test', '1234');
    await Parse.EventuallyQueue.save(object);

    object.set('foo', undefined);
    await Parse.EventuallyQueue.save(object);

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 1);

    const queue = await Parse.EventuallyQueue.getQueue();
    assert.strictEqual(queue[0].object.foo, 'bar');
    assert.strictEqual(queue[0].object.test, '1234');
  });

  it('can poll server', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    object.set('foo', 'bar');
    await Parse.EventuallyQueue.save(object);
    Parse.EventuallyQueue.poll();
    assert.ok(Parse.EventuallyQueue.isPolling());

    while (Parse.EventuallyQueue.isPolling()) {
      await sleep(100);
    }
    const query = new Parse.Query(TestObject);
    let result = await query.get(object.id);
    while (result.get('foo') !== 'bar') {
      result = await query.get(object.id);
    }
    assert.strictEqual(result.get('foo'), 'bar');

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
    assert.strictEqual(Parse.EventuallyQueue.isPolling(), false);
  });

  it('can clear queue', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    await Parse.EventuallyQueue.save(object);
    const q = await Parse.EventuallyQueue.getQueue();
    assert.strictEqual(q.length, 1);

    await Parse.EventuallyQueue.clear();
    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
  });

  it('can saveEventually', async done => {
    const parseServer = await reconfigureServer();
    const object = new TestObject({ hash: 'saveSecret' });
    parseServer.server.close(async () => {
      await object.saveEventually();
      let length = await Parse.EventuallyQueue.length();
      assert(Parse.EventuallyQueue.isPolling());
      assert.strictEqual(length, 1);

      await reconfigureServer({});
      while (Parse.EventuallyQueue.isPolling()) {
        await sleep(100);
      }
      assert.strictEqual(Parse.EventuallyQueue.isPolling(), false);

      while (await Parse.EventuallyQueue.length()) {
        await sleep(100);
      }
      length = await Parse.EventuallyQueue.length();
      assert.strictEqual(length, 0);

      const query = new Parse.Query(TestObject);
      query.equalTo('hash', 'saveSecret');
      let results = await query.find();
      while (results.length === 0) {
        results = await query.find();
      }
      assert.strictEqual(results.length, 1);
      done();
    });
  });

  it('can destroyEventually', async done => {
    const parseServer = await reconfigureServer();
    const object = new TestObject({ hash: 'deleteSecret' });
    await object.save();
    parseServer.server.close(async () => {
      await object.destroyEventually();
      let length = await Parse.EventuallyQueue.length();
      assert(Parse.EventuallyQueue.isPolling());
      assert.strictEqual(length, 1);

      await reconfigureServer({});
      while (Parse.EventuallyQueue.isPolling()) {
        await sleep(100);
      }
      assert.strictEqual(Parse.EventuallyQueue.isPolling(), false);
      while (await Parse.EventuallyQueue.length()) {
        await sleep(100);
      }
      length = await Parse.EventuallyQueue.length();
      assert.strictEqual(length, 0);

      const query = new Parse.Query(TestObject);
      query.equalTo('hash', 'deleteSecret');
      let results = await query.find();
      while (results.length) {
        results = await query.find();
      }
      assert.strictEqual(results.length, 0);
      done();
    });
  });
});
