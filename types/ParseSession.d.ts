export default ParseSession;
/**
 * <p>A Parse.Session object is a local representation of a revocable session.
 * This class is a subclass of a Parse.Object, and retains the same
 * functionality of a Parse.Object.</p>
 *
 * @alias Parse.Session
 * @augments Parse.Object
 */
declare class ParseSession {
    static readOnlyAttributes(): string[];
    /**
     * Retrieves the Session object for the currently logged in session.
     *
     * @param {object} options useMasterKey
     * @static
     * @returns {Promise} A promise that is resolved with the Parse.Session
     * object after it has been fetched. If there is no current user, the
     * promise will be rejected.
     */
    static current(options: FullOptions): Promise<any>;
    /**
     * Determines whether the current session token is revocable.
     * This method is useful for migrating Express.js or Node.js web apps to
     * use revocable sessions. If you are migrating an app that uses the Parse
     * SDK in the browser only, please use Parse.User.enableRevocableSession()
     * instead, so that sessions can be automatically upgraded.
     *
     * @static
     * @returns {boolean}
     */
    static isCurrentSessionRevocable(): boolean;
    /**
     * @param {object} attributes The initial set of data to store in the user.
     */
    constructor(attributes: AttributeMap | null);
    /**
     * Returns the session token string.
     *
     * @returns {string}
     */
    getSessionToken(): string;
}
import { FullOptions } from './RESTController';
import { AttributeMap } from './ObjectStateMutations';
