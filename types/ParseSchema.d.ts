// @ts-nocheck
export default ParseSchema;
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
declare class ParseSchema {
    /**
     * Static method to get all schemas
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    static all(): Promise<any>;
    /**
     * @param {string} className Parse Class string.
     */
    constructor(className: string);
    className: string;
    _fields: {
        [key: string]: mixed;
    };
    _indexes: {
        [key: string]: mixed;
    };
    _clp: {
        [key: string]: mixed;
    };
    /**
     * Get the Schema from Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    get(): Promise<any>;
    /**
     * Create a new Schema on Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    save(): Promise<any>;
    /**
     * Update a Schema on Parse
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    update(): Promise<any>;
    /**
     * Removing a Schema from Parse
     * Can only be used on Schema without objects
     *
     * @returns {Promise} A promise that is resolved with the result when
     * the query completes.
     */
    delete(): Promise<any>;
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
    private assertClassName;
    /**
     * Sets Class Level Permissions when creating / updating a Schema.
     * EXERCISE CAUTION, running this may override CLP for this schema and cannot be reversed
     *
     * @param {object | Parse.CLP} clp Class Level Permissions
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    setCLP(clp: PermissionsMap | ParseCLP): Parse.Schema;
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
    addField(name: string, type: string, options?: FieldOptions): Parse.Schema;
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
    addIndex(name: string, index: any): Parse.Schema;
    /**
     * Adding String Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addString(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Number Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addNumber(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Boolean Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addBoolean(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Date Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addDate(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding File Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addFile(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding GeoPoint Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addGeoPoint(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Polygon Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addPolygon(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Array Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addArray(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Object Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addObject(name: string, options: FieldOptions): Parse.Schema;
    /**
     * Adding Pointer Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {string} targetClass Name of the target Pointer Class
     * @param {object} options See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Schema.html#addField addField}
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addPointer(name: string, targetClass: string, options?: FieldOptions): Parse.Schema;
    /**
     * Adding Relation Field
     *
     * @param {string} name Name of the field that will be created on Parse
     * @param {string} targetClass Name of the target Pointer Class
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    addRelation(name: string, targetClass: string): Parse.Schema;
    /**
     * Deleting a Field to Update on a Schema
     *
     * @param {string} name Name of the field
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    deleteField(name: string): Parse.Schema;
    /**
     * Deleting an Index to Update on a Schema
     *
     * @param {string} name Name of the field
     * @returns {Parse.Schema} Returns the schema, so you can chain this call.
     */
    deleteIndex(name: string): Parse.Schema;
}
import { PermissionsMap } from './ParseCLP';
import ParseCLP from './ParseCLP';
type FieldOptions = {
    required: boolean;
    defaultValue: mixed;
};
