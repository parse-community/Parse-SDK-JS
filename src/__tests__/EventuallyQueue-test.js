jest.autoMockOff();
jest.useFakeTimers();

let objectCount = 0;

class MockObject {
  constructor(className) {
    this.className = className;
    this.attributes = {};

    this.id = String(objectCount++);
    this._localId = `local${objectCount}`;
  }
  destroy() {}
  save() {}
  _getId() {
    return this.id || this._localId;
  }
  set(key, value) {
    this.attributes[key] = value;
  }
  get(key) {
    return this.attributes[key];
  }
  toJSON() {
    return this.attributes;
  }
  static extend(className) {
    class MockSubclass {
      constructor() {
        this.className = className;
      }
    }
    return MockSubclass;
  }
}
jest.setMock('../ParseObject', MockObject);

const mockQueryFind = jest.fn();
jest.mock('../ParseQuery', () => {
  return jest.fn().mockImplementation(function () {
    this.equalTo = jest.fn();
    this.find = mockQueryFind;
  });
});
const mockRNStorageInterface = require('./test_helpers/mockRNStorage');
const CoreManager = require('../CoreManager');
const EventuallyQueue = require('../EventuallyQueue');
const ParseError = require('../ParseError').default;
const ParseObject = require('../ParseObject');
const RESTController = require('../RESTController');
const Storage = require('../Storage');
const mockXHR = require('./test_helpers/mockXHR');

