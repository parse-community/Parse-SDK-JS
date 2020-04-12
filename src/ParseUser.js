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

import AnonymousUtils from './AnonymousUtils';
import CoreManager from './CoreManager';
import isRevocableSession from './isRevocableSession';
import ParseError from './ParseError';
import ParseObject from './ParseObject';
import ParseSession from './ParseSession';
import Storage from './Storage';

import type { AttributeMap } from './ObjectStateMutations';
import type { RequestOptions, FullOptions } from './RESTController';

export type AuthData = ?{ [key: string]: mixed };

const CURRENT_USER_KEY = 'currentUser';
let canUseCurrentUser = !CoreManager.get('IS_NODE');
let currentUserCacheMatchesDisk = false;
let currentUserCache = null;

const authProviders = {};

/**
 * <p>A Parse.User object is a local representation of a user persisted to the
 * Parse cloud. This class is a subclass of a Parse.Object, and retains the
 * same functionality of a Parse.Object, but also extends it with various
 * user specific methods, like authentication, signing up, and validation of
 * uniqueness.</p>
 * @alias Parse.User
 * @extends Parse.Object
 */
class ParseUser extends ParseObject {
  /**
   * @param {Object} attributes The initial set of data to store in the user.
   */
  constructor(attributes: ?AttributeMap) {
    super('_User');
    if (attributes && typeof attributes === 'object'){
      if (!this.set(attributes || {})) {
        throw new Error('Can\'t create an invalid Parse User');
      }
    }
  }

  /**
   * Request a revocable session token to replace the older style of token.

   * @param {Object} options
   * @return {Promise} A promise that is resolved when the replacement
   *   token has been fetched.
   */
  _upgradeToRevocableSession(options: RequestOptions): Promise<void> {
    options = options || {};

    const upgradeOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      upgradeOptions.useMasterKey = options.useMasterKey;
    }

