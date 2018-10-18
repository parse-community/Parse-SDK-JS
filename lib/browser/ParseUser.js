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

var _get2 = _interopRequireDefault(require("@babel/runtime/helpers/get"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _isRevocableSession = _interopRequireDefault(require("./isRevocableSession"));

var _ParseError = _interopRequireDefault(require("./ParseError"));

var _ParseObject2 = _interopRequireDefault(require("./ParseObject"));

var _ParseSession = _interopRequireDefault(require("./ParseSession"));

var _Storage = _interopRequireDefault(require("./Storage"));
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


var CURRENT_USER_KEY = 'currentUser';
var canUseCurrentUser = !_CoreManager.default.get('IS_NODE');
var currentUserCacheMatchesDisk = false;
var currentUserCache = null;
var authProviders = {};
/**
 * <p>A Parse.User object is a local representation of a user persisted to the
 * Parse cloud. This class is a subclass of a Parse.Object, and retains the
 * same functionality of a Parse.Object, but also extends it with various
 * user specific methods, like authentication, signing up, and validation of
 * uniqueness.</p>
 * @alias Parse.User
 * @extends Parse.Object
 */

var ParseUser =
/*#__PURE__*/
function (_ParseObject) {
  (0, _inherits2.default)(ParseUser, _ParseObject);
  /**
   * @param {Object} attributes The initial set of data to store in the user.
   */

  function ParseUser(attributes
  /*: ?AttributeMap*/
  ) {
    var _this;

    (0, _classCallCheck2.default)(this, ParseUser);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(ParseUser).call(this, '_User'));

    if (attributes && (0, _typeof2.default)(attributes) === 'object') {
      if (!_this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Parse User');
      }
    }

    return _this;
  }
  /**
   * Request a revocable session token to replace the older style of token.
    * @param {Object} options
   * @return {Promise} A promise that is resolved when the replacement
   *   token has been fetched.
   */


  (0, _createClass2.default)(ParseUser, [{
    key: "_upgradeToRevocableSession",
    value: function (options
    /*: RequestOptions*/
    )
    /*: Promise*/
    {
      options = options || {};
      var upgradeOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        upgradeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.upgradeToRevocableSession(this, upgradeOptions);
    }
    /**
     * Unlike in the Android/iOS SDKs, logInWith is unnecessary, since you can
     * call linkWith on the user (even if it doesn't exist yet on the server).
     */

  }, {
    key: "_linkWith",
    value: function (provider
    /*: any*/
    , options
    /*: { authData?: AuthData }*/
    )
    /*: Promise*/
    {
      var _this2 = this;

      var authType;

      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[provider];
      } else {
        authType = provider.getAuthType();
      }

      if (options && options.hasOwnProperty('authData')) {
        var authData = this.get('authData') || {};

        if ((0, _typeof2.default)(authData) !== 'object') {
          throw new Error('Invalid type: authData field should be an object');
        }

        authData[authType] = options.authData;

        var controller = _CoreManager.default.getUserController();

        return controller.linkWith(this, authData);
      } else {
        return new Promise(function (resolve, reject) {
          provider.authenticate({
            success: function (provider, result) {
              var opts = {};
              opts.authData = result;

              _this2._linkWith(provider, opts).then(function () {
                resolve(_this2);
              }, function (error) {
                reject(error);
              });
            },
            error: function (provider, _error) {
              reject(_error);
            }
          });
        });
      }
    }
    /**
     * Synchronizes auth data for a provider (e.g. puts the access token in the
     * right place to be used by the Facebook SDK).
      */

  }, {
    key: "_synchronizeAuthData",
    value: function (provider
    /*: string*/
    ) {
      if (!this.isCurrent() || !provider) {
        return;
      }

      var authType;

      if (typeof provider === 'string') {
        authType = provider;
        provider = authProviders[authType];
      } else {
        authType = provider.getAuthType();
      }

      var authData = this.get('authData');

      if (!provider || !authData || (0, _typeof2.default)(authData) !== 'object') {
        return;
      }

      var success = provider.restoreAuthentication(authData[authType]);

      if (!success) {
        this._unlinkFrom(provider);
      }
    }
    /**
     * Synchronizes authData for all providers.
      */

  }, {
    key: "_synchronizeAllAuthData",
    value: function () {
      var authData = this.get('authData');

      if ((0, _typeof2.default)(authData) !== 'object') {
        return;
      }

      for (var key in authData) {
        this._synchronizeAuthData(key);
      }
    }
    /**
     * Removes null values from authData (which exist temporarily for
     * unlinking)
      */

  }, {
    key: "_cleanupAuthData",
    value: function () {
      if (!this.isCurrent()) {
        return;
      }

      var authData = this.get('authData');

      if ((0, _typeof2.default)(authData) !== 'object') {
        return;
      }

      for (var key in authData) {
        if (!authData[key]) {
          delete authData[key];
        }
      }
    }
    /**
     * Unlinks a user from a service.
      */

  }, {
    key: "_unlinkFrom",
    value: function (provider
    /*: any*/
    ) {
      var _this3 = this;

      if (typeof provider === 'string') {
        provider = authProviders[provider];
      }

      return this._linkWith(provider, {
        authData: null
      }).then(function () {
        _this3._synchronizeAuthData(provider);

        return Promise.resolve(_this3);
      });
    }
    /**
     * Checks whether a user is linked to a service.
      */

  }, {
    key: "_isLinked",
    value: function (provider
    /*: any*/
    )
    /*: boolean*/
    {
      var authType;

      if (typeof provider === 'string') {
        authType = provider;
      } else {
        authType = provider.getAuthType();
      }

      var authData = this.get('authData') || {};

      if ((0, _typeof2.default)(authData) !== 'object') {
        return false;
      }

      return !!authData[authType];
    }
    /**
     * Deauthenticates all providers.
      */

  }, {
    key: "_logOutWithAll",
    value: function () {
      var authData = this.get('authData');

      if ((0, _typeof2.default)(authData) !== 'object') {
        return;
      }

      for (var key in authData) {
        this._logOutWith(key);
      }
    }
    /**
     * Deauthenticates a single provider (e.g. removing access tokens from the
     * Facebook SDK).
      */

  }, {
    key: "_logOutWith",
    value: function (provider
    /*: any*/
    ) {
      if (!this.isCurrent()) {
        return;
      }

      if (typeof provider === 'string') {
        provider = authProviders[provider];
      }

      if (provider && provider.deauthenticate) {
        provider.deauthenticate();
      }
    }
    /**
     * Class instance method used to maintain specific keys when a fetch occurs.
     * Used to ensure that the session token is not lost.
     */

  }, {
    key: "_preserveFieldsOnFetch",
    value: function ()
    /*: AttributeMap*/
    {
      return {
        sessionToken: this.get('sessionToken')
      };
    }
    /**
     * Returns true if <code>current</code> would return this user.
      * @return {Boolean}
     */

  }, {
    key: "isCurrent",
    value: function ()
    /*: boolean*/
    {
      var current = ParseUser.current();
      return !!current && current.id === this.id;
    }
    /**
     * Returns get("username").
      * @return {String}
     */

  }, {
    key: "getUsername",
    value: function ()
    /*: ?string*/
    {
      var username = this.get('username');

      if (username == null || typeof username === 'string') {
        return username;
      }

      return '';
    }
    /**
     * Calls set("username", username, options) and returns the result.
      * @param {String} username
     * @param {Object} options
     * @return {Boolean}
     */

  }, {
    key: "setUsername",
    value: function (username
    /*: string*/
    ) {
      // Strip anonymity, even we do not support anonymous user in js SDK, we may
      // encounter anonymous user created by android/iOS in cloud code.
      var authData = this.get('authData');

      if (authData && (0, _typeof2.default)(authData) === 'object' && authData.hasOwnProperty('anonymous')) {
        // We need to set anonymous to null instead of deleting it in order to remove it from Parse.
        authData.anonymous = null;
      }

      this.set('username', username);
    }
    /**
     * Calls set("password", password, options) and returns the result.
      * @param {String} password
     * @param {Object} options
     * @return {Boolean}
     */

  }, {
    key: "setPassword",
    value: function (password
    /*: string*/
    ) {
      this.set('password', password);
    }
    /**
     * Returns get("email").
      * @return {String}
     */

  }, {
    key: "getEmail",
    value: function ()
    /*: ?string*/
    {
      var email = this.get('email');

      if (email == null || typeof email === 'string') {
        return email;
      }

      return '';
    }
    /**
     * Calls set("email", email) and returns the result.
      * @param {String} email
     * @return {Boolean}
     */

  }, {
    key: "setEmail",
    value: function (email
    /*: string*/
    ) {
      return this.set('email', email);
    }
    /**
     * Returns the session token for this user, if the user has been logged in,
     * or if it is the result of a query with the master key. Otherwise, returns
     * undefined.
      * @return {String} the session token, or undefined
     */

  }, {
    key: "getSessionToken",
    value: function ()
    /*: ?string*/
    {
      var token = this.get('sessionToken');

      if (token == null || typeof token === 'string') {
        return token;
      }

      return '';
    }
    /**
     * Checks whether this user is the current user and has been authenticated.
      * @return (Boolean) whether this user is the current user and is logged in.
     */

  }, {
    key: "authenticated",
    value: function ()
    /*: boolean*/
    {
      var current = ParseUser.current();
      return !!this.get('sessionToken') && !!current && current.id === this.id;
    }
    /**
     * Signs up a new user. You should call this instead of save for
     * new Parse.Users. This will create a new Parse.User on the server, and
     * also persist the session on disk so that you can access the user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling signUp.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {Object} attrs Extra fields to set on the new user, or null.
     * @param {Object} options
     * @return {Promise} A promise that is fulfilled when the signup
     *     finishes.
     */

  }, {
    key: "signUp",
    value: function (attrs
    /*: AttributeMap*/
    , options
    /*: FullOptions*/
    )
    /*: Promise*/
    {
      options = options || {};
      var signupOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        signupOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('installationId')) {
        signupOptions.installationId = options.installationId;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.signUp(this, attrs, signupOptions);
    }
    /**
     * Logs in a Parse.User. On success, this saves the session to disk,
     * so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>A username and password must be set before calling logIn.</p>
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {Object} options
     * @return {Promise} A promise that is fulfilled with the user when
     *     the login is complete.
     */

  }, {
    key: "logIn",
    value: function (options
    /*: FullOptions*/
    )
    /*: Promise*/
    {
      options = options || {};
      var loginOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        loginOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('installationId')) {
        loginOptions.installationId = options.installationId;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.logIn(this, loginOptions);
    }
    /**
     * Requires email change for user. It save new email into field
     * <code>emailNew</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {string} email
     * @param {Object} options
     * @return {Promise} A promise that is fulfilled when
     *     the operation is complete.
     */

  }, {
    key: "requestEmailChange",
    value: function (email
    /*: string*/
    , options
    /*: FullOptions*/
    )
    /*: Promise*/
    {
      options = options || {};
      var requestOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        requestOptions.useMasterKey = options.useMasterKey;
      }

      if (options.hasOwnProperty('installationId')) {
        requestOptions.installationId = options.installationId;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.requestEmailChange(this, email, requestOptions);
    }
    /**
     * Wrap the default save behavior with functionality to save to local
     * storage if this is current user.
     */

  }, {
    key: "save",
    value: function ()
    /*: Promise*/
    {
      var _this4 = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (0, _get2.default)((0, _getPrototypeOf2.default)(ParseUser.prototype), "save", this).apply(this, args).then(function () {
        if (_this4.isCurrent()) {
          return _CoreManager.default.getUserController().updateUserOnDisk(_this4);
        }

        return _this4;
      });
    }
    /**
     * Wrap the default destroy behavior with functionality that logs out
     * the current user when it is destroyed
     */

  }, {
    key: "destroy",
    value: function ()
    /*: Promise*/
    {
      var _this5 = this;

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (0, _get2.default)((0, _getPrototypeOf2.default)(ParseUser.prototype), "destroy", this).apply(this, args).then(function () {
        if (_this5.isCurrent()) {
          return _CoreManager.default.getUserController().removeUserFromDisk();
        }

        return _this5;
      });
    }
    /**
     * Wrap the default fetch behavior with functionality to save to local
     * storage if this is current user.
     */

  }, {
    key: "fetch",
    value: function ()
    /*: Promise*/
    {
      var _this6 = this;

      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (0, _get2.default)((0, _getPrototypeOf2.default)(ParseUser.prototype), "fetch", this).apply(this, args).then(function () {
        if (_this6.isCurrent()) {
          return _CoreManager.default.getUserController().updateUserOnDisk(_this6);
        }

        return _this6;
      });
    }
    /**
     * Wrap the default fetchWithInclude behavior with functionality to save to local
     * storage if this is current user.
     */

  }, {
    key: "fetchWithInclude",
    value: function ()
    /*: Promise*/
    {
      var _this7 = this;

      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return (0, _get2.default)((0, _getPrototypeOf2.default)(ParseUser.prototype), "fetchWithInclude", this).apply(this, args).then(function () {
        if (_this7.isCurrent()) {
          return _CoreManager.default.getUserController().updateUserOnDisk(_this7);
        }

        return _this7;
      });
    }
  }], [{
    key: "readOnlyAttributes",
    value: function () {
      return ['sessionToken'];
    }
    /**
     * Adds functionality to the existing Parse.User class
      * @param {Object} protoProps A set of properties to add to the prototype
     * @param {Object} classProps A set of static properties to add to the class
     * @static
     * @return {Class} The newly extended Parse.User class
     */

  }, {
    key: "extend",
    value: function (protoProps
    /*: {[prop: string]: any}*/
    , classProps
    /*: {[prop: string]: any}*/
    ) {
      if (protoProps) {
        for (var prop in protoProps) {
          if (prop !== 'className') {
            Object.defineProperty(ParseUser.prototype, prop, {
              value: protoProps[prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      if (classProps) {
        for (var _prop in classProps) {
          if (_prop !== 'className') {
            Object.defineProperty(ParseUser, _prop, {
              value: classProps[_prop],
              enumerable: false,
              writable: true,
              configurable: true
            });
          }
        }
      }

      return ParseUser;
    }
    /**
     * Retrieves the currently logged in ParseUser with a valid session,
     * either from memory or localStorage, if necessary.
      * @static
     * @return {Parse.Object} The currently logged in Parse.User.
     */

  }, {
    key: "current",
    value: function ()
    /*: ?ParseUser*/
    {
      if (!canUseCurrentUser) {
        return null;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.currentUser();
    }
    /**
     * Retrieves the currently logged in ParseUser from asynchronous Storage.
      * @static
     * @return {Promise} A Promise that is resolved with the currently
     *   logged in Parse User
     */

  }, {
    key: "currentAsync",
    value: function ()
    /*: Promise*/
    {
      if (!canUseCurrentUser) {
        return Promise.resolve(null);
      }

      var controller = _CoreManager.default.getUserController();

      return controller.currentUserAsync();
    }
    /**
     * Signs up a new user with a username (or email) and password.
     * This will create a new Parse.User on the server, and also persist the
     * session in localStorage so that you can access the user using
     * {@link #current}.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {String} username The username (or email) to sign up with.
     * @param {String} password The password to sign up with.
     * @param {Object} attrs Extra fields to set on the new user.
     * @param {Object} options
     * @static
     * @return {Promise} A promise that is fulfilled with the user when
     *     the signup completes.
     */

  }, {
    key: "signUp",
    value: function (username, password, attrs, options) {
      attrs = attrs || {};
      attrs.username = username;
      attrs.password = password;
      var user = new ParseUser(attrs);
      return user.signUp({}, options);
    }
    /**
     * Logs in a user with a username (or email) and password. On success, this
     * saves the session to disk, so you can retrieve the currently logged in
     * user using <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {String} username The username (or email) to log in with.
     * @param {String} password The password to log in with.
     * @param {Object} options
     * @static
     * @return {Promise} A promise that is fulfilled with the user when
     *     the login completes.
     */

  }, {
    key: "logIn",
    value: function (username, password, options) {
      if (typeof username !== 'string') {
        return Promise.reject(new _ParseError.default(_ParseError.default.OTHER_CAUSE, 'Username must be a string.'));
      } else if (typeof password !== 'string') {
        return Promise.reject(new _ParseError.default(_ParseError.default.OTHER_CAUSE, 'Password must be a string.'));
      }

      var user = new ParseUser();

      user._finishFetch({
        username: username,
        password: password
      });

      return user.logIn(options);
    }
    /**
     * Logs in a user with a session token. On success, this saves the session
     * to disk, so you can retrieve the currently logged in user using
     * <code>current</code>.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {String} sessionToken The sessionToken to log in with.
     * @param {Object} options
     * @static
     * @return {Promise} A promise that is fulfilled with the user when
     *     the login completes.
     */

  }, {
    key: "become",
    value: function (sessionToken, options) {
      if (!canUseCurrentUser) {
        throw new Error('It is not memory-safe to become a user in a server environment');
      }

      options = options || {};
      var becomeOptions
      /*: RequestOptions*/
      = {
        sessionToken: sessionToken
      };

      if (options.hasOwnProperty('useMasterKey')) {
        becomeOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.become(becomeOptions);
    }
  }, {
    key: "logInWith",
    value: function (provider, options) {
      return ParseUser._logInWith(provider, options);
    }
    /**
     * Logs out the currently logged in user session. This will remove the
     * session from disk, log out of linked services, and future calls to
     * <code>current</code> will return <code>null</code>.
      * @static
     * @return {Promise} A promise that is resolved when the session is
     *   destroyed on the server.
     */

  }, {
    key: "logOut",
    value: function () {
      if (!canUseCurrentUser) {
        throw new Error('There is no current user on a node.js server environment.');
      }

      var controller = _CoreManager.default.getUserController();

      return controller.logOut();
    }
    /**
     * Requests a password reset email to be sent to the specified email address
     * associated with the user account. This email allows the user to securely
     * reset their password on the Parse site.
     *
     * <p>Calls options.success or options.error on completion.</p>
     *
      * @param {String} email The email address associated with the user that
     *     forgot their password.
     * @param {Object} options
     * @static
     * @returns {Promise}
     */

  }, {
    key: "requestPasswordReset",
    value: function (email, options) {
      options = options || {};
      var requestOptions = {};

      if (options.hasOwnProperty('useMasterKey')) {
        requestOptions.useMasterKey = options.useMasterKey;
      }

      var controller = _CoreManager.default.getUserController();

      return controller.requestPasswordReset(email, requestOptions);
    }
    /**
     * Allow someone to define a custom User class without className
     * being rewritten to _User. The default behavior is to rewrite
     * User to _User for legacy reasons. This allows developers to
     * override that behavior.
     *
      * @param {Boolean} isAllowed Whether or not to allow custom User class
     * @static
     */

  }, {
    key: "allowCustomUserClass",
    value: function (isAllowed
    /*: boolean*/
    ) {
      _CoreManager.default.set('PERFORM_USER_REWRITE', !isAllowed);
    }
    /**
     * Allows a legacy application to start using revocable sessions. If the
     * current session token is not revocable, a request will be made for a new,
     * revocable session.
     * It is not necessary to call this method from cloud code unless you are
     * handling user signup or login from the server side. In a cloud code call,
     * this function will not attempt to upgrade the current token.
      * @param {Object} options
     * @static
     * @return {Promise} A promise that is resolved when the process has
     *   completed. If a replacement session token is requested, the promise
     *   will be resolved after a new token has been fetched.
     */

  }, {
    key: "enableRevocableSession",
    value: function (options) {
      options = options || {};

      _CoreManager.default.set('FORCE_REVOCABLE_SESSION', true);

      if (canUseCurrentUser) {
        var current = ParseUser.current();

        if (current) {
          return current._upgradeToRevocableSession(options);
        }
      }

      return Promise.resolve();
    }
    /**
     * Enables the use of become or the current user in a server
     * environment. These features are disabled by default, since they depend on
     * global objects that are not memory-safe for most servers.
      * @static
     */

  }, {
    key: "enableUnsafeCurrentUser",
    value: function () {
      canUseCurrentUser = true;
    }
    /**
     * Disables the use of become or the current user in any environment.
     * These features are disabled on servers by default, since they depend on
     * global objects that are not memory-safe for most servers.
      * @static
     */

  }, {
    key: "disableUnsafeCurrentUser",
    value: function () {
      canUseCurrentUser = false;
    }
  }, {
    key: "_registerAuthenticationProvider",
    value: function (provider) {
      authProviders[provider.getAuthType()] = provider; // Synchronize the current user with the auth provider.

      ParseUser.currentAsync().then(function (current) {
        if (current) {
          current._synchronizeAuthData(provider.getAuthType());
        }
      });
    }
  }, {
    key: "_logInWith",
    value: function (provider, options) {
      var user = new ParseUser();
      return user._linkWith(provider, options);
    }
  }, {
    key: "_clearCache",
    value: function () {
      currentUserCache = null;
      currentUserCacheMatchesDisk = false;
    }
  }, {
    key: "_setCurrentUserCache",
    value: function (user) {
      currentUserCache = user;
    }
  }]);
  return ParseUser;
}(_ParseObject2.default);

_ParseObject2.default.registerSubclass('_User', ParseUser);

var DefaultController = {
  updateUserOnDisk: function (user) {
    var path = _Storage.default.generatePath(CURRENT_USER_KEY);

    var json = user.toJSON();
    json.className = '_User';
    return _Storage.default.setItemAsync(path, JSON.stringify(json)).then(function () {
      return user;
    });
  },
  removeUserFromDisk: function () {
    var path = _Storage.default.generatePath(CURRENT_USER_KEY);

    currentUserCacheMatchesDisk = true;
    currentUserCache = null;
    return _Storage.default.removeItemAsync(path);
  },
  setCurrentUser: function (user) {
    currentUserCache = user;

    user._cleanupAuthData();

    user._synchronizeAllAuthData();

    return DefaultController.updateUserOnDisk(user);
  },
  currentUser: function ()
  /*: ?ParseUser*/
  {
    if (currentUserCache) {
      return currentUserCache;
    }

    if (currentUserCacheMatchesDisk) {
      return null;
    }

    if (_Storage.default.async()) {
      throw new Error('Cannot call currentUser() when using a platform with an async ' + 'storage system. Call currentUserAsync() instead.');
    }

    var path = _Storage.default.generatePath(CURRENT_USER_KEY);

    var userData = _Storage.default.getItem(path);

    currentUserCacheMatchesDisk = true;

    if (!userData) {
      currentUserCache = null;
      return null;
    }

    userData = JSON.parse(userData);

    if (!userData.className) {
      userData.className = '_User';
    }

    if (userData._id) {
      if (userData.objectId !== userData._id) {
        userData.objectId = userData._id;
      }

      delete userData._id;
    }

    if (userData._sessionToken) {
      userData.sessionToken = userData._sessionToken;
      delete userData._sessionToken;
    }

    var current = _ParseObject2.default.fromJSON(userData);

    currentUserCache = current;

    current._synchronizeAllAuthData();

    return current;
  },
  currentUserAsync: function ()
  /*: Promise*/
  {
    if (currentUserCache) {
      return Promise.resolve(currentUserCache);
    }

    if (currentUserCacheMatchesDisk) {
      return Promise.resolve(null);
    }

    var path = _Storage.default.generatePath(CURRENT_USER_KEY);

    return _Storage.default.getItemAsync(path).then(function (userData) {
      currentUserCacheMatchesDisk = true;

      if (!userData) {
        currentUserCache = null;
        return Promise.resolve(null);
      }

      userData = JSON.parse(userData);

      if (!userData.className) {
        userData.className = '_User';
      }

      if (userData._id) {
        if (userData.objectId !== userData._id) {
          userData.objectId = userData._id;
        }

        delete userData._id;
      }

      if (userData._sessionToken) {
        userData.sessionToken = userData._sessionToken;
        delete userData._sessionToken;
      }

      var current = _ParseObject2.default.fromJSON(userData);

      currentUserCache = current;

      current._synchronizeAllAuthData();

      return Promise.resolve(current);
    });
  },
  signUp: function (user
  /*: ParseUser*/
  , attrs
  /*: AttributeMap*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    var username = attrs && attrs.username || user.get('username');
    var password = attrs && attrs.password || user.get('password');

    if (!username || !username.length) {
      return Promise.reject(new _ParseError.default(_ParseError.default.OTHER_CAUSE, 'Cannot sign up user with an empty name.'));
    }

    if (!password || !password.length) {
      return Promise.reject(new _ParseError.default(_ParseError.default.OTHER_CAUSE, 'Cannot sign up user with an empty password.'));
    }

    return user.save(attrs, options).then(function () {
      // Clear the password field
      user._finishFetch({
        password: undefined
      });

      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }

      return user;
    });
  },
  logIn: function (user
  /*: ParseUser*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    var RESTController = _CoreManager.default.getRESTController();

    var stateController = _CoreManager.default.getObjectStateController();

    var auth = {
      username: user.get('username'),
      password: user.get('password')
    };
    return RESTController.request('GET', 'login', auth, options).then(function (response) {
      user._migrateId(response.objectId);

      user._setExisted(true);

      stateController.setPendingOp(user._getStateIdentifier(), 'username', undefined);
      stateController.setPendingOp(user._getStateIdentifier(), 'password', undefined);
      response.password = undefined;

      user._finishFetch(response);

      if (!canUseCurrentUser) {
        // We can't set the current user, so just return the one we logged in
        return Promise.resolve(user);
      }

      return DefaultController.setCurrentUser(user);
    });
  },
  become: function (options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    var user = new ParseUser();

    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('GET', 'users/me', {}, options).then(function (response) {
      user._finishFetch(response);

      user._setExisted(true);

      return DefaultController.setCurrentUser(user);
    });
  },
  logOut: function ()
  /*: Promise*/
  {
    return DefaultController.currentUserAsync().then(function (currentUser) {
      var path = _Storage.default.generatePath(CURRENT_USER_KEY);

      var promise = _Storage.default.removeItemAsync(path);

      var RESTController = _CoreManager.default.getRESTController();

      if (currentUser !== null) {
        var currentSession = currentUser.getSessionToken();

        if (currentSession && (0, _isRevocableSession.default)(currentSession)) {
          promise = promise.then(function () {
            return RESTController.request('POST', 'logout', {}, {
              sessionToken: currentSession
            });
          });
        }

        currentUser._logOutWithAll();

        currentUser._finishFetch({
          sessionToken: undefined
        });
      }

      currentUserCacheMatchesDisk = true;
      currentUserCache = null;
      return promise;
    });
  },
  requestPasswordReset: function (email
  /*: string*/
  , options
  /*: RequestOptions*/
  ) {
    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('POST', 'requestPasswordReset', {
      email: email
    }, options);
  },
  upgradeToRevocableSession: function (user
  /*: ParseUser*/
  , options
  /*: RequestOptions*/
  ) {
    var token = user.getSessionToken();

    if (!token) {
      return Promise.reject(new _ParseError.default(_ParseError.default.SESSION_MISSING, 'Cannot upgrade a user with no session token'));
    }

    options.sessionToken = token;

    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('POST', 'upgradeToRevocableSession', {}, options).then(function (result) {
      var session = new _ParseSession.default();

      session._finishFetch(result);

      user._finishFetch({
        sessionToken: session.getSessionToken()
      });

      if (user.isCurrent()) {
        return DefaultController.setCurrentUser(user);
      }

      return Promise.resolve(user);
    });
  },
  linkWith: function (user
  /*: ParseUser*/
  , authData
  /*: AuthData*/
  ) {
    return user.save({
      authData: authData
    }).then(function () {
      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }

      return user;
    });
  },
  requestEmailChange: function (user
  /*: ParseUser*/
  , email
  /*: string*/
  , options
  /*: RequestOptions*/
  ) {
    var token = user.getSessionToken();

    if (!token) {
      return Promise.reject(new _ParseError.default(_ParseError.default.SESSION_MISSING, 'Cannot upgrade a user with no session token'));
    }

    options.sessionToken = token;

    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('POST', 'requestEmailChange', {
      email: email
    }, options);
  }
};

_CoreManager.default.setUserController(DefaultController);

var _default = ParseUser;
exports.default = _default;