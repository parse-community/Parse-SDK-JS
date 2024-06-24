import CoreManager, { WebSocketController } from './CoreManager';
import ParseObject from './ParseObject';
import LiveQuerySubscription from './LiveQuerySubscription';
import { resolvingPromise } from './promiseUtils';
import ParseError from './ParseError';
import type ParseQuery from './ParseQuery';

// The LiveQuery client inner state
const CLIENT_STATE = {
  INITIALIZED: 'initialized',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected',
};

// The event type the LiveQuery client should sent to server
const OP_TYPES = {
  CONNECT: 'connect',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  ERROR: 'error',
};

// The event we get back from LiveQuery server
const OP_EVENTS = {
  CONNECTED: 'connected',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete',
};

// The event the LiveQuery client should emit
const CLIENT_EMMITER_TYPES = {
  CLOSE: 'close',
  ERROR: 'error',
  OPEN: 'open',
};

// The event the LiveQuery subscription should emit
const SUBSCRIPTION_EMMITER_TYPES = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete',
};

// Exponentially-growing random delay
const generateInterval = k => {
  return Math.random() * Math.min(30, Math.pow(2, k) - 1) * 1000;
};

/**
 * Creates a new LiveQueryClient.
 * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.
 *
 * A wrapper of a standard WebSocket client. We add several useful methods to
 * help you connect/disconnect to LiveQueryServer, subscribe/unsubscribe a ParseQuery easily.
 *
 * javascriptKey and masterKey are used for verifying the LiveQueryClient when it tries
 * to connect to the LiveQuery server
 *
 * We expose three events to help you monitor the status of the LiveQueryClient.
 *
 * <pre>
 * const LiveQueryClient = Parse.LiveQueryClient;
 * const client = new LiveQueryClient({
 *   applicationId: '',
 *   serverURL: '',
 *   javascriptKey: '',
 *   masterKey: ''
 *  });
 * </pre>
 *
 * Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('open', () => {
 *
 * });</pre>
 *
 * Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('close', () => {
 *
 * });</pre>
 *
 * Error - When some network error or LiveQuery server error happens, you'll get this event.
 * <pre>
 * client.on('error', (error) => {
 *
 * });</pre>
 *
 * @alias Parse.LiveQueryClient
 */
class LiveQueryClient {
  attempts: number;
  id: number;
  requestId: number;
  applicationId: string;
  serverURL: string;
  javascriptKey?: string;
  masterKey?: string;
  sessionToken?: string;
  installationId?: string;
  additionalProperties: boolean;
  connectPromise: any;
  subscriptions: Map<number, LiveQuerySubscription>;
  socket: WebSocketController & { closingPromise?: any };
  state: string;
  reconnectHandle: any;
  emitter: any;
  on: any;
  emit: any;

  /**
   * @param {object} options
   * @param {string} options.applicationId - applicationId of your Parse app
   * @param {string} options.serverURL - <b>the URL of your LiveQuery server</b>
   * @param {string} options.javascriptKey (optional)
   * @param {string} options.masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @param {string} options.sessionToken (optional)
   * @param {string} options.installationId (optional)
   */
  constructor({
    applicationId,
    serverURL,
    javascriptKey,
    masterKey,
    sessionToken,
    installationId,
  }) {
    if (!serverURL || serverURL.indexOf('ws') !== 0) {
      throw new Error(
        'You need to set a proper Parse LiveQuery server url before using LiveQueryClient'
      );
    }

    this.reconnectHandle = null;
    this.attempts = 1;
    this.id = 0;
    this.requestId = 1;
    this.serverURL = serverURL;
    this.applicationId = applicationId;
    this.javascriptKey = javascriptKey || undefined;
    this.masterKey = masterKey || undefined;
    this.sessionToken = sessionToken || undefined;
    this.installationId = installationId || undefined;
    this.additionalProperties = true;
    this.connectPromise = resolvingPromise();
    this.subscriptions = new Map();
    this.state = CLIENT_STATE.INITIALIZED;
    const EventEmitter = CoreManager.getEventEmitter();
    this.emitter = new EventEmitter();

    this.on = (eventName, listener) => this.emitter.on(eventName, listener);
    this.emit = (eventName, ...args) => this.emitter.emit(eventName, ...args);
    // adding listener so process does not crash
    // best practice is for developer to register their own listener
    this.on('error', () => {});
  }

  shouldOpen(): any {
    return this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED;
  }

