import CoreManager from './CoreManager';
import ParseObject from './ParseObject';
import ParseCLP from './ParseCLP';
import type ParseGeoPoint from './ParseGeoPoint';
import type ParseFile from './ParseFile';
import type ParsePolygon from './ParsePolygon';
import type ParseRelation from './ParseRelation';
import type { PermissionsMap } from './ParseCLP';
import type { Pointer } from './ParseObject';

type Bytes = string;

type TYPE =
  | 'String'
  | 'Number'
  | 'Bytes'
  | 'Boolean'
  | 'Date'
  | 'File'
  | 'GeoPoint'
  | 'Polygon'
  | 'Array'
  | 'Object'
  | 'Pointer'
  | 'Relation';

type AttrType<T extends ParseObject, V> = Extract<
  {
    [K in keyof T['attributes']]: T['attributes'][K] extends V ? K : never;
  }[keyof T['attributes']],
  string
>;

interface FieldOptions<
  T extends
    | string
    | number
    | boolean
    | Bytes
    | Date
    | ParseFile
    | ParseGeoPoint
    | ParsePolygon
    | any[]
    | object
    | Pointer
    | ParseRelation = any,
> {
  required?: boolean | undefined;
  defaultValue?: T | undefined;
  targetClass?: string | undefined;
}

interface Index {
  [fieldName: string]: number | string;
}

interface CLPField {
  '*'?: boolean | undefined;
  requiresAuthentication?: boolean | undefined;
  [userIdOrRoleName: string]: boolean | undefined;
}

interface CLP {
  find?: CLPField | undefined;
  get?: CLPField | undefined;
  count?: CLPField | undefined;
  create?: CLPField | undefined;
  update?: CLPField | undefined;
  delete?: CLPField | undefined;
  addField?: CLPField | undefined;
  readUserFields?: string[] | undefined;
  writeUserFields?: string[] | undefined;
  protectedFields?: {
    [userIdOrRoleName: string]: string[];
  };
}

interface RestSchema {
  className: string;
  fields: {
    [key: string]: {
      type: string;
      targetClass?: string;
      required?: boolean;
      defaultValue?: string;
    };
  };
  classLevelPermissions: CLP;
  indexes?: {
    [key: string]: {
      [key: string]: any;
    };
  };
}

const FIELD_TYPES = [
  'String',
  'Number',
  'Boolean',
  'Bytes',
  'Date',
  'File',
  'GeoPoint',
  'Polygon',
  'Array',
  'Object',
  'Pointer',
  'Relation',
];

/**
 * A Parse.Schema object is for handling schema data from Parse.
 * <p>All the schemas methods require MasterKey.
 *
 * When adding fields, you may set required and default values. (Requires Parse Server 3.7.0+)
 *
 * <pre>
 * const options = { required: true, defaultValue: 'hello world' };
 * const schema = new Parse.Schema('MyClass');
 * schema.addString('field', options);
 * schema.addIndex('index_name', { 'field': 1 });
 * schema.save();
 * </pre>
 * </p>
 *
 * @alias Parse.Schema
 */
class ParseSchema<T extends ParseObject = any> {
  className: string;
  _fields: { [key: string]: any };
  _indexes: { [key: string]: any };
  _clp: { [key: string]: any };

