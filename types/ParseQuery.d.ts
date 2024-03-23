// @ts-nocheck
type WhereClause = {
    [attr: string]: mixed;
};
type QueryJSON = {
    where: WhereClause;
    watch?: string;
    include?: string;
    excludeKeys?: string;
    keys?: string;
    limit?: number;
    skip?: number;
    order?: string;
    className?: string;
    count?: number;
    hint?: mixed;
    explain?: boolean;
    readPreference?: string;
    includeReadPreference?: string;
    subqueryReadPreference?: string;
    comment?: string,
};
export default ParseQuery;
/**
 * Creates a new parse Parse.Query for the given Parse.Object subclass.
 *
 * <p>Parse.Query defines a query that is used to fetch Parse.Objects. The
 * most common use case is finding all objects that match a query through the
 * <code>find</code> method. for example, this sample code fetches all objects
 * of class <code>myclass</code>. it calls a different function depending on
 * whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(myclass);
 * query.find().then((results) => {
 *   // results is an array of parse.object.
 * }).catch((error) =>  {
 *  // error is an instance of parse.error.
 * });</pre></p>
 *
 * <p>a Parse.Query can also be used to retrieve a single object whose id is
 * known, through the get method. for example, this sample code fetches an
 * object of class <code>myclass</code> and id <code>myid</code>. it calls a
 * different function depending on whether the fetch succeeded or not.
 *
 * <pre>
 * var query = new Parse.Query(myclass);
 * query.get(myid).then((object) => {
 *     // object is an instance of parse.object.
 * }).catch((error) =>  {
 *  // error is an instance of parse.error.
 * });</pre></p>
 *
 * <p>a Parse.Query can also be used to count the number of objects that match
 * the query without retrieving all of those objects. for example, this
 * sample code counts the number of objects of the class <code>myclass</code>
 * <pre>
 * var query = new Parse.Query(myclass);
 * query.count().then((number) => {
 *     // there are number instances of myclass.
 * }).catch((error) => {
 *     // error is an instance of Parse.Error.
 * });</pre></p>
 *
 * @alias Parse.Query
 */