  /**
   * Subscribes to a ParseQuery
   *
   * If you provide the sessionToken, when the LiveQuery server gets ParseObject's
   * updates from parse server, it'll try to check whether the sessionToken fulfills
   * the ParseObject's ACL. The LiveQuery server will only send updates to clients whose
   * sessionToken is fit for the ParseObject's ACL. You can check the LiveQuery protocol
   * <a href="https://github.com/parse-community/parse-server/wiki/Parse-LiveQuery-Protocol-Specification">here</a> for more details. The subscription you get is the same subscription you get
   * from our Standard API.
   *
   * @param {ParseQuery} query - the ParseQuery you want to subscribe to
   * @param {string} sessionToken (optional)
   * @returns {LiveQuerySubscription | undefined}
   */
  subscribe(query: ParseQuery, sessionToken?: string): LiveQuerySubscription | undefined {
    if (!query) {
      return;
    }
    const className = query.className;
    const queryJSON = query.toJSON();
    const where = queryJSON.where;
    const keys = queryJSON.keys?.split(',');
    const watch = queryJSON.watch?.split(',');
    const subscribeRequest = {
      op: OP_TYPES.SUBSCRIBE,
      requestId: this.requestId,
      query: {
        className,
        where,
        keys,
        watch,
      },
      sessionToken: undefined as string | undefined,
    };

    if (sessionToken) {
      subscribeRequest.sessionToken = sessionToken;
    }

    const subscription = new LiveQuerySubscription(this.requestId, query, sessionToken);
    this.subscriptions.set(this.requestId, subscription);
    this.requestId += 1;
    this.connectPromise
      .then(() => {
        this.socket.send(JSON.stringify(subscribeRequest));
      })
      .catch(error => {
        subscription.subscribePromise.reject(error);
      });

    return subscription;
  }

  /**
   * After calling unsubscribe you'll stop receiving events from the subscription object.
   *
   * @param {object} subscription - subscription you would like to unsubscribe from.
   * @returns {Promise | undefined}
   */
  async unsubscribe(subscription: LiveQuerySubscription): Promise<void> {
    if (!subscription) {
      return;
    }
    const unsubscribeRequest = {
      op: OP_TYPES.UNSUBSCRIBE,
      requestId: subscription.id,
    };
    return this.connectPromise
      .then(() => {
        return this.socket.send(JSON.stringify(unsubscribeRequest));
      })
      .then(() => {
        return subscription.unsubscribePromise;
      });
  }

  /**
   * After open is called, the LiveQueryClient will try to send a connect request
   * to the LiveQuery server.
   *
   */
  open() {
    const WebSocketImplementation = CoreManager.getWebSocketController();
    if (!WebSocketImplementation) {
      this.emit(CLIENT_EMMITER_TYPES.ERROR, 'Can not find WebSocket implementation');
      return;
    }

    if (this.state !== CLIENT_STATE.RECONNECTING) {
      this.state = CLIENT_STATE.CONNECTING;
    }

    this.socket = new WebSocketImplementation(this.serverURL);
    this.socket.closingPromise = resolvingPromise();

    // Bind WebSocket callbacks
    this.socket.onopen = () => {
      this._handleWebSocketOpen();
    };

    this.socket.onmessage = event => {
      this._handleWebSocketMessage(event);
    };

    this.socket.onclose = event => {
      this.socket.closingPromise?.resolve(event);
      this._handleWebSocketClose();
    };

    this.socket.onerror = error => {
      this._handleWebSocketError(error);
    };
  }

  resubscribe() {
    this.subscriptions.forEach((subscription, requestId) => {
      const query = subscription.query;
      const queryJSON = query.toJSON();
      const where = queryJSON.where;
      const keys = queryJSON.keys?.split(',');
      const watch = queryJSON.watch?.split(',');
      const className = query.className;
      const sessionToken = subscription.sessionToken;
      const subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId,
        query: {
          className,
          where,
          keys,
          watch,
        },
        sessionToken: undefined as string | undefined,
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      this.connectPromise.then(() => {
        this.socket.send(JSON.stringify(subscribeRequest));
      });
    });
  }

  /**
   * This method will close the WebSocket connection to this LiveQueryClient,
   * cancel the auto reconnect and unsubscribe all subscriptions based on it.
   *
   * @returns {Promise | undefined} CloseEvent {@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event}
   */
  async close(): Promise<void> {
    if (this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }
    this.state = CLIENT_STATE.DISCONNECTED;
    this.socket?.close();
    // Notify each subscription about the close
    for (const subscription of this.subscriptions.values()) {
      subscription.subscribed = false;
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
    }
    this._handleReset();
    this.emit(CLIENT_EMMITER_TYPES.CLOSE);
    return this.socket?.closingPromise;
  }

  // ensure we start with valid state if connect is called again after close
  _handleReset() {
    this.attempts = 1;
    this.id = 0;
    this.requestId = 1;
    this.connectPromise = resolvingPromise();
    this.subscriptions = new Map();
  }

