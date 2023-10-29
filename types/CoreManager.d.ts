// @ts-nocheck
export default CoreManager;
declare namespace CoreManager {
    function get(key: string): any;
    function set(key: string, value: any): void;
    function setAnalyticsController(controller: AnalyticsController): void;
    function getAnalyticsController(): AnalyticsController;
    function setCloudController(controller: CloudController): void;
    function getCloudController(): CloudController;
    function setConfigController(controller: ConfigController): void;
    function getConfigController(): ConfigController;
    function setCryptoController(controller: CryptoController): void;
    function getCryptoController(): CryptoController;
    function setFileController(controller: FileController): void;
    function getFileController(): FileController;
    function setInstallationController(controller: InstallationController): void;
    function getInstallationController(): InstallationController;
    function setObjectController(controller: ObjectController): void;
    function getObjectController(): ObjectController;
    function setObjectStateController(controller: ObjectStateController): void;
    function getObjectStateController(): ObjectStateController;
    function setPushController(controller: PushController): void;
    function getPushController(): PushController;
    function setQueryController(controller: QueryController): void;
    function getQueryController(): QueryController;
    function setRESTController(controller: RESTController): void;
    function getRESTController(): RESTController;
    function setSchemaController(controller: SchemaController): void;
    function getSchemaController(): SchemaController;
    function setSessionController(controller: SessionController): void;
    function getSessionController(): SessionController;
    function setStorageController(controller: StorageController): void;
    function setLocalDatastoreController(controller: LocalDatastoreController): void;
    function getLocalDatastoreController(): LocalDatastoreController;
    function setLocalDatastore(store: any): void;
    function getLocalDatastore(): mixed;
    function getStorageController(): StorageController;
    function setAsyncStorage(storage: any): void;
    function getAsyncStorage(): mixed;
    function setWebSocketController(controller: WebSocketController): void;
    function getWebSocketController(): WebSocketController;
    function setUserController(controller: UserController): void;
    function getUserController(): UserController;
    function setLiveQueryController(controller: any): void;
    function getLiveQueryController(): any;
    function setHooksController(controller: HooksController): void;
    function getHooksController(): HooksController;
}
type AnalyticsController = {
    track: (name: string, dimensions: {
        [key: string]: string;
    }) => Promise<any>;
};
type CloudController = {
    run: (name: string, data: mixed, options: RequestOptions) => Promise<any>;
    getJobsData: (options: RequestOptions) => Promise<any>;
    startJob: (name: string, data: mixed, options: RequestOptions) => Promise<any>;
};
type ConfigController = {
    current: () => Promise<any>;
    get: () => Promise<any>;
    save: (attrs: {
        [key: string]: any;
    }) => Promise<any>;
};
type CryptoController = {
    encrypt: (obj: any, secretKey: string) => string;
    decrypt: (encryptedText: string, secretKey: any) => string;
};
type FileController = {
    saveFile: (name: string, source: FileSource, options: FullOptions) => Promise<any>;
    saveBase64: (name: string, source: FileSource, options: FullOptions) => Promise<any>;
    download: (uri: string) => Promise<any>;
};
type InstallationController = {
    currentInstallationId: () => Promise<any>;
};
type ObjectController = {
    fetch: (object: ParseObject | ParseObject[], forceFetch: boolean, options: RequestOptions) => Promise<any>;
    save: (object: ParseObject | (ParseFile | ParseObject)[], options: RequestOptions) => Promise<any>;
    destroy: (object: ParseObject | ParseObject[], options: RequestOptions) => Promise<any>;
};
type ObjectStateController = {
    getState: (obj: any) => State;
    initializeState: (obj: any, initial?: State) => State;
    removeState: (obj: any) => State;
    getServerData: (obj: any) => AttributeMap;
    setServerData: (obj: any, attributes: AttributeMap) => void;
    getPendingOps: (obj: any) => OpsMap[];
    setPendingOp: (obj: any, attr: string, op: Op) => void;
    pushPendingState: (obj: any) => void;
    popPendingState: (obj: any) => OpsMap;
    mergeFirstPendingState: (obj: any) => void;
    getObjectCache: (obj: any) => ObjectCache;
    estimateAttribute: (obj: any, attr: string) => mixed;
    estimateAttributes: (obj: any) => AttributeMap;
    commitServerChanges: (obj: any, changes: AttributeMap) => void;
    enqueueTask: (obj: any, task: () => Promise<any>) => Promise<any>;
    clearAllState: () => void;
    duplicateState: (source: any, dest: any) => void;
};
type PushController = {
    send: (data: PushData) => Promise<any>;
};
type QueryController = {
    find: (className: string, params: QueryJSON, options: RequestOptions) => Promise<any>;
    aggregate: (className: string, params: any, options: RequestOptions) => Promise<any>;
};
type RESTController = {
    request: (method: string, path: string, data: mixed, options: RequestOptions) => Promise<any>;
    ajax: (method: string, url: string, data: any, headers?: any, options: FullOptions) => Promise<any>;
};
type SchemaController = {
    purge: (className: string) => Promise<any>;
    get: (className: string, options: RequestOptions) => Promise<any>;
    delete: (className: string, options: RequestOptions) => Promise<any>;
    create: (className: string, params: any, options: RequestOptions) => Promise<any>;
    update: (className: string, params: any, options: RequestOptions) => Promise<any>;
    send(className: string, method: string, params: any, options: RequestOptions): Promise<any>;
};
type SessionController = {
    getSession: (token: RequestOptions) => Promise<any>;
};
type StorageController = {
    async: 0;
    getItem: (path: string) => string;
    setItem: (path: string, value: string) => void;
    removeItem: (path: string) => void;
    getItemAsync?: (path: string) => Promise<any>;
    setItemAsync?: (path: string, value: string) => Promise<any>;
    removeItemAsync?: (path: string) => Promise<any>;
    clear: () => void;
} | {
    async: 1;
    getItem?: (path: string) => string;
    setItem?: (path: string, value: string) => void;
    removeItem?: (path: string) => void;
    getItemAsync: (path: string) => Promise<any>;
    setItemAsync: (path: string, value: string) => Promise<any>;
    removeItemAsync: (path: string) => Promise<any>;
    clear: () => void;
};
type LocalDatastoreController = {
    fromPinWithName: (name: string) => any;
    pinWithName: (name: string, objects: any) => void;
    unPinWithName: (name: string) => void;
    getAllContents: () => any;
    clear: () => void;
};
type WebSocketController = {
    onopen: () => void;
    onmessage: (message: any) => void;
    onclose: () => void;
    onerror: (error: any) => void;
    send: (data: any) => void;
    close: () => void;
};
type UserController = {
    setCurrentUser: (user: ParseUser) => Promise<any>;
    currentUser: () => ParseUser;
    currentUserAsync: () => Promise<any>;
    signUp: (user: ParseUser, attrs: AttributeMap, options: RequestOptions) => Promise<any>;
    logIn: (user: ParseUser, options: RequestOptions) => Promise<any>;
    become: (options: RequestOptions) => Promise<any>;
    hydrate: (userJSON: AttributeMap) => Promise<any>;
    logOut: (options: RequestOptions) => Promise<any>;
    me: (options: RequestOptions) => Promise<any>;
    requestPasswordReset: (email: string, options: RequestOptions) => Promise<any>;
    updateUserOnDisk: (user: ParseUser) => Promise<any>;
    upgradeToRevocableSession: (user: ParseUser, options: RequestOptions) => Promise<any>;
    linkWith: (user: ParseUser, authData: {
        [key: string]: mixed;
    }) => Promise<any>;
    removeUserFromDisk: () => Promise<any>;
    verifyPassword: (username: string, password: string, options: RequestOptions) => Promise<any>;
    requestEmailVerification: (email: string, options: RequestOptions) => Promise<any>;
};
type HooksController = {
    get: (type: string, functionName?: string, triggerName?: string) => Promise<any>;
    create: (hook: mixed) => Promise<any>;
    delete: (hook: mixed) => Promise<any>;
    update: (hook: mixed) => Promise<any>;
    send: (method: string, path: string, body?: mixed) => Promise<any>;
};
