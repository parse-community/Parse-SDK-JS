jest.dontMock('../LiveQuerySubscription');
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
jest.dontMock('../LocalDatastore');
jest.dontMock('../WebSocketController');

jest.useFakeTimers();

const mockLocalDatastore = {
  isEnabled: false,
  _updateObjectIfPinned: jest.fn(),
};
jest.setMock('../LocalDatastore', mockLocalDatastore);

const CoreManager = require('../CoreManager').default;
const EventEmitter = require('../EventEmitter').default;
const LiveQueryClient = require('../LiveQueryClient').default;
const LiveQuerySubscription = require('../LiveQuerySubscription').default;
const ParseObject = require('../ParseObject').default;
const ParseQuery = require('../ParseQuery').default;
const WebSocketController = require('../WebSocketController').default;
const { resolvingPromise } = require('../promiseUtils');
const events = require('events');

CoreManager.setLocalDatastore(mockLocalDatastore);
CoreManager.setWebSocketController(WebSocketController);

describe('LiveQueryClient', () => {
  beforeEach(() => {
    mockLocalDatastore.isEnabled = false;
    CoreManager.setEventEmitter(EventEmitter);
  });

  it('serverURL required', () => {
    expect(() => {
      new LiveQueryClient({});
    }).toThrow('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
  });

  it('WebSocketController required', done => {
    const WebSocketImplementation = CoreManager.getWebSocketController();
    CoreManager.setWebSocketController();
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.on('error', error => {
      expect(error).toBe('Can not find WebSocket implementation');
      CoreManager.setWebSocketController(WebSocketImplementation);
      done();
    });
    liveQueryClient.open();
  });

  it('can handle open / close states', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    expect(liveQueryClient.shouldOpen()).toBe(true);
    liveQueryClient.close();
    expect(liveQueryClient.shouldOpen()).toBe(true);
    liveQueryClient.open();
    expect(liveQueryClient.shouldOpen()).toBe(false);
  });

  it('set undefined sessionToken default', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
    });
    expect(liveQueryClient.sessionToken).toBe(undefined);
  });

  it('can connect to server', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Mock _getWebSocketImplementation
    liveQueryClient._getWebSocketImplementation = function () {
      return jest.fn();
    };
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
    expect(liveQueryClient._handleWebSocketOpen).toHaveBeenCalled();
    liveQueryClient.socket.onmessage({});
    expect(liveQueryClient._handleWebSocketMessage).toHaveBeenCalled();
    liveQueryClient.socket.onclose();
    expect(liveQueryClient._handleWebSocketClose).toHaveBeenCalled();
    liveQueryClient.socket.onerror();
    expect(liveQueryClient._handleWebSocketError).toHaveBeenCalled();
  });

  it('can handle WebSocket open message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };

    liveQueryClient._handleWebSocketOpen();

    expect(liveQueryClient.socket.send).toHaveBeenCalled();
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
      sessionToken: 'sessionToken',
    });
    const data = {
      op: 'connected',
      clientId: 1,
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    liveQueryClient.on('open', function () {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
    expect(liveQueryClient.id).toBe(1);
    await liveQueryClient.connectPromise;
    expect(liveQueryClient.state).toEqual('connected');
  });

  it('can handle WebSocket reconnect on connected response message', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const data = {
      op: 'connected',
      clientId: 1,
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    liveQueryClient.on('open', function () {
      isChecked = true;
    });
    jest.spyOn(liveQueryClient, 'resubscribe');
    liveQueryClient._handleReconnect();
    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
    expect(liveQueryClient.id).toBe(1);
    await liveQueryClient.connectPromise;
    expect(liveQueryClient.state).toEqual('connected');
    expect(liveQueryClient.resubscribe).toHaveBeenCalledTimes(1);
  });

  it('can handle WebSocket subscribed response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    subscription.subscribePromise = resolvingPromise();

    liveQueryClient.subscriptions.set(1, subscription);
    const data = {
      op: 'subscribed',
      clientId: 1,
      requestId: 1,
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    subscription.on('open', function () {
      isChecked = true;
    });

    liveQueryClient._handleWebSocketMessage(event);
    jest.runOnlyPendingTimers();
    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket unsubscribed response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const subscription = new events.EventEmitter();
    subscription.subscribePromise = resolvingPromise();
    subscription.unsubscribePromise = resolvingPromise();

    liveQueryClient.subscriptions.set(1, subscription);
    const data = {
      op: 'unsubscribed',
      clientId: 1,
      requestId: 1,
    };
    const event = {
      data: JSON.stringify(data),
    };
    liveQueryClient._handleWebSocketMessage(event);
    expect(liveQueryClient.subscriptions.size).toBe(0);
  });

  it('can handle WebSocket error response message', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const data = {
      op: 'error',
      clientId: 1,
      error: 'error',
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    liveQueryClient.on('error', function (error) {
      isChecked = true;
      expect(error).toEqual('error');
    });
    try {
      liveQueryClient._handleWebSocketMessage(event);
      await liveQueryClient.connectPromise;
    } catch (error) {
      expect(error.message).toEqual('error');
    }

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket error while subscribing', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const subscription = new events.EventEmitter();
    subscription.subscribePromise = resolvingPromise();
    liveQueryClient.subscriptions.set(1, subscription);

    const data = {
      op: 'error',
      clientId: 1,
      requestId: 1,
      error: 'error thrown',
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    subscription.on('error', function (error) {
      isChecked = true;
      expect(error).toEqual('error thrown');
    });

    try {
      liveQueryClient._handleWebSocketMessage(event);
      await Promise.all([
        subscription.connectPromise,
        subscription.subscribePromise,
        liveQueryClient.connectPromise,
        liveQueryClient.subscribePromise,
      ]);
    } catch (e) {
      expect(e.message).toEqual('error thrown');
    }

    jest.runOnlyPendingTimers();
    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket event response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
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
      object: object._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    subscription.on('create', function (parseObject) {
      isChecked = true;
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket event response message without subscription', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const object = new ParseObject('Test');
    object.set('key', 'value');
    const data = {
      op: 'create',
      clientId: 1,
      requestId: 1,
      object: object._toFullJSON(),
    };
    const event = {
      data: JSON.stringify(data),
    };
    liveQueryClient._handleWebSocketMessage(event);
  });

  it('can handle WebSocket response with original', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
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
      data: JSON.stringify(data),
    };
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
      sessionToken: 'sessionToken',
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
      data: JSON.stringify(data),
    };

    jest
      .spyOn(mockLocalDatastore, '_updateObjectIfPinned')
      .mockImplementationOnce(() => Promise.resolve());

    const spy = jest
      .spyOn(ParseObject, 'fromJSON')
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

  it('can handle select in websocket payload', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    subscription.query = new ParseQuery('Test').select('foo');
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
      data: JSON.stringify(data),
    };

    const spy = jest
      .spyOn(ParseObject, 'fromJSON')
      .mockImplementationOnce(() => original)
      .mockImplementationOnce(() => object);

    liveQueryClient._handleWebSocketMessage(event);
    expect(ParseObject.fromJSON.mock.calls[1][1]).toEqual(false);
    spy.mockRestore();
  });

  it('can handle WebSocket response unset field', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
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
      data: JSON.stringify(data),
    };
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
      sessionToken: 'sessionToken',
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    let isChecked = false;
    subscription.on('close', function () {
      isChecked = true;
    });
    let isCheckedAgain = false;
    liveQueryClient.on('close', function () {
      isCheckedAgain = true;
    });

    liveQueryClient._handleWebSocketClose();

    expect(isChecked).toBe(true);
    expect(isCheckedAgain).toBe(true);
  });

  it('can handle WebSocket close message while disconnected', () => {
    CoreManager.setWebSocketController();
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    let isChecked = false;
    subscription.on('close', function () {
      isChecked = true;
    });
    let isCheckedAgain = false;
    liveQueryClient.on('close', function () {
      isCheckedAgain = true;
    });
    liveQueryClient.open();
    liveQueryClient.close();
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
      sessionToken: 'sessionToken',
    });

    liveQueryClient.open = jest.fn();

    const attempts = liveQueryClient.attempts;
    liveQueryClient._handleReconnect();
    expect(liveQueryClient.state).toEqual('reconnecting');

    jest.runOnlyPendingTimers();

    expect(liveQueryClient.attempts).toEqual(attempts + 1);
    expect(liveQueryClient.open).toHaveBeenCalled();
  });

  it('can handle reconnect and clear handler', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });

    liveQueryClient.open = jest.fn();

    const attempts = liveQueryClient.attempts;
    liveQueryClient.state = 'disconnected';
    liveQueryClient._handleReconnect();
    expect(liveQueryClient.state).toEqual('disconnected');

    liveQueryClient.state = 'connected';
    liveQueryClient._handleReconnect();
    expect(liveQueryClient.state).toEqual('reconnecting');

    liveQueryClient._handleReconnect();
    jest.runOnlyPendingTimers();

    expect(liveQueryClient.attempts).toEqual(attempts + 1);
    expect(liveQueryClient.open).toHaveBeenCalled();
  });

  describe('connection lifecycle', () => {
    let liveQueryClient;
    let WebSocketImplementation;
    let previousWebSocketImplementation;

    beforeEach(() => {
      jest.clearAllTimers();
      previousWebSocketImplementation = CoreManager.getWebSocketController();
      WebSocketImplementation = jest.fn(() => ({
        send: jest.fn(),
        close: jest.fn(),
      }));
      CoreManager.setWebSocketController(WebSocketImplementation);
      liveQueryClient = new LiveQueryClient({
        applicationId: 'applicationId',
        serverURL: 'ws://test',
      });
    });

    afterEach(() => {
      jest.clearAllTimers();
      CoreManager.setWebSocketController(previousWebSocketImplementation);
    });

    async function connectClient() {
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      socket.onopen();
      socket.onmessage({ data: { op: 'connected', clientId: 1 } });
      await liveQueryClient.connectPromise;
      socket.send.mockClear();
      return socket;
    }

    it('restores established subscriptions when reopened while connected', async () => {
      const previousSocket = await connectClient();
      const query = new ParseQuery('Test');
      query.equalTo('key', 'value');
      const subscription = liveQueryClient.subscribe(query, 'subscriptionToken');
      await liveQueryClient.connectPromise;
      previousSocket.onmessage({ data: { op: 'subscribed', requestId: subscription.id } });
      const previousPromise = liveQueryClient.connectPromise;

      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      expect(liveQueryClient.state).toBe('reconnecting');
      expect(liveQueryClient.connectPromise).not.toBe(previousPromise);
      expect(liveQueryClient.subscriptions.get(subscription.id)).toBe(subscription);
      expect(previousSocket.close).toHaveBeenCalledTimes(1);
      expect(socket.send).not.toHaveBeenCalled();

      socket.onopen();
      expect(socket.send).toHaveBeenCalledTimes(1);
      socket.onmessage({ data: { op: 'connected', clientId: 2 } });
      await liveQueryClient.connectPromise;

      const requests = socket.send.mock.calls.map(([message]) => JSON.parse(message));
      expect(requests).toEqual([
        expect.objectContaining({ op: 'connect' }),
        {
          op: 'subscribe',
          requestId: subscription.id,
          query: { className: 'Test', where: { key: 'value' } },
          sessionToken: 'subscriptionToken',
        },
      ]);
    });

    it.each(['before transport open', 'before the connected response'])(
      'queues a new subscription once when reopening %s',
      async phase => {
        await connectClient();
        const existing = liveQueryClient.subscribe(new ParseQuery('Existing'));
        await liveQueryClient.connectPromise;
        liveQueryClient.open();
        const socket = liveQueryClient.socket;
        if (phase === 'before the connected response') {
          socket.onopen();
        }
        const subscription = liveQueryClient.subscribe(new ParseQuery('New'));
        await Promise.resolve();
        const beforeConnected = socket.send.mock.calls.map(([message]) => JSON.parse(message));
        expect(beforeConnected.filter(request => request.op === 'subscribe')).toEqual([]);

        if (phase === 'before transport open') {
          socket.onopen();
        }
        socket.onmessage({ data: { op: 'connected', clientId: 2 } });
        await liveQueryClient.connectPromise;

        const requests = socket.send.mock.calls
          .map(([message]) => JSON.parse(message))
          .filter(request => request.op === 'subscribe');
        expect(requests.map(request => request.requestId).sort()).toEqual([
          existing.id,
          subscription.id,
        ]);
      }
    );

    it('preserves an initial subscription queued before open', async () => {
      const subscription = liveQueryClient.subscribe(new ParseQuery('Test'));
      const promise = liveQueryClient.connectPromise;
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      expect(liveQueryClient.connectPromise).toBe(promise);
      expect(socket.send).not.toHaveBeenCalled();
      socket.onopen();
      socket.onmessage({ data: { op: 'connected', clientId: 1 } });
      await promise;
      const requests = socket.send.mock.calls.map(([message]) => JSON.parse(message));
      expect(requests.filter(request => request.op === 'subscribe')).toEqual([
        expect.objectContaining({ requestId: subscription.id }),
      ]);
    });

    it.each(['timer', 'manual open'])(
      'keeps new subscriptions queued through a reconnect started by %s',
      async retry => {
        const previousSocket = await connectClient();
        liveQueryClient.subscribe(new ParseQuery('Existing'));
        await liveQueryClient.connectPromise;
        previousSocket.send.mockClear();
        previousSocket.onerror(new Error('Connection failed'));
        const promise = liveQueryClient.connectPromise;
        const subscription = liveQueryClient.subscribe(new ParseQuery('New'));
        await Promise.resolve();
        expect(previousSocket.send).not.toHaveBeenCalled();

        if (retry === 'timer') {
          jest.runOnlyPendingTimers();
        } else {
          liveQueryClient.open();
        }
        expect(liveQueryClient.connectPromise).toBe(promise);
        const socket = liveQueryClient.socket;
        expect(socket.send).not.toHaveBeenCalled();
        socket.onopen();
        socket.onmessage({ data: { op: 'connected', clientId: 2 } });
        await promise;
        const requests = socket.send.mock.calls
          .map(([message]) => JSON.parse(message))
          .filter(request => request.op === 'subscribe');
        expect(requests.map(request => request.requestId).sort()).toEqual([1, subscription.id]);
      }
    );

    it('does not send an old queued request on a connecting replacement', async () => {
      await connectClient();
      const subscription = liveQueryClient.subscribe(new ParseQuery('Test'));
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      await Promise.resolve();
      expect(socket.send).not.toHaveBeenCalled();
      socket.onopen();
      socket.onmessage({ data: { op: 'connected', clientId: 2 } });
      await liveQueryClient.connectPromise;
      const requests = socket.send.mock.calls
        .map(([message]) => JSON.parse(message))
        .filter(request => request.op === 'subscribe');
      expect(requests).toEqual([expect.objectContaining({ requestId: subscription.id })]);
    });

    it('cancels a pending reconnect when closed', async () => {
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      socket.onerror(new Error('Connection failed'));

      const closed = liveQueryClient.close();
      jest.runOnlyPendingTimers();

      expect(WebSocketImplementation).toHaveBeenCalledTimes(1);
      expect(liveQueryClient.state).toBe('disconnected');
      expect(liveQueryClient.reconnectHandle).toBeNull();
      socket.onclose();
      await closed;
    });

    it('cancels a pending reconnect when opened manually', () => {
      liveQueryClient.open();
      liveQueryClient.socket.onerror(new Error('Connection failed'));

      liveQueryClient.open();
      jest.runOnlyPendingTimers();

      expect(WebSocketImplementation).toHaveBeenCalledTimes(2);
      expect(liveQueryClient.reconnectHandle).toBeNull();
    });

    it('closes the previous connection after a server requests a reconnect', async () => {
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      socket.onmessage({ data: { op: 'connected', clientId: 1 } });
      socket.onmessage({
        data: { op: 'error', error: 'Reconnect required', reconnect: true },
      });

      jest.runOnlyPendingTimers();

      expect(WebSocketImplementation).toHaveBeenCalledTimes(2);
      expect(liveQueryClient.socket).not.toBe(socket);
      expect(socket.close).toHaveBeenCalledTimes(1);
      expect(liveQueryClient.state).toBe('reconnecting');

      liveQueryClient.socket.onopen();
      const request = JSON.parse(liveQueryClient.socket.send.mock.calls[0][0]);
      expect(request.op).toBe('connect');
      liveQueryClient.socket.onmessage({
        data: { op: 'connected', clientId: 2 },
      });
      await liveQueryClient.connectPromise;
      expect(liveQueryClient.state).toBe('connected');
      expect(liveQueryClient.id).toBe(2);
    });

    it.each(['onopen', 'onmessage', 'onclose', 'onerror'])(
      'ignores %s from a replaced connection',
      eventName => {
        liveQueryClient.open();
        const socket = liveQueryClient.socket;
        liveQueryClient.open();
        const currentSocket = liveQueryClient.socket;
        const onOpen = jest.fn();
        const onClose = jest.fn();
        const onError = jest.fn();
        liveQueryClient.on('open', onOpen);
        liveQueryClient.on('close', onClose);
        liveQueryClient.on('error', onError);

        socket[eventName]({ data: { op: 'connected', clientId: 42 } });

        expect(currentSocket.send).not.toHaveBeenCalled();
        expect(liveQueryClient.state).toBe('connecting');
        expect(liveQueryClient.id).toBe(0);
        expect(onOpen).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(liveQueryClient.reconnectHandle).toBeNull();
      }
    );

    it.each(['onopen', 'onmessage', 'onerror'])(
      'ignores %s after an explicit close',
      async eventName => {
        liveQueryClient.open();
        const socket = liveQueryClient.socket;
        const onOpen = jest.fn();
        const onError = jest.fn();
        liveQueryClient.on('open', onOpen);
        liveQueryClient.on('error', onError);
        const closed = liveQueryClient.close();

        socket[eventName]({ data: { op: 'connected', clientId: 42 } });

        expect(socket.send).not.toHaveBeenCalled();
        expect(liveQueryClient.state).toBe('disconnected');
        expect(onOpen).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(liveQueryClient.reconnectHandle).toBeNull();
        socket.onclose();
        await closed;
      }
    );

    it('resolves each close with the event from its own connection', async () => {
      liveQueryClient.open();
      const firstSocket = liveQueryClient.socket;
      const firstClosed = liveQueryClient.close();
      liveQueryClient.open();
      const secondSocket = liveQueryClient.socket;
      const secondClosed = liveQueryClient.close();
      const firstResolve = jest.spyOn(firstSocket.closingPromise, 'resolve');
      const secondResolve = jest.spyOn(secondSocket.closingPromise, 'resolve');
      const firstEvent = { code: 1000, reason: 'First connection closed' };
      const secondEvent = { code: 1000, reason: 'Second connection closed' };

      firstSocket.onclose(firstEvent);

      expect(firstResolve).toHaveBeenCalledWith(firstEvent);
      expect(secondResolve).not.toHaveBeenCalled();
      secondSocket.onclose(secondEvent);
      await expect(firstClosed).resolves.toBe(firstEvent);
      await expect(secondClosed).resolves.toBe(secondEvent);
    });

    it('keeps the original close promise when a close listener reopens', async () => {
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      liveQueryClient.on('close', () => liveQueryClient.open());

      const closed = liveQueryClient.close();
      const currentSocket = liveQueryClient.socket;
      const currentResolve = jest.spyOn(currentSocket.closingPromise, 'resolve');
      const event = { code: 1000 };
      socket.onclose(event);

      expect(currentResolve).not.toHaveBeenCalled();
      await expect(closed).resolves.toBe(event);
      expect(liveQueryClient.state).toBe('connecting');
    });

    it('ignores a synchronous close event while replacing a connection', () => {
      liveQueryClient.open();
      const socket = liveQueryClient.socket;
      socket.close.mockImplementation(() => socket.onclose());
      const onClose = jest.fn();
      liveQueryClient.on('close', onClose);

      liveQueryClient.open();

      expect(socket.close).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
      expect(liveQueryClient.state).toBe('connecting');
      expect(liveQueryClient.reconnectHandle).toBeNull();
    });
  });

  it('can handle WebSocket error message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const error = {};
    let isChecked = false;
    liveQueryClient.on('error', function (errorAgain) {
      isChecked = true;
      expect(errorAgain).toEqual(error);
    });

    liveQueryClient._handleWebSocketError(error);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket error message with subscriptions', done => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const error = {};
    subscription.on('error', errorAgain => {
      expect(errorAgain).toEqual(error);
      done();
    });

    liveQueryClient._handleWebSocketError(error);
  });

  it('can handle WebSocket reconnect on error event', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    expect(liveQueryClient.additionalProperties).toBe(true);
    const data = {
      op: 'error',
      code: 1,
      reconnect: true,
      error: 'Additional properties not allowed',
    };
    const event = {
      data: JSON.stringify(data),
    };
    let isChecked = false;
    liveQueryClient.on('error', function (error) {
      isChecked = true;
      expect(error).toEqual(data.error);
    });
    const spy = jest.spyOn(liveQueryClient, '_handleReconnect');
    try {
      liveQueryClient._handleWebSocketMessage(event);
      await liveQueryClient.connectPromise;
    } catch (e) {
      expect(e.message).toBe('Additional properties not allowed');
    }

    expect(isChecked).toBe(true);
    expect(liveQueryClient._handleReconnect).toHaveBeenCalledTimes(1);
    expect(liveQueryClient.additionalProperties).toBe(false);
    spy.mockRestore();
  });

  it('can handle WebSocket disconnect if already disconnected', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const spy = jest.spyOn(liveQueryClient, '_handleReconnect');
    liveQueryClient.state = 'disconnected';
    liveQueryClient._handleWebSocketClose();
    expect(liveQueryClient._handleReconnect).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('can subscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
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
          key: 'value',
        },
      },
    });
  });

  it('can subscribe with sessionToken', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    const subscribePromise = liveQueryClient.subscribe(query, 'mySessionToken');
    const clientSub = liveQueryClient.subscriptions.get(1);
    clientSub.subscribePromise.resolve();

    const subscription = await subscribePromise;
    liveQueryClient.connectPromise.resolve();
    expect(subscription).toBe(clientSub);
    expect(subscription.sessionToken).toBe('mySessionToken');
    expect(liveQueryClient.requestId).toBe(2);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'subscribe',
      requestId: 1,
      sessionToken: 'mySessionToken',
      query: {
        className: 'Test',
        where: {
          key: 'value',
        },
      },
    });
  });

  it('can unsubscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const subscription = {
      id: 1,
      unsubscribePromise: resolvingPromise(),
    };
    liveQueryClient.subscriptions.set(1, subscription);

    liveQueryClient.unsubscribe(subscription);
    liveQueryClient.connectPromise.resolve();
    expect(liveQueryClient.subscriptions.size).toBe(1);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'unsubscribe',
      requestId: 1,
    });
    const event = {
      data: JSON.stringify({
        op: 'unsubscribed',
        requestId: 1,
      }),
    };
    liveQueryClient._handleWebSocketMessage(event);
    expect(liveQueryClient.subscriptions.size).toBe(0);
  });

  it('can unsubscribe without subscription', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    liveQueryClient.unsubscribe();
    liveQueryClient.connectPromise.resolve();
    await liveQueryClient.connectPromise;
    expect(liveQueryClient.socket.send).toHaveBeenCalledTimes(0);
  });

  it('cannot subscribe on connection error', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    const subscription = liveQueryClient.subscribe(query);
    liveQueryClient.connectPromise.reject(new Error('Unable to connect'));
    liveQueryClient.connectPromise.catch(() => {});
    try {
      await subscription.subscribePromise;
      expect(true).toBeFalse();
    } catch (e) {
      expect(e.message).toBe('Unable to connect');
    }
  });

  it('can resubscribe', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');
    query.select(['key']);
    query.watch(['key']);
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
          key: 'value',
        },
        keys: ['key'],
        watch: ['key'],
      },
    });
  });

  it('can resubscribe with sessionToken', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');
    query.select(['key']);
    query.watch(['key']);
    liveQueryClient.subscribe(query, 'mySessionToken');
    liveQueryClient.connectPromise.resolve();

    liveQueryClient.resubscribe();

    expect(liveQueryClient.requestId).toBe(2);
    await liveQueryClient.connectPromise;
    const messageStr = liveQueryClient.socket.send.mock.calls[0][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'subscribe',
      requestId: 1,
      sessionToken: 'mySessionToken',
      query: {
        className: 'Test',
        where: {
          key: 'value',
        },
        keys: ['key'],
        watch: ['key'],
      },
    });
  });

  it('can close', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.state = 'connected';
    liveQueryClient.socket = {
      close: jest.fn(),
    };
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    // Register checked in advance
    let isChecked = false;
    subscription.on('close', function () {
      isChecked = true;
    });
    let isCheckedAgain = false;
    liveQueryClient.on('close', function () {
      isCheckedAgain = true;
    });

    liveQueryClient.close();

    expect(liveQueryClient.subscriptions.size).toBe(0);
    expect(isChecked).toBe(true);
    expect(isCheckedAgain).toBe(true);
    expect(liveQueryClient.socket.close).toHaveBeenCalled();
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
      sessionToken: 'sessionToken',
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
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    subscription.on('create', function (parseObject) {
      isChecked = true;
      expect(parseObject instanceof MyExtendedClass).toBe(true);
      expect(parseObject.get('key')).toEqual('value');
      expect(parseObject.get('className')).toBeUndefined();
      expect(parseObject.get('__type')).toBeUndefined();
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('cannot subscribe without query', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
    });
    const subscription = liveQueryClient.subscribe();
    expect(subscription).toBe(undefined);
  });

  it('can handle WebSocket result response message', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Add mock subscription
    const subscription = new events.EventEmitter();
    liveQueryClient.subscriptions.set(1, subscription);
    const object1 = new ParseObject('Test');
    object1.set('key', 'value1');
    const object2 = new ParseObject('Test');
    object2.set('key', 'value2');
    const data = {
      op: 'result',
      clientId: 1,
      requestId: 1,
      results: [object1._toFullJSON(), object2._toFullJSON()],
    };
    const event = {
      data: JSON.stringify(data),
    };
    // Register checked in advance
    let isChecked = false;
    subscription.on('result', function (objects) {
      isChecked = true;
      expect(objects.length).toBe(2);
      expect(objects[0].get('key')).toEqual('value1');
      expect(objects[1].get('key')).toEqual('value2');
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('can handle WebSocket result response message with missing className', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    // Add mock subscription with query
    const subscription = new events.EventEmitter();
    const query = new ParseQuery('TestClass');
    subscription.query = query;
    liveQueryClient.subscriptions.set(1, subscription);

    // Create results without className property
    const data = {
      op: 'result',
      clientId: 1,
      requestId: 1,
      results: [
        { objectId: 'obj1', key: 'value1' },
        { objectId: 'obj2', key: 'value2' },
      ],
    };
    const event = {
      data: JSON.stringify(data),
    };

    // Register checked in advance
    let isChecked = false;
    subscription.on('result', function (objects) {
      isChecked = true;
      expect(objects.length).toBe(2);
      expect(objects[0].className).toEqual('TestClass');
      expect(objects[1].className).toEqual('TestClass');
    });

    liveQueryClient._handleWebSocketMessage(event);

    expect(isChecked).toBe(true);
  });

  it('LiveQuerySubscription class has find method', () => {
    expect(typeof LiveQuerySubscription.prototype.find).toBe('function');
  });

  it('subscription has find method', () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    const subscription = liveQueryClient.subscribe(query);

    expect(subscription).toBeInstanceOf(LiveQuerySubscription);
    expect(typeof subscription.find).toBe('function');
  });

  it('can send query message via subscription', async () => {
    const liveQueryClient = new LiveQueryClient({
      applicationId: 'applicationId',
      serverURL: 'ws://test',
      javascriptKey: 'javascriptKey',
      masterKey: 'masterKey',
      sessionToken: 'sessionToken',
    });
    liveQueryClient.socket = {
      send: jest.fn(),
    };
    const query = new ParseQuery('Test');
    query.equalTo('key', 'value');

    const subscription = liveQueryClient.subscribe(query);
    liveQueryClient.connectPromise.resolve();
    await liveQueryClient.connectPromise;

    subscription.find();

    // Need to wait for the sendMessage promise to resolve
    await Promise.resolve();

    const messageStr = liveQueryClient.socket.send.mock.calls[1][0];
    const message = JSON.parse(messageStr);
    expect(message).toEqual({
      op: 'query',
      requestId: 1,
    });
  });
});
