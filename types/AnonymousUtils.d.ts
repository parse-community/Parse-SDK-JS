export default AnonymousUtils;
declare namespace AnonymousUtils {
    /**
     * Gets whether the user has their account linked to anonymous user.
     *
     * @function isLinked
     * @name Parse.AnonymousUtils.isLinked
     * @param {Parse.User} user User to check for.
     *     The user must be logged in on this device.
     * @returns {boolean} <code>true</code> if the user has their account
     *     linked to an anonymous user.
     * @static
     */
    function isLinked(user: ParseUser): boolean;
    /**
     * Logs in a user Anonymously.
     *
     * @function logIn
     * @name Parse.AnonymousUtils.logIn
     * @param {object} options MasterKey / SessionToken.
     * @returns {Promise} Logged in user
     * @static
     */
    function logIn(options?: RequestOptions): Promise<ParseUser>;
    /**
     * Links Anonymous User to an existing PFUser.
     *
     * @function link
     * @name Parse.AnonymousUtils.link
     * @param {Parse.User} user User to link. This must be the current user.
     * @param {object} options MasterKey / SessionToken.
     * @returns {Promise} Linked with User
     * @static
     */
    function link(user: ParseUser, options?: RequestOptions): Promise<ParseUser>;
    /**
     * Returns true if Authentication Provider has been registered for use.
     *
     * @function isRegistered
     * @name Parse.AnonymousUtils.isRegistered
     * @returns {boolean}
     * @static
     */
    function isRegistered(): boolean;
    function _getAuthProvider(): {
        restoreAuthentication(): boolean;
        getAuthType(): string;
        getAuthData(): {
            authData: {
                id: any;
            };
        };
    };
}
import ParseUser from './ParseUser';
import { RequestOptions } from './RESTController';
