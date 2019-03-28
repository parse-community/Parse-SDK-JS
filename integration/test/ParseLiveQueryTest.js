'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');
const sleep = require('./sleep');

const TestObject = Parse.Object.extend('TestObject');
const DiffObject = Parse.Object.extend('DiffObject');

describe('Parse LiveQuery', () => {
  beforeEach((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(done).catch(done.fail);
  });

  it('can subscribe to query', async (done) => {
    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();

    subscription.on('update', object => {
      assert.equal(object.get('foo'), 'bar');
      done();
    })
    object.set({ foo: 'bar' });
    await object.save();
  });

  it('can subscribe to multiple queries', async () => {
    const objectA = new TestObject();
    const objectB = new TestObject();
    await Parse.Object.saveAll([objectA, objectB]);

    const queryA = new Parse.Query(TestObject);
    const queryB = new Parse.Query(TestObject);
    queryA.equalTo('objectId', objectA.id);
    queryB.equalTo('objectId', objectB.id);
    const subscriptionA = await queryA.subscribe();
    const subscriptionB = await queryB.subscribe();
    let count = 0;
    subscriptionA.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'bar');
    })
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    })
    await objectA.save({ foo: 'bar' });
    await objectB.save({ foo: 'baz' });
    await sleep(1000);
    assert.equal(count, 2);
  });

  it('can subscribe to multiple queries different class', async () => {
    const objectA = new TestObject();
    const objectB = new DiffObject();
    await Parse.Object.saveAll([objectA, objectB]);

    const queryA = new Parse.Query(TestObject);
    const queryB = new Parse.Query(DiffObject);
    queryA.equalTo('objectId', objectA.id);
    queryB.equalTo('objectId', objectB.id);
    const subscriptionA = await queryA.subscribe();
    const subscriptionB = await queryB.subscribe();
    let count = 0;
    subscriptionA.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'bar');
    })
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    })
    await objectA.save({ foo: 'bar' });
    await objectB.save({ foo: 'baz' });
    await sleep(1000);
    assert.equal(count, 2);
  });

  it('can unsubscribe to multiple queries different class', async () => {
    const objectA = new TestObject();
    const objectB = new DiffObject();
    await Parse.Object.saveAll([objectA, objectB]);

    const queryA = new Parse.Query(TestObject);
    const queryB = new Parse.Query(DiffObject);
    queryA.equalTo('objectId', objectA.id);
    queryB.equalTo('objectId', objectB.id);
    const subscriptionA = await queryA.subscribe();
    const subscriptionB = await queryB.subscribe();
    let count = 0;
    subscriptionA.on('update', () => {
      count++;
    })
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    })
    subscriptionA.unsubscribe();
    await objectA.save({ foo: 'bar' });
    await objectB.save({ foo: 'baz' });
    await sleep(1000);
    assert.equal(count, 1);
  });

  it('can unsubscribe with await to multiple queries different class', async () => {
    const objectA = new TestObject();
    const objectB = new DiffObject();
    await Parse.Object.saveAll([objectA, objectB]);

    const queryA = new Parse.Query(TestObject);
    const queryB = new Parse.Query(DiffObject);
    queryA.equalTo('objectId', objectA.id);
    queryB.equalTo('objectId', objectB.id);
    const subscriptionA = await queryA.subscribe();
    const subscriptionB = await queryB.subscribe();
    let count = 0;
    subscriptionA.on('update', () => {
      count++;
    })
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    })
    await subscriptionA.unsubscribe();
    await objectA.save({ foo: 'bar' });
    await objectB.save({ foo: 'baz' });
    await sleep(1000);
    assert.equal(count, 1);
  });
});
