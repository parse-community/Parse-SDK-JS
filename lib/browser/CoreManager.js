/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var config = {
  // Defaults
  IS_NODE: typeof process !== 'undefined' && !!process.versions && !!process.versions.node && !process.version.electron,
  REQUEST_ATTEMPT_LIMIT: 5,
  SERVER_URL: 'https://api.parse.com/1',
  LIVEQUERY_SERVER_URL: null,
  VERSION: 'js' + '1.8.1',
  APPLICATION_ID: null,
  JAVASCRIPT_KEY: null,
  MASTER_KEY: null,
  USE_MASTER_KEY: false,
  PERFORM_USER_REWRITE: true,
  FORCE_REVOCABLE_SESSION: false
};

module.exports = {
  get: function get(key) {
    if (config.hasOwnProperty(key)) {
      return config[key];
    }
    throw new Error('Configuration key not found: ' + key);
  },

  set: function set(key, value) {
    config[key] = value;
  },

  /* Specialized Controller Setters/Getters */

  setAnalyticsController: function setAnalyticsController(controller) {
    if (typeof controller.track !== 'function') {
      throw new Error('AnalyticsController must implement track()');
    }
    config['AnalyticsController'] = controller;
  },

  getAnalyticsController: function getAnalyticsController() {
    return config['AnalyticsController'];
  },

  setCloudController: function setCloudController(controller) {
    if (typeof controller.run !== 'function') {
      throw new Error('CloudController must implement run()');
    }
    config['CloudController'] = controller;
  },

  getCloudController: function getCloudController() {
    return config['CloudController'];
  },

  setConfigController: function setConfigController(controller) {
    if (typeof controller.current !== 'function') {
      throw new Error('ConfigController must implement current()');
    }
    if (typeof controller.get !== 'function') {
      throw new Error('ConfigController must implement get()');
    }
    config['ConfigController'] = controller;
  },

  getConfigController: function getConfigController() {
    return config['ConfigController'];
  },

  setFileController: function setFileController(controller) {
    if (typeof controller.saveFile !== 'function') {
      throw new Error('FileController must implement saveFile()');
    }
    if (typeof controller.saveBase64 !== 'function') {
      throw new Error('FileController must implement saveBase64()');
    }
    config['FileController'] = controller;
  },

  getFileController: function getFileController() {
    return config['FileController'];
  },

  setInstallationController: function setInstallationController(controller) {
    if (typeof controller.currentInstallationId !== 'function') {
      throw new Error('InstallationController must implement currentInstallationId()');
    }
    config['InstallationController'] = controller;
  },

  getInstallationController: function getInstallationController() {
    return config['InstallationController'];
  },

  setObjectController: function setObjectController(controller) {
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

  getObjectController: function getObjectController() {
    return config['ObjectController'];
  },

  setObjectStateController: function setObjectStateController(controller) {
    if (typeof controller.getState !== 'function') {
      throw new Error('ObjectStateController must implement getState()');
    }
    if (typeof controller.initializeState !== 'function') {
      throw new Error('ObjectStateController must implement initializeState()');
    }
    if (typeof controller.removeState !== 'function') {
      throw new Error('ObjectStateController must implement removeState()');
    }
    if (typeof controller.getServerData !== 'function') {
      throw new Error('ObjectStateController must implement getServerData()');
    }
    if (typeof controller.setServerData !== 'function') {
      throw new Error('ObjectStateController must implement setServerData()');
    }
    if (typeof controller.getPendingOps !== 'function') {
      throw new Error('ObjectStateController must implement getPendingOps()');
    }
    if (typeof controller.setPendingOp !== 'function') {
      throw new Error('ObjectStateController must implement setPendingOp()');
    }
    if (typeof controller.pushPendingState !== 'function') {
      throw new Error('ObjectStateController must implement pushPendingState()');
    }
    if (typeof controller.popPendingState !== 'function') {
      throw new Error('ObjectStateController must implement popPendingState()');
    }
    if (typeof controller.mergeFirstPendingState !== 'function') {
      throw new Error('ObjectStateController must implement mergeFirstPendingState()');
    }
    if (typeof controller.getObjectCache !== 'function') {
      throw new Error('ObjectStateController must implement getObjectCache()');
    }
    if (typeof controller.estimateAttribute !== 'function') {
      throw new Error('ObjectStateController must implement estimateAttribute()');
    }
    if (typeof controller.estimateAttributes !== 'function') {
      throw new Error('ObjectStateController must implement estimateAttributes()');
    }
    if (typeof controller.commitServerChanges !== 'function') {
      throw new Error('ObjectStateController must implement commitServerChanges()');
    }
    if (typeof controller.enqueueTask !== 'function') {
      throw new Error('ObjectStateController must implement enqueueTask()');
    }
    if (typeof controller.clearAllState !== 'function') {
      throw new Error('ObjectStateController must implement clearAllState()');
    }

    config['ObjectStateController'] = controller;
  },

  getObjectStateController: function getObjectStateController() {
    return config['ObjectStateController'];
  },

  setPushController: function setPushController(controller) {
    if (typeof controller.send !== 'function') {
      throw new Error('PushController must implement send()');
    }
    config['PushController'] = controller;
  },

  getPushController: function getPushController() {
    return config['PushController'];
  },

  setQueryController: function setQueryController(controller) {
    if (typeof controller.find !== 'function') {
      throw new Error('QueryController must implement find()');
    }
    config['QueryController'] = controller;
  },

  getQueryController: function getQueryController() {
    return config['QueryController'];
  },

  setRESTController: function setRESTController(controller) {
    if (typeof controller.request !== 'function') {
      throw new Error('RESTController must implement request()');
    }
    if (typeof controller.ajax !== 'function') {
      throw new Error('RESTController must implement ajax()');
    }
    config['RESTController'] = controller;
  },

  getRESTController: function getRESTController() {
    return config['RESTController'];
  },

  setSessionController: function setSessionController(controller) {
    if (typeof controller.getSession !== 'function') {
      throw new Error('A SessionController must implement getSession()');
    }
    config['SessionController'] = controller;
  },

  getSessionController: function getSessionController() {
    return config['SessionController'];
  },

  setStorageController: function setStorageController(controller) {
    if (controller.async) {
      if (typeof controller.getItemAsync !== 'function') {
        throw new Error('An async StorageController must implement getItemAsync()');
      }
      if (typeof controller.setItemAsync !== 'function') {
        throw new Error('An async StorageController must implement setItemAsync()');
      }
      if (typeof controller.removeItemAsync !== 'function') {
        throw new Error('An async StorageController must implement removeItemAsync()');
      }
    } else {
      if (typeof controller.getItem !== 'function') {
        throw new Error('A synchronous StorageController must implement getItem()');
      }
      if (typeof controller.setItem !== 'function') {
        throw new Error('A synchronous StorageController must implement setItem()');
      }
      if (typeof controller.removeItem !== 'function') {
        throw new Error('A synchonous StorageController must implement removeItem()');
      }
    }
    config['StorageController'] = controller;
  },

  getStorageController: function getStorageController() {
    return config['StorageController'];
  },

  setUserController: function setUserController(controller) {
    if (typeof controller.setCurrentUser !== 'function') {
      throw new Error('A UserController must implement setCurrentUser()');
    }
    if (typeof controller.currentUser !== 'function') {
      throw new Error('A UserController must implement currentUser()');
    }
    if (typeof controller.currentUserAsync !== 'function') {
      throw new Error('A UserController must implement currentUserAsync()');
    }
    if (typeof controller.signUp !== 'function') {
      throw new Error('A UserController must implement signUp()');
    }
    if (typeof controller.logIn !== 'function') {
      throw new Error('A UserController must implement logIn()');
    }
    if (typeof controller.become !== 'function') {
      throw new Error('A UserController must implement become()');
    }
    if (typeof controller.logOut !== 'function') {
      throw new Error('A UserController must implement logOut()');
    }
    if (typeof controller.requestPasswordReset !== 'function') {
      throw new Error('A UserController must implement requestPasswordReset()');
    }
    if (typeof controller.upgradeToRevocableSession !== 'function') {
      throw new Error('A UserController must implement upgradeToRevocableSession()');
    }
    if (typeof controller.linkWith !== 'function') {
      throw new Error('A UserController must implement linkWith()');
    }
    config['UserController'] = controller;
  },

  getUserController: function getUserController() {
    return config['UserController'];
  },

  setLiveQueryController: function setLiveQueryController(controller) {
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

  getLiveQueryController: function getLiveQueryController() {
    return config['LiveQueryController'];
  }
};