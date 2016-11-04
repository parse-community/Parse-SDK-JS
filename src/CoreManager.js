/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';
import type ParseFile from './ParseFile';
import type { FileSource } from './ParseFile';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
import type ParsePromise from './ParsePromise';
import type { QueryJSON } from './ParseQuery';
import type ParseUser from './ParseUser';
import type { AuthData } from './ParseUser';
import type { PushData } from './Push';

type RequestOptions = {
  useMasterKey?: boolean;
  sessionToken?: string;
  installationId?: string;
};
type AnalyticsController = {
  track: (name: string, dimensions: { [key: string]: string }) => ParsePromise;
};
type CloudController = {
  run: (name: string, data: mixed, options: { [key: string]: mixed }) => ParsePromise;
};
type ConfigController = {
  current: () => ParsePromise;
  get: () => ParsePromise;
};
type FileController = {
  saveFile: (name: string, source: FileSource) => ParsePromise;
  saveBase64: (name: string, source: FileSource) => ParsePromise;
};
type InstallationController = {
  currentInstallationId: () => ParsePromise;
};
type ObjectController = {
  fetch: (object: ParseObject | Array<ParseObject>, forceFetch: boolean, options: RequestOptions) => ParsePromise;
  save: (object: ParseObject | Array<ParseObject | ParseFile>, options: RequestOptions) => ParsePromise;
  destroy: (object: ParseObject | Array<ParseObject>, options: RequestOptions) => ParsePromise;
};
type ObjectStateController = {
  getState: (obj: any) => ?State;
  initializeState: (obj: any, initial?: State) => State;
  removeState: (obj: any) => ?State;
  getServerData: (obj: any) => AttributeMap;
  setServerData: (obj: any, attributes: AttributeMap) => void;
  getPendingOps: (obj: any) => Array<OpsMap>;
  setPendingOp: (obj: any, attr: string, op: ?Op) => void;
  pushPendingState: (obj: any) => void;
  popPendingState: (obj: any) => OpsMap;
  mergeFirstPendingState: (obj: any) => void;
  getObjectCache: (obj: any) => ObjectCache;
  estimateAttribute: (obj: any, attr: string) => mixed;
  estimateAttributes: (obj: any) => AttributeMap;
  commitServerChanges: (obj: any, changes: AttributeMap) => void;
  enqueueTask: (obj: any, task: () => ParsePromise) => ParsePromise;
  clearAllState: () => void;
  duplicateState: (source: any, dest: any) => void;
};
type PushController = {
  send: (data: PushData, options: RequestOptions) => ParsePromise;
};
type QueryController = {
  find: (className: string, params: QueryJSON, options: RequestOptions) => ParsePromise;
};
type RESTController = {
  request: (method: string, path: string, data: mixed) => ParsePromise;
  ajax: (method: string, url: string, data: any, headers?: any) => ParsePromise;
};
type SessionController = {
  getSession: (token: RequestOptions) => ParsePromise;
};
type StorageController = {
  async: 0;
  getItem: (path: string) => ?string;
  setItem: (path: string, value: string) => void;
  removeItem: (path: string) => void;
  getItemAsync?: (path: string) => ParsePromise;
  setItemAsync?: (path: string, value: string) => ParsePromise;
  removeItemAsync?: (path: string) => ParsePromise;
  clear: () => void;
} | {
  async: 1;
  getItem?: (path: string) => ?string;
  setItem?: (path: string, value: string) => void;
  removeItem?: (path: string) => void;
  getItemAsync: (path: string) => ParsePromise;
  setItemAsync: (path: string, value: string) => ParsePromise;
  removeItemAsync: (path: string) => ParsePromise;
  clear: () => void;
};
type UserController = {
  setCurrentUser: (user: ParseUser) => ParsePromise;
  currentUser: () => ?ParseUser;
  currentUserAsync: () => ParsePromise;
  signUp: (user: ParseUser, attrs: AttributeMap, options: RequestOptions) => ParsePromise;
  logIn: (user: ParseUser, options: RequestOptions) => ParsePromise;
  become: (options: RequestOptions) => ParsePromise;
  logOut: () => ParsePromise;
  requestPasswordReset: (email: string, options: RequestOptions) => ParsePromise;
  updateUserOnDisk: (user: ParseUser) => ParsePromise;
  upgradeToRevocableSession: (user: ParseUser, options: RequestOptions) => ParsePromise;
  linkWith: (user: ParseUser, authData: AuthData) => ParsePromise;
  removeUserFromDisk: () => ParsePromise;
};
type HooksController = {
  get: (type: string, functionName?: string, triggerName?: string) => ParsePromise;
  create: (hook: mixed) => ParsePromise;
  delete: (hook: mixed) => ParsePromise;
  update: (hook: mixed) => ParsePromise;
  send: (method: string, path: string, body?: mixed) => ParsePromise;
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
  SessionController?: SessionController,
  StorageController?: StorageController,
  UserController?: UserController,
  HooksController?: HooksController,
};

