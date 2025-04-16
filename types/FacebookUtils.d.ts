import ParseUser from './ParseUser';
import type { AuthProvider } from './ParseUser';
/**
 * Provides a set of utilities for using Parse with Facebook.
 *
 * @class Parse.FacebookUtils
 * @static
 * @hideconstructor
 */
declare const FacebookUtils: {
    /**
     * Initializes Parse Facebook integration.  Call this function after you
     * have loaded the Facebook Javascript SDK with the same parameters
     * as you would pass to<code>
     * <a href=
     * "https://developers.facebook.com/docs/reference/javascript/FB.init/">
     * FB.init()</a></code>.  Parse.FacebookUtils will invoke FB.init() for you
     * with these arguments.
     *
     * @function init
     * @name Parse.FacebookUtils.init
     * @param {object} options Facebook options argument as described here:
     *   <a href=
     *   "https://developers.facebook.com/docs/reference/javascript/FB.init/">
     *   FB.init()</a>. The status flag will be coerced to 'false' because it
     *   interferes with Parse Facebook integration. Call FB.getLoginStatus()
     *   explicitly if this behavior is required by your application.
     */
    init(options: any): void;
    /**
     * Gets whether the user has their account linked to Facebook.
     *
     * @function isLinked
     * @name Parse.FacebookUtils.isLinked
     * @param {Parse.User} user User to check for a facebook link.
     *     The user must be logged in on this device.
     * @returns {boolean} <code>true</code> if the user has their account
     *     linked to Facebook.
     */
    isLinked(user: any): any;
    /**
     * Logs in a user using Facebook. This method delegates to the Facebook
     * SDK to authenticate the user, and then automatically logs in (or
     * creates, in the case where it is a new user) a Parse.User.
     *
     * Standard API:
     *
     * <code>logIn(permission: string, authData: Object);</code>
     *
     * Advanced API: Used for handling your own oAuth tokens
     * {@link https://docs.parseplatform.org/rest/guide/#linking-users}
     *
     * <code>logIn(authData: Object, options?: Object);</code>
     *
     * @function logIn
     * @name Parse.FacebookUtils.logIn
     * @param {(string | object)} permissions The permissions required for Facebook
     *    log in.  This is a comma-separated string of permissions.
     *    Alternatively, supply a Facebook authData object as described in our
     *    REST API docs if you want to handle getting facebook auth tokens
     *    yourself.
     * @param {object} options MasterKey / SessionToken. Alternatively can be used for authData if permissions is a string
     * @returns {Promise}
     */
    logIn(permissions: any, options: any): Promise<ParseUser<import("./ParseObject").Attributes>>;
    /**
     * Links Facebook to an existing PFUser. This method delegates to the
     * Facebook SDK to authenticate the user, and then automatically links
     * the account to the Parse.User.
     *
     * Standard API:
     *
     * <code>link(user: Parse.User, permission: string, authData?: Object);</code>
     *
     * Advanced API: Used for handling your own oAuth tokens
     * {@link https://docs.parseplatform.org/rest/guide/#linking-users}
     *
     * <code>link(user: Parse.User, authData: Object, options?: FullOptions);</code>
     *
     * @function link
     * @name Parse.FacebookUtils.link
     * @param {Parse.User} user User to link to Facebook. This must be the
     *     current user.
     * @param {(string | object)} permissions The permissions required for Facebook
     *    log in.  This is a comma-separated string of permissions.
     *    Alternatively, supply a Facebook authData object as described in our
     *    REST API docs if you want to handle getting facebook auth tokens
     *    yourself.
     * @param {object} options MasterKey / SessionToken. Alternatively can be used for authData if permissions is a string
     * @returns {Promise}
     */
    link(user: any, permissions: any, options: any): any;
    /**
     * Unlinks the Parse.User from a Facebook account.
     *
     * @function unlink
     * @name Parse.FacebookUtils.unlink
     * @param {Parse.User} user User to unlink from Facebook. This must be the
     *     current user.
     * @param {object} options Standard options object with success and error
     *    callbacks.
     * @returns {Promise}
     */
    unlink: (user: any, options: any) => any;
    _getAuthProvider(): AuthProvider;
};
export default FacebookUtils;
