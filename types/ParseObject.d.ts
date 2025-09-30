import ParseACL from './ParseACL';
import ParseError from './ParseError';
import ParseFile from './ParseFile';
import { Op } from './ParseOp';
import ParseRelation from './ParseRelation';
import type { AttributeMap, OpsMap } from './ObjectStateMutations';
import type { RequestOptions, FullOptions } from './RESTController';
import type ParseGeoPoint from './ParseGeoPoint';
import type ParsePolygon from './ParsePolygon';
export interface Pointer {
    __type: string;
    className: string;
    objectId?: string;
    _localId?: string;
}
interface SaveParams {
    method: string;
    path: string;
    body: AttributeMap;
}
export type SaveOptions = FullOptions & {
    cascadeSave?: boolean;
    context?: AttributeMap;
    batchSize?: number;
    transaction?: boolean;
};
interface FetchOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    include?: string | string[];
    context?: AttributeMap;
}
export interface SetOptions {
    ignoreValidation?: boolean;
    unset?: boolean;
}
export type AttributeKey<T> = Extract<keyof T, string>;
export type Attributes = Record<string, any>;
interface JSONBaseAttributes {
    objectId: string;
    createdAt: string;
    updatedAt: string;
}
interface CommonAttributes {
    ACL: ParseACL;
}
type AtomicKey<T> = {
    [K in keyof T]: NonNullable<T[K]> extends any[] ? K : never;
};
type Encode<T> = T extends ParseObject ? ReturnType<T['toJSON']> | Pointer : T extends ParseACL | ParseGeoPoint | ParsePolygon | ParseRelation | ParseFile ? ReturnType<T['toJSON']> : T extends Date ? {
    __type: 'Date';
    iso: string;
} : T extends RegExp ? string : T extends (infer R)[] ? Encode<R>[] : T extends object ? ToJSON<T> : T;
type ToJSON<T> = {
    [K in keyof T]: Encode<T[K]>;
};
/**
 * Creates a new model with defined attributes.
 *
 * <p>You won't normally call this method directly.  It is recommended that
 * you use a subclass of <code>Parse.Object</code> instead, created by calling
 * <code>extend</code>.</p>
 *
 * <p>However, if you don't want to use a subclass, or aren't sure which
 * subclass is appropriate, you can use this form:<pre>
 *     var object = new Parse.Object("ClassName");
 * </pre>
 * That is basically equivalent to:<pre>
 *     var MyClass = Parse.Object.extend("ClassName");
 *     var object = new MyClass();
 * </pre></p>
 *
 * @alias Parse.Object
 */
