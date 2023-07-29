// @ts-nocheck
export default ParseConfig;
/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @alias Parse.Config
 */
declare class ParseConfig {
    /**
     * Retrieves the most recently-fetched configuration object, either from
     * memory or from local storage if necessary.
     *
     * @static
     * @returns {Parse.Config} The most recently-fetched Parse.Config if it
     *     exists, else an empty Parse.Config.
     */
    static current(): Parse.Config;
    /**
     * Gets a new configuration object from the server.
     *
     * @static
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     * </ul>
     * @returns {Promise} A promise that is resolved with a newly-created
     *     configuration object when the get completes.
     */
    static get(options?: RequestOptions): Promise<any>;
    /**
     * Save value keys to the server.
     *
     * @static
     * @param {object} attrs The config parameters and values.
     * @param {object} masterKeyOnlyFlags The flags that define whether config parameters listed
     * in `attrs` should be retrievable only by using the master key.
     * For example: `param1: true` makes `param1` only retrievable by using the master key.
     * If a parameter is not provided or set to `false`, it can be retrieved without
     * using the master key.
     * @returns {Promise} A promise that is resolved with a newly-created
     *     configuration object or with the current with the update.
     */
    static save(attrs: {
        [key: string]: any;
    }, masterKeyOnlyFlags: {
        [key: string]: any;
    }): Promise<any>;
    /**
     * Used for testing
     *
     * @private
     */
    private static _clearCache;
    attributes: {
        [key: string]: any;
    };
    _escapedAttributes: {
        [key: string]: any;
    };
    /**
     * Gets the value of an attribute.
     *
     * @param {string} attr The name of an attribute.
     * @returns {*}
     */
    get(attr: string): any;
    /**
     * Gets the HTML-escaped value of an attribute.
     *
     * @param {string} attr The name of an attribute.
     * @returns {string}
     */
    escape(attr: string): string;
}
import { RequestOptions } from './RESTController';
