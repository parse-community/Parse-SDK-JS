"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _EventEmitter2 = _interopRequireDefault(require("./EventEmitter"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _LiveQuerySubscription = _interopRequireDefault(require("./LiveQuerySubscription"));

var _promiseUtils = require("./promiseUtils");
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

/* global WebSocket */
// The LiveQuery client inner state


var CLIENT_STATE = {
  INITIALIZED: 'initialized',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed',
  RECONNECTING: 'reconnecting',
  DISCONNECTED: 'disconnected'
}; // The event type the LiveQuery client should sent to server

var OP_TYPES = {
  CONNECT: 'connect',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  ERROR: 'error'
}; // The event we get back from LiveQuery server

var OP_EVENTS = {
  CONNECTED: 'connected',
  SUBSCRIBED: 'subscribed',
  UNSUBSCRIBED: 'unsubscribed',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
}; // The event the LiveQuery client should emit

var CLIENT_EMMITER_TYPES = {
  CLOSE: 'close',
  ERROR: 'error',
  OPEN: 'open'
}; // The event the LiveQuery subscription should emit

var SUBSCRIPTION_EMMITER_TYPES = {
  OPEN: 'open',
  CLOSE: 'close',
  ERROR: 'error',
  CREATE: 'create',
  UPDATE: 'update',
  ENTER: 'enter',
  LEAVE: 'leave',
  DELETE: 'delete'
};

var generateInterval = function (k) {
  return Math.random() * Math.min(30, Math.pow(2, k) - 1) * 1000;
};
/**
 * Creates a new LiveQueryClient.
 * Extends events.EventEmitter
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
 * let Parse = require('parse/node');
 * let LiveQueryClient = Parse.LiveQueryClient;
 * let client = new LiveQueryClient({
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
 * @alias Parse.LiveQueryClient
 */


