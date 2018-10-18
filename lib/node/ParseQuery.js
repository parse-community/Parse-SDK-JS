"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _encode = _interopRequireDefault(require("./encode"));

var _promiseUtils = require("./promiseUtils");

var _ParseError = _interopRequireDefault(require("./ParseError"));

var _ParseGeoPoint = _interopRequireDefault(require("./ParseGeoPoint"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
/*
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

/**
 * Converts a string into a regex that matches it.
 * Surrounding with \Q .. \E does this, we just need to escape any \E's in
 * the text separately.
 * @private
 */


function quote(s
/*: string*/
) {
  return '\\Q' + s.replace('\\E', '\\E\\\\E\\Q') + '\\E';
}
/**
 * Extracts the class name from queries. If not all queries have the same
 * class name an error will be thrown.
 */


function _getClassNameFromQueries(queries
/*: Array<ParseQuery>*/
)
/*: string*/
{
  var className = null;
  queries.forEach(q => {
    if (!className) {
      className = q.className;
    }

    if (className !== q.className) {
      throw new Error('All queries must be for the same class.');
    }
  });
  return className;
}
/*
 * Handles pre-populating the result data of a query with select fields,
 * making sure that the data object contains keys for all objects that have
 * been requested with a select, so that our cached state updates correctly.
 */


function handleSelectResult(data
/*: any*/
, select
/*: Array<string>*/
) {
  var serverDataMask = {};
  select.forEach(field => {
    const hasSubObjectSelect = field.indexOf(".") !== -1;

    if (!hasSubObjectSelect && !data.hasOwnProperty(field)) {
      // this field was selected, but is missing from the retrieved data
      data[field] = undefined;
    } else if (hasSubObjectSelect) {
      // this field references a sub-object,
      // so we need to walk down the path components
      const pathComponents = field.split(".");
      var obj = data;
      var serverMask = serverDataMask;
      pathComponents.forEach((component, index, arr) => {
        // add keys if the expected data is missing
        if (obj && !obj.hasOwnProperty(component)) {
          obj[component] = undefined;
        }

        if (obj !== undefined) {
          obj = obj[component];
        } //add this path component to the server mask so we can fill it in later if needed


        if (index < arr.length - 1) {
          if (!serverMask[component]) {
            serverMask[component] = {};
          }

          serverMask = serverMask[component];
        }
      });
    }
  });

  if (Object.keys(serverDataMask).length > 0) {
    // When selecting from sub-objects, we don't want to blow away the missing
    // information that we may have retrieved before. We've already added any
    // missing selected keys to sub-objects, but we still need to add in the
    // data for any previously retrieved sub-objects that were not selected.
    const serverData = _CoreManager.default.getObjectStateController().getServerData({
      id: data.objectId,
      className: data.className
    });

    copyMissingDataWithMask(serverData, data, serverDataMask, false);
  }
}

function copyMissingDataWithMask(src, dest, mask, copyThisLevel) {
  //copy missing elements at this level
  if (copyThisLevel) {
    for (const key in src) {
      if (src.hasOwnProperty(key) && !dest.hasOwnProperty(key)) {
        dest[key] = src[key];
      }
    }
  }

  for (const key in mask) {
    if (dest[key] !== undefined && dest[key] !== null && src !== undefined && src !== null) {
      //traverse into objects as needed
      copyMissingDataWithMask(src[key], dest[key], mask[key], true);
    }
  }
}
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
 * @alias Parse.Query
 */


class ParseQuery {
  /*:: className: string;*/

  /*:: _where: any;*/

  /*:: _include: Array<string>;*/

  /*:: _select: Array<string>;*/

  /*:: _limit: number;*/

  /*:: _skip: number;*/

  /*:: _order: Array<string>;*/

  /*:: _extraOptions: { [key: string]: mixed };*/

  /**
   * @property className
   * @type String
   */

  /**
   * @param {(String|Parse.Object)} objectClass An instance of a subclass of Parse.Object, or a Parse className string.
   */
  constructor(objectClass
  /*: string | ParseObject*/
  ) {
    if (typeof objectClass === 'string') {
      if (objectClass === 'User' && _CoreManager.default.get('PERFORM_USER_REWRITE')) {
        this.className = '_User';
      } else {
        this.className = objectClass;
      }
    } else if (objectClass instanceof _ParseObject.default) {
      this.className = objectClass.className;
    } else if (typeof objectClass === 'function') {
      if (typeof objectClass.className === 'string') {
        this.className = objectClass.className;
      } else {
        var obj = new objectClass();
        this.className = obj.className;
      }
    } else {
      throw new TypeError('A ParseQuery must be constructed with a ParseObject or class name.');
    }

    this._where = {};
    this._include = [];
    this._limit = -1; // negative limit is not sent in the server request

    this._skip = 0;
    this._extraOptions = {};
  }
  /**
   * Adds constraint that at least one of the passed in queries matches.
   * @param {Array} queries
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  _orQuery(queries
  /*: Array<ParseQuery>*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = queries.map(q => {
      return q.toJSON().where;
    });
    this._where.$or = queryJSON;
    return this;
  }
  /**
   * Adds constraint that all of the passed in queries match.
   * @param {Array} queries
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  _andQuery(queries
  /*: Array<ParseQuery>*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = queries.map(q => {
      return q.toJSON().where;
    });
    this._where.$and = queryJSON;
    return this;
  }
  /**
   * Adds constraint that none of the passed in queries match.
   * @param {Array} queries
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  _norQuery(queries
  /*: Array<ParseQuery>*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = queries.map(q => {
      return q.toJSON().where;
    });
    this._where.$nor = queryJSON;
    return this;
  }
  /**
   * Helper for condition queries
   */


  _addCondition(key
  /*: string*/
  , condition
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    if (!this._where[key] || typeof this._where[key] === 'string') {
      this._where[key] = {};
    }

    this._where[key][condition] = (0, _encode.default)(value, false, true);
    return this;
  }
  /**
   * Converts string for regular expression at the beginning
   */


  _regexStartWith(string
  /*: string*/
  )
  /*: String*/
  {
    return '^' + quote(string);
  }
  /**
   * Returns a JSON representation of this query.
   * @return {Object} The JSON representation of the query.
   */


  toJSON()
  /*: QueryJSON*/
  {
    var params
    /*: QueryJSON*/
    = {
      where: this._where
    };

    if (this._include.length) {
      params.include = this._include.join(',');
    }

    if (this._select) {
      params.keys = this._select.join(',');
    }

    if (this._limit >= 0) {
      params.limit = this._limit;
    }

    if (this._skip > 0) {
      params.skip = this._skip;
    }

    if (this._order) {
      params.order = this._order.join(',');
    }

    for (var key in this._extraOptions) {
      params[key] = this._extraOptions[key];
    }

    return params;
  }
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
   * @param {QueryJSON} json from Parse.Query.toJSON() method
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withJSON(json
  /*: QueryJSON*/
  )
  /*: ParseQuery*/
  {
    if (json.where) {
      this._where = json.where;
    }

    if (json.include) {
      this._include = json.include.split(",");
    }

    if (json.keys) {
      this._select = json.keys.split(",");
    }

    if (json.limit) {
      this._limit = json.limit;
    }

    if (json.skip) {
      this._skip = json.skip;
    }

    if (json.order) {
      this._order = json.order.split(",");
    }

    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if (["where", "include", "keys", "limit", "skip", "order"].indexOf(key) === -1) {
          this._extraOptions[key] = json[key];
        }
      }
    }

    return this;
  }
  /**
     * Static method to restore Parse.Query by json representation
     * Internally calling Parse.Query.withJSON
     * @param {String} className
     * @param {QueryJSON} json from Parse.Query.toJSON() method
     * @returns {Parse.Query} new created query
     */


  static fromJSON(className
  /*: string*/
  , json
  /*: QueryJSON*/
  )
  /*: ParseQuery*/
  {
    const query = new ParseQuery(className);
    return query.withJSON(json);
  }
  /**
   * Constructs a Parse.Object whose id is already known by fetching data from
   * the server.  Either options.success or options.error is called when the
   * find completes. Unlike the <code>first</code> method, it never returns undefined.
   *
   * @param {String} objectId The id of the object to be fetched.
   * @param {Object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the result when
   * the query completes.
   */


  get(objectId
  /*: string*/
  , options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    this.equalTo('objectId', objectId);
    var firstOptions = {};

    if (options && options.hasOwnProperty('useMasterKey')) {
      firstOptions.useMasterKey = options.useMasterKey;
    }

    if (options && options.hasOwnProperty('sessionToken')) {
      firstOptions.sessionToken = options.sessionToken;
    }

    return this.first(firstOptions).then(response => {
      if (response) {
        return response;
      }

      var errorObject = new _ParseError.default(_ParseError.default.OBJECT_NOT_FOUND, 'Object not found.');
      return Promise.reject(errorObject);
    });
  }
  /**
   * Retrieves a list of ParseObjects that satisfy this query.
   * Either options.success or options.error is called when the find
   * completes.
   *
   * @param {Object} options Valid options
   * are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the results when
   * the query completes.
   */


  find(options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    options = options || {};
    const findOptions = {};

    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }

    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    const controller = _CoreManager.default.getQueryController();

    const select = this._select;
    return controller.find(this.className, this.toJSON(), findOptions).then(response => {
      return response.results.map(data => {
        // In cases of relations, the server may send back a className
        // on the top level of the payload
        const override = response.className || this.className;

        if (!data.className) {
          data.className = override;
        } // Make sure the data object contains keys for all objects that
        // have been requested with a select, so that our cached state
        // updates correctly.


        if (select) {
          handleSelectResult(data, select);
        }

        return _ParseObject.default.fromJSON(data, !select);
      });
    });
  }
  /**
   * Counts the number of objects that match this query.
   * Either options.success or options.error is called when the count
   * completes.
   *
   * @param {Object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the count when
   * the query completes.
   */


  count(options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    options = options || {};
    var findOptions = {};

    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }

    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var controller = _CoreManager.default.getQueryController();

    var params = this.toJSON();
    params.limit = 0;
    params.count = 1;
    return controller.find(this.className, params, findOptions).then(result => {
      return result.count;
    });
  }
  /**
   * Executes a distinct query and returns unique values
   *
   * @param {String} key A field to find distinct values
   * @param {Object} options
   * Valid options are:<ul>
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the query completes.
   */


  distinct(key
  /*: string*/
  , options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    options = options || {};
    const distinctOptions = {
      useMasterKey: true
    };

    if (options.hasOwnProperty('sessionToken')) {
      distinctOptions.sessionToken = options.sessionToken;
    }

    const controller = _CoreManager.default.getQueryController();

    const params = {
      distinct: key,
      where: this._where
    };
    return controller.aggregate(this.className, params, distinctOptions).then(results => {
      return results.results;
    });
  }
  /**
   * Executes an aggregate query and returns aggregate results
   *
   * @param {Mixed} pipeline Array or Object of stages to process query
   * @param {Object} options Valid options are:<ul>
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the query completes.
   */


  aggregate(pipeline
  /*: mixed*/
  , options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    options = options || {};
    const aggregateOptions = {
      useMasterKey: true
    };

    if (options.hasOwnProperty('sessionToken')) {
      aggregateOptions.sessionToken = options.sessionToken;
    }

    const controller = _CoreManager.default.getQueryController();

    if (!Array.isArray(pipeline) && typeof pipeline !== 'object') {
      throw new Error('Invalid pipeline must be Array or Object');
    }

    return controller.aggregate(this.className, {
      pipeline
    }, aggregateOptions).then(results => {
      return results.results;
    });
  }
  /**
   * Retrieves at most one Parse.Object that satisfies this query.
   *
   * Either options.success or options.error is called when it completes.
   * success is passed the object if there is one. otherwise, undefined.
   *
   * @param {Object} options Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   *
   * @return {Promise} A promise that is resolved with the object when
   * the query completes.
   */


  first(options
  /*:: ?: FullOptions*/
  )
  /*: Promise*/
  {
    options = options || {};
    var findOptions = {};

    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }

    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var controller = _CoreManager.default.getQueryController();

    var params = this.toJSON();
    params.limit = 1;
    var select = this._select;
    return controller.find(this.className, params, findOptions).then(response => {
      var objects = response.results;

      if (!objects[0]) {
        return undefined;
      }

      if (!objects[0].className) {
        objects[0].className = this.className;
      } // Make sure the data object contains keys for all objects that
      // have been requested with a select, so that our cached state
      // updates correctly.


      if (select) {
        handleSelectResult(objects[0], select);
      }

      return _ParseObject.default.fromJSON(objects[0], !select);
    });
  }
  /**
   * Iterates over each result of a query, calling a callback for each one. If
   * the callback returns a promise, the iteration will not continue until
   * that promise has been fulfilled. If the callback returns a rejected
   * promise, then iteration will stop with that error. The items are
   * processed in an unspecified order. The query may not have any sort order,
   * and may not use limit or skip.
   * @param {Function} callback Callback that will be called with each result
   *     of the query.
   * @param {Object} options Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   *   <li>sessionToken: A valid session token, used for making a request on
   *       behalf of a specific user.
   * </ul>
   * @return {Promise} A promise that will be fulfilled once the
   *     iteration has completed.
   */


  each(callback
  /*: (obj: ParseObject) => any*/
  , options
  /*:: ?: BatchOptions*/
  )
  /*: Promise*/
  {
    options = options || {};

    if (this._order || this._skip || this._limit >= 0) {
      return Promise.reject('Cannot iterate on a query with sort, skip, or limit.');
    }

    var query = new ParseQuery(this.className); // We can override the batch size from the options.
    // This is undocumented, but useful for testing.

    query._limit = options.batchSize || 100;
    query._include = this._include.map(i => {
      return i;
    });

    if (this._select) {
      query._select = this._select.map(s => {
        return s;
      });
    }

    query._where = {};

    for (var attr in this._where) {
      var val = this._where[attr];

      if (Array.isArray(val)) {
        query._where[attr] = val.map(v => {
          return v;
        });
      } else if (val && typeof val === 'object') {
        var conditionMap = {};
        query._where[attr] = conditionMap;

        for (var cond in val) {
          conditionMap[cond] = val[cond];
        }
      } else {
        query._where[attr] = val;
      }
    }

    query.ascending('objectId');
    var findOptions = {};

    if (options.hasOwnProperty('useMasterKey')) {
      findOptions.useMasterKey = options.useMasterKey;
    }

    if (options.hasOwnProperty('sessionToken')) {
      findOptions.sessionToken = options.sessionToken;
    }

    var finished = false;
    return (0, _promiseUtils.continueWhile)(() => {
      return !finished;
    }, () => {
      return query.find(findOptions).then(results => {
        var callbacksDone = Promise.resolve();
        results.forEach(result => {
          callbacksDone = callbacksDone.then(() => {
            return callback(result);
          });
        });
        return callbacksDone.then(() => {
          if (results.length >= query._limit) {
            query.greaterThan('objectId', results[results.length - 1].id);
          } else {
            finished = true;
          }
        });
      });
    });
  }
  /** Query Conditions **/

  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be equal to the provided value.
   * @param {String} key The key to check.
   * @param value The value that the Parse.Object must contain.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  equalTo(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    if (typeof value === 'undefined') {
      return this.doesNotExist(key);
    }

    this._where[key] = (0, _encode.default)(value, false, true);
    return this;
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be not equal to the provided value.
   * @param {String} key The key to check.
   * @param value The value that must not be equalled.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  notEqualTo(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$ne', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be less than the provided value.
   * @param {String} key The key to check.
   * @param value The value that provides an upper bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  lessThan(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$lt', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be greater than the provided value.
   * @param {String} key The key to check.
   * @param value The value that provides an lower bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  greaterThan(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$gt', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be less than or equal to the provided value.
   * @param {String} key The key to check.
   * @param value The value that provides an upper bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  lessThanOrEqualTo(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$lte', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be greater than or equal to the provided value.
   * @param {String} key The key to check.
   * @param value The value that provides an lower bound.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  greaterThanOrEqualTo(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$gte', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be contained in the provided list of values.
   * @param {String} key The key to check.
   * @param {Array} values The values that will match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  containedIn(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$in', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * not be contained in the provided list of values.
   * @param {String} key The key to check.
   * @param {Array} values The values that will not match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  notContainedIn(key
  /*: string*/
  , value
  /*: mixed*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$nin', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * be contained by the provided list of values. Get objects where all array elements match.
   * @param {String} key The key to check.
   * @param {Array} values The values that will match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  containedBy(key
  /*: string*/
  , value
  /*: Array<mixed>*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$containedBy', value);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * contain each one of the provided list of values.
   * @param {String} key The key to check.  This key's value must be an array.
   * @param {Array} values The values that will match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  containsAll(key
  /*: string*/
  , values
  /*: Array<mixed>*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$all', values);
  }
  /**
   * Adds a constraint to the query that requires a particular key's value to
   * contain each one of the provided list of values starting with given strings.
   * @param {String} key The key to check.  This key's value must be an array.
   * @param {Array<String>} values The string values that will match as starting string.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  containsAllStartingWith(key
  /*: string*/
  , values
  /*: Array<string>*/
  )
  /*: ParseQuery*/
  {
    var _this = this;

    if (!Array.isArray(values)) {
      values = [values];
    }

    values = values.map(function (value) {
      return {
        "$regex": _this._regexStartWith(value)
      };
    });
    return this.containsAll(key, values);
  }
  /**
   * Adds a constraint for finding objects that contain the given key.
   * @param {String} key The key that should exist.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  exists(key
  /*: string*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$exists', true);
  }
  /**
   * Adds a constraint for finding objects that do not contain a given key.
   * @param {String} key The key that should not exist
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  doesNotExist(key
  /*: string*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$exists', false);
  }
  /**
   * Adds a regular expression constraint for finding string values that match
   * the provided regular expression.
   * This may be slow for large datasets.
   * @param {String} key The key that the string to match is stored in.
   * @param {RegExp} regex The regular expression pattern to match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  matches(key
  /*: string*/
  , regex
  /*: RegExp*/
  , modifiers
  /*: string*/
  )
  /*: ParseQuery*/
  {
    this._addCondition(key, '$regex', regex);

    if (!modifiers) {
      modifiers = '';
    }

    if (regex.ignoreCase) {
      modifiers += 'i';
    }

    if (regex.multiline) {
      modifiers += 'm';
    }

    if (modifiers.length) {
      this._addCondition(key, '$options', modifiers);
    }

    return this;
  }
  /**
   * Adds a constraint that requires that a key's value matches a Parse.Query
   * constraint.
   * @param {String} key The key that the contains the object to match the
   *                     query.
   * @param {Parse.Query} query The query that should match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  matchesQuery(key
  /*: string*/
  , query
  /*: ParseQuery*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$inQuery', queryJSON);
  }
  /**
   * Adds a constraint that requires that a key's value not matches a
   * Parse.Query constraint.
   * @param {String} key The key that the contains the object to match the
   *                     query.
   * @param {Parse.Query} query The query that should not match.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  doesNotMatchQuery(key
  /*: string*/
  , query
  /*: ParseQuery*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$notInQuery', queryJSON);
  }
  /**
   * Adds a constraint that requires that a key's value matches a value in
   * an object returned by a different Parse.Query.
   * @param {String} key The key that contains the value that is being
   *                     matched.
   * @param {String} queryKey The key in the objects returned by the query to
   *                          match against.
   * @param {Parse.Query} query The query to run.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  matchesKeyInQuery(key
  /*: string*/
  , queryKey
  /*: string*/
  , query
  /*: ParseQuery*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$select', {
      key: queryKey,
      query: queryJSON
    });
  }
  /**
   * Adds a constraint that requires that a key's value not match a value in
   * an object returned by a different Parse.Query.
   * @param {String} key The key that contains the value that is being
   *                     excluded.
   * @param {String} queryKey The key in the objects returned by the query to
   *                          match against.
   * @param {Parse.Query} query The query to run.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  doesNotMatchKeyInQuery(key
  /*: string*/
  , queryKey
  /*: string*/
  , query
  /*: ParseQuery*/
  )
  /*: ParseQuery*/
  {
    var queryJSON = query.toJSON();
    queryJSON.className = query.className;
    return this._addCondition(key, '$dontSelect', {
      key: queryKey,
      query: queryJSON
    });
  }
  /**
   * Adds a constraint for finding string values that contain a provided
   * string.  This may be slow for large datasets.
   * @param {String} key The key that the string to match is stored in.
   * @param {String} substring The substring that the value must contain.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  contains(key
  /*: string*/
  , value
  /*: string*/
  )
  /*: ParseQuery*/
  {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }

    return this._addCondition(key, '$regex', quote(value));
  }
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
  * @param {String} key The key that the string to match is stored in.
  * @param {String} value The string to search
  * @param {Object} options (Optional)
  * @param {String} options.language The language that determines the list of stop words for the search and the rules for the stemmer and tokenizer.
  * @param {Boolean} options.caseSensitive A boolean flag to enable or disable case sensitive search.
  * @param {Boolean} options.diacriticSensitive A boolean flag to enable or disable diacritic sensitive search.
  * @return {Parse.Query} Returns the query, so you can chain this call.
  */


  fullText(key
  /*: string*/
  , value
  /*: string*/
  , options
  /*: ?Object*/
  )
  /*: ParseQuery*/
  {
    options = options || {};

    if (!key) {
      throw new Error('A key is required.');
    }

    if (!value) {
      throw new Error('A search term is required');
    }

    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }

    const fullOptions = {
      $term: value
    };

    for (const option in options) {
      switch (option) {
        case 'language':
          fullOptions.$language = options[option];
          break;

        case 'caseSensitive':
          fullOptions.$caseSensitive = options[option];
          break;

        case 'diacriticSensitive':
          fullOptions.$diacriticSensitive = options[option];
          break;

        default:
          throw new Error(`Unknown option: ${option}`);
      }
    }

    return this._addCondition(key, '$text', {
      $search: fullOptions
    });
  }
  /**
   * Method to sort the full text search by text score
   *
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  sortByTextScore() {
    this.ascending('$score');
    this.select(['$score']);
    return this;
  }
  /**
   * Adds a constraint for finding string values that start with a provided
   * string.  This query will use the backend index, so it will be fast even
   * for large datasets.
   * @param {String} key The key that the string to match is stored in.
   * @param {String} prefix The substring that the value must start with.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  startsWith(key
  /*: string*/
  , value
  /*: string*/
  )
  /*: ParseQuery*/
  {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }

    return this._addCondition(key, '$regex', this._regexStartWith(value));
  }
  /**
   * Adds a constraint for finding string values that end with a provided
   * string.  This will be slow for large datasets.
   * @param {String} key The key that the string to match is stored in.
   * @param {String} suffix The substring that the value must end with.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  endsWith(key
  /*: string*/
  , value
  /*: string*/
  )
  /*: ParseQuery*/
  {
    if (typeof value !== 'string') {
      throw new Error('The value being searched for must be a string.');
    }

    return this._addCondition(key, '$regex', quote(value) + '$');
  }
  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given.
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  near(key
  /*: string*/
  , point
  /*: ParseGeoPoint*/
  )
  /*: ParseQuery*/
  {
    if (!(point instanceof _ParseGeoPoint.default)) {
      // Try to cast it as a GeoPoint
      point = new _ParseGeoPoint.default(point);
    }

    return this._addCondition(key, '$nearSphere', point);
  }
  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in radians) of results to
   *   return.
   * @param {Boolean} sorted A Bool value that is true if results should be
   *   sorted by distance ascending, false is no sorting is required,
   *   defaults to true.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withinRadians(key
  /*: string*/
  , point
  /*: ParseGeoPoint*/
  , distance
  /*: number*/
  , sorted
  /*: boolean*/
  )
  /*: ParseQuery*/
  {
    if (sorted || sorted === undefined) {
      this.near(key, point);
      return this._addCondition(key, '$maxDistance', distance);
    } else {
      return this._addCondition(key, '$geoWithin', {
        '$centerSphere': [[point.longitude, point.latitude], distance]
      });
    }
  }
  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * Radius of earth used is 3958.8 miles.
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in miles) of results to
   *   return.
   * @param {Boolean} sorted A Bool value that is true if results should be
   *   sorted by distance ascending, false is no sorting is required,
   *   defaults to true.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withinMiles(key
  /*: string*/
  , point
  /*: ParseGeoPoint*/
  , distance
  /*: number*/
  , sorted
  /*: boolean*/
  )
  /*: ParseQuery*/
  {
    return this.withinRadians(key, point, distance / 3958.8, sorted);
  }
  /**
   * Adds a proximity based constraint for finding objects with key point
   * values near the point given and within the maximum distance given.
   * Radius of earth used is 6371.0 kilometers.
   * @param {String} key The key that the Parse.GeoPoint is stored in.
   * @param {Parse.GeoPoint} point The reference Parse.GeoPoint that is used.
   * @param {Number} maxDistance Maximum distance (in kilometers) of results
   *   to return.
   * @param {Boolean} sorted A Bool value that is true if results should be
   *   sorted by distance ascending, false is no sorting is required,
   *   defaults to true.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withinKilometers(key
  /*: string*/
  , point
  /*: ParseGeoPoint*/
  , distance
  /*: number*/
  , sorted
  /*: boolean*/
  )
  /*: ParseQuery*/
  {
    return this.withinRadians(key, point, distance / 6371.0, sorted);
  }
  /**
   * Adds a constraint to the query that requires a particular key's
   * coordinates be contained within a given rectangular geographic bounding
   * box.
   * @param {String} key The key to be constrained.
   * @param {Parse.GeoPoint} southwest
   *     The lower-left inclusive corner of the box.
   * @param {Parse.GeoPoint} northeast
   *     The upper-right inclusive corner of the box.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withinGeoBox(key
  /*: string*/
  , southwest
  /*: ParseGeoPoint*/
  , northeast
  /*: ParseGeoPoint*/
  )
  /*: ParseQuery*/
  {
    if (!(southwest instanceof _ParseGeoPoint.default)) {
      southwest = new _ParseGeoPoint.default(southwest);
    }

    if (!(northeast instanceof _ParseGeoPoint.default)) {
      northeast = new _ParseGeoPoint.default(northeast);
    }

    this._addCondition(key, '$within', {
      '$box': [southwest, northeast]
    });

    return this;
  }
  /**
   * Adds a constraint to the query that requires a particular key's
   * coordinates be contained within and on the bounds of a given polygon.
   * Supports closed and open (last point is connected to first) paths
   *
   * Polygon must have at least 3 points
   *
   * @param {String} key The key to be constrained.
   * @param {Array} array of geopoints
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  withinPolygon(key
  /*: string*/
  , points
  /*: Array*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$geoWithin', {
      '$polygon': points
    });
  }
  /**
   * Add a constraint to the query that requires a particular key's
   * coordinates that contains a ParseGeoPoint
   *
   * @param {String} key The key to be constrained.
   * @param {Parse.GeoPoint} GeoPoint
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  polygonContains(key
  /*: string*/
  , point
  /*: ParseGeoPoint*/
  )
  /*: ParseQuery*/
  {
    return this._addCondition(key, '$geoIntersects', {
      '$point': point
    });
  }
  /** Query Orderings **/

  /**
   * Sorts the results in ascending order by the given key.
   *
   * @param {(String|String[]|...String)} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  ascending(...keys)
  /*: ParseQuery*/
  {
    this._order = [];
    return this.addAscending.apply(this, keys);
  }
  /**
   * Sorts the results in ascending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order.
   *
   * @param {(String|String[]|...String)} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  addAscending(...keys)
  /*: ParseQuery*/
  {
    if (!this._order) {
      this._order = [];
    }

    keys.forEach(key => {
      if (Array.isArray(key)) {
        key = key.join();
      }

      this._order = this._order.concat(key.replace(/\s/g, '').split(','));
    });
    return this;
  }
  /**
   * Sorts the results in descending order by the given key.
   *
   * @param {(String|String[]|...String)} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  descending(...keys)
  /*: ParseQuery*/
  {
    this._order = [];
    return this.addDescending.apply(this, keys);
  }
  /**
   * Sorts the results in descending order by the given key,
   * but can also add secondary sort descriptors without overwriting _order.
   *
   * @param {(String|String[]|...String)} key The key to order by, which is a
   * string of comma separated values, or an Array of keys, or multiple keys.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  addDescending(...keys)
  /*: ParseQuery*/
  {
    if (!this._order) {
      this._order = [];
    }

    keys.forEach(key => {
      if (Array.isArray(key)) {
        key = key.join();
      }

      this._order = this._order.concat(key.replace(/\s/g, '').split(',').map(k => {
        return '-' + k;
      }));
    });
    return this;
  }
  /** Query Options **/

  /**
   * Sets the number of results to skip before returning any results.
   * This is useful for pagination.
   * Default is to skip zero results.
   * @param {Number} n the number of results to skip.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  skip(n
  /*: number*/
  )
  /*: ParseQuery*/
  {
    if (typeof n !== 'number' || n < 0) {
      throw new Error('You can only skip by a positive number');
    }

    this._skip = n;
    return this;
  }
  /**
   * Sets the limit of the number of results to return. The default limit is
   * 100, with a maximum of 1000 results being returned at a time.
   * @param {Number} n the number of results to limit to.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  limit(n
  /*: number*/
  )
  /*: ParseQuery*/
  {
    if (typeof n !== 'number') {
      throw new Error('You can only set the limit to a numeric value');
    }

    this._limit = n;
    return this;
  }
  /**
   * Includes nested Parse.Objects for the provided key.  You can use dot
   * notation to specify which fields in the included object are also fetched.
   *
   * You can include all nested Parse.Objects by passing in '*'.
   * Requires Parse Server 3.0.0+
   * <pre>query.include('*');</pre>
   *
   * @param {...String|Array<String>} key The name(s) of the key(s) to include.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  include(...keys)
  /*: ParseQuery*/
  {
    keys.forEach(key => {
      if (Array.isArray(key)) {
        this._include = this._include.concat(key);
      } else {
        this._include.push(key);
      }
    });
    return this;
  }
  /**
   * Includes all nested Parse.Objects.
   *
   * Requires Parse Server 3.0.0+
   *
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  includeAll()
  /*: ParseQuery*/
  {
    return this.include('*');
  }
  /**
   * Restricts the fields of the returned Parse.Objects to include only the
   * provided keys.  If this is called multiple times, then all of the keys
   * specified in each of the calls will be included.
   * @param {...String|Array<String>} keys The name(s) of the key(s) to include.
   * @return {Parse.Query} Returns the query, so you can chain this call.
   */


  select(...keys)
  /*: ParseQuery*/
  {
    if (!this._select) {
      this._select = [];
    }

    keys.forEach(key => {
      if (Array.isArray(key)) {
        this._select = this._select.concat(key);
      } else {
        this._select.push(key);
      }
    });
    return this;
  }
  /**
   * Subscribe this query to get liveQuery updates
   * @return {LiveQuerySubscription} Returns the liveQuerySubscription, it's an event emitter
   * which can be used to get liveQuery updates.
   */


  subscribe()
  /*: any*/
  {
    const controller = _CoreManager.default.getLiveQueryController();

    return controller.subscribe(this);
  }
  /**
   * Constructs a Parse.Query that is the OR of the passed in queries.  For
   * example:
   * <pre>var compoundQuery = Parse.Query.or(query1, query2, query3);</pre>
   *
   * will create a compoundQuery that is an or of the query1, query2, and
   * query3.
   * @param {...Parse.Query} var_args The list of queries to OR.
   * @static
   * @return {Parse.Query} The query that is the OR of the passed in queries.
   */


  static or(...queries)
  /*: ParseQuery*/
  {
    var className = _getClassNameFromQueries(queries);

    var query = new ParseQuery(className);

    query._orQuery(queries);

    return query;
  }
  /**
   * Constructs a Parse.Query that is the AND of the passed in queries.  For
   * example:
   * <pre>var compoundQuery = Parse.Query.and(query1, query2, query3);</pre>
   *
   * will create a compoundQuery that is an and of the query1, query2, and
   * query3.
   * @param {...Parse.Query} var_args The list of queries to AND.
   * @static
   * @return {Parse.Query} The query that is the AND of the passed in queries.
   */


  static and(...queries)
  /*: ParseQuery*/
  {
    var className = _getClassNameFromQueries(queries);

    var query = new ParseQuery(className);

    query._andQuery(queries);

    return query;
  }
  /**
   * Constructs a Parse.Query that is the NOR of the passed in queries.  For
   * example:
   * <pre>const compoundQuery = Parse.Query.nor(query1, query2, query3);</pre>
   *
   * will create a compoundQuery that is a nor of the query1, query2, and
   * query3.
   * @param {...Parse.Query} var_args The list of queries to NOR.
   * @static
   * @return {Parse.Query} The query that is the NOR of the passed in queries.
   */


  static nor(...queries)
  /*: ParseQuery*/
  {
    const className = _getClassNameFromQueries(queries);

    const query = new ParseQuery(className);

    query._norQuery(queries);

    return query;
  }

}

var DefaultController = {
  find(className
  /*: string*/
  , params
  /*: QueryJSON*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('GET', 'classes/' + className, params, options);
  },

  aggregate(className
  /*: string*/
  , params
  /*: any*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    const RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('GET', 'aggregate/' + className, params, options);
  }

};

_CoreManager.default.setQueryController(DefaultController);

var _default = ParseQuery;
exports.default = _default;