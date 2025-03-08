import CoreManager from './CoreManager';
import isRevocableSession from './isRevocableSession';
import ParseError from './ParseError';
import ParseObject, { Attributes } from './ParseObject';
import Storage from './Storage';

import type { AttributeKey } from './ParseObject';
import type { RequestOptions, FullOptions } from './RESTController';

export type AuthData = { [key: string]: any };
export type AuthProvider = {
  authenticate?(options: {
    error?: (provider: AuthProvider, error: string | any) => void;
    success?: (provider: AuthProvider, result: AuthData) => void;
  }): void;
  restoreAuthentication(authData: any): boolean;
  getAuthType(): string;
  deauthenticate?(): void;
};
const CURRENT_USER_KEY = 'currentUser';
let canUseCurrentUser = !CoreManager.get('IS_NODE');
let currentUserCacheMatchesDisk = false;
let currentUserCache: ParseUser | null = null;

const authProviders: { [key: string]: AuthProvider } = {};

/**
 * <p>A Parse.User object is a local representation of a user persisted to the
 * Parse cloud. This class is a subclass of a Parse.Object, and retains the
 * same functionality of a Parse.Object, but also extends it with various
 * user specific methods, like authentication, signing up, and validation of
 * uniqueness.</p>
 *
 * @alias Parse.User
 * @augments Parse.Object
 */
class ParseUser<T extends Attributes = Attributes> extends ParseObject<T> {
  /**
   * @param {object} attributes The initial set of data to store in the user.
   */
  constructor(attributes?: T) {
    super('_User');
    if (attributes && typeof attributes === 'object') {
      try {
        this.set((attributes || {}) as any);
      } catch (_) {
        throw new Error("Can't create an invalid Parse User");
      }
    }
  }

  /**
   * Request a revocable session token to replace the older style of token.
   *
   * @param {object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   * </ul>
   * @returns {Promise} A promise that is resolved when the replacement
   *   token has been fetched.
   */
  _upgradeToRevocableSession(options?: RequestOptions): Promise<void> {
    const upgradeOptions = ParseObject._getRequestOptions(options);
    const controller = CoreManager.getUserController();
    return controller.upgradeToRevocableSession(this, upgradeOptions);
  }