var LiveQueryClient =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2.default)(LiveQueryClient, _EventEmitter);
  /**
   * @param {Object} options
   * @param {string} options.applicationId - applicationId of your Parse app
   * @param {string} options.serverURL - <b>the URL of your LiveQuery server</b>
   * @param {string} options.javascriptKey (optional)
   * @param {string} options.masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @param {string} options.sessionToken (optional)
   */

  function LiveQueryClient(_ref) {
    var _this;

    var applicationId = _ref.applicationId,
        serverURL = _ref.serverURL,
        javascriptKey = _ref.javascriptKey,
        masterKey = _ref.masterKey,
        sessionToken = _ref.sessionToken;
    (0, _classCallCheck2.default)(this, LiveQueryClient);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(LiveQueryClient).call(this));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "attempts", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "id", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "requestId", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "applicationId", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "serverURL", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "javascriptKey", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "masterKey", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "sessionToken", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "connectPromise", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "subscriptions", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "socket", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), "state", void 0);

    if (!serverURL || serverURL.indexOf('ws') !== 0) {
      throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
    }

    _this.reconnectHandle = null;
    _this.attempts = 1;
    _this.id = 0;
    _this.requestId = 1;
    _this.serverURL = serverURL;
    _this.applicationId = applicationId;
    _this.javascriptKey = javascriptKey;
    _this.masterKey = masterKey;
    _this.sessionToken = sessionToken;
    _this.connectPromise = (0, _promiseUtils.resolvingPromise)();
    _this.subscriptions = new Map();
    _this.state = CLIENT_STATE.INITIALIZED;
    return _this;
  }

  (0, _createClass2.default)(LiveQueryClient, [{
    key: "shouldOpen",
    value: function ()
    /*: any*/
    {
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
     * @param {Object} query - the ParseQuery you want to subscribe to
     * @param {string} sessionToken (optional)
     * @return {Object} subscription
     */

  }, {
    key: "subscribe",
    value: function (query
    /*: Object*/
    , sessionToken
    /*: ?string*/
    )
    /*: Object*/
    {
      var _this2 = this;

      if (!query) {
        return;
      }

      var className = query.className;
      var queryJSON = query.toJSON();
      var where = queryJSON.where;
      var fields = queryJSON.keys ? queryJSON.keys.split(',') : undefined;
      var subscribeRequest = {
        op: OP_TYPES.SUBSCRIBE,
        requestId: this.requestId,
        query: {
          className: className,
          where: where,
          fields: fields
        }
      };

      if (sessionToken) {
        subscribeRequest.sessionToken = sessionToken;
      }

      var subscription = new _LiveQuerySubscription.default(this.requestId, query, sessionToken);
      this.subscriptions.set(this.requestId, subscription);
      this.requestId += 1;
      this.connectPromise.then(function () {
        _this2.socket.send(JSON.stringify(subscribeRequest));
      }); // adding listener so process does not crash
      // best practice is for developer to register their own listener

      subscription.on('error', function () {});
      return subscription;
    }
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {Object} subscription - subscription you would like to unsubscribe from.
     */

  }, {
    key: "unsubscribe",
    value: function (subscription
    /*: Object*/
    ) {
      var _this3 = this;

      if (!subscription) {
        return;
      }

      this.subscriptions.delete(subscription.id);
      var unsubscribeRequest = {
        op: OP_TYPES.UNSUBSCRIBE,
        requestId: subscription.id
      };
      this.connectPromise.then(function () {
        _this3.socket.send(JSON.stringify(unsubscribeRequest));
      });
    }
    /**
     * After open is called, the LiveQueryClient will try to send a connect request
     * to the LiveQuery server.
     *
     */

  }, {
    key: "open",
    value: function () {
      var _this4 = this;

      var WebSocketImplementation = this._getWebSocketImplementation();

      if (!WebSocketImplementation) {
        this.emit(CLIENT_EMMITER_TYPES.ERROR, 'Can not find WebSocket implementation');
        return;
      }

      if (this.state !== CLIENT_STATE.RECONNECTING) {
        this.state = CLIENT_STATE.CONNECTING;
      } // Get WebSocket implementation


      this.socket = new WebSocketImplementation(this.serverURL); // Bind WebSocket callbacks

      this.socket.onopen = function () {
        _this4._handleWebSocketOpen();
      };

      this.socket.onmessage = function (event) {
        _this4._handleWebSocketMessage(event);
      };

      this.socket.onclose = function () {
        _this4._handleWebSocketClose();
      };

      this.socket.onerror = function (error) {
        _this4._handleWebSocketError(error);
      };
    }
  }, {
    key: "resubscribe",
    value: function () {
      var _this5 = this;

      this.subscriptions.forEach(function (subscription, requestId) {
        var query = subscription.query;
        var queryJSON = query.toJSON();
        var where = queryJSON.where;
        var fields = queryJSON.keys ? queryJSON.keys.split(',') : undefined;
        var className = query.className;
        var sessionToken = subscription.sessionToken;
        var subscribeRequest = {
          op: OP_TYPES.SUBSCRIBE,
          requestId: requestId,
          query: {
            className: className,
            where: where,
            fields: fields
          }
        };

        if (sessionToken) {
          subscribeRequest.sessionToken = sessionToken;
        }

        _this5.connectPromise.then(function () {
          _this5.socket.send(JSON.stringify(subscribeRequest));
        });
      });
    }
    /**
     * This method will close the WebSocket connection to this LiveQueryClient,
     * cancel the auto reconnect and unsubscribe all subscriptions based on it.
     *
     */

  }, {
    key: "close",
    value: function () {
      if (this.state === CLIENT_STATE.INITIALIZED || this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }

      this.state = CLIENT_STATE.DISCONNECTED;
      this.socket.close(); // Notify each subscription about the close

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.subscriptions.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var subscription = _step.value;
          subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      this._handleReset();

      this.emit(CLIENT_EMMITER_TYPES.CLOSE);
    }
  }, {
    key: "_getWebSocketImplementation",
    value: function ()
    /*: any*/
    {
      return typeof WebSocket === 'function' || (typeof WebSocket === "undefined" ? "undefined" : (0, _typeof2.default)(WebSocket)) === 'object' ? WebSocket : null;
    } // ensure we start with valid state if connect is called again after close

  }, {
    key: "_handleReset",
    value: function () {
      this.attempts = 1;
      this.id = 0;
      this.requestId = 1;
      this.connectPromise = (0, _promiseUtils.resolvingPromise)();
      this.subscriptions = new Map();
    }
  }, {
    key: "_handleWebSocketOpen",
    value: function () {
      this.attempts = 1;
      var connectRequest = {
        op: OP_TYPES.CONNECT,
        applicationId: this.applicationId,
        javascriptKey: this.javascriptKey,
        masterKey: this.masterKey,
        sessionToken: this.sessionToken
      };
      this.socket.send(JSON.stringify(connectRequest));
    }
  }, {
    key: "_handleWebSocketMessage",
    value: function (event
    /*: any*/
    ) {
      var data = event.data;

      if (typeof data === 'string') {
        data = JSON.parse(data);
      }

      var subscription = null;

      if (data.requestId) {
        subscription = this.subscriptions.get(data.requestId);
      }

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
            subscription.emit(SUBSCRIPTION_EMMITER_TYPES.OPEN);
          }

          break;

        case OP_EVENTS.ERROR:
          if (data.requestId) {
            if (subscription) {
              subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR, data.error);
            }
          } else {
            this.emit(CLIENT_EMMITER_TYPES.ERROR, data.error);
          }

          break;

        case OP_EVENTS.UNSUBSCRIBED:
          // We have already deleted subscription in unsubscribe(), do nothing here
          break;

        default:
          {
            // create, update, enter, leave, delete cases
            // Does not override / clear server data
            delete data.object.__type;

            var parseObject = _ParseObject.default.fromJSON(data.object, false);

            if (!subscription) {
              break;
            }

            subscription.emit(data.op, parseObject);
          }
      }
    }
  }, {
    key: "_handleWebSocketClose",
    value: function () {
      if (this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }

      this.state = CLIENT_STATE.CLOSED;
      this.emit(CLIENT_EMMITER_TYPES.CLOSE); // Notify each subscription about the close

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.subscriptions.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var subscription = _step2.value;
          subscription.emit(SUBSCRIPTION_EMMITER_TYPES.CLOSE);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this._handleReconnect();
    }
  }, {
    key: "_handleWebSocketError",
    value: function (error
    /*: any*/
    ) {
      this.emit(CLIENT_EMMITER_TYPES.ERROR, error);
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.subscriptions.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var subscription = _step3.value;
          subscription.emit(SUBSCRIPTION_EMMITER_TYPES.ERROR);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      this._handleReconnect();
    }
  }, {
    key: "_handleReconnect",
    value: function () {
      var _this6 = this; // if closed or currently reconnecting we stop attempting to reconnect


      if (this.state === CLIENT_STATE.DISCONNECTED) {
        return;
      }

      this.state = CLIENT_STATE.RECONNECTING;
      var time = generateInterval(this.attempts); // handle case when both close/error occur at frequent rates we ensure we do not reconnect unnecessarily.
      // we're unable to distinguish different between close/error when we're unable to reconnect therefore
      // we try to reonnect in both cases
      // server side ws and browser WebSocket behave differently in when close/error get triggered

      if (this.reconnectHandle) {
        clearTimeout(this.reconnectHandle);
      }

      this.reconnectHandle = setTimeout(function () {
        _this6.attempts++;
        _this6.connectPromise = (0, _promiseUtils.resolvingPromise)();

        _this6.open();
      }.bind(this), time);
    }
  }]);
  return LiveQueryClient;
}(_EventEmitter2.default);

var _default = LiveQueryClient;
exports.default = _default;