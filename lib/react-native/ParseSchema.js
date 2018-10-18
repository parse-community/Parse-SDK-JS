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
import CoreManager from './CoreManager';
/*:: import type { RequestOptions, FullOptions } from './RESTController';*/

const FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'File', 'GeoPoint', 'Polygon', 'Array', 'Object', 'Pointer', 'Relation'];
/**
 * A Parse.Schema object is for handling schema data from Parse.
 * <p>All the schemas methods require MasterKey.
 *
 * <pre>
 * const schema = new Parse.Schema('MyClass');
 * schema.addString('field');
 * schema.addIndex('index_name', {'field', 1});
 * schema.save();
 * </pre>
 * </p>
 * @alias Parse.Schema
 */

class ParseSchema {
  /*:: className: string;*/

  /*:: _fields: { [key: string]: mixed };*/

  /*:: _indexes: { [key: string]: mixed };*/

  /**
   * @param {String} className Parse Class string.
   */
  constructor(className
  /*: string*/
  ) {
    if (typeof className === 'string') {
      if (className === 'User' && CoreManager.get('PERFORM_USER_REWRITE')) {
        this.className = '_User';
      } else {
        this.className = className;
      }
    }

    this._fields = {};
    this._indexes = {};
  }
  /**
   * Static method to get all schemas
   *
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


  static all(options
  /*: FullOptions*/
  ) {
    options = options || {};
    const controller = CoreManager.getSchemaController();
    return controller.get('', options).then(response => {
      if (response.results.length === 0) {
        throw new Error('Schema not found.');
      }

      return response.results;
    });
  }
  /**
   * Get the Schema from Parse
   *
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


  get(options
  /*: FullOptions*/
  ) {
    this.assertClassName();
    options = options || {};
    const controller = CoreManager.getSchemaController();
    return controller.get(this.className, options).then(response => {
      if (!response) {
        throw new Error('Schema not found.');
      }

      return response;
    });
  }
  /**
   * Create a new Schema on Parse
   *
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


  save(options
  /*: FullOptions*/
  ) {
    this.assertClassName();
    options = options || {};
    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes
    };
    return controller.create(this.className, params, options).then(response => {
      return response;
    });
  }
  /**
   * Update a Schema on Parse
   *
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


  update(options
  /*: FullOptions*/
  ) {
    this.assertClassName();
    options = options || {};
    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes
    };
    this._fields = {};
    this._indexes = {};
    return controller.update(this.className, params, options).then(response => {
      return response;
    });
  }
  /**
   * Removing a Schema from Parse
   * Can only be used on Schema without objects
   *
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


  delete(options
  /*: FullOptions*/
  ) {
    this.assertClassName();
    options = options || {};
    const controller = CoreManager.getSchemaController();
    return controller.delete(this.className, options).then(response => {
      return response;
    });
  }
  /**
   * Removes all objects from a Schema (class) in Parse.
   * EXERCISE CAUTION, running this will delete all objects for this schema and cannot be reversed
   * @return {Promise} A promise that is resolved with the result when
   * the query completes.
   */


  purge() {
    this.assertClassName();
    const controller = CoreManager.getSchemaController();
    return controller.purge(this.className).then(response => {
      return response;
    });
  }
  /**
   * Assert if ClassName has been filled
   * @private
   */


  assertClassName() {
    if (!this.className) {
      throw new Error('You must set a Class Name before making any request.');
    }
  }
  /**
   * Adding a Field to Create / Update a Schema
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} type TheCan be a (String|Number|Boolean|Date|Parse.File|Parse.GeoPoint|Array|Object|Pointer|Parse.Relation)
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addField(name
  /*: string*/
  , type
  /*: string*/
  ) {
    type = type || 'String';

    if (!name) {
      throw new Error('field name may not be null.');
    }

    if (FIELD_TYPES.indexOf(type) === -1) {
      throw new Error(`${type} is not a valid type.`);
    }

    this._fields[name] = {
      type
    };
    return this;
  }
  /**
   * Adding an Index to Create / Update a Schema
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} type Can be a (String|Number|Boolean|Date|Parse.File|Parse.GeoPoint|Array|Object|Pointer|Parse.Relation)
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addIndex(name
  /*: string*/
  , index
  /*: any*/
  ) {
    if (!name) {
      throw new Error('index name may not be null.');
    }

    if (!index) {
      throw new Error('index may not be null.');
    }

    this._indexes[name] = index;
    return this;
  }
  /**
   * Adding String Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addString(name
  /*: string*/
  ) {
    return this.addField(name, 'String');
  }
  /**
   * Adding Number Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addNumber(name
  /*: string*/
  ) {
    return this.addField(name, 'Number');
  }
  /**
   * Adding Boolean Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addBoolean(name
  /*: string*/
  ) {
    return this.addField(name, 'Boolean');
  }
  /**
   * Adding Date Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addDate(name
  /*: string*/
  ) {
    return this.addField(name, 'Date');
  }
  /**
   * Adding File Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addFile(name
  /*: string*/
  ) {
    return this.addField(name, 'File');
  }
  /**
   * Adding GeoPoint Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addGeoPoint(name
  /*: string*/
  ) {
    return this.addField(name, 'GeoPoint');
  }
  /**
   * Adding Polygon Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addPolygon(name
  /*: string*/
  ) {
    return this.addField(name, 'Polygon');
  }
  /**
   * Adding Array Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addArray(name
  /*: string*/
  ) {
    return this.addField(name, 'Array');
  }
  /**
   * Adding Object Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addObject(name
  /*: string*/
  ) {
    return this.addField(name, 'Object');
  }
  /**
   * Adding Pointer Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} targetClass Name of the target Pointer Class
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addPointer(name
  /*: string*/
  , targetClass
  /*: string*/
  ) {
    if (!name) {
      throw new Error('field name may not be null.');
    }

    if (!targetClass) {
      throw new Error('You need to set the targetClass of the Pointer.');
    }

    this._fields[name] = {
      type: 'Pointer',
      targetClass
    };
    return this;
  }
  /**
   * Adding Relation Field
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} targetClass Name of the target Pointer Class
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  addRelation(name
  /*: string*/
  , targetClass
  /*: string*/
  ) {
    if (!name) {
      throw new Error('field name may not be null.');
    }

    if (!targetClass) {
      throw new Error('You need to set the targetClass of the Relation.');
    }

    this._fields[name] = {
      type: 'Relation',
      targetClass
    };
    return this;
  }
  /**
   * Deleting a Field to Update on a Schema
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} targetClass Name of the target Pointer Class
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  deleteField(name
  /*: string*/
  ) {
    this._fields[name] = {
      __op: 'Delete'
    };
  }
  /**
   * Deleting an Index to Update on a Schema
   *
   * @param {String} name Name of the field that will be created on Parse
   * @param {String} targetClass Name of the target Pointer Class
   * @return {Parse.Schema} Returns the schema, so you can chain this call.
   */


  deleteIndex(name
  /*: string*/
  ) {
    this._indexes[name] = {
      __op: 'Delete'
    };
  }

}

const DefaultController = {
  send(className
  /*: string*/
  , method
  /*: string*/
  , params
  /*: any*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    const RESTController = CoreManager.getRESTController();
    const requestOptions = {
      useMasterKey: true
    };

    if (options.hasOwnProperty('sessionToken')) {
      requestOptions.sessionToken = options.sessionToken;
    }

    return RESTController.request(method, `schemas/${className}`, params, requestOptions);
  },

  get(className
  /*: string*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    return this.send(className, 'GET', {}, options);
  },

  create(className
  /*: string*/
  , params
  /*: any*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    return this.send(className, 'POST', params, options);
  },

  update(className
  /*: string*/
  , params
  /*: any*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    return this.send(className, 'PUT', params, options);
  },

  delete(className
  /*: string*/
  , options
  /*: RequestOptions*/
  )
  /*: Promise*/
  {
    return this.send(className, 'DELETE', {}, options);
  },

  purge(className
  /*: string*/
  )
  /*: Promise*/
  {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('DELETE', `purge/${className}`, {}, {
      useMasterKey: true
    });
  }

};
CoreManager.setSchemaController(DefaultController);
export default ParseSchema;