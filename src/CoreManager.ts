import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';
import type ParseFile from './ParseFile';
import type { FileSource } from './ParseFile';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
import type { QueryJSON } from './ParseQuery';
import type ParseUser from './ParseUser';
import type { AuthData } from './ParseUser';
import type { PushData } from './Push';
import type { RequestOptions, FullOptions } from './RESTController';
import type ParseSession from './ParseSession';
import type { HookDeclaration, HookDeleteArg } from './ParseHooks';
import type ParseConfig from './ParseConfig';

type AnalyticsController = {
  track: (name: string, dimensions: { [key: string]: string }) => Promise<void>,
};
type CloudController = {
  run: (name: string, data: any, options: RequestOptions) => Promise<void>,
  getJobsData: (options: RequestOptions) => Promise<void>,
  startJob: (name: string, data: any, options: RequestOptions) => Promise<void>,
};
type ConfigController = {
  current: () => Promise<ParseConfig>,
  get: (opts?: RequestOptions) => Promise<ParseConfig>,
  save: (attrs: { [key: string]: any }, masterKeyOnlyFlags?: { [key: string]: any }) => Promise<void>,
};
type CryptoController = {
  encrypt: (obj: any, secretKey: string) => string,
  decrypt: (encryptedText: string, secretKey: any) => string,
};
type FileController = {
  saveFile: (name: string, source: FileSource, options: FullOptions) => Promise<any>,
  saveBase64: (name: string, source: FileSource, options: FullOptions) => Promise<{ name: string, url: string }>,
  download: (uri: string, options?: any) => Promise<{ base64?: string, contentType?: string }>,
  deleteFile: (name: string, options?: { useMasterKey?: boolean }) => Promise<void>,
};
type InstallationController = {
  currentInstallationId: () => Promise<string>,
};
type ObjectController = {
  fetch: (
    object: ParseObject | Array<ParseObject>,
    forceFetch: boolean,
    options: RequestOptions
  ) => Promise<any>,
  save: (object: ParseObject | Array<ParseObject | ParseFile>, options: RequestOptions) => Promise<ParseObject | Array<ParseObject> | ParseFile>,
  destroy: (object: ParseObject | Array<ParseObject>, options: RequestOptions) => Promise<ParseObject | Array<ParseObject>>,
};
type ObjectStateController = {
  getState: (obj: any) => State | undefined,
  initializeState: (obj: any, initial?: State) => State,
  removeState: (obj: any) => State | undefined,
  getServerData: (obj: any) => AttributeMap,
  setServerData: (obj: any, attributes: AttributeMap) => void,
  getPendingOps: (obj: any) => Array<OpsMap>,
  setPendingOp: (obj: any, attr: string, op?: Op) => void,
  pushPendingState: (obj: any) => void,
  popPendingState: (obj: any) => OpsMap,
  mergeFirstPendingState: (obj: any) => void,
  getObjectCache: (obj: any) => ObjectCache,
  estimateAttribute: (obj: any, attr: string) => any,
  estimateAttributes: (obj: any) => AttributeMap,
  commitServerChanges: (obj: any, changes: AttributeMap) => void,
  enqueueTask: (obj: any, task: () => Promise<void>) => Promise<void>,
  clearAllState: () => void,
  duplicateState: (source: any, dest: any) => void,
};
type PushController = {
  send: (data: PushData) => Promise<void>,
};
type QueryController = {
  find: (className: string, params: QueryJSON, options: RequestOptions) => Promise<void>,
  aggregate: (className: string, params: any, options: RequestOptions) => Promise<void>,
};
type RESTController = {
  request: (method: string, path: string, data: any, options?: RequestOptions) => Promise<any>,
  ajax: (method: string, url: string, data: any, headers?: any, options?: FullOptions) => Promise<void>,
  handleError: (err?: any) => void,
};
type SchemaController = {
  purge: (className: string) => Promise<void>,
  get: (className: string, options?: RequestOptions) => Promise<any>,
  delete: (className: string, options?: RequestOptions) => Promise<void>,
  create: (className: string, params: any, options?: RequestOptions) => Promise<any>,
  update: (className: string, params: any, options?: RequestOptions) => Promise<any>,
  send(className: string, method: string, params: any, options: RequestOptions): Promise<any>,
};
type SessionController = {
  getSession: (token: RequestOptions) => Promise<ParseSession>,
};
type StorageController =
  | {
    async: 0,
    getItem: (path: string) => string | null,
    setItem: (path: string, value: string) => void,
    removeItem: (path: string) => void,
    getItemAsync?: (path: string) => Promise<string | null>,
    setItemAsync?: (path: string, value: string) => Promise<void>,
    removeItemAsync?: (path: string) => Promise<void>,
    clear: () => void,
    getAllKeys?: () => Array<string>
    getAllKeysAsync?: () => Promise<Array<string>>
  }
  | {
    async: 1,
    getItem?: (path: string) => string | null,
    setItem?: (path: string, value: string) => void,
    removeItem?: (path: string) => void,
    getItemAsync: (path: string) => Promise<string | null>,
    setItemAsync: (path: string, value: string) => Promise<void>,
    removeItemAsync: (path: string) => Promise<void>,
    clear: () => void,
    getAllKeys?: () => Array<string>
    getAllKeysAsync?: () => Promise<Array<string>>
  };
