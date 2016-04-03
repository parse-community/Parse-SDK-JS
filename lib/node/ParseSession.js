/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

/**
 * @class Parse.Session
 * @constructor
 *
 * <p>A Parse.Session object is a local representation of a revocable session.
 * This class is a subclass of a Parse.Object, and retains the same
 * functionality of a Parse.Object.</p>
 */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _isRevocableSession = require('./isRevocableSession');

var _isRevocableSession2 = _interopRequireDefault(_isRevocableSession);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var _ParsePromise = require('./ParsePromise');

var _ParsePromise2 = _interopRequireDefault(_ParsePromise);

var _ParseUser = require('./ParseUser');

var _ParseUser2 = _interopRequireDefault(_ParseUser);

var ParseSession = (function (_ParseObject) {
  _inherits(ParseSession, _ParseObject);

  function ParseSession(attributes) {
    _classCallCheck(this, ParseSession);

    _get(Object.getPrototypeOf(ParseSession.prototype), 'constructor', this).call(this, '_Session');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }
  }

  /**
   * Returns the session token string.
   * @method getSessionToken
   * @return {String}
   */

  _createClass(ParseSession, [{
    key: 'getSessionToken',
    value: function getSessionToken() {
      return this.get('sessionToken');
    }
  }], [{
    key: 'readOnlyAttributes',
    value: function readOnlyAttributes() {
      return ['createdWith', 'expiresAt', 'installationId', 'restricted', 'sessionToken', 'user'];
    }

    /**
     * Retrieves the Session object for the currently logged in session.
     * @method current
     * @static
     * @return {Parse.Promise} A promise that is resolved with the Parse.Session
     *   object after it has been fetched. If there is no current user, the
     *   promise will be rejected.
     */
  }, {
    key: 'current',
    value: function current(options) {
      options = options || {};
      var controller = _CoreManager2['default'].getSessionController();

      var sessionOptions = {};
      if (options.hasOwnProperty('useMasterKey')) {
        sessionOptions.useMasterKey = options.useMasterKey;
      }
      return _ParseUser2['default'].currentAsync().then(function (user) {
        if (!user) {
          return _ParsePromise2['default'].error('There is no current user.');
        }
        var token = user.getSessionToken();
        sessionOptions.sessionToken = user.getSessionToken();
        return controller.getSession(sessionOptions);
      });
    }

    /**
     * Determines whether the current session token is revocable.
     * This method is useful for migrating Express.js or Node.js web apps to
     * use revocable sessions. If you are migrating an app that uses the Parse
     * SDK in the browser only, please use Parse.User.enableRevocableSession()
     * instead, so that sessions can be automatically upgraded.
     * @method isCurrentSessionRevocable
     * @static
     * @return {Boolean}
     */
  }, {
    key: 'isCurrentSessionRevocable',
    value: function isCurrentSessionRevocable() {
      var currentUser = _ParseUser2['default'].current();
      if (currentUser) {
        return (0, _isRevocableSession2['default'])(currentUser.getSessionToken() || '');
      }
      return false;
    }
  }]);

  return ParseSession;
})(_ParseObject3['default']);

exports['default'] = ParseSession;

_ParseObject3['default'].registerSubclass('_Session', ParseSession);

_CoreManager2['default'].setSessionController({
  getSession: function getSession(options) {
    var RESTController = _CoreManager2['default'].getRESTController();
    var session = new ParseSession();

    return RESTController.request('GET', 'sessions/me', {}, options).then(function (sessionData) {
      session._finishFetch(sessionData);
      session._setExisted(true);
      return session;
    });
  }
});
module.exports = exports['default'];