    const controller = CoreManager.getUserController();
    return controller.upgradeToRevocableSession(
      this,
      upgradeOptions
    );
  }

  /**
   * Parse allows you to link your users with {@link https://docs.parseplatform.org/parse-server/guide/#oauth-and-3rd-party-authentication 3rd party authentication}, enabling
   * your users to sign up or log into your application using their existing identities.
   * Since 2.9.0
   *
   * @see {@link https://docs.parseplatform.org/js/guide/#linking-users Linking Users}
   * @param {String|AuthProvider} provider Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @param {Object} options
   * <ul>
   *   <li>If provider is string, options is {@link http://docs.parseplatform.org/parse-server/guide/#supported-3rd-party-authentications authData}
   *   <li>If provider is AuthProvider, options is saveOpts
   * </ul>
   * @param {Object} saveOpts useMasterKey / sessionToken
   * @return {Promise} A promise that is fulfilled with the user is linked
   */
  linkWith(provider: any, options: { authData?: AuthData }, saveOpts?: FullOptions = {}): Promise<ParseUser> {
    saveOpts.sessionToken = saveOpts.sessionToken || this.getSessionToken() || '';
    let authType;
    if (typeof provider === 'string') {
      authType = provider;
      if (authProviders[provider]) {
        provider = authProviders[provider];
      } else {
        const authProvider = {
          restoreAuthentication() {
            return true;
          },
          getAuthType() {
            return authType;
          },
        };
        authProviders[authType] = authProvider;
        provider = authProvider;
      }
    } else {
      authType = provider.getAuthType();
    }
    if (options && options.hasOwnProperty('authData')) {
      const authData = this.get('authData') || {};
      if (typeof authData !== 'object') {
        throw new Error('Invalid type: authData field should be an object');
      }
      authData[authType] = options.authData;

      const controller = CoreManager.getUserController();
      return controller.linkWith(
        this,
        authData,
        saveOpts
      );
    } else {
      return new Promise((resolve, reject) => {
        provider.authenticate({
          success: (provider, result) => {
            const opts = {};
            opts.authData = result;
            this.linkWith(provider, opts, saveOpts).then(() => {
              resolve(this);
            }, (error) => {
              reject(error);
            });
          },
          error: (provider, error) => {
            reject(error);
          }
        });
      });
    }
  }

  /**
   * @deprecated since 2.9.0 see {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith}
   */
  _linkWith(provider: any, options: { authData?: AuthData }, saveOpts?: FullOptions = {}): Promise<ParseUser> {
    return this.linkWith(provider, options, saveOpts);
  }

  /**
   * Synchronizes auth data for a provider (e.g. puts the access token in the
   * right place to be used by the Facebook SDK).
   */
  _synchronizeAuthData(provider: string) {
    if (!this.isCurrent() || !provider) {
      return;
    }
    let authType;
    if (typeof provider === 'string') {
      authType = provider;
      provider = authProviders[authType];
    } else {
      authType = provider.getAuthType();
    }
    const authData = this.get('authData');
    if (!provider || !authData || typeof authData !== 'object') {
      return;
    }
    const success = provider.restoreAuthentication(authData[authType]);
    if (!success) {
      this._unlinkFrom(provider);
    }
  }

  /**
   * Synchronizes authData for all providers.

   */
  _synchronizeAllAuthData() {
    const authData = this.get('authData');
    if (typeof authData !== 'object') {
      return;
    }

    for (const key in authData) {
      this._synchronizeAuthData(key);
    }
  }

  /**
   * Removes null values from authData (which exist temporarily for
   * unlinking)

   */
  _cleanupAuthData() {
    if (!this.isCurrent()) {
      return;
    }
    const authData = this.get('authData');
    if (typeof authData !== 'object') {
      return;
    }

    for (const key in authData) {
      if (!authData[key]) {
        delete authData[key];
      }
    }
  }

  /**
   * Unlinks a user from a service.
   *
   * @param {String|AuthProvider} provider Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @param {Object} options MasterKey / SessionToken
   * @return {Promise} A promise that is fulfilled when the unlinking
   *     finishes.
   */
  _unlinkFrom(provider: any, options?: FullOptions): Promise<ParseUser> {
    return this.linkWith(provider, { authData: null }, options).then(() => {
      this._synchronizeAuthData(provider);
      return Promise.resolve(this);
    });
  }

  /**
   * Checks whether a user is linked to a service.

   */
  _isLinked(provider: any): boolean {
    let authType;
    if (typeof provider === 'string') {
      authType = provider;
    } else {
      authType = provider.getAuthType();
    }
    const authData = this.get('authData') || {};
    if (typeof authData !== 'object') {
      return false;
    }
    return !!authData[authType];
  }

  /**
   * Deauthenticates all providers.

   */
  _logOutWithAll() {
    const authData = this.get('authData');
    if (typeof authData !== 'object') {
      return;
    }

    for (const key in authData) {
      this._logOutWith(key);
    }
  }

  /**
   * Deauthenticates a single provider (e.g. removing access tokens from the
   * Facebook SDK).

   */
  _logOutWith(provider: any) {
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
  _preserveFieldsOnFetch(): AttributeMap {
    return {
      sessionToken: this.get('sessionToken'),
    };
  }

  /**
   * Returns true if <code>current</code> would return this user.

   * @return {Boolean}
   */
  isCurrent(): boolean {
    const current = ParseUser.current();
    return !!current && current.id === this.id;
  }

  /**
   * Returns get("username").

   * @return {String}
   */
  getUsername(): ?string {
    const username = this.get('username');
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
  setUsername(username: string) {
    // Strip anonymity, even we do not support anonymous user in js SDK, we may
    // encounter anonymous user created by android/iOS in cloud code.
    const authData = this.get('authData');
    if (authData && typeof authData === 'object' && authData.hasOwnProperty('anonymous')) {
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
  setPassword(password: string) {
    this.set('password', password);
  }

  /**
   * Returns get("email").

   * @return {String}
   */
  getEmail(): ?string {
    const email = this.get('email');
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
  setEmail(email: string) {
    return this.set('email', email);
  }

  /**
   * Returns the session token for this user, if the user has been logged in,
   * or if it is the result of a query with the master key. Otherwise, returns
   * undefined.

   * @return {String} the session token, or undefined
   */
  getSessionToken(): ?string {
    const token = this.get('sessionToken');
    if (token == null || typeof token === 'string') {
      return token;
    }
    return '';
  }

  /**
   * Checks whether this user is the current user and has been authenticated.

   * @return (Boolean) whether this user is the current user and is logged in.
   */
  authenticated(): boolean {
    const current = ParseUser.current();
    return (
      !!this.get('sessionToken') &&
      !!current &&
      current.id === this.id
    );
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
  signUp(attrs: AttributeMap, options?: FullOptions): Promise<ParseUser> {
    options = options || {};

    const signupOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      signupOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('installationId')) {
      signupOptions.installationId = options.installationId;
    }

    const controller = CoreManager.getUserController();
    return controller.signUp(
      this,
      attrs,
      signupOptions
    );
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
  logIn(options?: FullOptions): Promise<ParseUser> {
    options = options || {};

    const loginOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      loginOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('installationId')) {
      loginOptions.installationId = options.installationId;
    }

    const controller = CoreManager.getUserController();
    return controller.logIn(this, loginOptions);
  }

  /**
   * Wrap the default save behavior with functionality to save to local
   * storage if this is current user.
   */
  save(...args: Array<any>): Promise<ParseUser> {
    return super.save.apply(this, args).then(() => {
      if (this.isCurrent()) {
        return CoreManager.getUserController().updateUserOnDisk(this);
      }
      return this;
    });
  }

  /**
   * Wrap the default destroy behavior with functionality that logs out
   * the current user when it is destroyed
   */
  destroy(...args: Array<any>): Promise<ParseUser> {
    return super.destroy.apply(this, args).then(() => {
      if (this.isCurrent()) {
        return CoreManager.getUserController().removeUserFromDisk();
      }
      return this;
    });
  }

  /**
   * Wrap the default fetch behavior with functionality to save to local
   * storage if this is current user.
   */
  fetch(...args: Array<any>): Promise<ParseUser> {
    return super.fetch.apply(this, args).then(() => {
      if (this.isCurrent()) {
        return CoreManager.getUserController().updateUserOnDisk(this);
      }
      return this;
    });
  }

  /**
   * Wrap the default fetchWithInclude behavior with functionality to save to local
   * storage if this is current user.
   */
  fetchWithInclude(...args: Array<any>): Promise<ParseUser> {
    return super.fetchWithInclude.apply(this, args).then(() => {
      if (this.isCurrent()) {
        return CoreManager.getUserController().updateUserOnDisk(this);
      }
      return this;
    });
  }

  /**
   * Verify whether a given password is the password of the current user.
   *
   * @param {String} password A password to be verified
   * @param {Object} options
   * @return {Promise} A promise that is fulfilled with a user
   *  when the password is correct.
   */
  verifyPassword(password: string, options?: RequestOptions): Promise<ParseUser> {
    const username = this.getUsername() || '';

    return ParseUser.verifyPassword(username, password, options);
  }

  static readOnlyAttributes() {
    return ['sessionToken'];
  }

  /**
   * Adds functionality to the existing Parse.User class

   * @param {Object} protoProps A set of properties to add to the prototype
   * @param {Object} classProps A set of static properties to add to the class
   * @static
   * @return {Class} The newly extended Parse.User class
   */
  static extend(protoProps: {[prop: string]: any}, classProps: {[prop: string]: any}) {
    if (protoProps) {
      for (const prop in protoProps) {
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
      for (const prop in classProps) {
        if (prop !== 'className') {
          Object.defineProperty(ParseUser, prop, {
            value: classProps[prop],
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
  static current(): ?ParseUser {
    if (!canUseCurrentUser) {
      return null;
    }
    const controller = CoreManager.getUserController();
    return controller.currentUser();
  }

  /**
   * Retrieves the currently logged in ParseUser from asynchronous Storage.

   * @static
   * @return {Promise} A Promise that is resolved with the currently
   *   logged in Parse User
   */
  static currentAsync(): Promise<?ParseUser> {
    if (!canUseCurrentUser) {
      return Promise.resolve(null);
    }
    const controller = CoreManager.getUserController();
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
  static signUp(username: string, password: string, attrs: AttributeMap, options?: FullOptions) {
    attrs = attrs || {};
    attrs.username = username;
    attrs.password = password;
    const user = new this(attrs);
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
  static logIn(username: string, password: string, options?: FullOptions) {
    if (typeof username !== 'string') {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Username must be a string.'
        )
      );
    } else if (typeof password !== 'string') {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Password must be a string.'
        )
      );
    }
    const user = new this();
    user._finishFetch({ username: username, password: password });
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
  static become(sessionToken: string, options?: RequestOptions) {
    if (!canUseCurrentUser) {
      throw new Error(
        'It is not memory-safe to become a user in a server environment'
      );
    }
    options = options || {};

    const becomeOptions: RequestOptions = {
      sessionToken: sessionToken
    };
    if (options.hasOwnProperty('useMasterKey')) {
      becomeOptions.useMasterKey = options.useMasterKey;
    }

    const controller = CoreManager.getUserController();
    const user = new this();
    return controller.become(user, becomeOptions);
  }

  /**
   * Retrieves a user with a session token.
   *
   * @param {String} sessionToken The sessionToken to get user with.
   * @param {Object} options
   * @static
   * @return {Promise} A promise that is fulfilled with the user is fetched.
   */
  static me(sessionToken: string, options?: RequestOptions = {}) {
    const controller = CoreManager.getUserController();
    const meOptions: RequestOptions = {
      sessionToken: sessionToken
    };
    if (options.useMasterKey) {
      meOptions.useMasterKey = options.useMasterKey;
    }
    const user = new this();
    return controller.me(user, meOptions);
  }

  /**
   * Logs in a user with a session token. On success, this saves the session
   * to disk, so you can retrieve the currently logged in user using
   * <code>current</code>. If there is no session token the user will not logged in.
   *
   * @param {Object} userJSON The JSON map of the User's data
   * @static
   * @return {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static hydrate(userJSON: AttributeMap) {
    const controller = CoreManager.getUserController();
    const user = new this();
    return controller.hydrate(user, userJSON);
  }

  /**
   * Static version of {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith}
   * @static
   */
  static logInWith(provider: any, options: { authData?: AuthData }, saveOpts?: FullOptions) {
    const user = new this();
    return user.linkWith(provider, options, saveOpts);
  }

  /**
   * Logs out the currently logged in user session. This will remove the
   * session from disk, log out of linked services, and future calls to
   * <code>current</code> will return <code>null</code>.
   *
   * @param {Object} options
   * @static
   * @return {Promise} A promise that is resolved when the session is
   *   destroyed on the server.
   */
  static logOut(options: RequestOptions = {}) {
    const controller = CoreManager.getUserController();
    return controller.logOut(options);
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
  static requestPasswordReset(email: string, options?: RequestOptions) {
    options = options || {};

    const requestOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      requestOptions.useMasterKey = options.useMasterKey;
    }

    const controller = CoreManager.getUserController();
    return controller.requestPasswordReset(
      email, requestOptions
    );
  }

  /**
   * Request an email verification.
   *
   * <p>Calls options.success or options.error on completion.</p>
   *
   * @param {String} email The email address associated with the user that
   *     forgot their password.
   * @param {Object} options
   * @static
   * @returns {Promise}
   */
  static requestEmailVerification(email: string, options?: RequestOptions) {
    options = options || {};

    const requestOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      requestOptions.useMasterKey = options.useMasterKey;
    }

    const controller = CoreManager.getUserController();
    return controller.requestEmailVerification(email, requestOptions);
  }

  /**
   * Verify whether a given password is the password of the current user.
   *
   * @param {String} username  A username to be used for identificaiton
   * @param {String} password A password to be verified
   * @param {Object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with a user
   *  when the password is correct.
   */
  static verifyPassword(username: string, password: string, options?: RequestOptions) {
    if (typeof username !== 'string') {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Username must be a string.'
        )
      );
    }

    if (typeof password !== 'string') {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Password must be a string.'
        )
      );
    }

    options = options || {};

    const verificationOption = {};
    if (options.hasOwnProperty('useMasterKey')) {
      verificationOption.useMasterKey = options.useMasterKey;
    }

    const controller = CoreManager.getUserController();
    return controller.verifyPassword(username, password, verificationOption);
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
  static allowCustomUserClass(isAllowed: boolean) {
    CoreManager.set('PERFORM_USER_REWRITE', !isAllowed);
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
  static enableRevocableSession(options?: RequestOptions) {
    options = options || {};
    CoreManager.set('FORCE_REVOCABLE_SESSION', true);
    if (canUseCurrentUser) {
      const current = ParseUser.current();
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
  static enableUnsafeCurrentUser() {
    canUseCurrentUser = true;
  }

  /**
   * Disables the use of become or the current user in any environment.
   * These features are disabled on servers by default, since they depend on
   * global objects that are not memory-safe for most servers.

   * @static
   */
  static disableUnsafeCurrentUser() {
    canUseCurrentUser = false;
  }

  /**
   * When registering users with {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith} a basic auth provider
   * is automatically created for you.
   *
   * For advanced authentication, you can register an Auth provider to
   * implement custom authentication, deauthentication.
   *
   * @see {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @see {@link https://docs.parseplatform.org/js/guide/#custom-authentication-module Custom Authentication Module}
   * @static
   */
  static _registerAuthenticationProvider(provider: any) {
    authProviders[provider.getAuthType()] = provider;
    // Synchronize the current user with the auth provider.
    ParseUser.currentAsync().then((current) => {
      if (current) {
        current._synchronizeAuthData(provider.getAuthType());
      }
    });
  }

  /**
   * @deprecated since 2.9.0 see {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#logInWith logInWith}
   * @static
   */
  static _logInWith(provider: any, options: { authData?: AuthData }, saveOpts?: FullOptions) {
    const user = new this();
    return user.linkWith(provider, options, saveOpts);
  }

  static _clearCache() {
    currentUserCache = null;
    currentUserCacheMatchesDisk = false;
  }

  static _setCurrentUserCache(user: ParseUser) {
    currentUserCache = user;
  }
}

ParseObject.registerSubclass('_User', ParseUser);

const DefaultController = {
  updateUserOnDisk(user) {
    const path = Storage.generatePath(CURRENT_USER_KEY);
    const json = user.toJSON();
    delete json.password;

    json.className = '_User';
    let userData = JSON.stringify(json);
    if (CoreManager.get('ENCRYPTED_USER')) {
      const crypto = CoreManager.getCryptoController();
      userData = crypto.encrypt(json, CoreManager.get('ENCRYPTED_KEY'))
    }
    return Storage.setItemAsync(
      path, userData
    ).then(() => {
      return user;
    });
  },

  removeUserFromDisk() {
    const path = Storage.generatePath(CURRENT_USER_KEY);
    currentUserCacheMatchesDisk = true;
    currentUserCache = null;
    return Storage.removeItemAsync(path);
  },

  async setCurrentUser(user) {
    const currentUser = await this.currentUserAsync();
    if (currentUser && !user.equals(currentUser) && AnonymousUtils.isLinked(currentUser)) {
      await currentUser.destroy({ sessionToken: currentUser.getSessionToken() })
    }
    currentUserCache = user;
    user._cleanupAuthData();
    user._synchronizeAllAuthData();
    return DefaultController.updateUserOnDisk(user);
  },

  currentUser(): ?ParseUser {
    if (currentUserCache) {
      return currentUserCache;
    }
    if (currentUserCacheMatchesDisk) {
      return null;
    }
    if (Storage.async()) {
      throw new Error(
        'Cannot call currentUser() when using a platform with an async ' +
        'storage system. Call currentUserAsync() instead.'
      );
    }
    const path = Storage.generatePath(CURRENT_USER_KEY);
    let userData = Storage.getItem(path);
    currentUserCacheMatchesDisk = true;
    if (!userData) {
      currentUserCache = null;
      return null;
    }
    if (CoreManager.get('ENCRYPTED_USER')) {
      const crypto = CoreManager.getCryptoController();
      userData = crypto.decrypt(userData, CoreManager.get('ENCRYPTED_KEY'));
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
    const current = ParseObject.fromJSON(userData);
    currentUserCache = current;
    current._synchronizeAllAuthData();
    return current;
  },

  currentUserAsync(): Promise<?ParseUser> {
    if (currentUserCache) {
      return Promise.resolve(currentUserCache)
    }
    if (currentUserCacheMatchesDisk) {
      return Promise.resolve(null);
    }
    const path = Storage.generatePath(CURRENT_USER_KEY);
    return Storage.getItemAsync(
      path
    ).then((userData) => {
      currentUserCacheMatchesDisk = true;
      if (!userData) {
        currentUserCache = null;
        return Promise.resolve(null);
      }
      if (CoreManager.get('ENCRYPTED_USER')) {
        const crypto = CoreManager.getCryptoController();
        userData = crypto.decrypt(userData.toString(), CoreManager.get('ENCRYPTED_KEY'));
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
      const current = ParseObject.fromJSON(userData);
      currentUserCache = current;
      current._synchronizeAllAuthData();
      return Promise.resolve(current);
    });
  },

  signUp(user: ParseUser, attrs: AttributeMap, options: RequestOptions): Promise<ParseUser> {
    const username = (attrs && attrs.username) || user.get('username');
    const password = (attrs && attrs.password) || user.get('password');

    if (!username || !username.length) {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Cannot sign up user with an empty username.'
        )
      );
    }
    if (!password || !password.length) {
      return Promise.reject(
        new ParseError(
          ParseError.OTHER_CAUSE,
          'Cannot sign up user with an empty password.'
        )
      );
    }

    return user.save(attrs, options).then(() => {
      // Clear the password field
      user._finishFetch({ password: undefined });

      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  },

  logIn(user: ParseUser, options: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    const stateController = CoreManager.getObjectStateController();
    const auth = {
      username: user.get('username'),
      password: user.get('password')
    };
    return RESTController.request(
      'GET', 'login', auth, options
    ).then((response) => {
      user._migrateId(response.objectId);
      user._setExisted(true);
      stateController.setPendingOp(
        user._getStateIdentifier(), 'username', undefined
      );
      stateController.setPendingOp(
        user._getStateIdentifier(), 'password', undefined
      );
      response.password = undefined;
      user._finishFetch(response);
      if (!canUseCurrentUser) {
        // We can't set the current user, so just return the one we logged in
        return Promise.resolve(user);
      }
      return DefaultController.setCurrentUser(user);
    });
  },

  become(user: ParseUser, options: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'GET', 'users/me', {}, options
    ).then((response) => {
      user._finishFetch(response);
      user._setExisted(true);
      return DefaultController.setCurrentUser(user);
    });
  },

  hydrate(user: ParseUser, userJSON: AttributeMap): Promise<ParseUser> {
    user._finishFetch(userJSON);
    user._setExisted(true);
    if (userJSON.sessionToken && canUseCurrentUser) {
      return DefaultController.setCurrentUser(user);
    } else {
      return Promise.resolve(user);
    }
  },

  me(user: ParseUser, options: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'GET', 'users/me', {}, options
    ).then((response) => {
      user._finishFetch(response);
      user._setExisted(true);
      return user;
    });
  },

  logOut(options: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    if (options.sessionToken) {
      return RESTController.request(
        'POST', 'logout', {}, options
      );
    }
    return DefaultController.currentUserAsync().then((currentUser) => {
      const path = Storage.generatePath(CURRENT_USER_KEY);
      let promise = Storage.removeItemAsync(path);
      if (currentUser !== null) {
        const isAnonymous = AnonymousUtils.isLinked(currentUser);
        const currentSession = currentUser.getSessionToken();
        if (currentSession && isRevocableSession(currentSession)) {
          promise = promise.then(() => {
            if (isAnonymous) {
              return currentUser.destroy({ sessionToken: currentSession });
            }
          }).then(() => {
            return RESTController.request(
              'POST', 'logout', {}, { sessionToken: currentSession }
            );
          });
        }
        currentUser._logOutWithAll();
        currentUser._finishFetch({ sessionToken: undefined });
      }
      currentUserCacheMatchesDisk = true;
      currentUserCache = null;

      return promise;
    });
  },

  requestPasswordReset(email: string, options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'POST',
      'requestPasswordReset',
      { email: email },
      options
    );
  },

  upgradeToRevocableSession(user: ParseUser, options: RequestOptions) {
    const token = user.getSessionToken();
    if (!token) {
      return Promise.reject(
        new ParseError(
          ParseError.SESSION_MISSING,
          'Cannot upgrade a user with no session token'
        )
      );
    }

    options.sessionToken = token;

    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'POST',
      'upgradeToRevocableSession',
      {},
      options
    ).then((result) => {
      const session = new ParseSession();
      session._finishFetch(result);
      user._finishFetch({ sessionToken: session.getSessionToken() });
      if (user.isCurrent()) {
        return DefaultController.setCurrentUser(user);
      }
      return Promise.resolve(user);
    });
  },

  linkWith(user: ParseUser, authData: AuthData, options: FullOptions) {
    return user.save({ authData }, options).then(() => {
      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  },

  verifyPassword(username: string, password: string, options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'GET',
      'verifyPassword',
      { username, password },
      options
    );
  },

  requestEmailVerification(email: string, options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(
      'POST',
      'verificationEmailRequest',
      { email: email },
      options
    );
  }
};

CoreManager.setUserController(DefaultController);

export default ParseUser;
