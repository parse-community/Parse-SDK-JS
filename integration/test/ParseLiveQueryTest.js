'use strict';

const assert = require('assert');
const Parse = require('../../node');
const sleep = require('./sleep');

describe('Parse LiveQuery', () => {
  beforeEach(() => {
    Parse.User.enableUnsafeCurrentUser();
  });

  it('can subscribe to query', async done => {
    const object = new TestObject();
    await object.save();
    const installationId = await Parse.CoreManager.getInstallationController().currentInstallationId();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();

    subscription.on('update', (object, original, response) => {
      assert.equal(object.get('foo'), 'bar');
      assert.equal(response.installationId, installationId);
      done();
    });
    object.set({ foo: 'bar' });
    await object.save();
  });

  it('can subscribe to query with client', async done => {
    const object = new TestObject();
    await object.save();
    const installationId = await Parse.CoreManager.getInstallationController().currentInstallationId();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const client = await Parse.CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
    if (client.shouldOpen()) {
      client.open();
    }
    const subscription = client.subscribe(query);

    subscription.on('update', (object, original, response) => {
      assert.equal(object.get('foo'), 'bar');
      assert.equal(response.installationId, installationId);
      done();
    });
    await subscription.subscribePromise;
    object.set({ foo: 'bar' });
    await object.save();
  });

  it('can subscribe to query with null connect fields', async done => {
    const client = new Parse.LiveQueryClient({
      applicationId: 'integration',
      serverURL: 'ws://localhost:1337',
      javascriptKey: null,
      masterKey: null,
      sessionToken: null,
      installationId: null,
    });
    client.open();
    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await client.subscribe(query);
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      client.close();
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
    });
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    });
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
    });
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    });
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
    });
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    });
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
    });
    subscriptionB.on('update', object => {
      count++;
      assert.equal(object.get('foo'), 'baz');
    });
    await subscriptionA.unsubscribe();
    await objectA.save({ foo: 'bar' });
    await objectB.save({ foo: 'baz' });
    await sleep(1000);
    assert.equal(count, 1);
  });

  it('can subscribe to ACL', async done => {
    const user = await Parse.User.signUp('ooo', 'password');
    const ACL = new Parse.ACL(user);

    const object = new TestObject();
    object.setACL(ACL);
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe(user.getSessionToken());
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      await Parse.User.logOut();
      done();
    });
    await object.save({ foo: 'bar' });
  });

  it('can subscribe to null sessionToken', async done => {
    const user = await Parse.User.signUp('oooooo', 'password');

    const readOnly = Parse.User.readOnlyAttributes();
    Parse.User.readOnlyAttributes = null;
    user.set('sessionToken', null);
    assert.equal(user.getSessionToken(), null);

    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      Parse.User.readOnlyAttributes = function () {
        return readOnly;
      };
      await Parse.User.logOut();
      done();
    });
    await object.save({ foo: 'bar' });
  });

  it('can subscribe with open event', async done => {
    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();
    subscription.on('open', response => {
      assert(response.clientId);
      assert(response.installationId);
      done();
    });
  });

  it('can subscribe to query with fields', async done => {
    const object = new TestObject();
    await object.save({ name: 'hello', age: 21 });

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    query.select(['name']);
    const subscription = await query.subscribe();

    subscription.on('update', object => {
      assert.equal(object.get('name'), 'hello');
      assert.equal(object.get('age'), undefined);
      assert.equal(object.get('foo'), undefined);
      done();
    });
    object.set({ foo: 'bar' });
    await object.save();
  });
});
