import ParseObject from './ParseObject';
import type { AttributeMap } from './ObjectStateMutations';
import type { RequestOptions, FullOptions } from './RESTController';
export type AuthData = {
  [key: string]: any;
};
export type AuthProviderType = {
  authenticate?(options: {
    error?: (provider: AuthProviderType, error: string | any) => void;
    success?: (provider: AuthProviderType, result: AuthData) => void;
  }): void;
  restoreAuthentication(authData: any): boolean;
  getAuthType(): string;
  deauthenticate?(): void;
};
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
declare class ParseUser extends ParseObject {
  /**
   * @param {object} attributes The initial set of data to store in the user.
   */
  constructor(attributes?: AttributeMap);
  /**
   * Request a revocable session token to replace the older style of token.
   *
   * @param {object} options
   * @returns {Promise} A promise that is resolved when the replacement
   *   token has been fetched.
   */
  _upgradeToRevocableSession(options: RequestOptions): Promise<void>;
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
    provider: AuthProviderType,
    options: {
      authData?: AuthData;
    },
    saveOpts?: FullOptions
  ): Promise<ParseUser>;
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
    options: {
      authData?: AuthData;
    },
    saveOpts?: FullOptions
  ): Promise<ParseUser>;
  /**
   * Synchronizes auth data for a provider (e.g. puts the access token in the
   * right place to be used by the Facebook SDK).
   *
   * @param provider
   */
  _synchronizeAuthData(provider: string | AuthProviderType): void;
  /**
   * Synchronizes authData for all providers.
   */
  _synchronizeAllAuthData(): void;
  /**
   * Removes null values from authData (which exist temporarily for unlinking)
   */
  _cleanupAuthData(): void;
  /**
   * Unlinks a user from a service.
   *
   * @param {string | AuthProvider} provider Name of auth provider or {@link https://parseplatform.org/Parse-SDK-JS/api/master/AuthProvider.html AuthProvider}
   * @param {object} options MasterKey / SessionToken
   * @returns {Promise} A promise that is fulfilled when the unlinking
   *     finishes.
   */
  _unlinkFrom(provider: any, options?: FullOptions): Promise<ParseUser>;
  /**
   * Checks whether a user is linked to a service.
   *
   * @param {object} provider service to link to
   * @returns {boolean} true if link was successful
   */
  _isLinked(provider: any): boolean;
  /**
   * Deauthenticates all providers.
   */
  _logOutWithAll(): void;
  /**
   * Deauthenticates a single provider (e.g. removing access tokens from the
   * Facebook SDK).
   *
   * @param {object} provider service to logout of
   */
  _logOutWith(provider: any): void;
  /**
   * Class instance method used to maintain specific keys when a fetch occurs.
   * Used to ensure that the session token is not lost.
   *
   * @returns {object} sessionToken
   */
  _preserveFieldsOnFetch(): AttributeMap;
  /**
   * Returns true if <code>current</code> would return this user.
   *
   * @returns {boolean} true if user is cached on disk
   */
  isCurrent(): boolean;
  /**
   * Returns true if <code>current</code> would return this user.
   *
   * @returns {Promise<boolean>} true if user is cached on disk
   */
  isCurrentAsync(): Promise<boolean>;
  stripAnonymity(): void;
  restoreAnonimity(anonymousData: any): void;
  /**
   * Returns get("username").
   *
   * @returns {string}
   */
  getUsername(): string | null;
  /**
   * Calls set("username", username, options) and returns the result.
   *
   * @param {string} username
   */
  setUsername(username: string): void;
  /**
   * Calls set("password", password, options) and returns the result.
   *
   * @param {string} password User's Password
   */
  setPassword(password: string): void;
  /**
   * Returns get("email").
   *
   * @returns {string} User's Email
   */
  getEmail(): string | null;
  /**
   * Calls set("email", email) and returns the result.
   *
   * @param {string} email
   * @returns {boolean}
   */
  setEmail(email: string): boolean | ParseObject;
  /**
   * Returns the session token for this user, if the user has been logged in,
   * or if it is the result of a query with the master key. Otherwise, returns
   * undefined.
   *
   * @returns {string} the session token, or undefined
   */
  getSessionToken(): string | null;
  /**
   * Checks whether this user is the current user and has been authenticated.
   *
   * @returns {boolean} whether this user is the current user and is logged in.
   */
  authenticated(): boolean;
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
   * @returns {Promise} A promise that is fulfilled when the signup
   *     finishes.
   */
  signUp(
    attrs: AttributeMap,
    options?: FullOptions & {
      context?: AttributeMap;
    }
  ): Promise<ParseUser>;
  /**
   * Logs in a Parse.User. On success, this saves the session to disk,
   * so you can retrieve the currently logged in user using
   * <code>current</code>.
   *
   * <p>A username and password must be set before calling logIn.</p>
   *
   * @param {object} options
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login is complete.
   */
  logIn(
    options?: FullOptions & {
      context?: AttributeMap;
    }
  ): Promise<ParseUser>;
  /**
   * Wrap the default save behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Promise}
   */
  save(...args: Array<any>): Promise<this>;
  /**
   * Wrap the default destroy behavior with functionality that logs out
   * the current user when it is destroyed
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  destroy(...args: Array<any>): Promise<ParseUser | void>;
  /**
   * Wrap the default fetch behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  fetch(...args: Array<any>): Promise<ParseUser>;
  /**
   * Wrap the default fetchWithInclude behavior with functionality to save to local
   * storage if this is current user.
   *
   * @param {...any} args
   * @returns {Parse.User}
   */
  fetchWithInclude(...args: Array<any>): Promise<ParseUser>;
  /**
   * Verify whether a given password is the password of the current user.
   *
   * @param {string} password The password to be verified.
   * @param {object} options The options.
   * @param {boolean} [options.ignoreEmailVerification] Set to `true` to bypass email verification and verify
   * the password regardless of whether the email has been verified. This requires the master key.
   * @returns {Promise} A promise that is fulfilled with a user when the password is correct.
   */
  verifyPassword(password: string, options?: RequestOptions): Promise<ParseUser>;
  static readOnlyAttributes(): string[];
  /**
   * Adds functionality to the existing Parse.User class.
   *
   * @param {object} protoProps A set of properties to add to the prototype
   * @param {object} classProps A set of static properties to add to the class
   * @static
   * @returns {Parse.User} The newly extended Parse.User class
   */
  static extend(
    protoProps: {
      [prop: string]: any;
    },
    classProps: {
      [prop: string]: any;
    }
  ): typeof ParseUser;
  /**
   * Retrieves the currently logged in ParseUser with a valid session,
   * either from memory or localStorage, if necessary.
   *
   * @static
   * @returns {Parse.Object} The currently logged in Parse.User.
   */
  static current(): ParseUser | null;
  /**
   * Retrieves the currently logged in ParseUser from asynchronous Storage.
   *
   * @static
   * @returns {Promise} A Promise that is resolved with the currently
   *   logged in Parse User
   */
  static currentAsync(): Promise<ParseUser | null>;
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
  static signUp(
    username: string,
    password: string,
    attrs: AttributeMap,
    options?: FullOptions
  ): Promise<ParseUser>;
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
  static logIn(username: string, password: string, options?: FullOptions): Promise<ParseUser>;
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
  static logInWithAdditionalAuth(
    username: string,
    password: string,
    authData: AuthData,
    options?: FullOptions
  ): Promise<ParseUser>;
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
  static loginAs(userId: string): Promise<ParseUser>;
  /**
   * Logs in a user with a session token. On success, this saves the session
   * to disk, so you can retrieve the currently logged in user using
   * <code>current</code>.
   *
   * @param {string} sessionToken The sessionToken to log in with.
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with the user when
   *     the login completes.
   */
  static become(sessionToken: string, options?: RequestOptions): Promise<ParseUser>;
  /**
   * Retrieves a user with a session token.
   *
   * @param {string} sessionToken The sessionToken to get user with.
   * @param {object} options
   * @static
   * @returns {Promise} A promise that is fulfilled with the user is fetched.
   */
  static me(sessionToken: string, options?: RequestOptions): Promise<ParseUser>;
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
  static hydrate(userJSON: AttributeMap): Promise<ParseUser>;
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
  static logInWith(
    provider: any,
    options: {
      authData?: AuthData;
    },
    saveOpts?: FullOptions
  ): Promise<ParseUser>;
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
  static logOut(options?: RequestOptions): Promise<void>;
  /**
   * Requests a password reset email to be sent to the specified email address
   * associated with the user account. This email allows the user to securely
   * reset their password on the Parse site.
   *
   * @param {string} email The email address associated with the user that
   *     forgot their password.
   * @param {object} options
   * @static
   * @returns {Promise}
   */
  static requestPasswordReset(email: string, options?: RequestOptions): Promise<void>;
  /**
   * Request an email verification.
   *
   * @param {string} email The email address associated with the user that
   *     needs to verify their email.
   * @param {object} options
   * @static
   * @returns {Promise}
   */
  static requestEmailVerification(email: string, options?: RequestOptions): Promise<void>;
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
  static verifyPassword(
    username: string,
    password: string,
    options?: RequestOptions
  ): Promise<ParseUser>;
  /**
   * Allow someone to define a custom User class without className
   * being rewritten to _User. The default behavior is to rewrite
   * User to _User for legacy reasons. This allows developers to
   * override that behavior.
   *
   * @param {boolean} isAllowed Whether or not to allow custom User class
   * @static
   */
  static allowCustomUserClass(isAllowed: boolean): void;
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
  static enableRevocableSession(options?: RequestOptions): Promise<void>;
  /**
   * Enables the use of become or the current user in a server
   * environment. These features are disabled by default, since they depend on
   * global objects that are not memory-safe for most servers.
   *
   * @static
   */
  static enableUnsafeCurrentUser(): void;
  /**
   * Disables the use of become or the current user in any environment.
   * These features are disabled on servers by default, since they depend on
   * global objects that are not memory-safe for most servers.
   *
   * @static
   */
  static disableUnsafeCurrentUser(): void;
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
  static _registerAuthenticationProvider(provider: any): void;
  /**
   * @param provider
   * @param options
   * @param {object} [options.authData]
   * @param saveOpts
   * @deprecated since 2.9.0 see {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.User.html#logInWith logInWith}
   * @static
   * @returns {Promise}
   */
  static _logInWith(
    provider: any,
    options: {
      authData?: AuthData;
    },
    saveOpts?: FullOptions
  ): Promise<ParseUser>;
  static _clearCache(): void;
  static _setCurrentUserCache(user: ParseUser): void;
}
export default ParseUser;