type LocalDatastoreController = {
  fromPinWithName: (name: string) => any | undefined,
  pinWithName: (name: string, objects: any) => void,
  unPinWithName: (name: string) => void,
  getAllContents: () => any | undefined,
  clear: () => void,
};
type UserController = {
  setCurrentUser: (user: ParseUser) => Promise<void>,
  currentUser: () => ParseUser | undefined,
  currentUserAsync: () => Promise<ParseUser>,
  signUp: (user: ParseUser, attrs: AttributeMap, options: RequestOptions) => Promise<void>,
  logIn: (user: ParseUser, options: RequestOptions) => Promise<void>,
  become: (options: RequestOptions) => Promise<void>,
  hydrate: (userJSON: AttributeMap) => Promise<void>,
  logOut: (options: RequestOptions) => Promise<void>,
  me: (options: RequestOptions) => Promise<void>,
  requestPasswordReset: (email: string, options: RequestOptions) => Promise<void>,
  updateUserOnDisk: (user: ParseUser) => Promise<void>,
  upgradeToRevocableSession: (user: ParseUser, options: RequestOptions) => Promise<void>,
  linkWith: (user: ParseUser, authData: AuthData) => Promise<void>,
  removeUserFromDisk: () => Promise<void>,
  verifyPassword: (username: string, password: string, options: RequestOptions) => Promise<void>,
  requestEmailVerification: (email: string, options: RequestOptions) => Promise<void>,
};
type HooksController = {
  get: (type: string, functionName?: string, triggerName?: string) => Promise<void>,
  create: (hook: HookDeclaration) => Promise<void>,
  remove: (hook: HookDeleteArg) => Promise<void>,
  update: (hook: HookDeclaration) => Promise<void>,
  // Renamed to sendRequest since ParseHooks file & tests file uses this. (originally declared as just "send")
  sendRequest?: (method: string, path: string, body?: any) => Promise<void>,
};
type WebSocketController = {
  onopen: () => void,
  onmessage: (message: any) => void,
  onclose: () => void,
  onerror: (error: any) => void,
  send: (data: any) => void,
  close: () => void,
};
type Config = {
  AnalyticsController?: AnalyticsController,
  CloudController?: CloudController,
  ConfigController?: ConfigController,
  FileController?: FileController,
  InstallationController?: InstallationController,
  ObjectController?: ObjectController,
  ObjectStateController?: ObjectStateController,
  PushController?: PushController,
  QueryController?: QueryController,
  RESTController?: RESTController,
  SchemaController?: SchemaController,
  SessionController?: SessionController,
  StorageController?: StorageController,
  LocalDatastoreController?: LocalDatastoreController,
  UserController?: UserController,
  HooksController?: HooksController,
  WebSocketController?: WebSocketController,
};

