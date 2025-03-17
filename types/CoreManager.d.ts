import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';
import type ParseFile from './ParseFile';
import type { FileSaveOptions, FileSource } from './ParseFile';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
import type { SaveOptions } from './ParseObject';
import type { QueryJSON } from './ParseQuery';
import type ParseUser from './ParseUser';
import type { AuthData } from './ParseUser';
import type { PushData } from './Push';
import type { RequestOptions, FullOptions } from './RESTController';
import type ParseSession from './ParseSession';
import type { HookDeclaration, HookDeleteArg } from './ParseHooks';
import type ParseConfig from './ParseConfig';
import type LiveQueryClient from './LiveQueryClient';
import type ParseInstallation from './ParseInstallation';
type AnalyticsController = {
    track: (name: string, dimensions: {
        [key: string]: string;
    }) => Promise<any>;
};
type CloudController = {
    run: (name: string, data: any, options?: RequestOptions) => Promise<any>;
    getJobsData: (options?: RequestOptions) => Promise<any>;
    /** Returns promise which resolves with JobStatusId of the job */
    startJob: (name: string, data: any, options?: RequestOptions) => Promise<string>;
};
type ConfigController = {
    current: () => Promise<ParseConfig> | ParseConfig;
    get: (opts?: RequestOptions) => Promise<ParseConfig>;
    save: (attrs: {
        [key: string]: any;
    }, masterKeyOnlyFlags?: {
        [key: string]: any;
    }) => Promise<void>;
};
type CryptoController = {
    encrypt: (obj: any, secretKey: string) => string;
    decrypt: (encryptedText: string, secretKey: any) => string;
};
type FileController = {
    saveFile: (name: string, source: FileSource, options?: FullOptions) => Promise<any>;
    saveBase64: (name: string, source: FileSource, options?: FileSaveOptions) => Promise<{
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
type InstallationController = {
    currentInstallationId: () => Promise<string>;
    currentInstallation: () => Promise<ParseInstallation | null>;
    updateInstallationOnDisk: (installation: ParseInstallation) => Promise<void>;
};
type ObjectController = {
    fetch: (object: ParseObject | Array<ParseObject>, forceFetch: boolean, options?: RequestOptions) => Promise<Array<ParseObject | undefined> | ParseObject | undefined>;
    save: (object: ParseObject | Array<ParseObject | ParseFile> | null, options?: RequestOptions) => Promise<ParseObject | Array<ParseObject> | ParseFile | undefined>;
    destroy: (object: ParseObject | Array<ParseObject>, options?: RequestOptions) => Promise<ParseObject | Array<ParseObject>>;
};
type ObjectStateController = {
    getState: (obj: any) => State | null;
    initializeState: (obj: any, initial?: State) => State;
    removeState: (obj: any) => State | null;
    getServerData: (obj: any) => AttributeMap;
    setServerData: (obj: any, attributes: AttributeMap) => void;
    getPendingOps: (obj: any) => Array<OpsMap>;
    setPendingOp: (obj: any, attr: string, op?: Op) => void;
    pushPendingState: (obj: any) => void;
    popPendingState: (obj: any) => OpsMap | undefined;
    mergeFirstPendingState: (obj: any) => void;
    getObjectCache: (obj: any) => ObjectCache;
    estimateAttribute: (obj: any, attr: string) => any;
    estimateAttributes: (obj: any) => AttributeMap;
    commitServerChanges: (obj: any, changes: AttributeMap) => void;
    enqueueTask: (obj: any, task: () => Promise<void>) => Promise<void>;
    clearAllState: () => void;
    duplicateState: (source: any, dest: any) => void;
};
type PushController = {
    send: (data: PushData, options?: FullOptions) => Promise<any>;
};
type QueryController = {
    find(className: string, params: QueryJSON, options?: RequestOptions): Promise<{
        results?: Array<ParseObject>;
        className?: string;
        count?: number;
    }>;
    aggregate(className: string, params: any, options?: RequestOptions): Promise<{
        results?: Array<any>;
    }>;
};
export type QueueObject = {
    queueId: string;
    action: string;
    object: ParseObject;
    serverOptions: SaveOptions | RequestOptions;
    id: string;
    className: string;
    hash: string;
    createdAt: Date;
};
export type Queue = Array<QueueObject>;
export type EventuallyQueue = {
    save: (object: ParseObject, serverOptions?: SaveOptions) => Promise<void>;
    destroy: (object: ParseObject, serverOptions?: RequestOptions) => Promise<void>;
    generateQueueId: (action: string, object: ParseObject) => string;
    enqueue(action: string, object: ParseObject, serverOptions?: SaveOptions | RequestOptions): Promise<void>;
    store(data: Queue): Promise<void>;
    load(): Promise<string | null>;
    getQueue(): Promise<Queue>;
    setQueue(queue: Queue): Promise<void>;
    remove(queueId: string): Promise<void>;
    clear(): Promise<void>;
    queueItemExists(queue: Queue, queueId: string): number;
    length(): Promise<number>;
    sendQueue(): Promise<boolean>;
    sendQueueCallback(object: ParseObject, queueObject: QueueObject): Promise<void>;
    poll(ms?: number): void;
    stopPoll(): void;
    isPolling(): boolean;
    process: {
        create(ObjectType: any, queueObject: any): Promise<void>;
        byId(ObjectType: any, queueObject: any): Promise<void>;
        byHash(ObjectType: any, queueObject: any): Promise<void>;
    };
};
type RESTController = {
    request: (method: string, path: string, data?: any, options?: RequestOptions) => Promise<any>;
    ajax: (method: string, url: string, data: any, headers?: any, options?: FullOptions) => Promise<any>;
    handleError: (err?: any) => void;
};
type SchemaController = {
    purge: (className: string) => Promise<any>;
    get: (className: string, options?: RequestOptions) => Promise<any>;
    delete: (className: string, options?: RequestOptions) => Promise<void>;
    create: (className: string, params: any, options?: RequestOptions) => Promise<any>;
    update: (className: string, params: any, options?: RequestOptions) => Promise<any>;
    send(className: string, method: string, params: any, options?: RequestOptions): Promise<any>;
};
type SessionController = {
    getSession: (options?: RequestOptions) => Promise<ParseSession>;
};
type StorageController = {
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
type LocalDatastoreController = {
    fromPinWithName: (name: string) => any | undefined;
    pinWithName: (name: string, objects: any) => void;
    unPinWithName: (name: string) => void;
    getAllContents: () => any | undefined;
    clear: () => void;
};
type UserController = {
    setCurrentUser: (user: ParseUser) => Promise<void>;
    currentUser: () => ParseUser | null;
    currentUserAsync: () => Promise<ParseUser | null>;
    signUp: (user: ParseUser, attrs: AttributeMap, options?: RequestOptions) => Promise<ParseUser>;
    logIn: (user: ParseUser, options?: RequestOptions) => Promise<ParseUser>;
    loginAs: (user: ParseUser, userId: string) => Promise<ParseUser>;
    become: (user: ParseUser, options?: RequestOptions) => Promise<ParseUser>;
    hydrate: (user: ParseUser, userJSON: AttributeMap) => Promise<ParseUser>;
    logOut: (options?: RequestOptions) => Promise<void>;
    me: (user: ParseUser, options?: RequestOptions) => Promise<ParseUser>;
    requestPasswordReset: (email: string, options?: RequestOptions) => Promise<void>;
    updateUserOnDisk: (user: ParseUser) => Promise<ParseUser>;
    upgradeToRevocableSession: (user: ParseUser, options?: RequestOptions) => Promise<void>;
    linkWith: (user: ParseUser, authData: AuthData, options?: FullOptions) => Promise<ParseUser>;
    removeUserFromDisk: () => Promise<ParseUser | void>;
    verifyPassword: (username: string, password: string, options?: RequestOptions) => Promise<ParseUser>;
    requestEmailVerification: (email: string, options?: RequestOptions) => Promise<void>;
};
type HooksController = {
    get: (type: string, functionName?: string, triggerName?: string) => Promise<any>;
    create: (hook: HookDeclaration) => Promise<any>;
    remove: (hook: HookDeleteArg) => Promise<any>;
    update: (hook: HookDeclaration) => Promise<any>;
    sendRequest?: (method: string, path: string, body?: any) => Promise<any>;
};
type LiveQueryControllerType = {
    setDefaultLiveQueryClient(liveQueryClient: LiveQueryClient): void;
    getDefaultLiveQueryClient(): Promise<LiveQueryClient>;
    _clearCachedDefaultClient(): void;
};
/** Based on https://github.com/react-native-async-storage/async-storage/blob/main/packages/default-storage-backend/src/types.ts */
type AsyncStorageType = {
    /** Fetches an item for a `key` and invokes a callback upon completion. */
    getItem: (key: string, callback?: (error?: Error | null, result?: string | null) => void) => Promise<string | null>;
    /** Sets the value for a `key` and invokes a callback upon completion. */
    setItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
    /** Removes an item for a `key` and invokes a callback upon completion. */
    removeItem: (key: string, callback?: (error?: Error | null) => void) => Promise<void>;
    /** Merges an existing `key` value with an input value, assuming both values are stringified JSON. */
    mergeItem: (key: string, value: string, callback?: (error?: Error | null) => void) => Promise<void>;
    /**
     * Erases *all* `AsyncStorage` for all clients, libraries, etc. You probably
     * don't want to call this; use `removeItem` or `multiRemove` to clear only
     * your app's keys.
     */
    clear: (callback?: (error?: Error | null) => void) => Promise<void>;
    /** Gets *all* keys known to your app; for all callers, libraries, etc. */
    getAllKeys: (callback?: (error?: Error | null, result?: readonly string[] | null) => void) => Promise<readonly string[]>;
    /**
     * This allows you to batch the fetching of items given an array of `key`
     * inputs. Your callback will be invoked with an array of corresponding
     * key-value pairs found.
     */
    multiGet: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null, result?: readonly [string, string][]) => void) => Promise<readonly [string, string | null][]>;
    /**
     * Use this as a batch operation for storing multiple key-value pairs. When
     * the operation completes you'll get a single callback with any errors.
     *
     * See https://react-native-async-storage.github.io/async-storage/docs/api#multiset
     */
    multiSet: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<readonly [string, string | null][]>;
    /**
     * Call this to batch the deletion of all keys in the `keys` array.
     *
     * See https://react-native-async-storage.github.io/async-storage/docs/api#multiremove
     */
    multiRemove: (keys: readonly string[], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
    /**
     * Batch operation to merge in existing and new values for a given set of
     * keys. This assumes that the values are stringified JSON.
     *
     * See https://react-native-async-storage.github.io/async-storage/docs/api#multimerge
     */
    multiMerge: (keyValuePairs: [string, string][], callback?: (errors?: readonly (Error | null)[] | null) => void) => Promise<void>;
};
export type WebSocketController = {
    onopen: () => void;
    onmessage: (message: any) => void;
    onclose: (arg?: any) => void;
    onerror: (error: any) => void;
    send: (data: any) => void;
    close: () => void;
};
declare const CoreManager: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    setIfNeeded: (key: string, value: any) => any;
    setAnalyticsController(controller: AnalyticsController): void;
    getAnalyticsController(): AnalyticsController;
    setCloudController(controller: CloudController): void;
    getCloudController(): CloudController;
    setConfigController(controller: ConfigController): void;
    getConfigController(): ConfigController;
    setCryptoController(controller: CryptoController): void;
    getCryptoController(): CryptoController;
    setEventEmitter(eventEmitter: any): void;
    getEventEmitter(): any;
    setFileController(controller: FileController): void;
    setEventuallyQueue(controller: EventuallyQueue): void;
    getEventuallyQueue(): EventuallyQueue;
    getFileController(): FileController;
    setInstallationController(controller: InstallationController): void;
    getInstallationController(): InstallationController;
    setLiveQuery(liveQuery: any): void;
    getLiveQuery(): any;
    setObjectController(controller: ObjectController): void;
    getObjectController(): ObjectController;
    setObjectStateController(controller: ObjectStateController): void;
    getObjectStateController(): ObjectStateController;
    setPushController(controller: PushController): void;
    getPushController(): PushController;
    setQueryController(controller: QueryController): void;
    getQueryController(): QueryController;
    setRESTController(controller: RESTController): void;
    getRESTController(): RESTController;
    setSchemaController(controller: SchemaController): void;
    getSchemaController(): SchemaController;
    setSessionController(controller: SessionController): void;
    getSessionController(): SessionController;
    setStorageController(controller: StorageController): void;
    setLocalDatastoreController(controller: LocalDatastoreController): void;
    getLocalDatastoreController(): LocalDatastoreController;
    setLocalDatastore(store: any): void;
    getLocalDatastore(): any;
    getStorageController(): StorageController;
    setAsyncStorage(storage: AsyncStorageType): void;
    getAsyncStorage(): AsyncStorageType;
    setWebSocketController(controller: new (url: string | URL, protocols?: string | string[] | undefined) => WebSocketController): void;
    getWebSocketController(): new (url: string | URL, protocols?: string | string[] | undefined) => WebSocketController;
    setUserController(controller: UserController): void;
    getUserController(): UserController;
    setLiveQueryController(controller: LiveQueryControllerType): void;
    getLiveQueryController(): LiveQueryControllerType;
    setHooksController(controller: HooksController): void;
    getHooksController(): HooksController;
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
export default CoreManager;
