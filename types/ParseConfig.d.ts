import type { RequestOptions } from './RESTController';
/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @alias Parse.Config
 */
declare class ParseConfig {
    attributes: Record<string, any>;
    _escapedAttributes: Record<string, any>;
    constructor();
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
    /**
     * Retrieves the most recently-fetched configuration object, either from
     * memory or from local storage if necessary.
     *
     * @static
     * @returns {Parse.Config} The most recently-fetched Parse.Config if it
     *     exists, else an empty Parse.Config.
     */
    static current(): ParseConfig | Promise<ParseConfig>;
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
    static get(options?: RequestOptions): Promise<ParseConfig>;
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
    static save(attrs: Record<string, any>, masterKeyOnlyFlags: Record<string, any>): Promise<ParseConfig>;
    /**
     * Used for testing
     *
     * @private
     */
    static _clearCache(): void;
}
export default ParseConfig;