  /**
   * @param {string} className Parse Class string.
   */
  constructor(className: string) {
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
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  static all(): Promise<RestSchema[]> {
    const controller = CoreManager.getSchemaController();
    return controller.get('').then(response => {
      if (response.results.length === 0) {
        throw new Error('Schema not found.');
      }
      return response.results;
    });
  }

  /**
   * Get the Schema from Parse
   *
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  get(): Promise<RestSchema> {
    this.assertClassName();

    const controller = CoreManager.getSchemaController();
    return controller.get(this.className).then(response => {
      if (!response) {
        throw new Error('Schema not found.');
      }
      return response;
    });
  }

  /**
   * Create a new Schema on Parse
   *
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  save(): Promise<ParseSchema> {
    this.assertClassName();

    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes,
      classLevelPermissions: this._clp,
    };

    return controller.create(this.className, params) as Promise<ParseSchema>;
  }

  /**
   * Update a Schema on Parse
   *
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  update(): Promise<ParseSchema> {
    this.assertClassName();

    const controller = CoreManager.getSchemaController();
    const params = {
      className: this.className,
      fields: this._fields,
      indexes: this._indexes,
      classLevelPermissions: this._clp,
    };

    this._fields = {};
    this._indexes = {};

    return controller.update(this.className, params) as Promise<ParseSchema>;
  }

  /**
   * Removing a Schema from Parse
   * Can only be used on Schema without objects
   *
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  delete(): Promise<void> {
    this.assertClassName();

    const controller = CoreManager.getSchemaController();
    return controller.delete(this.className);
  }

  /**
   * Removes all objects from a Schema (class) in Parse.
   * EXERCISE CAUTION, running this will delete all objects for this schema and cannot be reversed
   *
   * @returns {Promise} A promise that is resolved with the result when
   * the query completes.
   */
  purge(): Promise<any> {
    this.assertClassName();

    const controller = CoreManager.getSchemaController();
    return controller.purge(this.className);
  }

  /**
   * Assert if ClassName has been filled
   *
   * @private
   */
  assertClassName() {
    if (!this.className) {
      throw new Error('You must set a Class Name before making any request.');
    }
  }

  /**
   * Sets Class Level Permissions when creating / updating a Schema.
   * EXERCISE CAUTION, running this may override CLP for this schema and cannot be reversed
   *
   * @param {object | Parse.CLP} clp Class Level Permissions
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  setCLP(clp: PermissionsMap | ParseCLP): this {
    if (clp instanceof ParseCLP) {
      this._clp = clp.toJSON();
    } else {
      this._clp = clp;
    }
    return this;
  }

  /**
   * Adding a Field to Create / Update a Schema
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {string} type Can be a (String|Number|Boolean|Date|Parse.File|Parse.GeoPoint|Array|Object|Pointer|Parse.Relation)
   * @param {object} options
   * Valid options are:<ul>
   *   <li>required: If field is not set, save operation fails (Requires Parse Server 3.7.0+)
   *   <li>defaultValue: If field is not set, a default value is selected (Requires Parse Server 3.7.0+)
   *   <li>targetClass: Required if type is Pointer or Parse.Relation
   * </ul>
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addField<T extends TYPE = any>(name: string, type?: T, options?: FieldOptions): this {
    type = (type || 'String') as T;
    options = options || {};
    if (!name) {
      throw new Error('field name may not be null.');
    }
    if (FIELD_TYPES.indexOf(type) === -1) {
      throw new Error(`${type} is not a valid type.`);
    }
    if (type === 'Pointer') {
      return this.addPointer(name as any, options.targetClass!, options);
    }
    if (type === 'Relation') {
      return this.addRelation(name as any, options.targetClass!);
    }
    const fieldOptions: Partial<FieldOptions> & {
      type: string;
    } = { type };

    if (typeof options.required === 'boolean') {
      fieldOptions.required = options.required;
    }
    if (options.defaultValue !== undefined) {
      fieldOptions.defaultValue = options.defaultValue;
    }
    if (type === 'Date') {
      if (options && options.defaultValue) {
        fieldOptions.defaultValue = {
          __type: 'Date',
          iso: new Date(options.defaultValue),
        };
      }
    }
    if (type === ('Bytes' as T)) {
      if (options && options.defaultValue) {
        fieldOptions.defaultValue = {
          __type: 'Bytes',
          base64: options.defaultValue,
        };
      }
    }
    this._fields[name] = fieldOptions;
    return this;
  }

  /**
   * Adding an Index to Create / Update a Schema
   *
   * @param {string} name Name of the index
   * @param {object} index { field: value }
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   *
   * <pre>
   * schema.addIndex('index_name', { 'field': 1 });
   * </pre>
   */
  addIndex(name: string, index: Index): this {
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
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addString(name: AttrType<T, string>, options?: FieldOptions<string>): this {
    return this.addField(name, 'String', options);
  }

  /**
   * Adding Number Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addNumber(name: AttrType<T, number>, options?: FieldOptions<number>): this {
    return this.addField(name, 'Number', options);
  }

  /**
   * Adding Boolean Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addBoolean(name: AttrType<T, boolean>, options?: FieldOptions<boolean>): this {
    return this.addField(name, 'Boolean', options);
  }

  /**
   * Adding Bytes Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addBytes(name: AttrType<T, Bytes>, options?: FieldOptions<Bytes>): this {
    return this.addField(name, 'Bytes', options);
  }

  /**
   * Adding Date Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addDate(name: AttrType<T, Date>, options?: FieldOptions<Date>): this {
    return this.addField(name, 'Date', options);
  }

  /**
   * Adding File Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addFile(name: AttrType<T, ParseFile>, options?: FieldOptions<ParseFile>) {
    return this.addField(name, 'File', options);
  }

  /**
   * Adding GeoPoint Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addGeoPoint(name: AttrType<T, ParseGeoPoint>, options?: FieldOptions<ParseGeoPoint>): this {
    return this.addField(name, 'GeoPoint', options);
  }

  /**
   * Adding Polygon Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addPolygon(name: AttrType<T, ParsePolygon>, options?: FieldOptions<ParsePolygon>): this {
    return this.addField(name, 'Polygon', options);
  }

  /**
   * Adding Array Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addArray(name: AttrType<T, any[]>, options?: FieldOptions<any[]>): this {
    return this.addField(name, 'Array', options);
  }

  /**
   * Adding Object Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addObject(name: AttrType<T, object>, options?: FieldOptions<object>): this {
    return this.addField(name, 'Object', options);
  }

  /**
   * Adding Pointer Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {string} targetClass Name of the target Pointer Class
   * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addPointer(
    name: AttrType<T, ParseObject | Pointer>,
    targetClass: string,
    options?: FieldOptions<Pointer>
  ): this {
    if (!name) {
      throw new Error('field name may not be null.');
    }
    if (!targetClass) {
      throw new Error('You need to set the targetClass of the Pointer.');
    }
    const fieldOptions: Partial<FieldOptions> & {
      type: string;
    } = { type: 'Pointer', targetClass };

    if (typeof options?.required === 'boolean') {
      fieldOptions.required = options.required;
    }
    if (options?.defaultValue !== undefined) {
      fieldOptions.defaultValue = options.defaultValue;
      if (options.defaultValue instanceof ParseObject) {
        fieldOptions.defaultValue = options.defaultValue.toPointer();
      }
    }
    this._fields[name] = fieldOptions;
    return this;
  }

  /**
   * Adding Relation Field
   *
   * @param {string} name Name of the field that will be created on Parse
   * @param {string} targetClass Name of the target Pointer Class
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  addRelation(name: AttrType<T, ParseRelation>, targetClass: string) {
    if (!name) {
      throw new Error('field name may not be null.');
    }
    if (!targetClass) {
      throw new Error('You need to set the targetClass of the Relation.');
    }
    this._fields[name] = {
      type: 'Relation',
      targetClass,
    };
    return this;
  }

  /**
   * Deleting a Field to Update on a Schema
   *
   * @param {string} name Name of the field
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  deleteField(name: string): this {
    this._fields[name] = { __op: 'Delete' };
    return this;
  }

  /**
   * Deleting an Index to Update on a Schema
   *
   * @param {string} name Name of the field
   * @returns {Parse.Schema} Returns the schema, so you can chain this call.
   */
  deleteIndex(name: string): this {
    this._indexes[name] = { __op: 'Delete' };
    return this;
  }
}

const DefaultController = {
  send(className: string, method: string, params: any = {}): Promise<any> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request(method, `schemas/${className}`, params, {
      useMasterKey: true,
    });
  },

  get(className: string): Promise<any> {
    return this.send(className, 'GET');
  },

  create(className: string, params: any): Promise<any> {
    return this.send(className, 'POST', params);
  },

  update(className: string, params: any): Promise<any> {
    return this.send(className, 'PUT', params);
  },

  delete(className: string): Promise<any> {
    return this.send(className, 'DELETE');
  },

  purge(className: string): Promise<any> {
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('DELETE', `purge/${className}`, {}, { useMasterKey: true });
  },
};

CoreManager.setSchemaController(DefaultController);

export default ParseSchema;
