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

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _isRevocableSession = _interopRequireDefault(require("./isRevocableSession"));

var _ParseObject2 = _interopRequireDefault(require("./ParseObject"));

var _ParseUser = _interopRequireDefault(require("./ParseUser"));
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

/**
 * <p>A Parse.Session object is a local representation of a revocable session.
 * This class is a subclass of a Parse.Object, and retains the same
 * functionality of a Parse.Object.</p>
 * @alias Parse.Session
 * @extends Parse.Object
 */


var ParseSession =
/*#__PURE__*/
function (_ParseObject) {
  (0, _inherits2.default)(ParseSession, _ParseObject);
  /**
   *
   * @param {Object} attributes The initial set of data to store in the user.
   */

  function ParseSession(attributes
  /*: ?AttributeMap*/
  ) {
    var _this;

    (0, _classCallCheck2.default)(this, ParseSession);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ParseSession).call(this, '_Session'));

    if (attributes && (0, _typeof2.default)(attributes) === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Session');
      }
    }

    return _this;
  }
  /**
   * Returns the session token string.
    * @return {String}
   */


  (0, _createClass2.default)(ParseSession, [{
    key: "getSessionToken",
    value: function ()
    /*: string*/
    {
      var token = this.get('sessionToken');

      if (typeof token === 'string') {
        return token;
      }

      return '';
    }
  }], [{
    key: "readOnlyAttributes",
    value: function () {
      return ['createdWith', 'expiresAt', 'installationId', 'restricted', 'sessionToken', 'user'];
    }
    /**
     * Retrieves the Session object for the currently logged in session.
      * @static
     * @return {Promise} A promise that is resolved with the Parse.Session
     *   object after it has been fetched. If there is no current user, the
     *   promise will be rejected.
     */

  }, {
    key: "current",
    value: function (options
    /*: FullOptions*/
    ) {
      options = options || {};

      var controller = _CoreManager.default.getSessionController();

      var sessionOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        sessionOptions.useMasterKey = options.useMasterKey;
      }

      return _ParseUser.default.currentAsync().then(function (user) {
        if (!user) {
          return Promise.reject('There is no current user.');
        }

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
      * @static
     * @return {Boolean}
     */

  }, {
    key: "isCurrentSessionRevocable",
    value: function ()
    /*: boolean*/
    {
      var currentUser = _ParseUser.default.current();

      if (currentUser) {
        return (0, _isRevocableSession.default)(currentUser.getSessionToken() || '');
      }

      return false;
    }
  }]);
  return ParseSession;
}(_ParseObject2.default);

_ParseObject2.default.registerSubclass('_Session', ParseSession);

var DefaultController = {
  getSession: function (options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    var RESTController = _CoreManager.default.getRESTController();

    var session = new ParseSession();
    return RESTController.request('GET', 'sessions/me', {}, options).then(function (sessionData) {
      session._finishFetch(sessionData);

      session._setExisted(true);

      return session;
    });
  }
};

_CoreManager.default.setSessionController(DefaultController);

var _default = ParseSession;
exports.default = _default;