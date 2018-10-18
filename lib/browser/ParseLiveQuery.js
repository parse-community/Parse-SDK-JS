"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _EventEmitter = _interopRequireDefault(require("./EventEmitter"));

var _LiveQueryClient = _interopRequireDefault(require("./LiveQueryClient"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */


function open() {
  var LiveQueryController = _CoreManager.default.getLiveQueryController();

  LiveQueryController.open();
}

function close() {
  var LiveQueryController = _CoreManager.default.getLiveQueryController();

  LiveQueryController.close();
}
/**
 *
 * We expose three events to help you monitor the status of the WebSocket connection:
 *
 * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('open', () => {
 *
 * });</pre></p>
 *
 * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('close', () => {
 *
 * });</pre></p>
 *
 * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('error', (error) => {
 *
 * });</pre></p>
 *
 * @class Parse.LiveQuery
 * @static
 *
 */


var LiveQuery = new _EventEmitter.default();
/**
 * After open is called, the LiveQuery will try to send a connect request
 * to the LiveQuery server.
 *

 */

LiveQuery.open = open;
/**
 * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
 * This function will close the WebSocket connection to the LiveQuery server,
 * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
 * If you call query.subscribe() after this, we'll create a new WebSocket
 * connection to the LiveQuery server.
 *

 */

LiveQuery.close = close; // Register a default onError callback to make sure we do not crash on error

LiveQuery.on('error', function () {});
var _default = LiveQuery;
exports.default = _default;

function getSessionToken() {
  var controller = _CoreManager.default.getUserController();

  return controller.currentUserAsync().then(function (currentUser) {
    return currentUser ? currentUser.getSessionToken() : undefined;
  });
}

function getLiveQueryClient() {
  return _CoreManager.default.getLiveQueryController().getDefaultLiveQueryClient();
}

var defaultLiveQueryClient;
var DefaultLiveQueryController = {
  setDefaultLiveQueryClient: function (liveQueryClient
  /*: any*/
  ) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient: function ()
  /*: Promise*/
  {
    if (defaultLiveQueryClient) {
      return Promise.resolve(defaultLiveQueryClient);
    }

    return getSessionToken().then(function (sessionToken) {
      var liveQueryServerURL = _CoreManager.default.get('LIVEQUERY_SERVER_URL');

      if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
        throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
      } // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL


      if (!liveQueryServerURL) {
        var tempServerURL = _CoreManager.default.get('SERVER_URL');

        var protocol = 'ws://'; // If Parse is being served over SSL/HTTPS, ensure LiveQuery Server uses 'wss://' prefix

        if (tempServerURL.indexOf('https') === 0) {
          protocol = 'wss://';
        }

        var host = tempServerURL.replace(/^https?:\/\//, '');
        liveQueryServerURL = protocol + host;

        _CoreManager.default.set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
      }

      var applicationId = _CoreManager.default.get('APPLICATION_ID');

      var javascriptKey = _CoreManager.default.get('JAVASCRIPT_KEY');

      var masterKey = _CoreManager.default.get('MASTER_KEY'); // Get currentUser sessionToken if possible


      defaultLiveQueryClient = new _LiveQueryClient.default({
        applicationId: applicationId,
        serverURL: liveQueryServerURL,
        javascriptKey: javascriptKey,
        masterKey: masterKey,
        sessionToken: sessionToken
      }); // Register a default onError callback to make sure we do not crash on error
      // Cannot create these events on a nested way because of EventEmiiter from React Native

      defaultLiveQueryClient.on('error', function (error) {
        LiveQuery.emit('error', error);
      });
      defaultLiveQueryClient.on('open', function () {
        LiveQuery.emit('open');
      });
      defaultLiveQueryClient.on('close', function () {
        LiveQuery.emit('close');
      });
      return defaultLiveQueryClient;
    });
  },
  open: function () {
    getLiveQueryClient().then(function (liveQueryClient) {
      return liveQueryClient.open();
    });
  },
  close: function () {
    getLiveQueryClient().then(function (liveQueryClient) {
      return liveQueryClient.close();
    });
  },
  subscribe: function (query
  /*: any*/
  )
  /*: EventEmitter*/
  {
    var subscriptionWrap = new _EventEmitter.default();
    getLiveQueryClient().then(function (liveQueryClient) {
      if (liveQueryClient.shouldOpen()) {
        liveQueryClient.open();
      }

      var promiseSessionToken = getSessionToken(); // new event emitter

      return promiseSessionToken.then(function (sessionToken) {
        var subscription = liveQueryClient.subscribe(query, sessionToken); // enter, leave create, etc

        subscriptionWrap.id = subscription.id;
        subscriptionWrap.query = subscription.query;
        subscriptionWrap.sessionToken = subscription.sessionToken;
        subscriptionWrap.unsubscribe = subscription.unsubscribe; // Cannot create these events on a nested way because of EventEmiiter from React Native

        subscription.on('open', function () {
          subscriptionWrap.emit('open');
        });
        subscription.on('create', function (object) {
          subscriptionWrap.emit('create', object);
        });
        subscription.on('update', function (object) {
          subscriptionWrap.emit('update', object);
        });
        subscription.on('enter', function (object) {
          subscriptionWrap.emit('enter', object);
        });
        subscription.on('leave', function (object) {
          subscriptionWrap.emit('leave', object);
        });
        subscription.on('delete', function (object) {
          subscriptionWrap.emit('delete', object);
        });
        subscription.on('close', function (object) {
          subscriptionWrap.emit('close', object);
        });
        subscription.on('error', function (object) {
          subscriptionWrap.emit('error', object);
        });
      });
    });
    return subscriptionWrap;
  },
  unsubscribe: function (subscription
  /*: any*/
  ) {
    getLiveQueryClient().then(function (liveQueryClient) {
      return liveQueryClient.unsubscribe(subscription);
    });
  },
  _clearCachedDefaultClient: function () {
    defaultLiveQueryClient = null;
  }
};

_CoreManager.default.setLiveQueryController(DefaultLiveQueryController);