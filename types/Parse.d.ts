import * as ParseOp from './ParseOp';
import ACL from './ParseACL';
import * as Analytics from './Analytics';
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import Config from './ParseConfig';
import ParseError from './ParseError';
import File from './ParseFile';
import * as Hooks from './ParseHooks';
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
        setAnalyticsController(controller: {
            track: (name: string, dimensions: {
                [key: string]: string;
            }) => Promise<any>;
        }): void;
        getAnalyticsController(): {
            track: (name: string, dimensions: {
                [key: string]: string;
            }) => Promise<any>;
        };
        setCloudController(controller: {
            run: (name: string, data: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            getJobsData: (options?: import("./RESTController").RequestOptions) => Promise<any>;
            startJob: (name: string, data: any, options?: import("./RESTController").RequestOptions) => Promise<string>;
        }): void;
        getCloudController(): {
            run: (name: string, data: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            getJobsData: (options?: import("./RESTController").RequestOptions) => Promise<any>;
            startJob: (name: string, data: any, options?: import("./RESTController").RequestOptions) => Promise<string>;
        };
        setConfigController(controller: {
            current: () => Promise<Config> | Config;
            get: (opts?: import("./RESTController").RequestOptions) => Promise<Config>;
            save: (attrs: {
                [key: string]: any;
            }, masterKeyOnlyFlags?: {
                [key: string]: any;
            }) => Promise<void>;
        }): void;
        getConfigController(): {
            current: () => Promise<Config> | Config;
            get: (opts?: import("./RESTController").RequestOptions) => Promise<Config>;
            save: (attrs: {
                [key: string]: any;
            }, masterKeyOnlyFlags?: {
                [key: string]: any;
            }) => Promise<void>;
        };
        setCryptoController(controller: {
            encrypt: (obj: any, secretKey: string) => string;
            decrypt: (encryptedText: string, secretKey: any) => string;
        }): void;
        getCryptoController(): {
            encrypt: (obj: any, secretKey: string) => string;
            decrypt: (encryptedText: string, secretKey: any) => string;
        };
        setEventEmitter(eventEmitter: any): void;
        getEventEmitter(): any;
        setFileController(controller: {
            saveFile: (name: string, source: import("./ParseFile").FileSource, options?: import("./RESTController").FullOptions) => Promise<any>;
            saveBase64: (name: string, source: import("./ParseFile").FileSource, options?: import("./ParseFile").FileSaveOptions) => Promise<{
                name: string;
                url: string;
            }>;
            download: (uri: string, options?: any) => Promise<{
                base64?: string;
                contentType?: string;
            }>;
            deleteFile: (name: string, options?: {
                useMasterKey?: boolean;
            }) => Promise<void>;
        }): void;
        setEventuallyQueue(controller: EventuallyQueue): void;
        getEventuallyQueue(): EventuallyQueue;
        getFileController(): {
            saveFile: (name: string, source: import("./ParseFile").FileSource, options?: import("./RESTController").FullOptions) => Promise<any>;
            saveBase64: (name: string, source: import("./ParseFile").FileSource, options?: import("./ParseFile").FileSaveOptions) => Promise<{
                name: string;
                url: string;
            }>;
            download: (uri: string, options?: any) => Promise<{
                base64?: string;
                contentType?: string;
            }>;
            deleteFile: (name: string, options?: {
                useMasterKey?: boolean;
            }) => Promise<void>;
        };
        setInstallationController(controller: {
            currentInstallationId: () => Promise<string>;
            currentInstallation: () => Promise<Installation | null>;
            updateInstallationOnDisk: (installation: Installation) => Promise<void>;
        }): void;
        getInstallationController(): {
            currentInstallationId: () => Promise<string>;
            currentInstallation: () => Promise<Installation | null>;
            updateInstallationOnDisk: (installation: Installation) => Promise<void>;
        };
        setLiveQuery(liveQuery: any): void;
        getLiveQuery(): any;
        setObjectController(controller: {
            fetch: (object: ParseObject | Array<ParseObject>, forceFetch: boolean, options?: import("./RESTController").RequestOptions) => Promise<Array<ParseObject | undefined> | ParseObject | undefined>;
            save: (object: ParseObject | Array<ParseObject | File> | null, options?: import("./RESTController").RequestOptions) => Promise<ParseObject | Array<ParseObject> | File | undefined>;
            destroy: (object: ParseObject | Array<ParseObject>, options?: import("./RESTController").RequestOptions) => Promise<ParseObject | Array<ParseObject>>;
        }): void;
        getObjectController(): {
            fetch: (object: ParseObject | Array<ParseObject>, forceFetch: boolean, options?: import("./RESTController").RequestOptions) => Promise<Array<ParseObject | undefined> | ParseObject | undefined>;
            save: (object: ParseObject | Array<ParseObject | File> | null, options?: import("./RESTController").RequestOptions) => Promise<ParseObject | Array<ParseObject> | File | undefined>;
            destroy: (object: ParseObject | Array<ParseObject>, options?: import("./RESTController").RequestOptions) => Promise<ParseObject | Array<ParseObject>>;
        };
        setObjectStateController(controller: {
            getState: (obj: any) => import("./ObjectStateMutations").State | null;
            initializeState: (obj: any, initial?: import("./ObjectStateMutations").State) => import("./ObjectStateMutations").State;
            removeState: (obj: any) => import("./ObjectStateMutations").State | null;
            getServerData: (obj: any) => import("./ObjectStateMutations").AttributeMap;
            setServerData: (obj: any, attributes: import("./ObjectStateMutations").AttributeMap) => void;
            getPendingOps: (obj: any) => Array<import("./ObjectStateMutations").OpsMap>;
            setPendingOp: (obj: any, attr: string, op?: ParseOp.Op) => void;
            pushPendingState: (obj: any) => void;
            popPendingState: (obj: any) => import("./ObjectStateMutations").OpsMap | undefined;
            mergeFirstPendingState: (obj: any) => void;
            getObjectCache: (obj: any) => import("./ObjectStateMutations").ObjectCache;
            estimateAttribute: (obj: any, attr: string) => any;
            estimateAttributes: (obj: any) => import("./ObjectStateMutations").AttributeMap;
            commitServerChanges: (obj: any, changes: import("./ObjectStateMutations").AttributeMap) => void;
            enqueueTask: (obj: any, task: () => Promise<void>) => Promise<void>;
            clearAllState: () => void;
            duplicateState: (source: any, dest: any) => void;
        }): void;
        getObjectStateController(): {
            getState: (obj: any) => import("./ObjectStateMutations").State | null;
            initializeState: (obj: any, initial?: import("./ObjectStateMutations").State) => import("./ObjectStateMutations").State;
            removeState: (obj: any) => import("./ObjectStateMutations").State | null;
            getServerData: (obj: any) => import("./ObjectStateMutations").AttributeMap;
            setServerData: (obj: any, attributes: import("./ObjectStateMutations").AttributeMap) => void;
            getPendingOps: (obj: any) => Array<import("./ObjectStateMutations").OpsMap>;
            setPendingOp: (obj: any, attr: string, op?: ParseOp.Op) => void;
            pushPendingState: (obj: any) => void;
            popPendingState: (obj: any) => import("./ObjectStateMutations").OpsMap | undefined;
            mergeFirstPendingState: (obj: any) => void;
            getObjectCache: (obj: any) => import("./ObjectStateMutations").ObjectCache;
            estimateAttribute: (obj: any, attr: string) => any;
            estimateAttributes: (obj: any) => import("./ObjectStateMutations").AttributeMap;
            commitServerChanges: (obj: any, changes: import("./ObjectStateMutations").AttributeMap) => void;
            enqueueTask: (obj: any, task: () => Promise<void>) => Promise<void>;
            clearAllState: () => void;
            duplicateState: (source: any, dest: any) => void;
        };
        setPushController(controller: {
            send: (data: Push.PushData, options?: import("./RESTController").FullOptions) => Promise<any>;
        }): void;
        getPushController(): {
            send: (data: Push.PushData, options?: import("./RESTController").FullOptions) => Promise<any>;
        };
        setQueryController(controller: {
            find(className: string, params: import("./ParseQuery").QueryJSON, options?: import("./RESTController").RequestOptions): Promise<{
                results?: Array<ParseObject>;
                className?: string;
                count?: number;
            }>;
            aggregate(className: string, params: any, options?: import("./RESTController").RequestOptions): Promise<{
                results?: Array<any>;
            }>;
        }): void;
        getQueryController(): {
            find(className: string, params: import("./ParseQuery").QueryJSON, options?: import("./RESTController").RequestOptions): Promise<{
                results?: Array<ParseObject>;
                className?: string;
                count?: number;
            }>;
            aggregate(className: string, params: any, options?: import("./RESTController").RequestOptions): Promise<{
                results?: Array<any>;
            }>;
        };
        setRESTController(controller: {
            request: (method: string, path: string, data?: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            ajax: (method: string, url: string, data: any, headers?: any, options?: import("./RESTController").FullOptions) => Promise<any>;
            handleError: (err?: any) => void;
        }): void;
        getRESTController(): {
            request: (method: string, path: string, data?: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            ajax: (method: string, url: string, data: any, headers?: any, options?: import("./RESTController").FullOptions) => Promise<any>;
            handleError: (err?: any) => void;
        };
        setSchemaController(controller: {
            purge: (className: string) => Promise<any>;
            get: (className: string, options?: import("./RESTController").RequestOptions) => Promise<any>;
            delete: (className: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
            create: (className: string, params: any, options? /**
             * @member {string} Parse.maintenanceKey
             * @static
             */: import("./RESTController").RequestOptions) => Promise<any>;
            update: (className: string, params: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            send(className: string, method: string, params: any, options?: import("./RESTController").RequestOptions): Promise<any>;
        }): void;
        getSchemaController(): {
            purge: (className: string) => Promise<any>;
            get: (className: string, options?: import("./RESTController").RequestOptions) => Promise<any>;
            delete: (className: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
            create: (className: string, params: any, options? /**
             * @member {string} Parse.maintenanceKey
             * @static
             */: import("./RESTController").RequestOptions) => Promise<any>;
            update: (className: string, params: any, options?: import("./RESTController").RequestOptions) => Promise<any>;
            send(className: string, method: string, params: any, options?: import("./RESTController").RequestOptions): Promise<any>;
        };
        setSessionController(controller: {
            getSession: (options?: import("./RESTController").RequestOptions) => Promise<Session>;
        }): void;
        getSessionController(): {
            getSession: (options?: import("./RESTController").RequestOptions) => Promise<Session>;
        };
        setStorageController(controller: {
            async: 0;
            getItem: (path: string) => string | null;
            setItem: (path: string, value: string) => void;
            removeItem: (path: string) => void;
            getItemAsync?: (path: string) => Promise<string | null>;
            setItemAsync?: (path: string, value: string) => Promise<void>;
            removeItemAsync?: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => Array<string>;
            getAllKeysAsync?: () => Promise<Array<string>>;
        } | {
            async: 1;
            getItem?: (path: string) => string | null;
            setItem?: (path: string, value: string) => void;
            removeItem?: (path: string) => void;
            getItemAsync: (path: string) => Promise<string | null>;
            setItemAsync: (path: string, value: string) => Promise<void>;
            removeItemAsync: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => Array<string>;
            getAllKeysAsync?: () => Promise<Array<string>>;
        }): void;
        setLocalDatastoreController(controller: {
            fromPinWithName: (name: string) => any | undefined;
            pinWithName: (name: string, objects: any) => void;
            unPinWithName: (name: string) => void;
            getAllContents: () => any | undefined;
            clear: () => void;
        }): void;
        getLocalDatastoreController(): {
            fromPinWithName: (name: string) => any | undefined;
            pinWithName: (name: string, objects: any) => void;
            unPinWithName: (name: string) => void;
            getAllContents: () => any | undefined;
            clear: () => void;
        };
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
            getAllKeys?: () => Array<string>;
            getAllKeysAsync?: () => Promise<Array<string>>;
        } | {
            async: 1;
            getItem?: (path: string) => string | null;
            setItem?: (path: string, value: string) => void;
            removeItem?: (path: string) => void;
            getItemAsync: (path: string) => Promise<string | null>;
            setItemAsync: (path: string, value: string) => Promise<void>;
            removeItemAsync: (path: string) => Promise<void>;
            clear: () => void;
            getAllKeys?: () => Array<string>;
            getAllKeysAsync?: () => Promise<Array<string>>;
        };
        setAsyncStorage(storage: {
            getItem: (key: string, callback?: (error?: Error | null, result?: string | null) => void) => Promise<string | null>;
            setItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
            removeItem: (key: string, callback?: (error?: Error | null) => void) => Promise<void>;
            mergeItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
            clear: (callback?: (error?: Error | null) => void) => Promise<void>;
            getAllKeys: (callback?: (error?: Error | null, result?: readonly string[] | null) => void) => Promise<readonly string[]>;
            multiGet: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null, result?: readonly [string, string][]) => void) => Promise<readonly [string, string | null][]>;
            multiSet: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<readonly [string, string | null][]>;
            multiRemove: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
            multiMerge: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
        }): void;
        getAsyncStorage(): {
            getItem: (key: string, callback?: (error?: Error | null, result?: string | null) => void) => Promise<string | null>;
            setItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
            removeItem: (key: string, callback?: (error?: Error | null) => void) => Promise<void>;
            mergeItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
            clear: (callback?: (error?: Error | null) => void) => Promise<void>;
            getAllKeys: (callback?: (error?: Error | null, result?: readonly string[] | null) => void) => Promise<readonly string[]>;
            multiGet: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null, result?: readonly [string, string][]) => void) => Promise<readonly [string, string | null][]>;
            multiSet: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<readonly [string, string | null][]>;
            multiRemove: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
            multiMerge: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
        };
        setWebSocketController(controller: new (url: string | URL, protocols?: string | string[] | undefined) => import("./CoreManager").WebSocketController): void;
        getWebSocketController(): new (url: string | URL, protocols?: string | string[] | undefined) => import("./CoreManager").WebSocketController;
        setUserController(controller: {
            setCurrentUser: (user: User) => Promise<void>;
            currentUser: () => User | null;
            currentUserAsync: () => Promise<User | null>;
            signUp: (user: User, attrs: import("./ObjectStateMutations").AttributeMap, options?: import("./RESTController").RequestOptions) => Promise<User>;
            logIn: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            loginAs: (user: User, userId: string) => Promise<User>;
            become: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            hydrate: (user: User, userJSON: import("./ObjectStateMutations").AttributeMap) => Promise<User>;
            logOut: (options?: import("./RESTController").RequestOptions) => Promise<void>;
            me: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            requestPasswordReset: (email: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
            updateUserOnDisk: (user: User) => Promise<User>;
            upgradeToRevocableSession: (user: User, options?: import("./RESTController").RequestOptions) => Promise<void>;
            linkWith: (user: User, authData: import("./ParseUser").AuthData, options?: import("./RESTController").FullOptions) => Promise<User>;
            removeUserFromDisk: () => Promise<User | void>;
            verifyPassword: (username: string, password: string, options?: import("./RESTController").RequestOptions) => Promise<User>;
            requestEmailVerification: (email: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
        }): void;
        getUserController(): {
            setCurrentUser: (user: User) => Promise<void>;
            currentUser: () => User | null;
            currentUserAsync: () => Promise<User | null>;
            signUp: (user: User, attrs: import("./ObjectStateMutations").AttributeMap, options?: import("./RESTController").RequestOptions) => Promise<User>;
            logIn: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            loginAs: (user: User, userId: string) => Promise<User>;
            become: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            hydrate: (user: User, userJSON: import("./ObjectStateMutations").AttributeMap) => Promise<User>;
            logOut: (options?: import("./RESTController").RequestOptions) => Promise<void>;
            me: (user: User, options?: import("./RESTController").RequestOptions) => Promise<User>;
            requestPasswordReset: (email: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
            updateUserOnDisk: (user: User) => Promise<User>;
            upgradeToRevocableSession: (user: User, options?: import("./RESTController").RequestOptions) => Promise<void>;
            linkWith: (user: User, authData: import("./ParseUser").AuthData, options?: import("./RESTController").FullOptions) => Promise<User>;
            removeUserFromDisk: () => Promise<User | void>;
            verifyPassword: (username: string, password: string, options?: import("./RESTController").RequestOptions) => Promise<User>;
            requestEmailVerification: (email: string, options?: import("./RESTController").RequestOptions) => Promise<void>;
        };
        setLiveQueryController(controller: {
            setDefaultLiveQueryClient(liveQueryClient: LiveQueryClient): void;
            getDefaultLiveQueryClient(): Promise<LiveQueryClient>;
            _clearCachedDefaultClient(): void;
        }): void;
        getLiveQueryController(): {
            setDefaultLiveQueryClient(liveQueryClient: LiveQueryClient): void;
            getDefaultLiveQueryClient(): Promise<LiveQueryClient>;
            _clearCachedDefaultClient(): void;
        };
        setHooksController(controller: {
            get: (type: string, functionName?: string, triggerName?: string) => Promise<any>;
            create: (hook: Hooks.HookDeclaration) => Promise<any>;
            remove: (hook: Hooks.HookDeleteArg) => Promise<any>;
            update: (hook: Hooks.HookDeclaration) => Promise<any>;
            sendRequest?: (method: string, path: string, body?: any) => Promise<any>;
        }): void;
        getHooksController(): {
            get: (type: string, functionName?: string, triggerName?: string) => Promise<any>;
            create: (hook: Hooks.HookDeclaration) => Promise<any>;
            remove: (hook: Hooks.HookDeleteArg) => Promise<any>;
            update: (hook: Hooks.HookDeclaration) => Promise<any>;
            sendRequest?: (method: string, path: string, body?: any) => Promise<any>;
        };
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
        fromPinWithName(name: string): Promise<Array<any>>;
        pinWithName(name: string, value: any): Promise<void>;
        unPinWithName(name: string): Promise<void>;
        _getAllContents(): Promise<any>;
        _getRawStorage(): Promise<any>;
        _clear(): Promise<void>;
        _handlePinAllWithName(name: string, objects: Array<ParseObject>): Promise<void>;
        _handleUnPinAllWithName(name: string, objects: Array<ParseObject>): Promise<any[]>;
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
        getAllKeys(): Array<string>;
        getAllKeysAsync(): Promise<Array<string>>;
        generatePath(path: string): string;
        _clear(): void;
    };
    User: typeof User;
    LiveQueryClient: typeof LiveQueryClient;
    IndexedDB: any;
    Hooks: any;
    Parse: any;
    /**
     * @member {EventuallyQueue} Parse.EventuallyQueue
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
     * @member {string} Parse.applicationId
     * @static
     */
    applicationId: any;
    /**
     * @member {string} Parse.javaScriptKey
     * @static
     */
    javaScriptKey: any;
    /**
     * @member {string} Parse.masterKey
     * @static
     */
    masterKey: any;
    /**
     * @member {string} Parse.maintenanceKey
     * @static
     */
    maintenanceKey: any;
    /**
     * @member {string} Parse.serverURL
     * @static
     */
    serverURL: any;
    /**
     * @member {string} Parse.serverAuthToken
     * @static
     */
    serverAuthToken: any;
    /**
     * @member {string} Parse.serverAuthType
     * @static
     */
    serverAuthType: any;
    /**
     * @member {ParseLiveQuery} Parse.LiveQuery
     * @static
     */
    LiveQuery: ParseLiveQuery;
    /**
     * @member {string} Parse.liveQueryServerURL
     * @static
     */
    liveQueryServerURL: any;
    /**
     * @member {boolean} Parse.encryptedUser
     * @static
     */
    encryptedUser: boolean;
    /**
     * @member {string} Parse.secret
     * @static
     */
    secret: any;
    /**
     * @member {boolean} Parse.idempotency
     * @static
     */
    idempotency: any;
    /**
     * @member {boolean} Parse.allowCustomObjectId
     * @static
     */
    allowCustomObjectId: any;
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