  /**
   * Parse allows you to link your users with {@link https://docs.parseplatform.org/parse-server/guide/#oauth-and-3rd-party-authentication 3rd party authentication}, enabling
   * your users to sign up or log into your application using their existing identities.
   * Since 2.9.0
   *
   * @see {@link https://docs.parseplatform.org/js/guide/#linking-users Linking Users}
   * @param {string | AuthProvider} provider Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @param {object} options
   * @param {object} [options.authData] AuthData to link with
   * <ul>
   *   <li>If provider is string, options is {@link http://docs.parseplatform.org/parse-server/guide/#supported-3rd-party-authentications authData}
   *   <li>If provider is AuthProvider, options is saveOpts
   * </ul>
   * @param {object} saveOpts useMasterKey / sessionToken
   * @returns {Promise} A promise that is fulfilled with the user is linked
   */
  linkWith(
    provider: string | AuthProvider,
    options: { authData?: AuthData },
    saveOpts: FullOptions = {}
  ): Promise<ParseUser> {
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
        authProviders[authProvider.getAuthType()] = authProvider;
        provider = authProvider;
      }
    } else {
      authType = provider.getAuthType();
    }
    if (options && Object.hasOwn(options, 'authData')) {
      const authData = this.get('authData' as AttributeKey<T>) || {};
      if (typeof authData !== 'object') {
        throw new Error('Invalid type: authData field should be an object');
      }
      authData[authType] = options.authData;
      const oldAnonymousData = (authData as any).anonymous;
      this.stripAnonymity();

      const controller = CoreManager.getUserController();
      return controller.linkWith(this, authData, saveOpts).catch(e => {
        delete authData[authType];
        this.restoreAnonimity(oldAnonymousData);
        throw e;
      });
    } else {
      return new Promise((resolve, reject) => {
        provider.authenticate({
          success: (provider, result) => {
            const opts: { authData?: AuthData } = {};
            opts.authData = result;
            this.linkWith(provider, opts, saveOpts).then(
              () => {
                resolve(this);
              },
              error => {
                reject(error);
              }
            );
          },
          error: (_provider, error) => {
            reject(error);
          },
        });
      });
    }
  }

  /**
   * @param provider
   * @param options
   * @param {object} [options.authData]
   * @param saveOpts
   * @deprecated since 2.9.0 see {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith}
   * @returns {Promise}
   */
  _linkWith(
    provider: any,
    options: { authData?: AuthData },
    saveOpts: FullOptions = {}
  ): Promise<ParseUser> {
    return this.linkWith(provider, options, saveOpts);
  }

  /**
   * Synchronizes auth data for a provider (e.g. puts the access token in the
   * right place to be used by the Facebook SDK).
   *
   * @param provider
   */
  _synchronizeAuthData(provider: string | AuthProvider) {
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
    const authData = this.get('authData' as AttributeKey<T>);
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
    const authData = this.get('authData' as AttributeKey<T>);
    if (typeof authData !== 'object') {
      return;
    }

    for (const key in authData) {
      this._synchronizeAuthData(key);
    }
  }

  /**
   * Removes null values from authData (which exist temporarily for unlinking)
   */
  _cleanupAuthData() {
    if (!this.isCurrent()) {
      return;
    }
    const authData = this.get('authData' as AttributeKey<T>);
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
   * @param {string | AuthProvider} provider Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @param {object} options MasterKey / SessionToken
   * @returns {Promise} A promise that is fulfilled when the unlinking
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
   *
   * @param {object} provider service to link to
   * @returns {boolean} true if link was successful
   */
  _isLinked(provider: any): boolean {
    let authType;
    if (typeof provider === 'string') {
      authType = provider;
    } else {
      authType = provider.getAuthType();
    }
    const authData = this.get('authData' as AttributeKey<T>) || {};
    if (typeof authData !== 'object') {
      return false;
    }
    return !!authData[authType];
  }

  /**
   * Deauthenticates all providers.
   */
  _logOutWithAll() {
    const authData = this.get('authData' as AttributeKey<T>);
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
   *
   * @param {object} provider service to logout of
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
   *
   * @returns {object} sessionToken
   */
  _preserveFieldsOnFetch(): Attributes {
    return {
      sessionToken: this.get('sessionToken' as AttributeKey<T>),
    };
  }

  /**
   * Returns true if <code>current</code> would return this user.
   *
   * @returns {boolean} true if user is cached on disk
   */
  isCurrent(): boolean {
    const current = ParseUser.current();
    return !!current && current.id === this.id;
  }

  /**
   * Returns true if <code>current</code> would return this user.
   *
   * @returns {Promise<boolean>} true if user is cached on disk
   */
  async isCurrentAsync(): Promise<boolean> {
    const current = await ParseUser.currentAsync();
    return !!current && current.id === this.id;
  }

  stripAnonymity() {
    const authData = this.get('authData' as AttributeKey<T>);
    if (authData && typeof authData === 'object' && Object.hasOwn(authData, 'anonymous')) {
      // We need to set anonymous to null instead of deleting it in order to remove it from Parse.
      authData.anonymous = null;
    }
  }

  restoreAnonimity(anonymousData: any) {
    if (anonymousData) {
      const authData = this.get('authData' as AttributeKey<T>);
      authData.anonymous = anonymousData;
    }
  }

  /**
   * Returns get("username").
   *
   * @returns {string}
   */
  getUsername(): string | null {
    const username = this.get('username' as AttributeKey<T>);
    if (username == null || typeof username === 'string') {
      return username;
    }
    return '';
  }

  /**
   * Calls set("username", username, options) and returns the result.
   *
   * @param {string} username
   */
  setUsername(username: string) {
    this.stripAnonymity();
    this.set('username' as AttributeKey<T>, username as any);
  }

  /**
   * Calls set("password", password, options) and returns the result.
   *
   * @param {string} password User's Password
   */
  setPassword(password: string) {
    this.set('password' as AttributeKey<T>, password as any);
  }

  /**
   * Returns get("email").
   *
   * @returns {string} User's Email
   */
  getEmail(): string | null {
    const email = this.get('email' as AttributeKey<T>);
    if (email == null || typeof email === 'string') {
      return email;
    }
    return '';
  }

  /**
   * Calls set("email", email) and returns the result.
   *
   * @param {string} email
   * @returns {boolean}
   */
  setEmail(email: string) {
    return this.set('email' as AttributeKey<T>, email as any);
  }

  /**
   * Returns the session token for this user, if the user has been logged in,
   * or if it is the result of a query with the master key. Otherwise, returns
   * undefined.
   *
   * @returns {string} the session token, or undefined
   */
  getSessionToken(): string | null {
    const token = this.get('sessionToken' as AttributeKey<T>);
    if (token == null || typeof token === 'string') {
      return token;
    }
    return '';
  }

  /**
   * Checks whether this user is the current user and has been authenticated.
   *
   * @returns {boolean} whether this user is the current user and is logged in.
   */
  authenticated(): boolean {
    const current = ParseUser.current();
    return !!this.get('sessionToken' as AttributeKey<T>) && !!current && current.id === this.id;
  }

  /**
   * Signs up a new user. You should call this instead of save for
   * new Parse.Users. This will create a new Parse.User on the server, and
   * also persist the session on disk so that you can access the user using
   * <code>current</code>.
   *
   * <p>A username and password must be set before calling signUp.</p>
   *
   * @param {object} attrs Extra fields to set on the new user, or null.
   * @param {object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>installationId: the installationId which made the request
   *   <li>context: A dictionary that is accessible in Cloud Code `beforeLogin` and `afterLogin` triggers.
   * </ul>
   * @returns {Promise} A promise that is fulfilled when the signup
   *     finishes.
   */
  signUp(
    attrs?: Attributes | null,
    options?: FullOptions & { context?: Attributes }
  ): Promise<ParseUser> {
    const signupOptions = ParseObject._getRequestOptions(options);
    const controller = CoreManager.getUserController();
    return controller.signUp(this, attrs, signupOptions);
  }

  /**
   * Logs in a Parse.User. On success, this saves the session to disk,
   * so you can retrieve the currently logged in user using
   * <code>current</code>.
   *
   * <p>A username and password must be set before calling logIn.</p>
   *
   * @param {object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>usePost: Use POST method to make the request (default: true)
   *   <li>installationId: the installationId which made the request
   *   <li>context: A dictionary that is accessible in Cloud Code `beforeLogin` and `afterLogin` triggers.
   * </ul>
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login is complete.
   */
  logIn(options: FullOptions & { context?: Attributes } = {}): Promise<ParseUser> {
    const loginOptions = ParseObject._getRequestOptions(options);
    if (!Object.hasOwn(loginOptions, 'usePost')) {
      loginOptions.usePost = true;
    }
    const controller = CoreManager.getUserController();
    return controller.logIn(this, loginOptions);
  }

  /**
   * Wrap the default save behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Promise}
   */
  async save(...args: Array<any>): Promise<this> {
    await super.save.apply(this, args);
    const current = await this.isCurrentAsync();
    if (current) {
      return CoreManager.getUserController().updateUserOnDisk(this) as Promise<this>;
    }
    return this;
  }

  /**
   * Wrap the default destroy behavior with functionality that logs out
   * the current user when it is destroyed
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  async destroy(...args: Array<any>): Promise<ParseUser | void> {
    await super.destroy.apply(this, args);
    const current = await this.isCurrentAsync();
    if (current) {
      return CoreManager.getUserController().removeUserFromDisk();
    }
    return this;
  }

  /**
   * Wrap the default fetch behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  async fetch(...args: Array<any>): Promise<this> {
    await super.fetch.apply(this, args);
    const current = await this.isCurrentAsync();
    if (current) {
      return CoreManager.getUserController().updateUserOnDisk(this) as Promise<this>;
    }
    return this;
  }

  /**
   * Wrap the default fetchWithInclude behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  async fetchWithInclude(...args: Array<any>): Promise<this> {
    await super.fetchWithInclude.apply(this, args);
    const current = await this.isCurrentAsync();
    if (current) {
      return CoreManager.getUserController().updateUserOnDisk(this) as Promise<this>;
    }
    return this;
  }

  /**
   * Verify whether a given password is the password of the current user.
   *
   * @param {string} password The password to be verified.
   * @param {object} options The options.
   * @param {boolean} [options.ignoreEmailVerification] Set to `true` to bypass email verification and verify
   * the password regardless of whether the email has been verified. This requires the master key.
   * @returns {Promise} A promise that is fulfilled with a user when the password is correct.
   */
  verifyPassword(password: string, options?: RequestOptions): Promise<ParseUser> {
    const username = this.getUsername() || '';

    return ParseUser.verifyPassword(username, password, options);
  }

  static readOnlyAttributes() {
    return ['sessionToken'];
  }

  /**
   * Adds functionality to the existing Parse.User class.
   *
   * @param {object} protoProps A set of properties to add to the prototype
   * @param {object} classProps A set of static properties to add to the class
   * @static
   * @returns {Parse.User} The newly extended Parse.User class
   */
  static extend(protoProps: { [prop: string]: any }, classProps: { [prop: string]: any }) {
    if (protoProps) {
      for (const prop in protoProps) {
        if (prop !== 'className') {
          Object.defineProperty(ParseUser.prototype, prop, {
            value: protoProps[prop],
            enumerable: false,
            writable: true,
            configurable: true,
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
            configurable: true,
          });
        }
      }
    }

    return ParseUser;
  }

  /**
   * Retrieves the currently logged in ParseUser with a valid session,
   * either from memory or localStorage, if necessary.
   *
   * @static
   * @returns {Parse.User} The currently logged in Parse.User.
   */
  static current<T extends ParseUser>(): T | null {
    if (!canUseCurrentUser) {
      return null;
    }
    const controller = CoreManager.getUserController();
    return controller.currentUser() as T;
  }

  /**
   * Retrieves the currently logged in ParseUser from asynchronous Storage.
   *
   * @static
   * @returns {Promise} A Promise that is resolved with the currently
   *   logged in Parse User
   */
  static currentAsync<T extends ParseUser>(): Promise<T | null> {
    if (!canUseCurrentUser) {
      return Promise.resolve(null);
    }
    const controller = CoreManager.getUserController();
    return controller.currentUserAsync() as Promise<T>;
  }

  /**
   * Signs up a new user with a username (or email) and password.
   * This will create a new Parse.User on the server, and also persist the
   * session in localStorage so that you can access the user using
   * {@link #current}.
   *
   * @param {string} username The username (or email) to sign up with.
   * @param {string} password The password to sign up with.
   * @param {object} attrs Extra fields to set on the new user.
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the signup completes.
   */
  static signUp<T extends ParseUser>(
    username: string,
    password: string,
    attrs: Attributes,
    options?: FullOptions
  ): Promise<T> {
    attrs = attrs || {};
    attrs.username = username;
    attrs.password = password;
    const user = new this(attrs);
    return user.signUp({}, options) as Promise<T>;
  }

  /**
   * Logs in a user with a username (or email) and password. On success, this
   * saves the session to disk, so you can retrieve the currently logged in
   * user using <code>current</code>.
   *
   * @param {string} username The username (or email) to log in with.
   * @param {string} password The password to log in with.
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static logIn<T extends ParseUser>(
    username: string,
    password: string,
    options?: FullOptions
  ): Promise<T> {
    if (typeof username !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Username must be a string.'));
    } else if (typeof password !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Password must be a string.'));
    }
    const user = new this();
    user._finishFetch({ username, password });
    return user.logIn(options) as Promise<T>;
  }

  /**
   * Logs in a user with a username (or email) and password, and authData. On success, this
   * saves the session to disk, so you can retrieve the currently logged in
   * user using <code>current</code>.
   *
   * @param {string} username The username (or email) to log in with.
   * @param {string} password The password to log in with.
   * @param {object} authData The authData to log in with.
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static logInWithAdditionalAuth<T extends ParseUser>(
    username: string,
    password: string,
    authData: AuthData,
    options?: FullOptions
  ): Promise<T> {
    if (typeof username !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Username must be a string.'));
    }
    if (typeof password !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Password must be a string.'));
    }
    if (Object.prototype.toString.call(authData) !== '[object Object]') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Auth must be an object.'));
    }
    const user = new this();
    user._finishFetch({ username, password, authData });
    return user.logIn(options) as Promise<T>;
  }

  /**
   * Logs in a user with an objectId. On success, this saves the session
   * to disk, so you can retrieve the currently logged in user using
   * <code>current</code>.
   *
   * @param {string} userId The objectId for the user.
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static loginAs<T extends ParseUser>(userId: string): Promise<T> {
    if (!userId) {
      throw new ParseError(
        ParseError.USERNAME_MISSING,
        'Cannot log in as user with an empty user id'
      );
    }
    const controller = CoreManager.getUserController();
    const user = new this();
    return controller.loginAs(user, userId) as Promise<T>;
  }

  /**
   * Logs in a user with a session token. On success, this saves the session
   * to disk, so you can retrieve the currently logged in user using
   * <code>current</code>.
   *
   * @param {string} sessionToken The sessionToken to log in with.
   * @param {object} options
   * @param {boolean} [options.useMasterKey]
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static become<T extends ParseUser>(sessionToken: string, options?: RequestOptions): Promise<T> {
    if (!canUseCurrentUser) {
      throw new Error('It is not memory-safe to become a user in a server environment');
    }
    const becomeOptions = ParseObject._getRequestOptions(options);
    becomeOptions.sessionToken = sessionToken;
    const controller = CoreManager.getUserController();
    const user = new this();
    return controller.become(user, becomeOptions) as Promise<T>;
  }

  /**
   * Retrieves a user with a session token.
   *
   * @param {string} sessionToken The sessionToken to get user with.
   * @param {object} options
   * @param {boolean} [options.useMasterKey]
   * @static
   * @returns {Promise} A promise that is fulfilled with the user is fetched.
   */
  static me<T extends ParseUser>(sessionToken: string, options?: RequestOptions): Promise<T> {
    const controller = CoreManager.getUserController();
    const meOptions = ParseObject._getRequestOptions(options);
    meOptions.sessionToken = sessionToken;
    const user = new this();
    return controller.me(user, meOptions) as Promise<T>;
  }

  /**
   * Logs in a user with a session token. On success, this saves the session
   * to disk, so you can retrieve the currently logged in user using
   * <code>current</code>. If there is no session token the user will not logged in.
   *
   * @param {object} userJSON The JSON map of the User's data
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static hydrate<T extends ParseUser>(userJSON: Attributes): Promise<T> {
    const controller = CoreManager.getUserController();
    const user = new this();
    return controller.hydrate(user, userJSON) as Promise<T>;
  }

  /**
   * Static version of {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#linkWith linkWith}
   *
   * @param provider
   * @param options
   * @param {object} [options.authData]
   * @param saveOpts
   * @static
   * @returns {Promise}
   */
  static logInWith<T extends ParseUser>(
    provider: string | AuthProvider,
    options: { authData?: AuthData },
    saveOpts?: FullOptions
  ): Promise<T> {
    const user = new this();
    return user.linkWith(provider, options, saveOpts) as Promise<T>;
  }

  /**
   * Logs out the currently logged in user session. This will remove the
   * session from disk, log out of linked services, and future calls to
   * <code>current</code> will return <code>null</code>.
   *
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is resolved when the session is
   *   destroyed on the server.
   */
  static logOut(options?: RequestOptions): Promise<void> {
    const controller = CoreManager.getUserController();
    return controller.logOut(options);
  }

  /**
   * Requests a password reset email to be sent to the specified email address
   * associated with the user account. This email allows the user to securely
   * reset their password on the Parse site.
   *
   * @param {string} email The email address associated with the user that
   *     forgot their password.
   * @param {object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   * </ul>
   * @static
   * @returns {Promise}
   */
  static requestPasswordReset(email: string, options?: RequestOptions): Promise<void> {
    const requestOptions = ParseObject._getRequestOptions(options);
    const controller = CoreManager.getUserController();
    return controller.requestPasswordReset(email, requestOptions);
  }

  /**
   * Request an email verification.
   *
   * @param {string} email The email address associated with the user that
   *     needs to verify their email.
   * @param {object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   * </ul>
   * @static
   * @returns {Promise}
   */
  static requestEmailVerification(email: string, options?: RequestOptions): Promise<void> {
    const requestOptions = ParseObject._getRequestOptions(options);
    const controller = CoreManager.getUserController();
    return controller.requestEmailVerification(email, requestOptions);
  }

  /**
   * Verify whether a given password is the password of the current user.
   * @static
   *
   * @param {string} username  The username of the user whose password should be verified.
   * @param {string} password The password to be verified.
   * @param {object} options The options.
   * @param {boolean} [options.ignoreEmailVerification] Set to `true` to bypass email verification and verify
   * the password regardless of whether the email has been verified. This requires the master key.
   * @returns {Promise} A promise that is fulfilled with a user when the password is correct.
   */
  static verifyPassword<T extends ParseUser>(
    username: string,
    password: string,
    options?: RequestOptions
  ): Promise<T> {
    if (typeof username !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Username must be a string.'));
    }

    if (typeof password !== 'string') {
      return Promise.reject(new ParseError(ParseError.OTHER_CAUSE, 'Password must be a string.'));
    }

    const controller = CoreManager.getUserController();
    return controller.verifyPassword(username, password, options || {}) as Promise<T>;
  }

  /**
   * Allow someone to define a custom User class without className
   * being rewritten to _User. The default behavior is to rewrite
   * User to _User for legacy reasons. This allows developers to
   * override that behavior.
   *
   * @param {boolean} isAllowed Whether or not to allow custom User class
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
   *
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is resolved when the process has
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
   *
   * @static
   */
  static enableUnsafeCurrentUser() {
    canUseCurrentUser = true;
  }

  /**
   * Disables the use of become or the current user in any environment.
   * These features are disabled on servers by default, since they depend on
   * global objects that are not memory-safe for most servers.
   *
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
   * @param provider
   * @see {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @see {@link https://docs.parseplatform.org/js/guide/#custom-authentication-module Custom Authentication Module}
   * @static
   */
  static _registerAuthenticationProvider(provider: any) {
    authProviders[provider.getAuthType()] = provider;
    // Synchronize the current user with the auth provider.
    ParseUser.currentAsync().then(current => {
      if (current) {
        current._synchronizeAuthData(provider.getAuthType());
      }
    });
  }

  /**
   * @param provider
   * @param options
   * @param {object} [options.authData]
   * @param saveOpts
   * @deprecated since 2.9.0 see {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#logInWith logInWith}
   * @static
   * @returns {Promise}
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
      userData = crypto.encrypt(json, CoreManager.get('ENCRYPTED_KEY'));
    }
    return Storage.setItemAsync(path, userData).then(() => {
      return user;
    });
  },

  removeUserFromDisk() {
    const path = Storage.generatePath(CURRENT_USER_KEY);
    currentUserCacheMatchesDisk = true;
    currentUserCache = null;
    return Storage.removeItemAsync(path);
  },

  setCurrentUser(user) {
    currentUserCache = user;
    user._cleanupAuthData();
    user._synchronizeAllAuthData();
    return DefaultController.updateUserOnDisk(user);
  },

  currentUser(): ParseUser | null {
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
    let userData: any = Storage.getItem(path);
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
    const current = ParseObject.fromJSON(userData) as ParseUser;
    currentUserCache = current;
    current._synchronizeAllAuthData();
    return current;
  },

  currentUserAsync(): Promise<ParseUser | null> {
    if (currentUserCache) {
      return Promise.resolve(currentUserCache);
    }
    if (currentUserCacheMatchesDisk) {
      return Promise.resolve(null);
    }
    const path = Storage.generatePath(CURRENT_USER_KEY);
    return Storage.getItemAsync(path).then((userData: any) => {
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
      const current = ParseObject.fromJSON(userData) as ParseUser;
      currentUserCache = current;
      current._synchronizeAllAuthData();
      return Promise.resolve(current);
    });
  },

  signUp(user: ParseUser, attrs: Attributes, options?: RequestOptions): Promise<ParseUser> {
    const username = (attrs && attrs.username) || user.get('username');
    const password = (attrs && attrs.password) || user.get('password');

    if (!username || !username.length) {
      return Promise.reject(
        new ParseError(ParseError.OTHER_CAUSE, 'Cannot sign up user with an empty username.')
      );
    }
    if (!password || !password.length) {
      return Promise.reject(
        new ParseError(ParseError.OTHER_CAUSE, 'Cannot sign up user with an empty password.')
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

  logIn(user: ParseUser, options?: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    const stateController = CoreManager.getObjectStateController();
    const auth = {
      username: user.get('username'),
      password: user.get('password'),
      authData: user.get('authData'),
    };
    return RESTController.request(options.usePost ? 'POST' : 'GET', 'login', auth, options).then(
      response => {
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
      }
    );
  },

  loginAs(user: ParseUser, userId: string): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('POST', 'loginAs', { userId }, { useMasterKey: true }).then(
      response => {
        user._finishFetch(response);
        user._setExisted(true);
        if (!canUseCurrentUser) {
          return Promise.resolve(user);
        }
        return DefaultController.setCurrentUser(user);
      }
    );
  },

  become(user: ParseUser, options?: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('GET', 'users/me', {}, options).then(response => {
      user._finishFetch(response);
      user._setExisted(true);
      return DefaultController.setCurrentUser(user);
    });
  },

  hydrate(user: ParseUser, userJSON: Attributes): Promise<ParseUser> {
    user._finishFetch(userJSON);
    user._setExisted(true);
    if (userJSON.sessionToken && canUseCurrentUser) {
      return DefaultController.setCurrentUser(user);
    } else {
      return Promise.resolve(user);
    }
  },

  me(user: ParseUser, options?: RequestOptions): Promise<ParseUser> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('GET', 'users/me', {}, options).then(response => {
      user._finishFetch(response);
      user._setExisted(true);
      return user;
    });
  },

  logOut(options?: RequestOptions): Promise<void> {
    const RESTController = CoreManager.getRESTController();
    if (options?.sessionToken) {
      return RESTController.request('POST', 'logout', {}, options);
    }
    return DefaultController.currentUserAsync().then(currentUser => {
      const path = Storage.generatePath(CURRENT_USER_KEY);
      let promise = Storage.removeItemAsync(path);
      if (currentUser !== null) {
        const currentSession = currentUser.getSessionToken();
        if (currentSession && isRevocableSession(currentSession)) {
          promise = promise.then(() => {
            return RESTController.request('POST', 'logout', {}, { sessionToken: currentSession });
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

  requestPasswordReset(email: string, options?: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('POST', 'requestPasswordReset', { email }, options);
  },

  async upgradeToRevocableSession(user: ParseUser, options?: RequestOptions) {
    const token = user.getSessionToken();
    if (!token) {
      return Promise.reject(
        new ParseError(ParseError.SESSION_MISSING, 'Cannot upgrade a user with no session token')
      );
    }

    options.sessionToken = token;

    const RESTController = CoreManager.getRESTController();
    const result = await RESTController.request('POST', 'upgradeToRevocableSession', {}, options);
    user._finishFetch({ sessionToken: result?.sessionToken || '' });
    const current = await user.isCurrentAsync();
    if (current) {
      return DefaultController.setCurrentUser(user);
    }
    return Promise.resolve(user);
  },

  linkWith(user: ParseUser, authData: AuthData, options: FullOptions) {
    return user.save({ authData }, options).then(() => {
      if (canUseCurrentUser) {
        return DefaultController.setCurrentUser(user);
      }
      return user;
    });
  },

  verifyPassword(username: string, password: string, options?: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    const data = {
      username,
      password,
      ...(options.ignoreEmailVerification !== undefined && {
        ignoreEmailVerification: options.ignoreEmailVerification,
      }),
    };
    return RESTController.request('GET', 'verifyPassword', data, options);
  },

  requestEmailVerification(email: string, options?: RequestOptions) {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('POST', 'verificationEmailRequest', { email }, options);
  },
};

CoreManager.setParseUser(ParseUser);
CoreManager.setUserController(DefaultController);

export default ParseUser;
