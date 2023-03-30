'use strict';

const assert = require('assert');
const Parse = require('../../node');
const sleep = require('./sleep');
const { resolvingPromise } = require('../../lib/node/promiseUtils');

describe('Parse LiveQuery', () => {
  beforeEach(() => {
    Parse.User.enableUnsafeCurrentUser();
  });

  afterEach(async () => {
    const client = await Parse.CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
    client.state = 'closed';
    await client.close();
  });

  it('can subscribe to query', async () => {
    const object = new TestObject();
    await object.save();
    const installationId = await Parse.CoreManager.getInstallationController().currentInstallationId();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();
    const promise = resolvingPromise();
    subscription.on('update', (object, original, response) => {
      assert.equal(object.get('foo'), 'bar');
      assert.equal(response.installationId, installationId);
      promise.resolve();
    });
    object.set({ foo: 'bar' });
    await object.save();
    await promise;
  });

  it('can subscribe to query with client', async () => {
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
    const promise = resolvingPromise();
    subscription.on('update', (object, original, response) => {
      assert.equal(object.get('foo'), 'bar');
      assert.equal(response.installationId, installationId);
      promise.resolve();
    });
    await subscription.subscribePromise;
    object.set({ foo: 'bar' });
    await object.save();
    await promise;
  });

  it('can subscribe to query with null connect fields', async () => {
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
    const promise = resolvingPromise();
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      await client.close();
      promise.resolve();
    });
    await subscription.subscribePromise;
    object.set({ foo: 'bar' });
    await object.save();
    await promise;
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

  it('can subscribe to ACL', async () => {
    const user = await Parse.User.signUp('ooo', 'password');
    const ACL = new Parse.ACL(user);

    const object = new TestObject();
    object.setACL(ACL);
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe(user.getSessionToken());
    const promise = resolvingPromise();
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      await Parse.User.logOut();
      promise.resolve();
    });
    await object.save({ foo: 'bar' });
    await promise;
  });

  it('can subscribe to null sessionToken', async () => {
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
    const promise = resolvingPromise();
    subscription.on('update', async object => {
      assert.equal(object.get('foo'), 'bar');
      Parse.User.readOnlyAttributes = function () {
        return readOnly;
      };
      await Parse.User.logOut();
      promise.resolve();
    });
    await object.save({ foo: 'bar' });
    await promise;
  });

  it('can subscribe with open event', async () => {
    const object = new TestObject();
    await object.save();

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();
    const promise = resolvingPromise();
    subscription.on('open', response => {
      assert(response.clientId);
      assert(response.installationId);
      promise.resolve();
    });
    await promise;
  });

  it('can subscribe to query with fields', async () => {
    const object = new TestObject();
    await object.save({ name: 'hello', age: 21 });

    const query = new Parse.Query(TestObject);
    query.equalTo('objectId', object.id);
    query.select(['name']);
    const subscription = await query.subscribe();

    const promise = resolvingPromise();
    subscription.on('update', object => {
      assert.equal(object.get('name'), 'hello');
      assert.equal(object.get('age'), undefined);
      assert.equal(object.get('foo'), undefined);
      promise.resolve();
    });
    object.set({ foo: 'bar' });
    await object.save();
    await promise;
  });

  it('can subscribe to query with watch', async () => {
    const query = new Parse.Query(TestObject);
    query.watch('yolo');
    const subscription = await query.subscribe();
    const spy = {
      create(obj) {
        if (!obj.get('yolo')) {
          fail('create should not have been called');
        }
      },
      update(object, original) {
        if (object.get('yolo') === original.get('yolo')) {
          fail('create should not have been called');
        }
      },
    };
    const createSpy = spyOn(spy, 'create').and.callThrough();
    const updateSpy = spyOn(spy, 'update').and.callThrough();
    subscription.on('create', spy.create);
    subscription.on('update', spy.update);
    const obj = new TestObject();
    obj.set('foo', 'bar');
    await obj.save();
    obj.set('foo', 'xyz');
    obj.set('yolo', 'xyz');
    await obj.save();
    const obj2 = new TestObject();
    obj2.set('foo', 'bar');
    obj2.set('yolo', 'bar');
    await obj2.save();
    obj2.set('foo', 'bart');
    await obj2.save();
    await sleep(1000);
    await subscription.unsubscribe();
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledTimes(1);
  });

  it('live query can handle beforeConnect and beforeSubscribe errors', async () => {
    await reconfigureServer({
      cloud({ Cloud }) {
        Cloud.beforeSubscribe('TestError', () => {
          throw 'not allowed to subscribe';
        });
      },
    });
    const client = new Parse.LiveQueryClient({
      applicationId: 'integration',
      serverURL: 'ws://localhost:1337',
      javascriptKey: null,
      masterKey: null,
      sessionToken: null,
      installationId: null,
    });
    client.open();
    const query = new Parse.Query('TestError');
    const subscription = client.subscribe(query);
    await expectAsync(subscription.subscribePromise).toBeRejectedWith(
      new Parse.Error(141, 'not allowed to subscribe')
    );
    client.state = 'closed';
    await client.close();
  });

  it('connectPromise does throw', async () => {
    await reconfigureServer({
      cloud({ Cloud }) {
        Cloud.beforeConnect(params => {
          if (params.sessionToken === 'testToken') {
            throw 'not allowed to connect';
          }
        });
      },
    });
    const client = new Parse.LiveQueryClient({
      applicationId: 'integration',
      serverURL: 'ws://localhost:1337',
      javascriptKey: null,
      masterKey: null,
      sessionToken: 'testToken',
      installationId: null,
    });
    client.open();
    const query = new Parse.Query('TestError');
    const subscription = client.subscribe(query);
    await expectAsync(subscription.subscribePromise).toBeRejectedWith(
      new Parse.Error(141, 'not allowed to connect')
    );
    client.state = 'closed';
    await client.close();
  });
});
