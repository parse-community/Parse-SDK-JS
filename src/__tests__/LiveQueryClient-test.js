/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../LiveQueryClient');
jest.dontMock('../arrayContainsObject');
jest.dontMock('../canBeSerialized');
jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../equals');
jest.dontMock('../escape');
jest.dontMock('../promiseUtils');
jest.dontMock('../EventEmitter');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../parseDate');
jest.dontMock('../ParseError');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../RESTController');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../TaskQueue');
jest.dontMock('../unique');
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../unsavedChildren');
jest.dontMock('../ParseACL');
jest.dontMock('../ParseQuery');
jest.dontMock('../LiveQuerySubscription');
jest.dontMock('../LocalDatastore');

jest.useFakeTimers();

const mockLocalDatastore = {
  isEnabled: false,
  _updateObjectIfPinned: jest.fn(),
};
jest.setMock('../LocalDatastore', mockLocalDatastore);

const CoreManager = require('../CoreManager');
const LiveQueryClient = require('../LiveQueryClient').default;
const ParseObject = require('../ParseObject').default;
const ParseQuery = require('../ParseQuery').default;
const events = require('events');

CoreManager.setLocalDatastore(mockLocalDatastore);

function resolvingPromise() {
  let res;
  let rej;
  const promise = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  promise.resolve = res;
  promise.reject = rej;
  return promise;
}