var config: Config & { [key: string]: mixed } = {
  // Defaults
  IS_NODE: (typeof process !== 'undefined' &&
            !!process.versions &&
            !!process.versions.node &&
            !process.versions.electron),
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  SERVER_AUTH_TYPE: null,
  SERVER_AUTH_TOKEN: null, 
  LIVEQUERY_SERVER_URL: null,
  VERSION: 'js' + require('../package.json').version,
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

function requireMethods(name: string, methods: Array<string>, controller: any) {
  methods.forEach((func) => {
    if (typeof controller[func] !== 'function') {
      throw new Error(`${name} must implement ${func}()`);
    }
  });
}

module.exports = {
  get: function(key: string): any {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function(key: string, value: any): void {
    config[key] = value;
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
    requireMethods('CloudController', ['run'], controller);
    config['CloudController'] = controller;
  },

  getCloudController(): CloudController {
    return config['CloudController'];
  },

  setConfigController(controller: ConfigController) {
    requireMethods('ConfigController', ['current', 'get'], controller);
    config['ConfigController'] = controller;
  },

  getConfigController(): ConfigController {
    return config['ConfigController'];
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

  setObjectController(controller: ObjectController) {
    requireMethods('ObjectController', ['save', 'fetch', 'destroy'], controller);
    config['ObjectController'] = controller;
  },

  getObjectController(): ObjectController {
    return config['ObjectController'];
  },

  setObjectStateController(controller: ObjectStateController) {
    requireMethods('ObjectStateController', [
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
    ], controller);

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
    requireMethods('QueryController', ['find'], controller);
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

  setSessionController(controller: SessionController) {
    requireMethods('SessionController', ['getSession'], controller);
    config['SessionController'] = controller;
  },

  getSessionController(): SessionController {
    return config['SessionController'];
  },

  setStorageController(controller: StorageController) {
    if (controller.async) {
      requireMethods('An async StorageController', [
        'getItemAsync',
        'setItemAsync',
        'removeItemAsync',
      ], controller);
    } else {
      requireMethods('A synchronous StorageController', [
        'getItem',
        'setItem',
        'removeItem',
      ], controller);
    }
    config['StorageController'] = controller;
  },

  getStorageController(): StorageController {
    return config['StorageController'];
  },

  setUserController(controller: UserController) {
    requireMethods('UserController', [
      'setCurrentUser',
      'currentUser',
      'currentUserAsync',
      'signUp',
      'logIn',
      'become',
      'logOut',
      'requestPasswordReset',
      'upgradeToRevocableSession',
      'linkWith',
    ], controller);
    config['UserController'] = controller;
  },

  getUserController(): UserController {
    return config['UserController'];
  },

  setLiveQueryController(controller: any) {
    requireMethods('LiveQueryController', [
      'subscribe',
      'unsubscribe',
      'open',
      'close',
    ], controller);
    config['LiveQueryController'] = controller;
  },

  getLiveQueryController(): any {
    return config['LiveQueryController'];
  },

  setHooksController(controller: HooksController) {
    requireMethods('HooksController', [
      'create',
      'get',
      'update',
      'remove',
    ], controller);
    config['HooksController'] = controller;
  },

  getHooksController(): HooksController {
    return config['HooksController'];
  }
}
