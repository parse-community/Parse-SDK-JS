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
import type { FileSource } from './ParseFile';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';
import type ParsePromise from './ParsePromise';
import type { QueryJSON } from './ParseQuery';
import type { ParseUser, AuthData } from './ParseUser';
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
  fetch: (object: ParseObject, forceFetch: boolean, options: RequestOptions) => ParsePromise;
  save: (object: ParseObject, options: RequestOptions) => ParsePromise;
  destroy: (object: ParseObject, options: RequestOptions) => ParsePromise;
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
};

var config: { [key: string]: mixed } = {
  // Defaults
  IS_NODE: (typeof process !== 'undefined' &&
            !!process.versions &&
            !!process.versions.node &&
            !process.version.electron),
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  LIVEQUERY_SERVER_URL: null,
  VERSION: 'js' + require('../package.json').version,
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

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
    if (typeof controller.track !== 'function') {
      throw new Error('AnalyticsController must implement track()');
    }
    config['AnalyticsController'] = controller;
  },

  getAnalyticsController(): AnalyticsController {
    return config['AnalyticsController'];
  },

  setCloudController(controller: CloudController) {
    if (typeof controller.run !== 'function') {
      throw new Error('CloudController must implement run()');
    }
    config['CloudController'] = controller;
  },

  getCloudController(): CloudController {
    return config['CloudController'];
  },

  setConfigController(controller: ConfigController) {
    if (typeof controller.current !== 'function') {
      throw new Error('ConfigController must implement current()');
    }
    if (typeof controller.get !== 'function') {
      throw new Error('ConfigController must implement get()');
    }
    config['ConfigController'] = controller;
  },

  getConfigController(): ConfigController {
    return config['ConfigController'];
  },

  setFileController(controller: FileController) {
    if (typeof controller.saveFile !== 'function') {
      throw new Error('FileController must implement saveFile()');
    }
    if (typeof controller.saveBase64 !== 'function') {
      throw new Error('FileController must implement saveBase64()');
    }
    config['FileController'] = controller;
  },

  getFileController(): FileController {
    return config['FileController'];
  },

  setInstallationController(controller: InstallationController) {
    if (typeof controller.currentInstallationId !== 'function') {
      throw new Error(
        'InstallationController must implement currentInstallationId()'
      );
    }
    config['InstallationController'] = controller;
  },

  getInstallationController(): InstallationController {
    return config['InstallationController'];
  },

  setObjectController(controller: ObjectController) {
    if (typeof controller.save !== 'function') {
      throw new Error('ObjectController must implement save()');
    }
    if (typeof controller.fetch !== 'function') {
      throw new Error('ObjectController must implement fetch()');
    }
    if (typeof controller.destroy !== 'function') {
      throw new Error('ObjectController must implement destroy()');
    }
    config['ObjectController'] = controller;
  },

  getObjectController(): ObjectController {
    return config['ObjectController'];
  },

  setObjectStateController(controller: ObjectStateController) {
    if (typeof controller.getState !== 'function') {
      throw new Error(
        'ObjectStateController must implement getState()'
      );
    }
    if (typeof controller.initializeState !== 'function') {
      throw new Error(
        'ObjectStateController must implement initializeState()'
      );
    }
    if (typeof controller.removeState !== 'function') {
      throw new Error(
        'ObjectStateController must implement removeState()'
      );
    }
    if (typeof controller.getServerData !== 'function') {
      throw new Error(
        'ObjectStateController must implement getServerData()'
      );
    }
    if (typeof controller.setServerData !== 'function') {
      throw new Error(
        'ObjectStateController must implement setServerData()'
      );
    }
    if (typeof controller.getPendingOps !== 'function') {
      throw new Error(
        'ObjectStateController must implement getPendingOps()'
      );
    }
    if (typeof controller.setPendingOp !== 'function') {
      throw new Error(
        'ObjectStateController must implement setPendingOp()'
      );
    }
    if (typeof controller.pushPendingState !== 'function') {
      throw new Error(
        'ObjectStateController must implement pushPendingState()'
      );
    }
    if (typeof controller.popPendingState !== 'function') {
      throw new Error(
        'ObjectStateController must implement popPendingState()'
      );
    }
    if (typeof controller.mergeFirstPendingState !== 'function') {
      throw new Error(
        'ObjectStateController must implement mergeFirstPendingState()'
      );
    }
    if (typeof controller.getObjectCache !== 'function') {
      throw new Error(
        'ObjectStateController must implement getObjectCache()'
      );
    }
    if (typeof controller.estimateAttribute !== 'function') {
      throw new Error(
        'ObjectStateController must implement estimateAttribute()'
      );
    }
    if (typeof controller.estimateAttributes !== 'function') {
      throw new Error(
        'ObjectStateController must implement estimateAttributes()'
      );
    }
    if (typeof controller.commitServerChanges !== 'function') {
      throw new Error(
        'ObjectStateController must implement commitServerChanges()'
      );
    }
    if (typeof controller.enqueueTask !== 'function') {
      throw new Error(
        'ObjectStateController must implement enqueueTask()'
      );
    }
    if (typeof controller.clearAllState !== 'function') {
      throw new Error(
        'ObjectStateController must implement clearAllState()'
      );
    }

    config['ObjectStateController'] = controller;
  },

  getObjectStateController(): ObjectStateController {
    return config['ObjectStateController'];
  },

  setPushController(controller: PushController) {
    if (typeof controller.send !== 'function') {
      throw new Error('PushController must implement send()');
    }
    config['PushController'] = controller;
  },

  getPushController(): PushController {
    return config['PushController'];
  },

  setQueryController(controller: QueryController) {
    if (typeof controller.find !== 'function') {
      throw new Error('QueryController must implement find()');
    }
    config['QueryController'] = controller;
  },

  getQueryController(): QueryController {
    return config['QueryController'];
  },

  setRESTController(controller: RESTController) {
    if (typeof controller.request !== 'function') {
      throw new Error('RESTController must implement request()');
    }
    if (typeof controller.ajax !== 'function') {
      throw new Error('RESTController must implement ajax()');
    }
    config['RESTController'] = controller;
  },

  getRESTController(): RESTController {
    return config['RESTController'];
  },

  setSessionController(controller: SessionController) {
    if (typeof controller.getSession !== 'function') {
      throw new Error(
        'A SessionController must implement getSession()'
      );
    }
    config['SessionController'] = controller;
  },

  getSessionController(): SessionController {
    return config['SessionController'];
  },

  setStorageController(controller: StorageController) {
    if (controller.async) {
      if (typeof controller.getItemAsync !== 'function') {
        throw new Error(
          'An async StorageController must implement getItemAsync()'
        );
      }
      if (typeof controller.setItemAsync !== 'function') {
        throw new Error(
          'An async StorageController must implement setItemAsync()'
        );
      }
      if (typeof controller.removeItemAsync !== 'function') {
        throw new Error(
          'An async StorageController must implement removeItemAsync()'
        );
      }
    } else {
      if (typeof controller.getItem !== 'function') {
        throw new Error(
          'A synchronous StorageController must implement getItem()'
        );
      }
      if (typeof controller.setItem !== 'function') {
        throw new Error(
          'A synchronous StorageController must implement setItem()'
        );
      }
      if (typeof controller.removeItem !== 'function') {
        throw new Error(
          'A synchonous StorageController must implement removeItem()'
        );
      }
    }
    config['StorageController'] = controller;
  },

  getStorageController(): StorageController {
    return config['StorageController'];
  },

  setUserController(controller: UserController) {
    if (typeof controller.setCurrentUser !== 'function') {
      throw new Error(
        'A UserController must implement setCurrentUser()'
      );
    }
    if (typeof controller.currentUser !== 'function') {
      throw new Error(
        'A UserController must implement currentUser()'
      );
    }
    if (typeof controller.currentUserAsync !== 'function') {
      throw new Error(
        'A UserController must implement currentUserAsync()'
      );
    }
    if (typeof controller.signUp !== 'function') {
      throw new Error(
        'A UserController must implement signUp()'
      );
    }
    if (typeof controller.logIn !== 'function') {
      throw new Error(
        'A UserController must implement logIn()'
      );
    }
    if (typeof controller.become !== 'function') {
      throw new Error(
        'A UserController must implement become()'
      );
    }
    if (typeof controller.logOut !== 'function') {
      throw new Error(
        'A UserController must implement logOut()'
      );
    }
    if (typeof controller.requestPasswordReset !== 'function') {
      throw new Error(
        'A UserController must implement requestPasswordReset()'
      );
    }
    if (typeof controller.upgradeToRevocableSession !== 'function') {
      throw new Error(
        'A UserController must implement upgradeToRevocableSession()'
      );
    }
    if (typeof controller.linkWith !== 'function') {
      throw new Error(
        'A UserController must implement linkWith()'
      );
    }
    config['UserController'] = controller;
  },

  getUserController(): UserController {
    return config['UserController'];
  },

  setLiveQueryController(controller: any) {
    if (typeof controller.subscribe !== 'function') {
      throw new Error('LiveQueryController must implement subscribe()');
    }
    if (typeof controller.unsubscribe !== 'function') {
      throw new Error('LiveQueryController must implement unsubscribe()');
    }
    if (typeof controller.open !== 'function') {
      throw new Error('LiveQueryController must implement open()');
    }
    if (typeof controller.close !== 'function') {
      throw new Error('LiveQueryController must implement close()');
    }
    config['LiveQueryController'] = controller;
  },

  getLiveQueryController(): any {
    return config['LiveQueryController'];
  }
}
