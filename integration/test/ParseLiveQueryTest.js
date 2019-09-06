'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');
const sleep = require('./sleep');

const TestObject = Parse.Object.extend('TestObject');
const DiffObject = Parse.Object.extend('DiffObject');
const SampleObject = Parse.Object.extend('SampleObject');

describe('Parse LiveQuery', () => {
  beforeEach((done) => {
    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.User.enableUnsafeCurrentUser();
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
  
  it('can subscribe to matchesKeyInQuery', async done => {
    const objectA = new TestObject();
    const objectB = new DiffObject();
    const objectC = new SampleObject();

    objectA.set({ name: 'test', sample: objectC });
    objectB.set({ name: 'diff', sample: objectC });
    objectC.set({ name: 'sample' });

    await Parse.Object.saveAll([objectA, objectB, objectC]);

    const subQuery = new Parse.Query(DiffObject);
    subQuery.equalTo('name', 'diff');

    const query = new Parse.Query(TestObject);
    query.contains('name', 'test');
    query.matchesKeyInQuery('sample', 'sample', subQuery);

    const subscripton = await query.subscribe();

    subscripton.on('update', object => {
      assert.equal(object.get('name'), 'tester');
      done();
    });

    objectA.set({ name: 'tester' });
    await objectA.save();
  });

  it('can subscribe to query with client', async (done) => {
    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const client = await Parse.CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
    if (client.shouldOpen()) {
      client.open();
    }
    const subscription = client.subscribe(query);

    subscription.on('update', object => {
      assert.equal(object.get('foo'), 'bar');
      done();
    });
    await subscription.subscribePromise;
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

  it('can subscribe to ACL', async (done) => {
    const user = await Parse.User.signUp('ooo', 'password');
    const ACL = new Parse.ACL(user);

    const object = new TestObject();
    object.setACL(ACL);
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe(user.getSessionToken());
    subscription.on('update', async (object) => {
      assert.equal(object.get('foo'), 'bar');
      await Parse.User.logOut();
      done();
    })
    await object.save({ foo: 'bar' });
  });
});