declare class ParseQuery {
    /**
     * Static method to restore Parse.Query by json representation
     * Internally calling Parse.Query.withJSON
     *
     * @param {string} className
     * @param {QueryJSON} json from Parse.Query.toJSON() method
     * @returns {Parse.Query} new created query
     */
    static fromJSON(className: string, json: QueryJSON): ParseQuery;
    /**
     * Constructs a Parse.Query that is the OR of the passed in queries.  For
     * example:
     * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
     *
     * will create a compoundQuery that is an or of the query1, query2, and
     * query3.
     *
     * @param {...Parse.Query} queries The list of queries to OR.
     * @static
     * @returns {Parse.Query} The query that is the OR of the passed in queries.
     */
    static or(...queries: Array<ParseQuery>): ParseQuery;
    /**
     * Constructs a Parse.Query that is the AND of the passed in queries.  For
     * example:
     * <pre>var compoundQuery = Parse.Query.and(query1, query2, query3);</pre>
     *
     * will create a compoundQuery that is an and of the query1, query2, and
     * query3.
     *
     * @param {...Parse.Query} queries The list of queries to AND.
     * @static
     * @returns {Parse.Query} The query that is the AND of the passed in queries.
     */
    static and(...queries: Array<ParseQuery>): ParseQuery;
    /**
     * Constructs a Parse.Query that is the NOR of the passed in queries.  For
     * example:
     * <pre>const compoundQuery = Parse.Query.nor(query1, query2, query3);</pre>
     *
     * will create a compoundQuery that is a nor of the query1, query2, and
     * query3.
     *
     * @param {...Parse.Query} queries The list of queries to NOR.
     * @static
     * @returns {Parse.Query} The query that is the NOR of the passed in queries.
     */
    static nor(...queries: Array<ParseQuery>): ParseQuery;
    /**
     * @param {(string | Parse.Object)} objectClass An instance of a subclass of Parse.Object, or a Parse className string.
     */
    constructor(objectClass: string | ParseObject);
    /**
     * @property {string} className
     */
    className: string;
    _where: any;
    _watch: Array<string>;
    _include: Array<string>;
    _exclude: Array<string>;
    _select: Array<string>;
    _limit: number;
    _skip: number;
    _count: boolean;
    _order: Array<string>;
    _readPreference: string;
    _includeReadPreference: string;
    _subqueryReadPreference: string;
    _queriesLocalDatastore: boolean;
    _localDatastorePinName: any;
    _extraOptions: {
        [key: string]: mixed;
    };
    _hint: mixed;
    _explain: boolean;
    _xhrRequest: any;
    _comment: string;
    /**
     * Adds constraint that at least one of the passed in queries matches.
     *
     * @param {Array} queries
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    _orQuery(queries: Array<ParseQuery>): ParseQuery;
    /**
     * Adds constraint that all of the passed in queries match.
     *
     * @param {Array} queries
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    _andQuery(queries: Array<ParseQuery>): ParseQuery;
    /**
     * Adds constraint that none of the passed in queries match.
     *
     * @param {Array} queries
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    _norQuery(queries: Array<ParseQuery>): ParseQuery;
    /**
     * Helper for condition queries
     *
     * @param key
     * @param condition
     * @param value
     * @returns {Parse.Query}
     */
    _addCondition(key: string, condition: string, value: mixed): ParseQuery;
    /**
     * Converts string for regular expression at the beginning
     *
     * @param string
     * @returns {string}
     */
    _regexStartWith(string: string): string;
    _handleOfflineQuery(params: any): Promise<any>;
    /**
     * Returns a JSON representation of this query.
     *
     * @returns {object} The JSON representation of the query.
     */
    toJSON(): QueryJSON;
    /**
     * Return a query with conditions from json, can be useful to send query from server side to client
     * Not static, all query conditions was set before calling this method will be deleted.
     * For example on the server side we have
     * var query = new Parse.Query("className");
     * query.equalTo(key: value);
     * query.limit(100);
     * ... (others queries)
     * Create JSON representation of Query Object
     * var jsonFromServer = query.fromJSON();
     *
     * On client side getting query:
     * var query = new Parse.Query("className");
     * query.fromJSON(jsonFromServer);
     *
     * and continue to query...
     * query.skip(100).find().then(...);
     *
     * @param {QueryJSON} json from Parse.Query.toJSON() method
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withJSON(json: QueryJSON): ParseQuery;
    /**
     * Constructs a Parse.Object whose id is already known by fetching data from
     * the server. Unlike the <code>first</code> method, it never returns undefined.
     *
     * @param {string} objectId The id of the object to be fetched.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     *   <li>json: Return raw json without converting to Parse.Object
     * </ul>
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    get(objectId: string, options?: FullOptions): Promise<ParseObject>;
    /**
     * Retrieves a list of ParseObjects that satisfy this query.
     *
     * @param {object} options Valid options
     * are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     *   <li>json: Return raw json without converting to Parse.Object
     * </ul>
     * @returns {Promise} A promise that is resolved with the results when
     * the query completes.
     */
    find(options?: FullOptions): Promise<Array<ParseObject>>;
    /**
     * Retrieves a complete list of ParseObjects that satisfy this query.
     * Using `eachBatch` under the hood to fetch all the valid objects.
     *
     * @param {object} options Valid options are:<ul>
     *   <li>batchSize: How many objects to yield in each batch (default: 100)
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that is resolved with the results when
     * the query completes.
     */
    findAll(options?: BatchOptions): Promise<Array<ParseObject>>;
    /**
     * Counts the number of objects that match this query.
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that is resolved with the count when
     * the query completes.
     */
    count(options?: FullOptions): Promise<number>;
    /**
     * Executes a distinct query and returns unique values
     *
     * @param {string} key A field to find distinct values
     * @param {object} options
     * Valid options are:<ul>
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that is resolved with the query completes.
     */
    distinct(key: string, options?: FullOptions): Promise<Array<mixed>>;
    /**
     * Executes an aggregate query and returns aggregate results
     *
     * @param {(Array|object)} pipeline Array or Object of stages to process query
     * @param {object} options Valid options are:<ul>
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that is resolved with the query completes.
     */
    aggregate(pipeline: mixed, options?: FullOptions): Promise<Array<mixed>>;
    /**
     * Retrieves at most one Parse.Object that satisfies this query.
     *
     * Returns the object if there is one, otherwise undefined.
     *
     * @param {object} options Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     *   <li>json: Return raw json without converting to Parse.Object
     * </ul>
     * @returns {Promise} A promise that is resolved with the object when
     * the query completes.
     */
    first(options?: FullOptions): Promise<ParseObject | void>;
    /**
     * Iterates over objects matching a query, calling a callback for each batch.
     * If the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are processed
     * in an unspecified order. The query may not have any sort order, and may
     * not use limit or skip.
     *
     * @param {Function} callback Callback that will be called with each result
     *     of the query.
     * @param {object} options Valid options are:<ul>
     *   <li>batchSize: How many objects to yield in each batch (default: 100)
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     * </ul>
     * @returns {Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
    eachBatch(callback: (objs: Array<ParseObject>) => Promise<any>, options?: BatchOptions): Promise<void>;
    /**
     * Iterates over each result of a query, calling a callback for each one. If
     * the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are
     * processed in an unspecified order. The query may not have any sort order,
     * and may not use limit or skip.
     *
     * @param {Function} callback Callback that will be called with each result
     *     of the query.
     * @param {object} options Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>json: Return raw json without converting to Parse.Object
     * </ul>
     * @returns {Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
    each(callback: (obj: ParseObject) => any, options?: BatchOptions): Promise<void>;
    /**
     * Adds a hint to force index selection. (https://docs.mongodb.com/manual/reference/operator/meta/hint/)
     *
     * @param {(string|object)} value String or Object of index that should be used when executing query
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    hint(value: mixed): ParseQuery;
    /**
     * Investigates the query execution plan. Useful for optimizing queries. (https://docs.mongodb.com/manual/reference/operator/meta/explain/)
     *
     * @param {boolean} explain Used to toggle the information on the query plan.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    explain(explain?: boolean): ParseQuery;
    /**
     * Iterates over each result of a query, calling a callback for each one. If
     * the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are
     * processed in an unspecified order. The query may not have any sort order,
     * and may not use limit or skip.
     *
     * @param {Function} callback Callback <ul>
     *   <li>currentObject: The current Parse.Object being processed in the array.</li>
     *   <li>index: The index of the current Parse.Object being processed in the array.</li>
     *   <li>query: The query map was called upon.</li>
     * </ul>
     * @param {object} options Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
    map(callback: (currentObject: ParseObject, index: number, query: ParseQuery) => any, options?: BatchOptions): Promise<Array<any>>;
    /**
     * Iterates over each result of a query, calling a callback for each one. If
     * the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are
     * processed in an unspecified order. The query may not have any sort order,
     * and may not use limit or skip.
     *
     * @param {Function} callback Callback <ul>
     *   <li>accumulator: The accumulator accumulates the callback's return values. It is the accumulated value previously returned in the last invocation of the callback.</li>
     *   <li>currentObject: The current Parse.Object being processed in the array.</li>
     *   <li>index: The index of the current Parse.Object being processed in the array.</li>
     * </ul>
     * @param {*} initialValue A value to use as the first argument to the first call of the callback. If no initialValue is supplied, the first object in the query will be used and skipped.
     * @param {object} options Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
    reduce(callback: (accumulator: any, currentObject: ParseObject, index: number) => any, initialValue: any, options?: BatchOptions): Promise<Array<any>>;
    /**
     * Iterates over each result of a query, calling a callback for each one. If
     * the callback returns a promise, the iteration will not continue until
     * that promise has been fulfilled. If the callback returns a rejected
     * promise, then iteration will stop with that error. The items are
     * processed in an unspecified order. The query may not have any sort order,
     * and may not use limit or skip.
     *
     * @param {Function} callback Callback <ul>
     *   <li>currentObject: The current Parse.Object being processed in the array.</li>
     *   <li>index: The index of the current Parse.Object being processed in the array.</li>
     *   <li>query: The query filter was called upon.</li>
     * </ul>
     * @param {object} options Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that will be fulfilled once the
     *     iteration has completed.
     */
    filter(callback: (currentObject: ParseObject, index: number, query: ParseQuery) => boolean, options?: BatchOptions): Promise<Array<ParseObject>>;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be equal to the provided value.
     *
     * @param {string} key The key to check.
     * @param value The value that the Parse.Object must contain.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    equalTo(key: string | {
        [key: string]: any;
    }, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be not equal to the provided value.
     *
     * @param {string} key The key to check.
     * @param value The value that must not be equalled.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    notEqualTo(key: string | {
        [key: string]: any;
    }, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be less than the provided value.
     *
     * @param {string} key The key to check.
     * @param value The value that provides an upper bound.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    lessThan(key: string, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be greater than the provided value.
     *
     * @param {string} key The key to check.
     * @param value The value that provides an lower bound.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    greaterThan(key: string, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be less than or equal to the provided value.
     *
     * @param {string} key The key to check.
     * @param value The value that provides an upper bound.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    lessThanOrEqualTo(key: string, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be greater than or equal to the provided value.
     *
     * @param {string} key The key to check.
     * @param {*} value The value that provides an lower bound.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    greaterThanOrEqualTo(key: string, value: mixed): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be contained in the provided list of values.
     *
     * @param {string} key The key to check.
     * @param {Array<*>} value The values that will match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    containedIn(key: string, value: Array<mixed>): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * not be contained in the provided list of values.
     *
     * @param {string} key The key to check.
     * @param {Array<*>} value The values that will not match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    notContainedIn(key: string, value: Array<mixed>): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * be contained by the provided list of values. Get objects where all array elements match.
     *
     * @param {string} key The key to check.
     * @param {Array} values The values that will match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    containedBy(key: string, values: Array<mixed>): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * contain each one of the provided list of values.
     *
     * @param {string} key The key to check.  This key's value must be an array.
     * @param {Array} values The values that will match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    containsAll(key: string, values: Array<mixed>): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's value to
     * contain each one of the provided list of values starting with given strings.
     *
     * @param {string} key The key to check.  This key's value must be an array.
     * @param {Array<string>} values The string values that will match as starting string.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    containsAllStartingWith(key: string, values: Array<string>): ParseQuery;
    /**
     * Adds a constraint for finding objects that contain the given key.
     *
     * @param {string} key The key that should exist.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    exists(key: string): ParseQuery;
    /**
     * Adds a constraint for finding objects that do not contain a given key.
     *
     * @param {string} key The key that should not exist
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    doesNotExist(key: string): ParseQuery;
    /**
     * Adds a regular expression constraint for finding string values that match
     * the provided regular expression.
     * This may be slow for large datasets.
     *
     * @param {string} key The key that the string to match is stored in.
     * @param {RegExp} regex The regular expression pattern to match.
     * @param {string} modifiers The regular expression mode.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    matches(key: string, regex: RegExp, modifiers: string): ParseQuery;
    /**
     * Adds a constraint that requires that a key's value matches a Parse.Query
     * constraint.
     *
     * @param {string} key The key that the contains the object to match the
     *                     query.
     * @param {Parse.Query} query The query that should match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    matchesQuery(key: string, query: ParseQuery): ParseQuery;
    /**
     * Adds a constraint that requires that a key's value not matches a
     * Parse.Query constraint.
     *
     * @param {string} key The key that the contains the object to match the
     *                     query.
     * @param {Parse.Query} query The query that should not match.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    doesNotMatchQuery(key: string, query: ParseQuery): ParseQuery;
    /**
     * Adds a constraint that requires that a key's value matches a value in
     * an object returned by a different Parse.Query.
     *
     * @param {string} key The key that contains the value that is being
     *                     matched.
     * @param {string} queryKey The key in the objects returned by the query to
     *                          match against.
     * @param {Parse.Query} query The query to run.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    matchesKeyInQuery(key: string, queryKey: string, query: ParseQuery): ParseQuery;
    /**
     * Adds a constraint that requires that a key's value not match a value in
     * an object returned by a different Parse.Query.
     *
     * @param {string} key The key that contains the value that is being
     *                     excluded.
     * @param {string} queryKey The key in the objects returned by the query to
     *                          match against.
     * @param {Parse.Query} query The query to run.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    doesNotMatchKeyInQuery(key: string, queryKey: string, query: ParseQuery): ParseQuery;
    /**
     * Adds a constraint for finding string values that contain a provided
     * string.  This may be slow for large datasets.
     *
     * @param {string} key The key that the string to match is stored in.
     * @param {string} substring The substring that the value must contain.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    contains(key: string, substring: string): ParseQuery;
    /**
     * Adds a constraint for finding string values that contain a provided
     * string. This may be slow for large datasets. Requires Parse-Server > 2.5.0
     *
     * In order to sort you must use select and ascending ($score is required)
     *  <pre>
     *   query.fullText('field', 'term');
     *   query.ascending('$score');
     *   query.select('$score');
     *  </pre>
     *
     * To retrieve the weight / rank
     *  <pre>
     *   object->get('score');
     *  </pre>
     *
     * You can define optionals by providing an object as a third parameter
     *  <pre>
     *   query.fullText('field', 'term', { language: 'es', diacriticSensitive: true });
     *  </pre>
     *
     * @param {string} key The key that the string to match is stored in.
     * @param {string} value The string to search
     * @param {object} options (Optional)
     * @param {string} options.language The language that determines the list of stop words for the search and the rules for the stemmer and tokenizer.
     * @param {boolean} options.caseSensitive A boolean flag to enable or disable case sensitive search.
     * @param {boolean} options.diacriticSensitive A boolean flag to enable or disable diacritic sensitive search.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    fullText(key: string, value: string, options: Object | null): ParseQuery;
    /**
     * Method to sort the full text search by text score
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    sortByTextScore(): Parse.Query;
    /**
     * Adds a constraint for finding string values that start with a provided
     * string.  This query will use the backend index, so it will be fast even
     * for large datasets.
     *
     * @param {string} key The key that the string to match is stored in.
     * @param {string} prefix The substring that the value must start with.
     * @param {string} modifiers The regular expression mode.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    startsWith(key: string, prefix: string, modifiers: string): ParseQuery;
    /**
     * Adds a constraint for finding string values that end with a provided
     * string.  This will be slow for large datasets.
     *
     * @param {string} key The key that the string to match is stored in.
     * @param {string} suffix The substring that the value must end with.
     * @param {string} modifiers The regular expression mode.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    endsWith(key: string, suffix: string, modifiers: string): ParseQuery;
    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given.
     *
     * @param {string} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    near(key: string, point: ParseGeoPoint): ParseQuery;
    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     *
     * @param {string} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {number} maxDistance Maximum distance (in radians) of results to return.
     * @param {boolean} sorted A Bool value that is true if results should be
     * sorted by distance ascending, false is no sorting is required,
     * defaults to true.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withinRadians(key: string, point: ParseGeoPoint, maxDistance: number, sorted: boolean): ParseQuery;
    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     * Radius of earth used is 3958.8 miles.
     *
     * @param {string} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {number} maxDistance Maximum distance (in miles) of results to return.
     * @param {boolean} sorted A Bool value that is true if results should be
     * sorted by distance ascending, false is no sorting is required,
     * defaults to true.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withinMiles(key: string, point: ParseGeoPoint, maxDistance: number, sorted: boolean): ParseQuery;
    /**
     * Adds a proximity based constraint for finding objects with key point
     * values near the point given and within the maximum distance given.
     * Radius of earth used is 6371.0 kilometers.
     *
     * @param {string} key The key that the Parse.GeoPoint is stored in.
     * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
     * @param {number} maxDistance Maximum distance (in kilometers) of results to return.
     * @param {boolean} sorted A Bool value that is true if results should be
     * sorted by distance ascending, false is no sorting is required,
     * defaults to true.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withinKilometers(key: string, point: ParseGeoPoint, maxDistance: number, sorted: boolean): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's
     * coordinates be contained within a given rectangular geographic bounding
     * box.
     *
     * @param {string} key The key to be constrained.
     * @param {Parse.GeoPoint} southwest
     *     The lower-left inclusive corner of the box.
     * @param {Parse.GeoPoint} northeast
     *     The upper-right inclusive corner of the box.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withinGeoBox(key: string, southwest: ParseGeoPoint, northeast: ParseGeoPoint): ParseQuery;
    /**
     * Adds a constraint to the query that requires a particular key's
     * coordinates be contained within and on the bounds of a given polygon.
     * Supports closed and open (last point is connected to first) paths
     *
     * Polygon must have at least 3 points
     *
     * @param {string} key The key to be constrained.
     * @param {Array} points Array of Coordinates / GeoPoints
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withinPolygon(key: string, points: Array<Array<number>>): ParseQuery;
    /**
     * Add a constraint to the query that requires a particular key's
     * coordinates that contains a ParseGeoPoint
     *
     * @param {string} key The key to be constrained.
     * @param {Parse.GeoPoint} point
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    polygonContains(key: string, point: ParseGeoPoint): ParseQuery;
    /**
     * Sorts the results in ascending order by the given key.
     *
     * @param {(string|string[])} keys The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    ascending(...keys: Array<string>): ParseQuery;
    /**
     * Sorts the results in ascending order by the given key,
     * but can also add secondary sort descriptors without overwriting _order.
     *
     * @param {(string|string[])} keys The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    addAscending(...keys: Array<string>): ParseQuery;
    /**
     * Sorts the results in descending order by the given key.
     *
     * @param {(string|string[])} keys The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    descending(...keys: Array<string>): ParseQuery;
    /**
     * Sorts the results in descending order by the given key,
     * but can also add secondary sort descriptors without overwriting _order.
     *
     * @param {(string|string[])} keys The key to order by, which is a
     * string of comma separated values, or an Array of keys, or multiple keys.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    addDescending(...keys: Array<string>): ParseQuery;
    /**
     * Sets the number of results to skip before returning any results.
     * This is useful for pagination.
     * Default is to skip zero results.
     *
     * @param {number} n the number of results to skip.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    skip(n: number): ParseQuery;
    /**
     * Sets the limit of the number of results to return. The default limit is 100.
     *
     * @param {number} n the number of results to limit to.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    limit(n: number): ParseQuery;
    /**
     * Sets the flag to include with response the total number of objects satisfying this query,
     * despite limits/skip. Might be useful for pagination.
     * Note that result of this query will be wrapped as an object with
     * `results`: holding {ParseObject} array and `count`: integer holding total number
     *
     * @param {boolean} includeCount false - disable, true - enable.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    withCount(includeCount?: boolean): ParseQuery;
    /**
     * Includes nested Parse.Objects for the provided key.  You can use dot
     * notation to specify which fields in the included object are also fetched.
     *
     * You can include all nested Parse.Objects by passing in '*'.
     * Requires Parse Server 3.0.0+
     * <pre>query.include('*');</pre>
     *
     * @param {...string|Array<string>} keys The name(s) of the key(s) to include.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    include(...keys: Array<string | Array<string>>): ParseQuery;
    /**
     * Includes all nested Parse.Objects one level deep.
     *
     * Requires Parse Server 3.0.0+
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    includeAll(): ParseQuery;
    /**
     * Restricts the fields of the returned Parse.Objects to include only the
     * provided keys.  If this is called multiple times, then all of the keys
     * specified in each of the calls will be included.
     *
     * @param {...string|Array<string>} keys The name(s) of the key(s) to include.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    select(...keys: Array<string | Array<string>>): ParseQuery;
    /**
     * Restricts the fields of the returned Parse.Objects to all keys except the
     * provided keys. Exclude takes precedence over select and include.
     *
     * Requires Parse Server 3.6.0+
     *
     * @param {...string|Array<string>} keys The name(s) of the key(s) to exclude.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    exclude(...keys: Array<string | Array<string>>): ParseQuery;
    /**
     * Restricts live query to trigger only for watched fields.
     *
     * Requires Parse Server 6.0.0+
     *
     * @param {...string|Array<string>} keys The name(s) of the key(s) to watch.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    watch(...keys: Array<string | Array<string>>): ParseQuery;
    /**
     * Changes the read preference that the backend will use when performing the query to the database.
     *
     * @param {string} readPreference The read preference for the main query.
     * @param {string} includeReadPreference The read preference for the queries to include pointers.
     * @param {string} subqueryReadPreference The read preference for the sub queries.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    readPreference(readPreference: string, includeReadPreference?: string, subqueryReadPreference?: string): ParseQuery;
    /**
     * Subscribe this query to get liveQuery updates
     *
     * @param {string} sessionToken (optional) Defaults to the currentUser
     * @returns {Promise<LiveQuerySubscription>} Returns the liveQuerySubscription, it's an event emitter
     * which can be used to get liveQuery updates.
     */
    subscribe(sessionToken?: string): Promise<LiveQuerySubscription>;
    /**
     * Change the source of this query to the server.
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    fromNetwork(): ParseQuery;
    /**
     * Changes the source of this query to all pinned objects.
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    fromLocalDatastore(): ParseQuery;
    /**
     * Changes the source of this query to the default group of pinned objects.
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    fromPin(): ParseQuery;
    /**
     * Changes the source of this query to a specific group of pinned objects.
     *
     * @param {string} name The name of query source.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    fromPinWithName(name?: string): ParseQuery;
    /**
     * Cancels the current network request (if any is running).
     *
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    cancel(): ParseQuery;
    _setRequestTask(options: any): void;
    /**
     * Sets a comment to the query so that the query 
     * can be identified when using a the profiler for MongoDB.
     *
     * @param {string} value a comment can make your profile data easier to interpret and trace.
     * @returns {Parse.Query} Returns the query, so you can chain this call.
     */
    comment(value: string): ParseQuery;
}
import { FullOptions } from './RESTController';
import ParseObject from './ParseObject';
type BatchOptions = FullOptions & {
    batchSize?: number;
};
import ParseGeoPoint from './ParseGeoPoint';
import LiveQuerySubscription from './LiveQuerySubscription';
