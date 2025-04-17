import type ParseObject from './ParseObject';
/**
 * Provides a local datastore which can be used to store and retrieve <code>Parse.Object</code>. <br />
 * To enable this functionality, call <code>Parse.enableLocalDatastore()</code>.
 *
 * Pin object to add to local datastore
 *
 * <pre>await object.pin();</pre>
 * <pre>await object.pinWithName('pinName');</pre>
 *
 * Query pinned objects
 *
 * <pre>query.fromLocalDatastore();</pre>
 * <pre>query.fromPin();</pre>
 * <pre>query.fromPinWithName();</pre>
 *
 * <pre>const localObjects = await query.find();</pre>
 *
 * @class Parse.LocalDatastore
 * @static
 */
declare const LocalDatastore: {
    isEnabled: boolean;
    isSyncing: boolean;
    fromPinWithName(name: string): Promise<any[]>;
    pinWithName(name: string, value: any): Promise<void>;
    unPinWithName(name: string): Promise<void>;
    _getAllContents(): Promise<any>;
    _getRawStorage(): Promise<any>;
    _clear(): Promise<void>;
    _handlePinAllWithName(name: string, objects: ParseObject[]): Promise<void>;
    _handleUnPinAllWithName(name: string, objects: ParseObject[]): Promise<any[]>;
    _getChildren(object: ParseObject): any;
    _traverse(object: any, encountered: any): void;
    _serializeObjectsFromPinName(name: string): Promise<any[]>;
    _serializeObject(objectKey: string, localDatastore: any): Promise<any>;
    _updateObjectIfPinned(object: ParseObject): Promise<void>;
    _destroyObjectIfPinned(object: ParseObject): Promise<any[]>;
    _updateLocalIdForObject(localId: string, object: ParseObject): Promise<any[]>;
    /**
     * Updates Local Datastore from Server
     *
     * <pre>
     * await Parse.LocalDatastore.updateFromServer();
     * </pre>
     *
     * @function updateFromServer
     * @name Parse.LocalDatastore.updateFromServer
     * @static
     */
    updateFromServer(): Promise<void>;
    getKeyForObject(object: any): string;
    getPinName(pinName?: string): string;
    checkIfEnabled(): any;
};
export default LocalDatastore;
