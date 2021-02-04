'use strict';

const assert = require('assert');
const Parse = require('../../node');
const sleep = require('./sleep');

describe('Parse EventuallyQueue', () => {
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

    // TODO: can't use obj1, etc because they don't have an id
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

  it('can poll server', async () => {
    const object = new TestObject({ test: 'test' });
    await object.save();
    object.set('foo', 'bar');
    await Parse.EventuallyQueue.save(object);
    Parse.EventuallyQueue.poll();
    assert.ok(Parse.EventuallyQueue.polling);

    await sleep(4000);
    const query = new Parse.Query(TestObject);
    const result = await query.get(object.id);
    assert.strictEqual(result.get('foo'), 'bar');

    const length = await Parse.EventuallyQueue.length();
    assert.strictEqual(length, 0);
    assert.strictEqual(Parse.EventuallyQueue.polling, undefined);
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
    await parseServer.handleShutdown();
    parseServer.server.close(async () => {
      await object.saveEventually();
      let length = await Parse.EventuallyQueue.length();
      assert(Parse.EventuallyQueue.polling);
      assert.strictEqual(length, 1);

      await reconfigureServer({});
      await sleep(3000); // Wait for polling

      assert.strictEqual(Parse.EventuallyQueue.polling, undefined);
      length = await Parse.EventuallyQueue.length();
      assert.strictEqual(length, 0);

      const query = new Parse.Query(TestObject);
      query.equalTo('hash', 'saveSecret');
      const results = await query.find();
      assert.strictEqual(results.length, 1);
      done();
    });
  });

  it('can destroyEventually', async done => {
    const parseServer = await reconfigureServer();
    const object = new TestObject({ hash: 'deleteSecret' });
    await object.save();
    await parseServer.handleShutdown();
    parseServer.server.close(async () => {
      await object.destroyEventually();
      let length = await Parse.EventuallyQueue.length();
      assert(Parse.EventuallyQueue.polling);
      assert.strictEqual(length, 1);

      await reconfigureServer({});
      await sleep(3000); // Wait for polling

      assert.strictEqual(Parse.EventuallyQueue.polling, undefined);
      length = await Parse.EventuallyQueue.length();
      assert.strictEqual(length, 0);

      const query = new Parse.Query(TestObject);
      query.equalTo('hash', 'deleteSecret');
      const results = await query.find();
      assert.strictEqual(results.length, 0);
      done();
    });
  });
});