declare class ParseObject<T extends Attributes = Attributes> {
    /**
     * @param {string} className The class name for the object
     * @param {object} attributes The initial set of data to store in the object.
     * @param {object} options The options for this object instance.
     * @param {boolean} [options.ignoreValidation] Set to `true` ignore any attribute validation errors.
     */
    constructor(className?: string | {
        className: string;
        [attr: string]: any;
    }, attributes?: T, options?: SetOptions);
    /**
     * The ID of this object, unique within its class.
     *
     * @property {string} id
     */
    id?: string;
    _localId?: string;
    _objCount: number;
    className: string;
    get attributes(): T;
    /**
     * The first time this object was saved on the server.
     *
     * @property {Date} createdAt
     * @returns {Date}
     */
    get createdAt(): Date | undefined;
    /**
     * The last time this object was updated on the server.
     *
     * @property {Date} updatedAt
     * @returns {Date}
     */
    get updatedAt(): Date | undefined;
    /**
     * Returns a local or server Id used uniquely identify this object
     *
     * @returns {string}
     */
    _getId(): string;
    /**
     * Returns a unique identifier used to pull data from the State Controller.
     *
     * @returns {Parse.Object|object}
     */
    _getStateIdentifier(): ParseObject | {
        id: string;
        className: string;
    };
    _getServerData(): Attributes;
    _clearServerData(): void;
    _getPendingOps(): OpsMap[];
    /**
     * @param {Array<string>} [keysToClear] - if specified, only ops matching
     * these fields will be cleared
     */
    _clearPendingOps(keysToClear?: string[]): void;
    _getDirtyObjectAttributes(): Attributes;
    _toFullJSON(seen?: any[], offline?: boolean): Attributes;
    _getSaveJSON(): Attributes;
    _getSaveParams(): SaveParams;
    _finishFetch(serverData: Attributes): void;
    _setExisted(existed: boolean): void;
    _migrateId(serverId: string): void;
    _handleSaveResponse(response: Attributes, status: number): void;
    _handleSaveError(): void;
    static _getClassMap(): AttributeMap;
    static _getRequestOptions(options?: RequestOptions & FullOptions & {
        json?: boolean;
    }): RequestOptions & FullOptions & {
        json?: boolean;
    };
    initialize(): void;
    /**
     * Returns a JSON version of the object suitable for saving to Parse.
     *
     * @param seen
     * @param offline
     * @returns {object}
     */
    toJSON(seen?: any[], offline?: boolean): ToJSON<T> & JSONBaseAttributes;
    /**
     * Determines whether this ParseObject is equal to another ParseObject
     *
     * @param {object} other - An other object ot compare
     * @returns {boolean}
     */
    equals<T extends ParseObject>(other: T): boolean;
    /**
     * Returns true if this object has been modified since its last
     * save/refresh.  If an attribute is specified, it returns true only if that
     * particular attribute has been modified since the last save/refresh.
     *
     * @param {string} attr An attribute name (optional).
     * @returns {boolean}
     */
    dirty<K extends AttributeKey<T>>(attr?: K): boolean;
    /**
     * Returns an array of keys that have been modified since last save/refresh
     *
     * @returns {string[]}
     */
    dirtyKeys(): string[];
    /**
     * Returns true if the object has been fetched.
     *
     * @returns {boolean}
     */
    isDataAvailable(): boolean;
    /**
     * Gets a Pointer referencing this Object.
     *
     * @returns {Pointer}
     */
    toPointer(): Pointer;
    /**
     * Gets a Pointer referencing this Object.
     *
     * @returns {Pointer}
     */
    toOfflinePointer(): Pointer;
    /**
     * Gets the value of an attribute.
     *
     * @param {string} attr The string name of an attribute.
     * @returns {*}
     */
    get<K extends AttributeKey<T>>(attr: K): T[K];
    /**
     * Gets a relation on the given class for the attribute.
     *
     * @param {string} attr The attribute to get the relation for.
     * @returns {Parse.Relation}
     */
    relation<R extends ParseObject, K extends AttributeKey<T> = AttributeKey<T>>(attr: T[K] extends ParseRelation ? K : never): ParseRelation<this, R>;
    /**
     * Gets the HTML-escaped value of an attribute.
     *
     * @param {string} attr The string name of an attribute.
     * @returns {string}
     */
    escape<K extends AttributeKey<T>>(attr: K): string;
    /**
     * Returns <code>true</code> if the attribute contains a value that is not
     * null or undefined.
     *
     * @param {string} attr The string name of the attribute.
     * @returns {boolean}
     */
    has<K extends AttributeKey<T>>(attr: K): boolean;
    /**
     * Sets a hash of model attributes on the object.
     *
     * <p>You can call it with an object containing keys and values, with one
     * key and value, or dot notation.  For example:<pre>
     *   gameTurn.set({
     *     player: player1,
     *     diceRoll: 2
     *   }, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
     *
     *   game.set("currentPlayer", player2, {
     *     error: function(gameTurnAgain, error) {
     *       // The set failed validation.
     *     }
     *   });
     *
     *   game.set("finished", true);</pre></p>
     *
     *   game.set("player.score", 10);</pre></p>
     *
     * @param {(string|object)} key The key to set.
     * @param {(string|object)} value The value to give it.
     * @param {object} options A set of options for the set.
     *     The only supported option is <code>error</code>.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    set<K extends AttributeKey<T>>(key: K | (Pick<T, K> | T), value?: SetOptions | (T[K] extends undefined ? never : T[K]), options?: SetOptions): this;
    /**
     * Remove an attribute from the model. This is a noop if the attribute doesn't
     * exist.
     *
     * @param {string} attr The string name of an attribute.
     * @param options
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    unset<K extends AttributeKey<T>>(attr: K, options?: SetOptions): this;
    /**
     * Atomically increments the value of the given attribute the next time the
     * object is saved. If no amount is specified, 1 is used by default.
     *
     * @param attr {String} The key.
     * @param amount {Number} The amount to increment by (optional).
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    increment<K extends AttributeKey<T>>(attr: K, amount?: number): this;
    /**
     * Atomically decrements the value of the given attribute the next time the
     * object is saved. If no amount is specified, 1 is used by default.
     *
     * @param attr {String} The key.
     * @param amount {Number} The amount to decrement by (optional).
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    decrement<K extends AttributeKey<T>>(attr: K, amount?: number): this;
    /**
     * Atomically add an object to the end of the array associated with a given
     * key.
     *
     * @param attr {String} The key.
     * @param item {} The item to add.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    add<K extends AtomicKey<T>[keyof T]>(attr: K, item: NonNullable<T[K]>[number]): this;
    /**
     * Atomically add the objects to the end of the array associated with a given
     * key.
     *
     * @param attr {String} The key.
     * @param items {Object[]} The items to add.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    addAll<K extends AtomicKey<T>[keyof T]>(attr: K, items: NonNullable<T[K]>): this;
    /**
     * Atomically add an object to the array associated with a given key, only
     * if it is not already present in the array. The position of the insert is
     * not guaranteed.
     *
     * @param attr {String} The key.
     * @param item {} The object to add.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    addUnique<K extends AtomicKey<T>[keyof T]>(attr: K, item: NonNullable<T[K]>[number]): this;
    /**
     * Atomically add the objects to the array associated with a given key, only
     * if it is not already present in the array. The position of the insert is
     * not guaranteed.
     *
     * @param attr {String} The key.
     * @param items {Object[]} The objects to add.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    addAllUnique<K extends AtomicKey<T>[keyof T]>(attr: K, items: NonNullable<T[K]>): this;
    /**
     * Atomically remove all instances of an object from the array associated
     * with a given key.
     *
     * @param attr {String} The key.
     * @param item {} The object to remove.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    remove<K extends AtomicKey<T>[keyof T]>(attr: K, item: NonNullable<T[K]>[number]): this;
    /**
     * Atomically remove all instances of the objects from the array associated
     * with a given key.
     *
     * @param attr {String} The key.
     * @param items {Object[]} The object to remove.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    removeAll<K extends AtomicKey<T>[keyof T]>(attr: K, items: NonNullable<T[K]>): this;
    /**
     * Returns an instance of a subclass of Parse.Op describing what kind of
     * modification has been performed on this field since the last time it was
     * saved. For example, after calling object.increment("x"), calling
     * object.op("x") would return an instance of Parse.Op.Increment.
     *
     * @param attr {String} The key.
     * @returns {Parse.Op | undefined} The operation, or undefined if none.
     */
    op<K extends AttributeKey<T>>(attr: K): Op | undefined;
    /**
     * Creates a new model with identical attributes to this one.
     *
     * @returns {Parse.Object}
     */
    clone(): any;
    /**
     * Creates a new instance of this object. Not to be confused with clone()
     *
     * @returns {Parse.Object}
     */
    newInstance(): this;
    /**
     * Returns true if this object has never been saved to Parse.
     *
     * @returns {boolean}
     */
    isNew(): boolean;
    /**
     * Returns true if this object was created by the Parse server when the
     * object might have already been there (e.g. in the case of a Facebook
     * login)
     *
     * @returns {boolean}
     */
    existed(): boolean;
    /**
     * Returns true if this object exists on the Server
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise<boolean>} A boolean promise that is fulfilled if object exists.
     */
    exists(options?: RequestOptions): Promise<boolean>;
    /**
     * Checks if the model is currently in a valid state.
     *
     * @returns {boolean}
     */
    isValid(): boolean;
    /**
     * You should not call this function directly unless you subclass
     * <code>Parse.Object</code>, in which case you can override this method
     * to provide additional validation on <code>set</code> and
     * <code>save</code>.  Your implementation should return
     *
     * @param {object} attrs The current data to validate.
     * @returns {Parse.Error|boolean} False if the data is valid.  An error object otherwise.
     * @see Parse.Object#set
     */
    validate(attrs: Attributes): ParseError | boolean;
    /**
     * Returns the ACL for this object.
     *
     * @returns {Parse.ACL|null} An instance of Parse.ACL.
     * @see Parse.Object#get
     */
    getACL(): ParseACL | null;
    /**
     * Sets the ACL to be used for this object.
     *
     * @param {Parse.ACL} acl An instance of Parse.ACL.
     * @param {object} options
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     * @see Parse.Object#set
     */
    setACL(acl: ParseACL, options?: any): this;
    /**
     * Clears any (or specific) changes to this object made since the last call to save()
     *
     * @param {string} [keys] - specify which fields to revert
     */
    revert(...keys: Extract<keyof (T & CommonAttributes), string>[]): void;
    /**
     * Clears all attributes on a model
     *
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    clear(): this;
    /**
     * Fetch the model from the server. If the server's representation of the
     * model differs from its current attributes, they will be overriden.
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>include: The name(s) of the key(s) to include. Can be a string, an array of strings,
     *       or an array of array of strings.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the fetch
     *     completes.
     */
    fetch(options?: FetchOptions): Promise<this>;
    /**
     * Fetch the model from the server. If the server's representation of the
     * model differs from its current attributes, they will be overriden.
     *
     * Includes nested Parse.Objects for the provided key. You can use dot
     * notation to specify which fields in the included object are also fetched.
     *
     * @param {string | Array<string | Array<string>>} keys The name(s) of the key(s) to include.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the fetch
     *     completes.
     */
    fetchWithInclude(keys: string | (string | string[])[], options?: RequestOptions): Promise<this>;
    /**
     * Saves this object to the server at some unspecified time in the future,
     * even if Parse is currently inaccessible.
     *
     * Use this when you may not have a solid network connection, and don't need to know when the save completes.
     * If there is some problem with the object such that it can't be saved, it will be silently discarded.
     *
     * Objects saved with this method will be stored locally in an on-disk cache until they can be delivered to Parse.
     * They will be sent immediately if possible. Otherwise, they will be sent the next time a network connection is
     * available. Objects saved this way will persist even after the app is closed, in which case they will be sent the
     * next time the app is opened.
     *
     * @param {object} [options]
     * Used to pass option parameters to method if arg1 and arg2 were both passed as strings.
     * Valid options are:
     * <ul>
     * <li>sessionToken: A valid session token, used for making a request on
     * behalf of a specific user.
     * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
     * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the save
     * completes.
     */
    saveEventually(options?: SaveOptions): Promise<this>;
    /**
     * Set a hash of model attributes, and save the model to the server.
     * updatedAt will be updated when the request returns.
     * You can either call it as:<pre>
     * object.save();</pre>
     * or<pre>
     * object.save(attrs);</pre>
     * or<pre>
     * object.save(null, options);</pre>
     * or<pre>
     * object.save(attrs, options);</pre>
     * or<pre>
     * object.save(key, value);</pre>
     * or<pre>
     * object.save(key, value, options);</pre>
     *
     * Example 1: <pre>
     * gameTurn.save({
     * player: "Jake Cutter",
     * diceRoll: 2
     * }).then(function(gameTurnAgain) {
     * // The save was successful.
     * }, function(error) {
     * // The save failed.  Error is an instance of Parse.Error.
     * });</pre>
     *
     * Example 2: <pre>
     * gameTurn.save("player", "Jake Cutter");</pre>
     *
     * @param {string | object | null} [arg1]
     * Valid options are:<ul>
     * <li>`Object` - Key/value pairs to update on the object.</li>
     * <li>`String` Key - Key of attribute to update (requires arg2 to also be string)</li>
     * <li>`null` - Passing null for arg1 allows you to save the object with options passed in arg2.</li>
     * </ul>
     * @param {string | object} [arg2]
     * <ul>
     * <li>`String` Value - If arg1 was passed as a key, arg2 is the value that should be set on that key.</li>
     * <li>`Object` Options - Valid options are:
     * <ul>
     * <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     * be used for this request.
     * <li>sessionToken: A valid session token, used for making a request on
     * behalf of a specific user.
     * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
     * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
     * </ul>
     * </li>
     * </ul>
     * @param {object} [arg3]
     * Used to pass option parameters to method if arg1 and arg2 were both passed as strings.
     * Valid options are:
     * <ul>
     * <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     * be used for this request.
     * <li>sessionToken: A valid session token, used for making a request on
     * behalf of a specific user.
     * <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
     * <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the save
     * completes.
     */
    save<K extends AttributeKey<T>>(arg1?: Pick<T, K> | T | null, arg2?: SaveOptions): Promise<this>;
    /**
     * Deletes this object from the server at some unspecified time in the future,
     * even if Parse is currently inaccessible.
     *
     * Use this when you may not have a solid network connection,
     * and don't need to know when the delete completes. If there is some problem with the object
     * such that it can't be deleted, the request will be silently discarded.
     *
     * Delete instructions made with this method will be stored locally in an on-disk cache until they can be transmitted
     * to Parse. They will be sent immediately if possible. Otherwise, they will be sent the next time a network connection
     * is available. Delete requests will persist even after the app is closed, in which case they will be sent the
     * next time the app is opened.
     *
     * @param {object} [options]
     * Valid options are:<ul>
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeDelete` and `afterDelete` triggers.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the destroy
     *     completes.
     */
    destroyEventually(options?: RequestOptions): Promise<this>;
    /**
     * Destroy this model on the server if it was already persisted.
     *
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeDelete` and `afterDelete` triggers.
     * </ul>
     * @returns {Promise} A promise that is fulfilled when the destroy
     *     completes.
     */
    destroy(options?: RequestOptions): Promise<ParseObject | undefined>;
    /**
     * Asynchronously stores the object and every object it points to in the local datastore,
     * recursively, using a default pin name: _default.
     *
     * If those other objects have not been fetched from Parse, they will not be stored.
     * However, if they have changed data, all the changes will be retained.
     *
     * <pre>
     * await object.pin();
     * </pre>
     *
     * To retrieve object:
     * <code>query.fromLocalDatastore()</code> or <code>query.fromPin()</code>
     *
     * @returns {Promise} A promise that is fulfilled when the pin completes.
     */
    pin(): Promise<void>;
    /**
     * Asynchronously removes the object and every object it points to in the local datastore,
     * recursively, using a default pin name: _default.
     *
     * <pre>
     * await object.unPin();
     * </pre>
     *
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     */
    unPin(): Promise<void>;
    /**
     * Asynchronously returns if the object is pinned
     *
     * <pre>
     * const isPinned = await object.isPinned();
     * </pre>
     *
     * @returns {Promise<boolean>} A boolean promise that is fulfilled if object is pinned.
     */
    isPinned(): Promise<boolean>;
    /**
     * Asynchronously stores the objects and every object they point to in the local datastore, recursively.
     *
     * If those other objects have not been fetched from Parse, they will not be stored.
     * However, if they have changed data, all the changes will be retained.
     *
     * <pre>
     * await object.pinWithName(name);
     * </pre>
     *
     * To retrieve object:
     * <code>query.fromLocalDatastore()</code> or <code>query.fromPinWithName(name)</code>
     *
     * @param {string} name Name of Pin.
     * @returns {Promise} A promise that is fulfilled when the pin completes.
     */
    pinWithName(name: string): Promise<void>;
    /**
     * Asynchronously removes the object and every object it points to in the local datastore, recursively.
     *
     * <pre>
     * await object.unPinWithName(name);
     * </pre>
     *
     * @param {string} name Name of Pin.
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     */
    unPinWithName(name: string): Promise<void>;
    /**
     * Asynchronously loads data from the local datastore into this object.
     *
     * <pre>
     * await object.fetchFromLocalDatastore();
     * </pre>
     *
     * You can create an unfetched pointer with <code>Parse.Object.createWithoutData()</code>
     * and then call <code>fetchFromLocalDatastore()</code> on it.
     *
     * @returns {Promise} A promise that is fulfilled when the fetch completes.
     */
    fetchFromLocalDatastore(): Promise<ParseObject>;
    static _clearAllState(): void;
    /**
     * Fetches the given list of Parse.Object.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAll([object1, object2, ...])
     *    .then((list) => {
     *      // All the objects were fetched.
     *    }, (error) => {
     *      // An error occurred while fetching one of the objects.
     *    });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>include: The name(s) of the key(s) to include. Can be a string, an array of strings,
     *       or an array of array of strings.
     * </ul>
     * @static
     * @returns {Parse.Object[]}
     */
    static fetchAll<T extends ParseObject>(list: T[], options?: RequestOptions): Promise<T[]>;
    /**
     * Fetches the given list of Parse.Object.
     *
     * Includes nested Parse.Objects for the provided key. You can use dot
     * notation to specify which fields in the included object are also fetched.
     *
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAllWithInclude([object1, object2, ...], [pointer1, pointer2, ...])
     *    .then((list) => {
     *      // All the objects were fetched.
     *    }, (error) => {
     *      // An error occurred while fetching one of the objects.
     *    });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {string | Array<string | Array<string>>} keys The name(s) of the key(s) to include.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @static
     * @returns {Parse.Object[]}
     */
    static fetchAllWithInclude<T extends ParseObject>(list: T[], keys: keyof T['attributes'] | (keyof T['attributes'])[], options?: RequestOptions): Promise<T[]>;
    /**
     * Fetches the given list of Parse.Object if needed.
     * If any error is encountered, stops and calls the error handler.
     *
     * Includes nested Parse.Objects for the provided key. You can use dot
     * notation to specify which fields in the included object are also fetched.
     *
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAllIfNeededWithInclude([object1, object2, ...], [pointer1, pointer2, ...])
     *    .then((list) => {
     *      // All the objects were fetched.
     *    }, (error) => {
     *      // An error occurred while fetching one of the objects.
     *    });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {string | Array<string | Array<string>>} keys The name(s) of the key(s) to include.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     * </ul>
     * @static
     * @returns {Parse.Object[]}
     */
    static fetchAllIfNeededWithInclude<T extends ParseObject>(list: T[], keys: keyof T['attributes'] | (keyof T['attributes'])[], options?: RequestOptions): Promise<T[]>;
    /**
     * Fetches the given list of Parse.Object if needed.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     *   Parse.Object.fetchAllIfNeeded([object1, ...])
     *    .then((list) => {
     *      // Objects were fetched and updated.
     *    }, (error) => {
     *      // An error occurred while fetching one of the objects.
     *    });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>include: The name(s) of the key(s) to include. Can be a string, an array of strings,
     *       or an array of array of strings.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeFind` trigger.
     * </ul>
     * @static
     * @returns {Parse.Object[]}
     */
    static fetchAllIfNeeded<T extends ParseObject>(list: T[], options?: FetchOptions): Promise<T[]>;
    static handleIncludeOptions(options: {
        include?: string | string[];
    }): any[];
    /**
     * Destroy the given list of models on the server if it was already persisted.
     *
     * <p>Unlike saveAll, if an error occurs while deleting an individual model,
     * this method will continue trying to delete the rest of the models if
     * possible, except in the case of a fatal error like a connection error.
     *
     * <p>In particular, the Parse.Error object returned in the case of error may
     * be one of two types:
     *
     * <ul>
     * <li>A Parse.Error.AGGREGATE_ERROR. This object's "errors" property is an
     * array of other Parse.Error objects. Each error object in this array
     * has an "object" property that references the object that could not be
     * deleted (for instance, because that object could not be found).</li>
     * <li>A non-aggregate Parse.Error. This indicates a serious error that
     * caused the delete operation to be aborted partway through (for
     * instance, a connection failure in the middle of the delete).</li>
     * </ul>
     *
     * <pre>
     * Parse.Object.destroyAll([object1, object2, ...])
     * .then((list) => {
     * // All the objects were deleted.
     * }, (error) => {
     * // An error occurred while deleting one or more of the objects.
     * // If this is an aggregate error, then we can inspect each error
     * // object individually to determine the reason why a particular
     * // object was not deleted.
     * if (error.code === Parse.Error.AGGREGATE_ERROR) {
     * for (var i = 0; i < error.errors.length; i++) {
     * console.log("Couldn't delete " + error.errors[i].object.id +
     * "due to " + error.errors[i].message);
     * }
     * } else {
     * console.log("Delete aborted because of " + error.message);
     * }
     * });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {object} options
     * Valid options are:<ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *     be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeDelete` and `afterDelete` triggers.
     *   <li>transaction: Set to true to enable transactions
     *   <li>batchSize: How many objects to yield in each batch (default: 20)
     * </ul>
     * @static
     * @returns {Promise} A promise that is fulfilled when the destroyAll
     * completes.
     */
    static destroyAll(list: ParseObject[], options?: SaveOptions): Promise<ParseObject<Attributes> | ParseObject<Attributes>[]>;
    /**
     * Saves the given list of Parse.Object.
     * If any error is encountered, stops and calls the error handler.
     *
     * <pre>
     * Parse.Object.saveAll([object1, object2, ...])
     * .then((list) => {
     * // All the objects were saved.
     * }, (error) => {
     * // An error occurred while saving one of the objects.
     * });
     * </pre>
     *
     * @param {Array} list A list of <code>Parse.Object</code>.
     * @param {object} options
     * Valid options are:
     * <ul>
     *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
     *        be used for this request.
     *   <li>sessionToken: A valid session token, used for making a request on
     *       behalf of a specific user.
     *   <li>cascadeSave: If `false`, nested objects will not be saved (default is `true`).
     *   <li>context: A dictionary that is accessible in Cloud Code `beforeSave` and `afterSave` triggers.
     *   <li>transaction: Set to true to enable transactions
     *   <li>batchSize: How many objects to yield in each batch (default: 20)
     * </ul>
     * @static
     * @returns {Parse.Object[]}
     */
    static saveAll<T extends ParseObject[]>(list: T, options?: SaveOptions): Promise<T>;
    /**
     * Creates a reference to a subclass of Parse.Object with the given id. This
     * does not exist on Parse.Object, only on subclasses.
     *
     * <p>A shortcut for: <pre>
     *  var Foo = Parse.Object.extend("Foo");
     *  var pointerToFoo = new Foo();
     *  pointerToFoo.id = "myObjectId";
     * </pre>
     *
     * @param {string} id The ID of the object to create a reference to.
     * @static
     * @returns {Parse.Object} A Parse.Object reference.
     */
    static createWithoutData(id: string): ParseObject;
    /**
     * Creates a new instance of a Parse Object from a JSON representation.
     *
     * @param {object} json The JSON map of the Object's data
     * @param {boolean} override In single instance mode, all old server data
     *   is overwritten if this is set to true
     * @param {boolean} dirty Whether the Parse.Object should set JSON keys to dirty
     * @static
     * @returns {Parse.Object} A Parse.Object reference
     */
    static fromJSON<T extends ParseObject>(json: any, override?: boolean, dirty?: boolean): T;
    /**
     * Registers a subclass of Parse.Object with a specific class name.
     * When objects of that class are retrieved from a query, they will be
     * instantiated with this subclass.
     * This is only necessary when using ES6 subclassing.
     *
     * @param {string} className The class name of the subclass
     * @param {Function} constructor The subclass
     */
    static registerSubclass(className: string, constructor: any): void;
    /**
     * Unegisters a subclass of Parse.Object with a specific class name.
     *
     * @param {string} className The class name of the subclass
     */
    static unregisterSubclass(className: string): void;
    /**
     * Creates a new subclass of Parse.Object for the given Parse class name.
     *
     * <p>Every extension of a Parse class will inherit from the most recent
     * previous extension of that class. When a Parse.Object is automatically
     * created by parsing JSON, it will use the most recent extension of that
     * class.</p>
     *
     * <p>You should call either:<pre>
     *     var MyClass = Parse.Object.extend("MyClass", {
     *         <i>Instance methods</i>,
     *         initialize: function(attrs, options) {
     *             this.someInstanceProperty = [],
     *             <i>Other instance properties</i>
     *         }
     *     }, {
     *         <i>Class properties</i>
     *     });</pre>
     * or, for Backbone compatibility:<pre>
     *     var MyClass = Parse.Object.extend({
     *         className: "MyClass",
     *         <i>Instance methods</i>,
     *         initialize: function(attrs, options) {
     *             this.someInstanceProperty = [],
     *             <i>Other instance properties</i>
     *         }
     *     }, {
     *         <i>Class properties</i>
     *     });</pre></p>
     *
     * @param {string} className The name of the Parse class backing this model.
     * @param {object} [protoProps] Instance properties to add to instances of the
     *     class returned from this method.
     * @param {object} [classProps] Class properties to add the class returned from
     *     this method.
     * @returns {Parse.Object} A new subclass of Parse.Object.
     */
    static extend(className: any, protoProps?: any, classProps?: any): any;
    /**
     * Enable single instance objects, where any local objects with the same Id
     * share the same attributes, and stay synchronized with each other.
     * This is disabled by default in server environments, since it can lead to
     * security issues.
     *
     * @static
     */
    static enableSingleInstance(): void;
    /**
     * Disable single instance objects, where any local objects with the same Id
     * share the same attributes, and stay synchronized with each other.
     * When disabled, you can have two instances of the same object in memory
     * without them sharing attributes.
     *
     * @static
     */
    static disableSingleInstance(): void;
    /**
     * Asynchronously stores the objects and every object they point to in the local datastore,
     * recursively, using a default pin name: _default.
     *
     * If those other objects have not been fetched from Parse, they will not be stored.
     * However, if they have changed data, all the changes will be retained.
     *
     * <pre>
     * await Parse.Object.pinAll([...]);
     * </pre>
     *
     * To retrieve object:
     * <code>query.fromLocalDatastore()</code> or <code>query.fromPin()</code>
     *
     * @param {Array} objects A list of <code>Parse.Object</code>.
     * @returns {Promise} A promise that is fulfilled when the pin completes.
     * @static
     */
    static pinAll(objects: ParseObject[]): Promise<void>;
    /**
     * Asynchronously stores the objects and every object they point to in the local datastore, recursively.
     *
     * If those other objects have not been fetched from Parse, they will not be stored.
     * However, if they have changed data, all the changes will be retained.
     *
     * <pre>
     * await Parse.Object.pinAllWithName(name, [obj1, obj2, ...]);
     * </pre>
     *
     * To retrieve object:
     * <code>query.fromLocalDatastore()</code> or <code>query.fromPinWithName(name)</code>
     *
     * @param {string} name Name of Pin.
     * @param {Array} objects A list of <code>Parse.Object</code>.
     * @returns {Promise} A promise that is fulfilled when the pin completes.
     * @static
     */
    static pinAllWithName(name: string, objects: ParseObject[]): Promise<void>;
    /**
     * Asynchronously removes the objects and every object they point to in the local datastore,
     * recursively, using a default pin name: _default.
     *
     * <pre>
     * await Parse.Object.unPinAll([...]);
     * </pre>
     *
     * @param {Array} objects A list of <code>Parse.Object</code>.
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     * @static
     */
    static unPinAll(objects: ParseObject[]): Promise<void>;
    /**
     * Asynchronously removes the objects and every object they point to in the local datastore, recursively.
     *
     * <pre>
     * await Parse.Object.unPinAllWithName(name, [obj1, obj2, ...]);
     * </pre>
     *
     * @param {string} name Name of Pin.
     * @param {Array} objects A list of <code>Parse.Object</code>.
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     * @static
     */
    static unPinAllWithName(name: string, objects: ParseObject[]): Promise<void>;
    /**
     * Asynchronously removes all objects in the local datastore using a default pin name: _default.
     *
     * <pre>
     * await Parse.Object.unPinAllObjects();
     * </pre>
     *
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     * @static
     */
    static unPinAllObjects(): Promise<void>;
    /**
     * Asynchronously removes all objects with the specified pin name.
     * Deletes the pin name also.
     *
     * <pre>
     * await Parse.Object.unPinAllObjectsWithName(name);
     * </pre>
     *
     * @param {string} name Name of Pin.
     * @returns {Promise} A promise that is fulfilled when the unPin completes.
     * @static
     */
    static unPinAllObjectsWithName(name: string): Promise<void>;
}
export default ParseObject;
