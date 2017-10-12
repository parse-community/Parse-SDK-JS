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
import ParsePromise from './ParsePromise';

import type { RequestOptions, FullOptions } from './RESTController';

const FIELD_TYPES = ['String', 'Number', 'Boolean', 'Date', 'File', 'GeoPoint', 'Array', 'Object', 'Pointer', 'Relation'];

/**
 * @class Parse.Schema
 * @constructor
 * @param {String} className The class name for the object
 *
 * <p>A Parse.Schema object is for handling schema data from Parse.
 * All the schemas methods require master key.</p>
 */
export default class ParseSchema {
  className: string;
  _fields: { [key: string]: mixed };
  _indexes: { [key: string]: mixed };

  constructor(className: ?string) {
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

  static all(options: FullOptions) {
    options = options || {};
    const controller = CoreManager.getSchemaController();

    return controller.get('', {}, options)
      .then((response) => {
        if (response.results.length === 0) {
          throw new Error('Schema not found.');
        }
        return response.results;
      })._thenRunCallbacks(options);
  }

  get(options: FullOptions) {
    this.assertClassName();

    options = options || {};
    const controller = CoreManager.getSchemaController();

    return controller.get(this.className, options)
      .then((response) => {
        if (!response) {
          throw new Error('Schema not found.');
        }
        return response;
      })._thenRunCallbacks(options);
  }

  save(options: FullOptions) {
    this.assertClassName();

    options = options || {};
    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes,
    };

    return controller.create(this.className, params, options)
      .then((response) => {
        return response;
      })._thenRunCallbacks(options);
  }

  update(options: FullOptions) {
    this.assertClassName();

    options = options || {};
    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes,
    };

    this._fields = {};
    this._indexes = {};

    return controller.update(this.className, params, options)
      .then((response) => {
        return response;
      })._thenRunCallbacks(options);
  }

  delete(options: FullOptions) {
    this.assertClassName();

    options = options || {};
    const controller = CoreManager.getSchemaController();

    return controller.delete(this.className, options)
      .then((response) => {
        return response;
      })._thenRunCallbacks(options);
  }

  assertClassName() {
    if (!this.className) {
      throw new Error('You must set a Class Name before making any request.');
    }
  }

  addField(name: string, type: string) {
    type = type || 'String';

    if (!name) {
      throw new Error('field name may not be null.');
    }
    if (FIELD_TYPES.indexOf(type) === -1) {
      throw new Error(`${type} is not a valid type.`);
    }

    this._fields[name] = { type };

    return this;
  }

  addIndex(name: string, index: any) {
    if (!name) {
      throw new Error('index name may not be null.');
    }
    if (!index) {
      throw new Error('index may not be null.');
    }

    this._indexes[name] = index;

    return this;
  }

  addString(name: string) {
    return this.addField(name, 'String');
  }

  addNumber(name: string) {
    return this.addField(name, 'Number');
  }

  addBoolean(name: string) {
    return this.addField(name, 'Boolean');
  }

  addDate(name: string) {
    return this.addField(name, 'Date');
  }

  addFile(name: string) {
    return this.addField(name, 'File');
  }

  addGeoPoint(name: string) {
    return this.addField(name, 'GeoPoint');
  }

  addArray(name: string) {
    return this.addField(name, 'Array');
  }

  addObject(name: string) {
    return this.addField(name, 'Object');
  }

  addPointer(name: string, targetClass: string) {
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

  addRelation(name: string, targetClass: string) {
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

  deleteField(name: string) {
    this._fields[name] = { __op: 'Delete'};
  }

  deleteIndex(name: string) {
    this._indexes[name] = { __op: 'Delete'};
  }
}

const DefaultController = {
  send(className: string, method: string, params: any, options: RequestOptions): ParsePromise {
    const RESTController = CoreManager.getRESTController();
    const requestOptions = { useMasterKey: true };
    if (options.hasOwnProperty('sessionToken')) {
      requestOptions.sessionToken = options.sessionToken;
    }
    return RESTController.request(
      method,
      `schemas/${className}`,
      params,
      requestOptions
    );
  },

  get(className: string, options: RequestOptions): ParsePromise {
    return this.send(className, 'GET', {}, options);
  },

  create(className: string, params: any, options: RequestOptions): ParsePromise {
    return this.send(className, 'POST', params, options);
  },

  update(className: string, params: any, options: RequestOptions): ParsePromise {
    return this.send(className, 'PUT', params, options);
  },

  delete(className: string, options: RequestOptions): ParsePromise {
    return this.send(className, 'DELETE', {}, options);
  }
};

CoreManager.setSchemaController(DefaultController);