  _handleWebSocketOpen() {
    const connectRequest = {
      op: OP_TYPES.CONNECT,
      applicationId: this.applicationId,
      javascriptKey: this.javascriptKey,
      masterKey: this.masterKey,
      sessionToken: this.sessionToken,
      installationId: undefined as string | undefined,
    };
    if (this.additionalProperties) {
      connectRequest.installationId = this.installationId;
    }
    this.socket.send(JSON.stringify(connectRequest));
  }

  _handleWebSocketMessage(event: any) {
    let data = event.data;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    let subscription: null | LiveQuerySubscription = null;
    if (data.requestId) {
      subscription = this.subscriptions.get(data.requestId) || null;
    }
    const response = {
      clientId: data.clientId,
      installationId: data.installationId,
    };
    switch (data.op) {
    case OP_EVENTS.CONNECTED:
      if (this.state === CLIENT_STATE.RECONNECTING) {
        this.resubscribe();
      }
      this.emit(CLIENT_EMMITER_TYPES.OPEN);
      this.id = data.clientId;
      this.connectPromise.resolve();
      this.state = CLIENT_STATE.CONNECTED;
      break;
    case OP_EVENTS.SUBSCRIBED:
      if (subscription) {
        this.attempts = 1;
        subscription.subscribed = true;
        subscription.subscribePromise.resolve();
        setTimeout(() => subscription.emit(SUBSCRIPTION_EMMITER_TYPES.OPEN, response), 200);
      }
      break;
    case OP_EVENTS.ERROR: {
      const parseError = new ParseError(data.code, data.error);
      if (!this.id) {
        this.connectPromise.reject(parseError);
        this.state = CLIENT_STATE.DISCONNECTED;
      }
      if (data.requestId) {
        if (subscription) {
          subscription.subscribePromise.reject(parseError);
          setTimeout(() => subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR, data.error), 200);
        }
      } else {
        this.emit(CLIENT_EMMITER_TYPES.ERROR, data.error);
      }
      if (data.error === 'Additional properties not allowed') {
        this.additionalProperties = false;
      }
      if (data.reconnect) {
        this._handleReconnect();
      }
      break;
    }
    case OP_EVENTS.UNSUBSCRIBED: {
      if (subscription) {
        this.subscriptions.delete(data.requestId);
        subscription.subscribed = false;
        subscription.unsubscribePromise.resolve();
      }
      break;
    }
    default: {
      // create, update, enter, leave, delete cases
      if (!subscription) {
        break;
      }
      let override = false;
      if (data.original) {
        override = true;
        delete data.original.__type;
        // Check for removed fields
        for (const field in data.original) {
          if (!(field in data.object)) {
            data.object[field] = undefined;
          }
        }
        data.original = ParseObject.fromJSON(data.original, false);
      }
      delete data.object.__type;
      const parseObject = ParseObject.fromJSON(
        data.object,
        !(subscription.query && subscription.query._select) ? override : false
      );

      if (data.original) {
        subscription.emit(data.op, parseObject, data.original, response);
      } else {
        subscription.emit(data.op, parseObject, response);
      }

      const localDatastore = CoreManager.getLocalDatastore();
      if (override && localDatastore.isEnabled) {
        localDatastore._updateObjectIfPinned(parseObject).then(() => {});
      }
    }
    }
  }

  _handleWebSocketClose() {
    if (this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }
    this.state = CLIENT_STATE.CLOSED;
    this.emit(CLIENT_EMMITER_TYPES.CLOSE);
    // Notify each subscription about the close
    for (const subscription of this.subscriptions.values()) {
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
    }
    this._handleReconnect();
  }

  _handleWebSocketError(error: any) {
    this.emit(CLIENT_EMMITER_TYPES.ERROR, error);
    for (const subscription of this.subscriptions.values()) {
      subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR, error);
    }
    this._handleReconnect();
  }

  _handleReconnect() {
    // if closed or currently reconnecting we stop attempting to reconnect
    if (this.state === CLIENT_STATE.DISCONNECTED) {
      return;
    }
    this.state = CLIENT_STATE.RECONNECTING;
    const time = generateInterval(this.attempts);

    // handle case when both close/error occur at frequent rates we ensure we do not reconnect unnecessarily.
    // we're unable to distinguish different between close/error when we're unable to reconnect therefore
    // we try to reconnect in both cases
    // server side ws and browser WebSocket behave differently in when close/error get triggered
    if (this.reconnectHandle) {
      clearTimeout(this.reconnectHandle);
    }
    this.reconnectHandle = setTimeout(
      (() => {
        this.attempts++;
        this.connectPromise = resolvingPromise();
        this.open();
      }).bind(this),
      time
    );
  }
}

export default LiveQueryClient;