const config: Config & { [key: string]: any } = {
  // Defaults
  IS_NODE:
    typeof process !== 'undefined' &&
    !!process.versions &&
    !!process.versions.node &&
    !process.versions.electron,
  REQUEST_ATTEMPT_LIMIT: 5,
  REQUEST_BATCH_SIZE: 20,
  REQUEST_HEADERS: {},
  SERVER_URL: 'https://api.parse.com/1',
  SERVER_AUTH_TYPE: null,
  SERVER_AUTH_TOKEN: null,
  LIVEQUERY_SERVER_URL: null,
  ENCRYPTED_KEY: null,
  VERSION: 'js' + require('../package.json').version,
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false,
  ENCRYPTED_USER: false,
  IDEMPOTENCY: false,
  ALLOW_CUSTOM_OBJECT_ID: false,
  PARSE_ERRORS: [],
};

function requireMethods(name: string, methods: Array<string>, controller: any) {
  methods.forEach(func => {
    if (typeof controller[func] !== 'function') {
      throw new Error(`${name} must implement ${func}()`);
    }
  });
}

const CoreManager = {
  get: function (key: string): any {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function (key: string, value: any): void {
    config[key] = value;
  },

  setIfNeeded: function (key: string, value: any): any {
    if (!config.hasOwnProperty(key)) {
      config[key] = value;
    }
    return config[key];
  },

  /* Specialized Controller Setters/Getters */

  setAnalyticsController(controller: AnalyticsController) {
    requireMethods('AnalyticsController', ['track'], controller);
    config['AnalyticsController'] = controller;
  },

  getAnalyticsController(): AnalyticsController {
    return config['AnalyticsController'];
  },

  setCloudController(controller: CloudController) {
    requireMethods('CloudController', ['run', 'getJobsData', 'startJob'], controller);
    config['CloudController'] = controller;
  },

  getCloudController(): CloudController {
    return config['CloudController'];
  },

  setConfigController(controller: ConfigController) {
    requireMethods('ConfigController', ['current', 'get', 'save'], controller);
    config['ConfigController'] = controller;
  },

  getConfigController(): ConfigController {
    return config['ConfigController'];
  },

  setCryptoController(controller: CryptoController) {
    requireMethods('CryptoController', ['encrypt', 'decrypt'], controller);
    config['CryptoController'] = controller;
  },

  getCryptoController(): CryptoController {
    return config['CryptoController'];
  },

  setEventEmitter(eventEmitter: any) {
    config['EventEmitter'] = eventEmitter;
  },

  getEventEmitter(): any {
    return config['EventEmitter'];
  },

  setFileController(controller: FileController) {
    requireMethods('FileController', ['saveFile', 'saveBase64'], controller);
    config['FileController'] = controller;
  },

  getFileController(): FileController {
    return config['FileController'];
  },

  setInstallationController(controller: InstallationController) {
    requireMethods('InstallationController', ['currentInstallationId'], controller);
    config['InstallationController'] = controller;
  },

  getInstallationController(): InstallationController {
    return config['InstallationController'];
  },

  setLiveQuery(liveQuery: any) {
    config['LiveQuery'] = liveQuery;
  },

  getLiveQuery(): any {
    return config['LiveQuery'];
  },

  setObjectController(controller: ObjectController) {
    requireMethods('ObjectController', ['save', 'fetch', 'destroy'], controller);
    config['ObjectController'] = controller;
  },

  getObjectController(): ObjectController {
    return config['ObjectController'];
  },

  setObjectStateController(controller: ObjectStateController) {
    requireMethods(
      'ObjectStateController',
      [
        'getState',
        'initializeState',
        'removeState',
        'getServerData',
        'setServerData',
        'getPendingOps',
        'setPendingOp',
        'pushPendingState',
        'popPendingState',
        'mergeFirstPendingState',
        'getObjectCache',
        'estimateAttribute',
        'estimateAttributes',
        'commitServerChanges',
        'enqueueTask',
        'clearAllState',
      ],
      controller
    );

    config['ObjectStateController'] = controller;
  },

  getObjectStateController(): ObjectStateController {
    return config['ObjectStateController'];
  },

  setPushController(controller: PushController) {
    requireMethods('PushController', ['send'], controller);
    config['PushController'] = controller;
  },

  getPushController(): PushController {
    return config['PushController'];
  },

  setQueryController(controller: QueryController) {
    requireMethods('QueryController', ['find', 'aggregate'], controller);
    config['QueryController'] = controller;
  },

  getQueryController(): QueryController {
    return config['QueryController'];
  },

  setRESTController(controller: RESTController) {
    requireMethods('RESTController', ['request', 'ajax'], controller);
    config['RESTController'] = controller;
  },

  getRESTController(): RESTController {
    return config['RESTController'];
  },

  setSchemaController(controller: SchemaController) {
    requireMethods(
      'SchemaController',
      ['get', 'create', 'update', 'delete', 'send', 'purge'],
      controller
    );
    config['SchemaController'] = controller;
  },

  getSchemaController(): SchemaController {
    return config['SchemaController'];
  },

  setSessionController(controller: SessionController) {
    requireMethods('SessionController', ['getSession'], controller);
    config['SessionController'] = controller;
  },

  getSessionController(): SessionController {
    return config['SessionController'];
  },

  setStorageController(controller: StorageController) {
    if (controller.async) {
      requireMethods(
        'An async StorageController',
        ['getItemAsync', 'setItemAsync', 'removeItemAsync', 'getAllKeysAsync'],
        controller
      );
    } else {
      requireMethods(
        'A synchronous StorageController',
        ['getItem', 'setItem', 'removeItem', 'getAllKeys'],
        controller
      );
    }
    config['StorageController'] = controller;
  },

  setLocalDatastoreController(controller: LocalDatastoreController) {
    requireMethods(
      'LocalDatastoreController',
      ['pinWithName', 'fromPinWithName', 'unPinWithName', 'getAllContents', 'clear'],
      controller
    );
    config['LocalDatastoreController'] = controller;
  },

  getLocalDatastoreController(): LocalDatastoreController {
    return config['LocalDatastoreController'];
  },

  setLocalDatastore(store: any) {
    config['LocalDatastore'] = store;
  },

  getLocalDatastore() {
    return config['LocalDatastore'];
  },

  getStorageController(): StorageController {
    return config['StorageController'];
  },

  setAsyncStorage(storage: any) {
    config['AsyncStorage'] = storage;
  },

  getAsyncStorage() {
    return config['AsyncStorage'];
  },

  setWebSocketController(controller: WebSocketController) {
    config['WebSocketController'] = controller;
  },

  getWebSocketController(): WebSocketController {
    return config['WebSocketController'];
  },

  setUserController(controller: UserController) {
    requireMethods(
      'UserController',
      [
        'setCurrentUser',
        'currentUser',
        'currentUserAsync',
        'signUp',
        'logIn',
        'become',
        'logOut',
        'me',
        'requestPasswordReset',
        'upgradeToRevocableSession',
        'requestEmailVerification',
        'verifyPassword',
        'linkWith',
      ],
      controller
    );
    config['UserController'] = controller;
  },

  getUserController(): UserController {
    return config['UserController'];
  },

  setLiveQueryController(controller: any) {
    requireMethods(
      'LiveQueryController',
      ['setDefaultLiveQueryClient', 'getDefaultLiveQueryClient', '_clearCachedDefaultClient'],
      controller
    );
    config['LiveQueryController'] = controller;
  },

  getLiveQueryController(): any {
    return config['LiveQueryController'];
  },

  setHooksController(controller: HooksController) {
    requireMethods('HooksController', ['create', 'get', 'update', 'remove'], controller);
    config['HooksController'] = controller;
  },

  getHooksController(): HooksController {
    return config['HooksController'];
  },
};

module.exports = CoreManager;
export default CoreManager;