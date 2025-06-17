import * as ParseOp from './ParseOp';
import ACL from './ParseACL';
import * as Analytics from './Analytics';
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import Config from './ParseConfig';
import ParseError from './ParseError';
import File from './ParseFile';
import GeoPoint from './ParseGeoPoint';
import Polygon from './ParsePolygon';
import Installation from './ParseInstallation';
import ParseObject from './ParseObject';
import * as Push from './Push';
import Query from './ParseQuery';
import Relation from './ParseRelation';
import Role from './ParseRole';
import Schema from './ParseSchema';
import Session from './ParseSession';
import User from './ParseUser';
import ParseLiveQuery from './ParseLiveQuery';
import LiveQueryClient from './LiveQueryClient';
import type { EventuallyQueue } from './CoreManager';
declare const Parse: {
    ACL: typeof ACL;
    Analytics: typeof Analytics;
    AnonymousUtils: {
        isLinked(user: User): boolean;
        logIn(options?: import("./RESTController").RequestOptions): Promise<User>;
        link(user: User, options?: import("./RESTController").RequestOptions): Promise<User>;
        isRegistered(): boolean;
        _getAuthProvider(): {
            restoreAuthentication(): boolean;
            getAuthType(): string;
            getAuthData(): {
                authData: {
                    id: string;
                };
            };
        };
    };
    Cloud: typeof Cloud;
    CLP: typeof CLP;
    CoreManager: {
        get: (key: string) => any;
        set: (key: string, value: any) => void;
        setIfNeeded: (key: string, value: any) => any;
        setAnalyticsController(controller: import("./CoreManager").AnalyticsController): void;
        getAnalyticsController(): import("./CoreManager").AnalyticsController;
        setCloudController(controller: import("./CoreManager").CloudController): void;
        getCloudController(): import("./CoreManager").CloudController;
        setConfigController(controller: import("./CoreManager").ConfigController): void;
        getConfigController(): import("./CoreManager").ConfigController;
        setCryptoController(controller: import("./CoreManager").CryptoController): void;
        getCryptoController(): import("./CoreManager").CryptoController;
        setEventEmitter(eventEmitter: any): void;
        getEventEmitter(): any;
        setFileController(controller: import("./CoreManager").FileController): void;
        setEventuallyQueue(controller: EventuallyQueue): void;
        getEventuallyQueue(): EventuallyQueue;
        getFileController(): import("./CoreManager").FileController;
        setInstallationController(controller: import("./CoreManager").InstallationController): void;
        getInstallationController(): import("./CoreManager").InstallationController;
        setLiveQuery(liveQuery: any): void;
        getLiveQuery(): any;
        setObjectController(controller: import("./CoreManager").ObjectController): void;
        getObjectController(): import("./CoreManager").ObjectController;
        setObjectStateController(controller: import("./CoreManager").ObjectStateController): void;
        getObjectStateController(): import("./CoreManager").ObjectStateController;
        setPushController(controller: import("./CoreManager").PushController): void;
        getPushController(): import("./CoreManager").PushController;
        setQueryController(controller: import("./CoreManager").QueryController): void;
        getQueryController(): import("./CoreManager").QueryController;
        setRESTController(controller: import("./CoreManager").RESTController): void;
        getRESTController(): import("./CoreManager").RESTController;
        setSchemaController(controller: import("./CoreManager").SchemaController): void;
        getSchemaController(): import("./CoreManager").SchemaController;
        setSessionController(controller: import("./CoreManager").SessionController): void;
        getSessionController(): import("./CoreManager").SessionController;
        setStorageController(controller: {
            async: 0;
            getItem: (path: string) => string | null;
            setItem: (path: string, value: string) => void;
            removeItem: (path: string) => void;
            getItemAsync?: (path: string) => Promise<string | null>;
            setItemAsync?: (path: string, value: string) => Promise<void>;
            removeItemAsync?: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => string[];
            getAllKeysAsync?: () => Promise<string[]>;
        } | {
            async: 1;
            getItem?: (path: string) => string | null;
            setItem?: (path: string, value: string) => void;
            removeItem?: (path: string) => void;
            getItemAsync: (path: string) => Promise<string | null>;
            setItemAsync: (path: string, value: string) => Promise<void>;
            removeItemAsync: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => string[];
            getAllKeysAsync?: () => Promise<string[]>;
        }): void;
        setLocalDatastoreController(controller: import("./CoreManager").LocalDatastoreController): void;
        getLocalDatastoreController(): import("./CoreManager").LocalDatastoreController;
        setLocalDatastore(store: any): void;
        getLocalDatastore(): any;
        getStorageController(): {
            async: 0;
            getItem: (path: string) => string | null;
            setItem: (path: string, value: string) => void;
            removeItem: (path: string) => void;
            getItemAsync?: (path: string) => Promise<string | null>;
            setItemAsync?: (path: string, value: string) => Promise<void>;
            removeItemAsync?: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => string[];
            getAllKeysAsync?: () => Promise<string[]>;
        } | {
            async: 1;
            getItem?: (path: string) => string | null;
            setItem?: (path: string, value: string) => void;
            removeItem?: (path: string) => void;
            getItemAsync: (path: string) => Promise<string | null>;
            setItemAsync: (path: string, value: string) => Promise<void>;
            removeItemAsync: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => string[];
            getAllKeysAsync?: () => Promise<string[]>;
        };
        setAsyncStorage(storage: import("./CoreManager").AsyncStorageType): void;
        getAsyncStorage(): import("./CoreManager").AsyncStorageType;
        setWebSocketController(controller: new (url: string | URL, protocols?: string | string[] | undefined) => import("./CoreManager").WebSocketController): void;
        getWebSocketController(): new (url: string | URL, protocols?: string | string[] | undefined) => import("./CoreManager").WebSocketController;
        setUserController(controller: import("./CoreManager").UserController): void;
        getUserController(): import("./CoreManager").UserController;
        setLiveQueryController(controller: import("./CoreManager").LiveQueryControllerType): void;
        getLiveQueryController(): import("./CoreManager").LiveQueryControllerType;
        setHooksController(controller: import("./CoreManager").HooksController): void;
        getHooksController(): import("./CoreManager").HooksController;
        setParseOp(op: any): void;
        getParseOp(): any;
        setParseObject(object: any): void;
        getParseObject(): any;
        setParseQuery(query: any): void;
        getParseQuery(): any;
        setParseRole(role: any): void;
        getParseRole(): any;
        setParseUser(user: any): void;
        getParseUser(): any;
    };
    Config: typeof Config;
    Error: typeof ParseError;
    FacebookUtils: {
        init(options: any): void;
        isLinked(user: any): any;
        logIn(permissions: any, options: any): Promise<User<import("./ParseObject").Attributes>>;
        link(user: any, permissions: any, options: any): any;
        unlink: (user: any, options: any) => any;
        _getAuthProvider(): import("./ParseUser").AuthProvider;
    };
    File: typeof File;
    GeoPoint: typeof GeoPoint;
    Polygon: typeof Polygon;
    Installation: typeof Installation;
    LocalDatastore: {
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
        updateFromServer(): Promise<void>;
        getKeyForObject(object: any): string;
        getPinName(pinName?: string): string;
        checkIfEnabled(): any;
    };
    Object: typeof ParseObject;
    Op: {
        Set: typeof ParseOp.SetOp;
        Unset: typeof ParseOp.UnsetOp;
        Increment: typeof ParseOp.IncrementOp;
        Add: typeof ParseOp.AddOp;
        Remove: typeof ParseOp.RemoveOp;
        AddUnique: typeof ParseOp.AddUniqueOp;
        Relation: typeof ParseOp.RelationOp;
    };
    Push: typeof Push;
    Query: typeof Query;
    Relation: typeof Relation;
    Role: typeof Role;
    Schema: typeof Schema;
    Session: typeof Session;
    Storage: {
        async(): boolean;
        getItem(path: string): string | null;
        getItemAsync(path: string): Promise<string | null>;
        setItem(path: string, value: string): void;
        setItemAsync(path: string, value: string): Promise<void>;
        removeItem(path: string): void;
        removeItemAsync(path: string): Promise<void>;
        getAllKeys(): string[];
        getAllKeysAsync(): Promise<string[]>;
        generatePath(path: string): string;
        _clear(): void;
    };
    User: typeof User;
    LiveQueryClient: typeof LiveQueryClient;
    IndexedDB: any;
    Hooks: any;
    Parse: any;
    /**
     * @property {EventuallyQueue} Parse.EventuallyQueue
     * @static
     */
    EventuallyQueue: EventuallyQueue;
    /**
     * Call this method first to set up your authentication tokens for Parse.
     *
     * @param {string} applicationId Your Parse Application ID.
     * @param {string} [javaScriptKey] Your Parse JavaScript Key (Not needed for parse-server)
     * @param {string} [masterKey] Your Parse Master Key. (Node.js only!)
     * @static
     */
    initialize(applicationId: string, javaScriptKey: string): void;
    _initialize(applicationId: string, javaScriptKey: string, masterKey?: string, maintenanceKey?: string): void;
    /**
     * Call this method to set your AsyncStorage engine
     * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
     * is not provided at a stable path and changes over versions.
     *
     * @param {AsyncStorage} storage a react native async storage.
     * @static
     */
    setAsyncStorage(storage: any): void;
    /**
     * Call this method to set your LocalDatastoreStorage engine
     * If using React-Native use {@link Parse.setAsyncStorage Parse.setAsyncStorage()}
     *
     * @param {LocalDatastoreController} controller a data storage.
     * @static
     */
    setLocalDatastoreController(controller: any): void;
    /**
     * Returns information regarding the current server's health
     *
     * @returns {Promise}
     * @static
     */
    getServerHealth(): Promise<any>;
    /**
     * @property {string} Parse.applicationId
     * @static
     */
    applicationId: any;
    /**
     * @property {string} Parse.javaScriptKey
     * @static
     */
    javaScriptKey: any;
    /**
     * @property {string} Parse.masterKey
     * @static
     */
    masterKey: any;
    /**
     * @property {string} Parse.maintenanceKey
     * @static
     */
    maintenanceKey: any;
    /**
     * @property {string} Parse.serverURL
     * @static
     */
    serverURL: any;
    /**
     * @property {ParseLiveQuery} Parse.LiveQuery
     * @static
     */
    LiveQuery: ParseLiveQuery;
    /**
     * @property {string} Parse.liveQueryServerURL
     * @static
     */
    liveQueryServerURL: any;
    /**
     * @property {boolean} Parse.encryptedUser
     * @static
     */
    encryptedUser: boolean;
    /**
     * @property {string} Parse.secret
     * @static
     */
    secret: any;
    /**
     * @property {boolean} Parse.idempotency
     * @static
     */
    idempotency: any;
    /**
     * @property {boolean} Parse.allowCustomObjectId
     * @static
     */
    allowCustomObjectId: any;
    /**
     * Setting this property to `true` enables enhanced logging for `Parse.Object`
     * in Node.js environments. Specifically, it will log:
     *
     * ```
     * ParseObject: className: <CLASS_NAME>, id: <OBJECT_ID>
     * Attributes: <OBJECT_ATTRIBUTES>
     * ```
     *
     * @warning This should not be enabled in production environments as this may
     * expose sensitive information in server logs.
     *
     * @property {boolean} Parse.nodeLogging
     * @static
     */
    nodeLogging: any;
    _request(...args: any[]): any;
    _ajax(...args: any[]): any;
    _decode(_: any, value: any): any;
    _encode(value: any, _: any, disallowObjects: any): any;
    _getInstallationId(): Promise<string>;
    /**
     * Enable pinning in your application.
     * This must be called after `Parse.initialize` in your application.
     *
     * @param [polling] Allow pinging the server /health endpoint. Default true
     * @param [ms] Milliseconds to ping the server. Default 2000ms
     * @static
     */
    enableLocalDatastore(polling?: boolean, ms?: number): void;
    /**
     * Flag that indicates whether Local Datastore is enabled.
     *
     * @static
     * @returns {boolean}
     */
    isLocalDatastoreEnabled(): boolean;
    /**
     * Gets all contents from Local Datastore
     *
     * <pre>
     * await Parse.dumpLocalDatastore();
     * </pre>
     *
     * @static
     * @returns {object}
     */
    dumpLocalDatastore(): Promise<any>;
    /**
     * Enable the current user encryption.
     * This must be called before login any user.
     *
     * @static
     */
    enableEncryptedUser(): void;
    /**
     * Flag that indicates whether Encrypted User is enabled.
     *
     * @static
     * @returns {boolean}
     */
    isEncryptedUserEnabled(): any;
};
export default Parse;
