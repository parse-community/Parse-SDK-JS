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
jest.dontMock('../EventEmitter');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../parseDate');
jest.dontMock('../ParseError');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParsePromise');
jest.dontMock('../RESTController');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../TaskQueue');
jest.dontMock('../unique');
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../unsavedChildren');
jest.dontMock('../ParseACL');
jest.dontMock('../ParseQuery');
jest.dontMock('../LiveQuerySubscription');

var LiveQueryClient = require('../LiveQueryClient');
var ParseObject = require('../ParseObject');
var ParseQuery = require('../ParseQuery');
var events = require('events');

describe('LiveQueryClient', () => {
  it('can connect to server', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Mock _getWebSocketImplementation
    liveQueryClient._getWebSocketImplementation = function() {
      return jest.genMockFunction();
    }
    // Mock handlers
    liveQueryClient._handleWebSocketOpen = jest.genMockFunction();
    liveQueryClient._handleWebSocketMessage = jest.genMockFunction();
    liveQueryClient._handleWebSocketClose = jest.genMockFunction();
    liveQueryClient._handleWebSocketError = jest.genMockFunction();

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
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.genMockFunction()
    };

    liveQueryClient._handleWebSocketOpen();

    expect(liveQueryClient.socket.send).toBeCalled();
    var messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    var message = JSON.parse(messageStr);
    expect(message.op).toEqual('connect');
    expect(message.applicationId).toEqual('applicationId');
    expect(message.javascriptKey).toEqual('javascriptKey');
    expect(message.masterKey).toEqual('masterKey');
    expect(message.sessionToken).toEqual('sessionToken');
  });

  it('can handle WebSocket connected response message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    var data = {
      op: 'connected',
      clientId: 1
    };
    var event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    var isChecked = false;
    liveQueryClient.on('open', function(dataAgain) {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
    expect(liveQueryClient.id).toBe(1);
    expect(liveQueryClient.connectPromise._resolved).toBe(true);
    expect(liveQueryClient.state).toEqual('connected');
  });

  it('can handle WebSocket subscribed response message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    var subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    var data = {
      op: 'subscribed',
      clientId: 1,
      requestId: 1
    };
    var event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    var isChecked = false;
    subscription.on('open', function(dataAgain) {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket error response message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    var data = {
      op: 'error',
      clientId: 1,
      error: 'error'
    };
    var event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    var isChecked = false;
    liveQueryClient.on('error', function(error) {
      isChecked = true;
      expect(error).toEqual('error');
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket event response message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    var subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    let object = new ParseObject('Test');
    object.set('key', 'value');
    var data = {
      op: 'create',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON()
    };
    var event = {
      data: JSON.stringify(data)
    }
    // Register checked in advance
    var isChecked = false;
    subscription.on('create', function(parseObject) {
      isChecked = true;
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket close message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    // Add mock subscription
    var subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    var isChecked = false;
    subscription.on('close', function() {
      isChecked = true;
    });
    var isCheckedAgain = false;
    liveQueryClient.on('close', function() {
      isCheckedAgain = true;
    });

    liveQueryClient._handleWebSocketClose();

    expect(isChecked).toBe(true);
    expect(isCheckedAgain).toBe(true);
  });

  it('can handle reconnect', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });

    liveQueryClient.open = jest.genMockFunction();

    let attempts = liveQueryClient.attempts;
    liveQueryClient._handleReconnect();
    expect(liveQueryClient.state).toEqual('reconnecting');

    jest.runOnlyPendingTimers();

    expect(liveQueryClient.attempts).toEqual(attempts + 1);
    expect(liveQueryClient.open).toBeCalled();
  });

  it('can handle WebSocket error message', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    var error = {};
    var isChecked = false;
    liveQueryClient.on('error', function(errorAgain) {
      isChecked = true;
      expect(errorAgain).toEqual(error);
    });

    liveQueryClient._handleWebSocketError(error);

    expect(isChecked).toBe(true);
  });

  it('can subscribe', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.genMockFunction()
    };
    var query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    var subscription = liveQueryClient.subscribe(query);
    liveQueryClient.connectPromise.resolve();

    expect(subscription).toBe(liveQueryClient.subscriptions.get(1));
    expect(liveQueryClient.requestId).toBe(2);
    var messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    var message = JSON.parse(messageStr);
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

  it('can unsubscribe', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.genMockFunction()
    };
    var subscription = {
      id: 1
    }
    liveQueryClient.subscriptions.set(1, subscription);

    liveQueryClient.unsubscribe(subscription);
    liveQueryClient.connectPromise.resolve();

    expect(liveQueryClient.subscriptions.size).toBe(0);
    var messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    var message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'unsubscribe',
      requestId: 1
    });
  });

  it('can resubscribe', () => {
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.socket = {
      send: jest.genMockFunction()
    };
    var query = new ParseQuery('Test');
    query.equalTo('key', 'value');
    var subscription = liveQueryClient.subscribe(query);
    liveQueryClient.connectPromise.resolve();

    liveQueryClient.resubscribe();

    expect(liveQueryClient.requestId).toBe(2);
    var messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    var message = JSON.parse(messageStr);
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
    var liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken'
    });
    liveQueryClient.state = 'connected';
    liveQueryClient.socket = {
      close: jest.genMockFunction()
    }
    var subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    var isChecked = false;
    subscription.on('close', function() {
      isChecked = true;
    });
    var isCheckedAgain = false;
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
});