CoreManager.setInstallationController({
  currentInstallationId() {
    return Promise.resolve('iid');
  },
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('EventuallyQueue', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    CoreManager.setAsyncStorage(mockRNStorageInterface);
    CoreManager.setStorageController(require('../StorageController.react-native'));
    CoreManager.setRESTController(RESTController);
    EventuallyQueue.stopPoll();
    await EventuallyQueue.clear();
  });

  it('init empty', async () => {
    const queue = await EventuallyQueue.getQueue();
    const length = await EventuallyQueue.length();
    expect(queue.length).toBe(length);
  });

  it('can get invalid storage', async () => {
    jest.spyOn(Storage, 'getItemAsync').mockImplementationOnce(() => {
      return Promise.resolve(undefined);
    });
    const queue = await EventuallyQueue.getQueue();
    expect(queue.length).toBe(0);
    expect(queue).toEqual([]);
  });

  it('can queue object', async () => {
    const object = new ParseObject('TestObject');
    await EventuallyQueue.save(object, { sessionToken: 'token' });
    let length = await EventuallyQueue.length();
    expect(length).toBe(1);

    await EventuallyQueue.destroy(object, { sessionToken: 'secret' });
    length = await EventuallyQueue.length();
    expect(length).toBe(2);

    const [savedObject, deleteObject] = await EventuallyQueue.getQueue();
    expect(savedObject.id).toEqual(object.id);
    expect(savedObject.action).toEqual('save');
    expect(savedObject.object).toEqual(object.toJSON());
    expect(savedObject.className).toEqual(object.className);
    expect(savedObject.serverOptions).toEqual({ sessionToken: 'token' });
    expect(savedObject.createdAt).toBeDefined();
    expect(savedObject.queueId).toEqual(EventuallyQueue.generateQueueId('save', object));

    expect(deleteObject.id).toEqual(object.id);
    expect(deleteObject.action).toEqual('destroy');
    expect(deleteObject.object).toEqual(object.toJSON());
    expect(deleteObject.className).toEqual(object.className);
    expect(deleteObject.serverOptions).toEqual({ sessionToken: 'secret' });
    expect(deleteObject.createdAt).toBeDefined();
    expect(deleteObject.queueId).toEqual(EventuallyQueue.generateQueueId('destroy', object));
  });

  it('can queue same save object', async () => {
    const object = new ParseObject('TestObject');
    await EventuallyQueue.save(object);
    await EventuallyQueue.save(object);
    const length = await EventuallyQueue.length();
    expect(length).toBe(1);
  });

  it('can queue same destroy object', async () => {
    const object = new ParseObject('TestObject');
    await EventuallyQueue.destroy(object);
    await EventuallyQueue.destroy(object);
    const length = await EventuallyQueue.length();
    expect(length).toBe(1);
  });

  it('can queue same object but override undefined fields', async () => {
    const object = new ParseObject('TestObject');
    object.set('foo', 'bar');
    object.set('test', '1234');
    await EventuallyQueue.save(object);

    object.set('foo', undefined);
    await EventuallyQueue.save(object);

    const length = await EventuallyQueue.length();
    expect(length).toBe(1);

    const queue = await EventuallyQueue.getQueue();
    expect(queue[0].object.test).toBe('1234');
  });

  it('can remove object from queue', async () => {
    const object = new ParseObject('TestObject');
    await EventuallyQueue.save(object);
    let length = await EventuallyQueue.length();
    expect(length).toBe(1);

    const queue = await EventuallyQueue.getQueue();
    const { queueId } = queue[0];
    await EventuallyQueue.remove(queueId);

    length = await EventuallyQueue.length();
    expect(length).toBe(0);
    await EventuallyQueue.remove(queueId);

    length = await EventuallyQueue.length();
    expect(length).toBe(0);
  });

  it('can send empty queue to server', async () => {
    const length = await EventuallyQueue.length();
    expect(length).toBe(0);
    const didSend = await EventuallyQueue.sendQueue();
    expect(didSend).toBe(false);
  });

  it('can send queue by object id', async () => {
    jest.spyOn(EventuallyQueue.process, 'byId').mockImplementationOnce(() => {});
    const object = new ParseObject('TestObject');
    await EventuallyQueue.save(object);

    const didSend = await EventuallyQueue.sendQueue();
    expect(didSend).toBe(true);
    expect(EventuallyQueue.process.byId).toHaveBeenCalledTimes(1);
  });

  it('can send queue by object hash', async () => {
    jest.spyOn(EventuallyQueue.process, 'byHash').mockImplementationOnce(() => {});
    const object = new ParseObject('TestObject');
    delete object.id;
    object.set('hash', 'secret');
    await EventuallyQueue.save(object);

    const didSend = await EventuallyQueue.sendQueue();
    expect(didSend).toBe(true);
    expect(EventuallyQueue.process.byHash).toHaveBeenCalledTimes(1);
  });

  it('can send queue by object create', async () => {
    jest.spyOn(EventuallyQueue.process, 'create').mockImplementationOnce(() => {});
    const object = new ParseObject('TestObject');
    delete object.id;
    await EventuallyQueue.save(object);

    const didSend = await EventuallyQueue.sendQueue();
    expect(didSend).toBe(true);
    expect(EventuallyQueue.process.create).toHaveBeenCalledTimes(1);
  });

  it('can handle send queue destroy callback', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'destroy').mockImplementationOnce(() => {});
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const queueObject = {
      action: 'destroy',
      queueId: 'queue1',
      serverOptions: { sessionToken: 'token' },
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.destroy).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(object.destroy).toHaveBeenCalledWith({ sessionToken: 'token' });
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue1');
  });

  it('should remove if queue destroy callback fails', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'destroy').mockImplementationOnce(() => {
      return Promise.reject('Unable to delete object.');
    });
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const queueObject = {
      action: 'destroy',
      queueId: 'queue1',
      serverOptions: {},
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.destroy).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(object.destroy).toHaveBeenCalledWith({});
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue1');
  });

  it('should not remove if queue destroy callback network fails', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'destroy').mockImplementationOnce(() => {
      throw new ParseError(
        ParseError.CONNECTION_FAILED,
        'XMLHttpRequest failed: "Unable to connect to the Parse API"'
      );
    });
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const queueObject = {
      action: 'destroy',
      queueId: 'queue1',
      serverOptions: {},
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.destroy).toHaveBeenCalledTimes(1);
    expect(object.destroy).toHaveBeenCalledWith({});
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(0);
  });

  it('can handle send queue save callback with no object', async () => {
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const object = null;

    const queueObject = { queueId: 'queue0' };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue0');
  });

  it('can handle send queue save callback', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'save').mockImplementationOnce(() => {});
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    await EventuallyQueue.save(object);

    const queueObject = {
      action: 'save',
      queueId: 'queue2',
      object: { foo: 'bar' },
      serverOptions: { sessionToken: 'token' },
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.save).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(object.save).toHaveBeenCalledWith({ foo: 'bar' }, { sessionToken: 'token' });
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue2');
  });

  it('can handle send queue save callback', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'save').mockImplementationOnce(() => {
      return Promise.reject('Unable to save.');
    });
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    await EventuallyQueue.save(object);

    const queueObject = {
      action: 'save',
      queueId: 'queue2',
      object: { foo: 'bar' },
      serverOptions: { sessionToken: 'token' },
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.save).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(object.save).toHaveBeenCalledWith({ foo: 'bar' }, { sessionToken: 'token' });
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue2');
  });

  it('should not remove if queue save callback network fails', async () => {
    const object = new ParseObject('TestObject');
    jest.spyOn(object, 'save').mockImplementationOnce(() => {
      throw new ParseError(
        ParseError.CONNECTION_FAILED,
        'XMLHttpRequest failed: "Unable to connect to the Parse API"'
      );
    });
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const queueObject = {
      action: 'save',
      queueId: 'queue2',
      object: { foo: 'bar' },
      serverOptions: {},
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(object.save).toHaveBeenCalledTimes(1);
    expect(object.save).toHaveBeenCalledWith({ foo: 'bar' }, {});
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(0);
  });

  it('can handle send queue save callback if queue is old', async () => {
    jest.spyOn(EventuallyQueue, 'remove').mockImplementationOnce(() => {});
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const object = new ParseObject('TestObject');
    object.updatedAt = tomorrow;
    await EventuallyQueue.save(object);

    const queueObject = {
      action: 'save',
      queueId: 'queue3',
      object: { createdAt: new Date() },
    };
    await EventuallyQueue.sendQueueCallback(object, queueObject);
    expect(EventuallyQueue.remove).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.remove).toHaveBeenCalledWith('queue3');
  });

  it('can process new object', async () => {
    jest.spyOn(EventuallyQueue, 'sendQueueCallback').mockImplementationOnce(() => {});
    await EventuallyQueue.process.create(MockObject, {});
    expect(EventuallyQueue.sendQueueCallback).toHaveBeenCalledTimes(1);
  });

  it('can process object by id', async () => {
    jest.spyOn(EventuallyQueue, 'sendQueueCallback').mockImplementationOnce(() => {});
    const object = new ParseObject('TestObject');
    const queueObject = {
      id: 'object1',
      serverOptions: { sessionToken: 'idToken' },
    };
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([object]));
    await EventuallyQueue.process.byId(MockObject, queueObject);
    expect(EventuallyQueue.sendQueueCallback).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.sendQueueCallback).toHaveBeenCalledWith(object, queueObject);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockQueryFind).toHaveBeenCalledWith({ sessionToken: 'idToken' });
  });

  it('can process object by hash', async () => {
    jest.spyOn(EventuallyQueue, 'sendQueueCallback').mockImplementationOnce(() => {});
    const object = new ParseObject('TestObject');
    const queueObject = {
      hash: 'secret',
      serverOptions: { sessionToken: 'hashToken' },
    };
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([object]));
    await EventuallyQueue.process.byHash(MockObject, queueObject);
    expect(EventuallyQueue.sendQueueCallback).toHaveBeenCalledTimes(1);
    expect(EventuallyQueue.sendQueueCallback).toHaveBeenCalledWith(object, queueObject);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockQueryFind).toHaveBeenCalledWith({ sessionToken: 'hashToken' });
  });

  it('can process new object if hash not exists', async () => {
    jest.spyOn(EventuallyQueue.process, 'create').mockImplementationOnce(() => {});
    const queueObject = {
      hash: 'secret',
      serverOptions: { sessionToken: 'hashToken' },
    };
    mockQueryFind.mockImplementationOnce(() => Promise.resolve([]));
    await EventuallyQueue.process.byHash(MockObject, queueObject);
    expect(mockQueryFind).toHaveBeenCalledTimes(1);
    expect(mockQueryFind).toHaveBeenCalledWith({ sessionToken: 'hashToken' });
  });

  it('cannot poll if already polling', () => {
    EventuallyQueue._setPolling(true);
    EventuallyQueue.poll();
    expect(EventuallyQueue.isPolling()).toBe(true);
  });

  it('can poll server', async () => {
    jest.spyOn(EventuallyQueue, 'sendQueue').mockImplementationOnce(() => {});
    RESTController._setXHR(mockXHR([{ status: 200, response: { status: 'ok' } }]));
    EventuallyQueue.poll();
    expect(EventuallyQueue.isPolling()).toBe(true);
    jest.runOnlyPendingTimers();
    await flushPromises();

    expect(EventuallyQueue.isPolling()).toBe(false);
    expect(EventuallyQueue.sendQueue).toHaveBeenCalledTimes(1);
  });

  it('can continue polling with connection error', async () => {
    const retry = CoreManager.get('REQUEST_ATTEMPT_LIMIT');
    CoreManager.set('REQUEST_ATTEMPT_LIMIT', 1);
    RESTController._setXHR(
      mockXHR([{ status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }])
    );
    EventuallyQueue.poll();
    expect(EventuallyQueue.isPolling()).toBe(true);
    jest.runOnlyPendingTimers();
    await flushPromises();

    expect(EventuallyQueue.isPolling()).toBe(true);
    CoreManager.set('REQUEST_ATTEMPT_LIMIT', retry);
  });
});
