export default LocalDatastore;
declare namespace LocalDatastore {
    let isEnabled: boolean;
    let isSyncing: boolean;
    function fromPinWithName(name: string): Promise<Object[]>;
    function pinWithName(name: string, value: any): Promise<void>;
    function unPinWithName(name: string): Promise<void>;
    function _getAllContents(): Promise<Object>;
    function _getRawStorage(): Promise<Object>;
    function _clear(): Promise<void>;
    function _handlePinAllWithName(name: string, objects: ParseObject[]): Promise<void>;
    function _handleUnPinAllWithName(name: string, objects: ParseObject[]): Promise<void[]>;
    function _getChildren(object: ParseObject): {};
    function _traverse(object: any, encountered: any): void;
    function _serializeObjectsFromPinName(name: string): Promise<any[]>;
    function _serializeObject(objectKey: string, localDatastore: any): Promise<any>;
    function _updateObjectIfPinned(object: ParseObject): Promise<void>;
    function _destroyObjectIfPinned(object: ParseObject): Promise<void[]>;
    function _updateLocalIdForObject(localId: string, object: ParseObject): Promise<void[]>;
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
    function updateFromServer(): Promise<void>;
    function getKeyForObject(object: any): string;
    function getPinName(pinName: string): string;
    function checkIfEnabled(): boolean;
}
import ParseObject from './ParseObject';
