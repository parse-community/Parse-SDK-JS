'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _EventEmitter = require('./EventEmitter');

var _EventEmitter2 = _interopRequireDefault(_EventEmitter);

var _LiveQueryClient = require('./LiveQueryClient');

var _LiveQueryClient2 = _interopRequireDefault(_LiveQueryClient);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

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
var LiveQuery = new _EventEmitter2['default']();

/**
 * After open is called, the LiveQuery will try to send a connect request
 * to the LiveQuery server.
 * 
 * @method open
 */
LiveQuery.open = function open() {
  var LiveQueryController = _CoreManager2['default'].getLiveQueryController();
  LiveQueryController.open();
};

/**
 * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
 * This function will close the WebSocket connection to the LiveQuery server,
 * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
 * If you call query.subscribe() after this, we'll create a new WebSocket
 * connection to the LiveQuery server.
 * 
 * @method close
 */

LiveQuery.close = function close() {
  var LiveQueryController = _CoreManager2['default'].getLiveQueryController();
  LiveQueryController.close();
};
// Register a default onError callback to make sure we do not crash on error
LiveQuery.on('error', function () {});

exports['default'] = LiveQuery;

var getSessionToken = function getSessionToken() {
  var currentUser = _CoreManager2['default'].getUserController().currentUser();
  var sessionToken = undefined;
  if (currentUser) {
    sessionToken = currentUser.getSessionToken();
  }
  return sessionToken;
};

var getLiveQueryClient = function getLiveQueryClient() {
  return _CoreManager2['default'].getLiveQueryController().getDefaultLiveQueryClient();
};

var defaultLiveQueryClient = undefined;

_CoreManager2['default'].setLiveQueryController({
  setDefaultLiveQueryClient: function setDefaultLiveQueryClient(liveQueryClient) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient: function getDefaultLiveQueryClient() {
    if (defaultLiveQueryClient) {
      return defaultLiveQueryClient;
    }

    var liveQueryServerURL = _CoreManager2['default'].get('LIVEQUERY_SERVER_URL');

    if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
      throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
    }

    // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL
    if (!liveQueryServerURL) {
      var host = _CoreManager2['default'].get('SERVER_URL').replace(/^https?:\/\//, '');
      liveQueryServerURL = 'ws://' + host;
      _CoreManager2['default'].set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
    }

    var applicationId = _CoreManager2['default'].get('APPLICATION_ID');
    var javascriptKey = _CoreManager2['default'].get('JAVASCRIPT_KEY');
    var masterKey = _CoreManager2['default'].get('MASTER_KEY');
    // Get currentUser sessionToken if possible
    defaultLiveQueryClient = new _LiveQueryClient2['default']({
      applicationId: applicationId,
      serverURL: liveQueryServerURL,
      javascriptKey: javascriptKey,
      masterKey: masterKey,
      sessionToken: getSessionToken()
    });
    // Register a default onError callback to make sure we do not crash on error
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
  },
  open: function open() {
    var liveQueryClient = getLiveQueryClient();
    liveQueryClient.open();
  },
  close: function close() {
    var liveQueryClient = getLiveQueryClient();
    liveQueryClient.close();
  },
  subscribe: function subscribe(query) {
    var liveQueryClient = getLiveQueryClient();
    if (liveQueryClient.shouldOpen()) {
      liveQueryClient.open();
    }
    return liveQueryClient.subscribe(query, getSessionToken());
  },
  unsubscribe: function unsubscribe(subscription) {
    var liveQueryClient = getLiveQueryClient();
    return liveQueryClient.unsubscribe(subscription);
  }
});
module.exports = exports['default'];