describe('LiveQueryClient', () => {
  beforeEach(() => {
    mockLocalDatastore.isEnabled = false;
  });

  it('can connect to server', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Mock _getWebSocketImplementation
    liveQueryClient._getWebSocketImplementation = function() {
      return jest.fn();
    }
    // Mock handlers
    liveQueryClient._handleWebSocketOpen = jest.fn();
    liveQueryClient._handleWebSocketMessage = jest.fn();
    liveQueryClient._handleWebSocketClose = jest.fn();
    liveQueryClient._handleWebSocketError = jest.fn();

    liveQueryClient.open();

    // Verify inner state
    expect(liveQueryClient.state).toEqual('connecting');
    // Verify handlers
    liveQueryClient.socket.onopen({});
    expect(liveQueryClient._handleWebSocketOpen).toBeCalled();
    liveQueryClient.socket.onmessage({});
    expect(liveQueryClient._handleWebSocketMessage).toBeCalled();
    liveQueryClient.socket.onclose();
    expect(liveQueryClient._handleWebSocketClose).toBeCalled();
    liveQueryClient.socket.onerror();
    expect(liveQueryClient._handleWebSocketError).toBeCalled();
  });

  it('can handle WebSocket open message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.fn()
    };

    liveQueryClient._handleWebSocketOpen();

    expect(liveQueryClient.socket.send).toBeCalled();
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message.op).toEqual('connect');
    expect(message.applicationId).toEqual('applicationId');
    expect(message.javascriptKey).toEqual('javascriptKey');
    expect(message.masterKey).toEqual('masterKey');
    expect(message.sessionToken).toEqual('sessionToken');
  });

  it('can handle WebSocket connected response message', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    const data = {
      op: 'connected',
      clientId: 1
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    liveQueryClient.on('open', function() {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
    expect(liveQueryClient.id).toBe(1);
    await liveQueryClient.connectPromise;
    expect(liveQueryClient.state).toEqual('connected');
  });

  it('can handle WebSocket subscribed response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    subscription.subscribePromise = resolvingPromise();

    liveQueryClient.subscriptions.set(1, subscription);
    const data = {
      op: 'subscribed',
      clientId: 1,
      requestId: 1
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    subscription.on('open', function() {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);
    jest.runOnlyPendingTimers();
    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket error response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    const data = {
      op: 'error',
      clientId: 1,
      error: 'error'
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    liveQueryClient.on('error', function(error) {
      isChecked = true;
      expect(error).toEqual('error');
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket error while subscribing', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    const subscription = new events.EventEmitter();
    subscription.subscribePromise = resolvingPromise();
    liveQueryClient.subscriptions.set(1, subscription);

    const data = {
      op: 'error',
      clientId: 1,
      requestId: 1,
      error: 'error thrown'
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    subscription.on('error', function(error) {
      isChecked = true;
      expect(error).toEqual('error thrown');
    });

    liveQueryClient._handleWebSocketMessage(event);

    jest.runOnlyPendingTimers();
    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket event response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const object = new ParseObject('Test');
    object.set('key', 'value');
    const data = {
      op: 'create',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON()
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    subscription.on('create', function(parseObject) {
      isChecked = true;
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket response with original', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const object = new ParseObject('Test');
    const original = new ParseObject('Test');
    object.set('key', 'value');
    original.set('key', 'old');
    const data = {
      op: 'update',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON(),
      original: original._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    subscription.on('update', (parseObject, parseOriginalObject) => {
      isChecked = true;
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();

      expect(parseOriginalObject.get('key')).toEqual('old');
      expect(parseOriginalObject.get('className')).toBeUndefined();
      expect(parseOriginalObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket response override data on update', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const object = new ParseObject('Test');
    const original = new ParseObject('Test');
    object.set('key', 'value');
    original.set('key', 'old');
    const data = {
      op: 'update',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON(),
      original: original._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data)
    }

    jest.spyOn(
      mockLocalDatastore,
      '_updateObjectIfPinned'
    )
      .mockImplementationOnce(() => Promise.resolve());

    const spy = jest.spyOn(
      ParseObject,
      'fromJSON'
    )
      .mockImplementationOnce(() => original)
      .mockImplementationOnce(() => object);


    mockLocalDatastore.isEnabled = true;

    let isChecked = false;
    subscription.on('update', () => {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);
    const override = true;

    expect(ParseObject.fromJSON.mock.calls[1][1]).toEqual(override);
    expect(mockLocalDatastore._updateObjectIfPinned).toHaveBeenCalledTimes(1);

    expect(isChecked).toBe(true);
    spy.mockRestore();
  });

  it('can handle WebSocket response unset field', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);

    const object = new ParseObject('Test');
    const original = new ParseObject('Test');
    const pointer = new ParseObject('PointerTest');
    pointer.id = '1234';
    original.set('pointer', pointer);
    const data = {
      op: 'update',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON(),
      original: original._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data)
    }
    let isChecked = false;
    subscription.on('update', (parseObject, parseOriginalObject) => {
      isChecked = true;
      expect(parseObject.toJSON().pointer).toBeUndefined();
      expect(parseOriginalObject.toJSON().pointer.objectId).toEqual(pointer.id);
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket close message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    let isChecked = false;
    subscription.on('close', function() {
      isChecked = true;
    });
    let isCheckedAgain = false;
    liveQueryClient.on('close', function() {
      isCheckedAgain = true;
    });

    liveQueryClient._handleWebSocketClose();

    expect(isChecked).toBe(true);
    expect(isCheckedAgain).toBe(true);
  });

  it('can handle reconnect', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });

    liveQueryClient.open = jest.fn();

    const attempts = liveQueryClient.attempts;
    liveQueryClient._handleReconnect();
    expect(liveQueryClient.state).toEqual('reconnecting');

    jest.runOnlyPendingTimers();

    expect(liveQueryClient.attempts).toEqual(attempts + 1);
    expect(liveQueryClient.open).toBeCalled();
  });

  it('can handle WebSocket error message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    const error = {};
    let isChecked = false;
    liveQueryClient.on('error', function(errorAgain) {
      isChecked = true;
      expect(errorAgain).toEqual(error);
    });

    liveQueryClient._handleWebSocketError(error);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket reconnect on error event', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    expect(liveQueryClient.additionalProperties).toBe(true);
    const data = {
      op: 'error',
      code: 1,
      reconnect: true,
      error: 'Additional properties not allowed',
    };
    const event = {
      data: JSON.stringify(data)
    }
    let isChecked = false;
    liveQueryClient.on('error', function(error) {
      isChecked = true;
      expect(error).toEqual(data.error);
    });
    const spy = jest.spyOn(liveQueryClient, '_handleReconnect');
    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
    expect(liveQueryClient._handleReconnect).toHaveBeenCalledTimes(1);
    expect(liveQueryClient.additionalProperties).toBe(false);
    spy.mockRestore();
  });

  it('can subscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.fn()
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    const subscribePromise = liveQueryClient.subscribe(query);
    const clientSub = liveQueryClient.subscriptions.get(1);
    clientSub.subscribePromise.resolve();

    const subscription = await subscribePromise;
    liveQueryClient.connectPromise.resolve();
    expect(subscription).toBe(clientSub);
    expect(liveQueryClient.requestId).toBe(2);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'subscribe',
      requestId: 1,
      query: {
        className: 'Test',
        where: {
          key: 'value'
        }
      }
    });
  });

  it('can unsubscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.fn()
    };
    const subscription = {
      id: 1
    }
    liveQueryClient.subscriptions.set(1, subscription);

    liveQueryClient.unsubscribe(subscription);
    liveQueryClient.connectPromise.resolve();
    expect(liveQueryClient.subscriptions.size).toBe(0);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'unsubscribe',
      requestId: 1
    });
  });

  it('can resubscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.fn()
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');
    liveQueryClient.subscribe(query);
    liveQueryClient.connectPromise.resolve();

    liveQueryClient.resubscribe();

    expect(liveQueryClient.requestId).toBe(2);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'subscribe',
      requestId: 1,
      query: {
        className: 'Test',
        where: {
          key: 'value'
        }
      }
    });
  });

  it('can close', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.state = 'connected';
    liveQueryClient.socket = {
      close: jest.fn()
    }
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    let isChecked = false;
    subscription.on('close', function() {
      isChecked = true;
    });
    let isCheckedAgain = false;
    liveQueryClient.on('close', function() {
      isCheckedAgain = true;
    });

    liveQueryClient.close();

    expect(liveQueryClient.subscriptions.size).toBe(0);
    expect(isChecked).toBe(true);
    expect(isCheckedAgain).toBe(true);
    expect(liveQueryClient.socket.close).toBeCalled();
    expect(liveQueryClient.state).toBe('disconnected');
  });

  it('can handle WebSocket subclass', () => {
    const MyExtendedClass = ParseObject.extend('MyExtendedClass');
    ParseObject.registerSubclass('MyExtendedClass', MyExtendedClass);

    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const object = new MyExtendedClass();
    object.set('key', 'value');
    const data = {
      op: 'create',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    let isChecked = false;
    subscription.on('create', function(parseObject) {
      isChecked = true;
      expect(parseObject instanceof MyExtendedClass).toBe(true);
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });
});
