import ParseObject from './ParseObject';
import ParseCLP from './ParseCLP';
import type ParseGeoPoint from './ParseGeoPoint';
import type ParseFile from './ParseFile';
import type ParsePolygon from './ParsePolygon';
import type ParseRelation from './ParseRelation';
import type { PermissionsMap } from './ParseCLP';
import type { Pointer } from './ParseObject';
type Bytes = string;
type TYPE = 'String' | 'Number' | 'Bytes' | 'Boolean' | 'Date' | 'File' | 'GeoPoint' | 'Polygon' | 'Array' | 'Object' | 'Pointer' | 'Relation';
type AttrType<T extends ParseObject, V> = Extract<{
    [K in keyof T['attributes']]: T['attributes'][K] extends V ? K : never;
}[keyof T['attributes']], string>;
interface FieldOptions<T extends string | number | boolean | Bytes | Date | ParseFile | ParseGeoPoint | ParsePolygon | any[] | object | Pointer | ParseRelation = any> {
    required?: boolean | undefined;
    defaultValue?: T | undefined;
    targetClass?: string | undefined;
}
type Index = Record<string, number | string>;
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
    protectedFields?: Record<string, string[]>;
}
interface RestSchema {
    className: string;
    fields: Record<string, {
        type: string;
        targetClass?: string;
        required?: boolean;
        defaultValue?: string;
    }>;
    classLevelPermissions: CLP;
    indexes?: Record<string, Record<string, any>>;
}
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
declare class ParseSchema<T extends ParseObject = any> {
    className: string;
    _fields: Record<string, any>;
    _indexes: Record<string, any>;
    _clp: Record<string, any>;
    /**
     * @param {string} className Parse Class string.
     */
    constructor(className: string);
    /**
     * Static method to get all schemas
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    static all(): Promise<RestSchema[]>;
    /**
     * Get the Schema from Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    get(): Promise<RestSchema>;
    /**
     * Create a new Schema on Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    save(): Promise<ParseSchema>;
    /**
     * Update a Schema on Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    update(): Promise<ParseSchema>;
    /**
     * Removing a Schema from Parse
     * Can only be used on Schema without objects
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    delete(): Promise<void>;
    /**
     * Removes all objects from a Schema (class) in Parse.
     * EXERCISE CAUTION, running this will delete all objects for this schema and cannot be reversed
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    purge(): Promise<any>;
    /**
     * Assert if ClassName has been filled
     *
     * @private
     */
    assertClassName(): void;
    /**
     * Sets Class Level Permissions when creating / updating a Schema.
     * EXERCISE CAUTION, running this may override CLP for this schema and cannot be reversed
     *
     * @param {object | Parse.CLP} clp Class Level Permissions
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    setCLP(clp: PermissionsMap | ParseCLP): this;
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
    addField<T extends TYPE = any>(name: string, type?: T, options?: FieldOptions): this;
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
    addIndex(name: string, index: Index): this;
    /**
     * Adding String Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addString(name: AttrType<T, string>, options?: FieldOptions<string>): this;
    /**
     * Adding Number Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addNumber(name: AttrType<T, number>, options?: FieldOptions<number>): this;
    /**
     * Adding Boolean Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addBoolean(name: AttrType<T, boolean>, options?: FieldOptions<boolean>): this;
    /**
     * Adding Bytes Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addBytes(name: AttrType<T, Bytes>, options?: FieldOptions<Bytes>): this;
    /**
     * Adding Date Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addDate(name: AttrType<T, Date>, options?: FieldOptions<Date>): this;
    /**
     * Adding File Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addFile(name: AttrType<T, ParseFile>, options?: FieldOptions<ParseFile>): this;
    /**
     * Adding GeoPoint Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addGeoPoint(name: AttrType<T, ParseGeoPoint>, options?: FieldOptions<ParseGeoPoint>): this;
    /**
     * Adding Polygon Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addPolygon(name: AttrType<T, ParsePolygon>, options?: FieldOptions<ParsePolygon>): this;
    /**
     * Adding Array Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addArray(name: AttrType<T, any[]>, options?: FieldOptions<any[]>): this;
    /**
     * Adding Object Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addObject(name: AttrType<T, object>, options?: FieldOptions<object>): this;
    /**
     * Adding Pointer Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {string} targetClass Name of the target Pointer Class
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addPointer(name: AttrType<T, ParseObject | Pointer>, targetClass: string, options?: FieldOptions<Pointer>): this;
    /**
     * Adding Relation Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {string} targetClass Name of the target Pointer Class
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addRelation(name: AttrType<T, ParseRelation>, targetClass: string): this;
    /**
     * Deleting a Field to Update on a Schema
     *
     * @param {string} name Name of the field
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    deleteField(name: string): this;
    /**
     * Deleting an Index to Update on a Schema
     *
     * @param {string} name Name of the field
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    deleteIndex(name: string): this;
}
export default ParseSchema;
