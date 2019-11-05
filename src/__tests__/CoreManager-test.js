/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');

const CoreManager = require('../CoreManager');

describe('CoreManager', () => {
  it('is initialized with default values', () => {
    expect(CoreManager.get('SERVER_URL')).toBe('https://api.parse.com/1');
  });

  it('pulls the version string from package.json', () => {
    expect(CoreManager.get('VERSION').length).toBeGreaterThan(0);
  });

  it('detects when running in node', () => {
    expect(CoreManager.get('IS_NODE')).toBe(true);
  });

  it('can set and retrieve arbitrary values', () => {
    expect(CoreManager.get.bind(null, 'something')).toThrow(
      'Configuration key not found: something'
    );
    CoreManager.set('something', 'a string');
    expect(CoreManager.get('something')).toBe('a string');
  });

  it('requires AnalyticsController to implement certain functionality', () => {
    expect(CoreManager.setAnalyticsController.bind(null, {})).toThrow(
      'AnalyticsController must implement track()'
    );

    expect(CoreManager.setAnalyticsController.bind(null, {
      track: function() {}
    })).not.toThrow();
  });

  it('can set and get AnalyticsController', () => {
    const controller = {
      track: function() {}
    };

    CoreManager.setAnalyticsController(controller);
    expect(CoreManager.getAnalyticsController()).toBe(controller);
  });

  it('requires CloudController to implement certain functionality', () => {
    expect(CoreManager.setCloudController.bind(null, {})).toThrow(
      'CloudController must implement run()'
    );

    expect(CoreManager.setCloudController.bind(null, {
      run: function() {},
      getJobsData: function() {},
      startJob: function() {},
      getJobStatus: function() {}
    })).not.toThrow();
  });

  it('can set and get CloudController', () => {
    const controller = {
      run: function() {},
      getJobsData: function() {},
      startJob: function() {},
      getJobStatus: function() {}
    };

    CoreManager.setCloudController(controller);
    expect(CoreManager.getCloudController()).toBe(controller);
  });

  it('requires ConfigController to implement certain functionality', () => {
    expect(CoreManager.setConfigController.bind(null, {})).toThrow(
      'ConfigController must implement current()'
    );

    expect(CoreManager.setConfigController.bind(null, {
      current: function() {}
    })).toThrow('ConfigController must implement get()');

    expect(CoreManager.setConfigController.bind(null, {
      current: function() {},
      get: function() {},
      save : function() {}
    })).not.toThrow();
  });

  it('can set and get ConfigController', () => {
    const controller = {
      current: function() {},
      get: function() {},
      save : function() {}
    };

    CoreManager.setConfigController(controller);
    expect(CoreManager.getConfigController()).toBe(controller);
  });

  it('requires FileController to implement certain functionality', () => {
    expect(CoreManager.setFileController.bind(null, {})).toThrow(
      'FileController must implement saveFile()'
    );

    expect(CoreManager.setFileController.bind(null, {
      saveFile: function() {}
    })).toThrow('FileController must implement saveBase64()');

    expect(CoreManager.setFileController.bind(null, {
      saveFile: function() {},
      saveBase64: function() {}
    })).not.toThrow();
  });

  it('can set and get FileController', () => {
    const controller = {
      saveFile: function() {},
      saveBase64: function() {}
    };

    CoreManager.setFileController(controller);
    expect(CoreManager.getFileController()).toBe(controller);
  });

  it('requires InstallationController to implement certain functionality', () => {
    expect(CoreManager.setInstallationController.bind(null, {})).toThrow(
      'InstallationController must implement currentInstallationId()'
    );

    expect(CoreManager.setInstallationController.bind(null, {
      currentInstallationId: function() {}
    })).not.toThrow();
  });

  it('can set and get InstallationController', () => {
    const controller = {
      currentInstallationId: function() {}
    };

    CoreManager.setInstallationController(controller);
    expect(CoreManager.getInstallationController()).toBe(controller);
  });

  it('requires PushController to implement certain functionality', () => {
    expect(CoreManager.setPushController.bind(null, {})).toThrow(
      'PushController must implement send()'
    );

    expect(CoreManager.setPushController.bind(null, {
      send: function() {}
    })).not.toThrow();
  });

  it('can set and get PushController', () => {
    const controller = {
      send: function() {}
    };

    CoreManager.setPushController(controller);
    expect(CoreManager.getPushController()).toBe(controller);
  });

  it('requires ObjectController to implement certain functionality', () => {
    expect(CoreManager.setObjectController.bind(null, {})).toThrow(
      'ObjectController must implement save()'
    );

    expect(CoreManager.setObjectController.bind(null, {
      save: function() {}
    })).toThrow('ObjectController must implement fetch()');

    expect(CoreManager.setObjectController.bind(null, {
      save: function() {},
      fetch: function() {}
    })).toThrow('ObjectController must implement destroy()');

    expect(CoreManager.setObjectController.bind(null, {
      save: function() {},
      fetch: function() {},
      destroy: function() {}
    })).not.toThrow();
  });

  it('can set and get ObjectController', () => {
    const controller = {
      save: function() {},
      fetch: function() {},
      destroy: function() {}
    };

    CoreManager.setObjectController(controller);
    expect(CoreManager.getObjectController()).toBe(controller);
  });

  it('can set and get ObjectStateController', () => {
    const controller = {
      getState: function() {},
      initializeState: function() {},
      removeState: function() {},
      getServerData: function() {},
      setServerData: function() {},
      getPendingOps: function() {},
      setPendingOp: function() {},
      pushPendingState: function() {},
      popPendingState: function() {},
      mergeFirstPendingState: function() {},
      getObjectCache: function() {},
      estimateAttribute: function() {},
      estimateAttributes: function() {},
      commitServerChanges: function() {},
      enqueueTask: function() {},
      clearAllState: function() {},
    };

    CoreManager.setObjectStateController(controller);
    expect(CoreManager.getObjectStateController()).toBe(controller);
  });

  it('requires QueryController to implement certain functionality', () => {
    expect(CoreManager.setQueryController.bind(null, {})).toThrow(
      'QueryController must implement find()'
    );

    expect(CoreManager.setQueryController.bind(null, {
      find: function() {},
      aggregate: function() {}
    })).not.toThrow();
  });

  it('can set and get QueryController', () => {
    const controller = {
      find: function() {},
      aggregate: function() {}
    };

    CoreManager.setQueryController(controller);
    expect(CoreManager.getQueryController()).toBe(controller);
  });

  it('requires RESTController to implement certain functionality', () => {
    expect(CoreManager.setRESTController.bind(null, {})).toThrow(
      'RESTController must implement request()'
    );

    expect(CoreManager.setRESTController.bind(null, {
      request: function() {}
    })).toThrow('RESTController must implement ajax()');

    expect(CoreManager.setRESTController.bind(null, {
      request: function() {},
      ajax: function() {}
    })).not.toThrow();
  });

  it('can set and get RESTController', () => {
    const controller = {
      request: function() {},
      ajax: function() {}
    };

    CoreManager.setRESTController(controller);
    expect(CoreManager.getRESTController()).toBe(controller);
  });

  it('requires StorageController to implement certain functionality', () => {
    expect(CoreManager.setStorageController.bind(null, { async: 0 })).toThrow(
      'A synchronous StorageController must implement getItem()'
    );

    expect(CoreManager.setStorageController.bind(null, {
      async: 0,
      getItem: function() {}
    })).toThrow('A synchronous StorageController must implement setItem()');

    expect(CoreManager.setStorageController.bind(null, {
      async: 0,
      getItem: function() {},
      setItem: function() {}
    })).toThrow('A synchronous StorageController must implement removeItem()');

    expect(CoreManager.setStorageController.bind(null, {
      async: 0,
      getItem: function() {},
      setItem: function() {},
      removeItem: function() {},
      getAllKeys: function() {}
    })).not.toThrow();

    expect(CoreManager.setStorageController.bind(null, { async: 1 })).toThrow(
      'An async StorageController must implement getItemAsync()'
    );

    expect(CoreManager.setStorageController.bind(null, {
      async: 1,
      getItemAsync: function() {}
    })).toThrow('An async StorageController must implement setItemAsync()');

    expect(CoreManager.setStorageController.bind(null, {
      async: 1,
      getItemAsync: function() {},
      setItemAsync: function() {}
    })).toThrow('An async StorageController must implement removeItemAsync()');

    expect(CoreManager.setStorageController.bind(null, {
      async: 1,
      getItemAsync: function() {},
      setItemAsync: function() {},
      removeItemAsync: function() {},
      getAllKeysAsync: function() {}
    })).not.toThrow();
  });

  it('can set and get StorageController', () => {
    const controller = {
      async: 0,
      getItem: function() {},
      setItem: function() {},
      removeItem: function() {},
      getAllKeys: function() {}
    };

    CoreManager.setStorageController(controller);
    expect(CoreManager.getStorageController()).toBe(controller);
  });

  it('requires SchemaController to implement certain functionality', () => {
    expect(CoreManager.setSchemaController.bind(null, {})).toThrow(
      'SchemaController must implement get()'
    );

    expect(CoreManager.setSchemaController.bind(null, {
      send: function() {},
      get: function() {},
      create: function() {},
      update: function() {},
      delete: function() {},
      purge: function() {},
    })).not.toThrow();
  });

  it('can set and get SchemaController', () => {
    const controller = {
      send: function() {},
      get: function() {},
      create: function() {},
      update: function() {},
      delete: function() {},
      purge: function() {},
    };

    CoreManager.setSchemaController(controller);
    expect(CoreManager.getSchemaController()).toBe(controller);
  });

  it('requires LocalDatastoreController to implement certain functionality', () => {
    expect(CoreManager.setLocalDatastoreController.bind(null, {})).toThrow(
      'LocalDatastoreController must implement pinWithName()'
    );

    expect(CoreManager.setLocalDatastoreController.bind(null, {
      fromPinWithName: function() {},
      pinWithName: function() {},
      unPinWithName: function() {},
      getAllContents: function() {},
      clear: function() {}
    })).not.toThrow();
  });

  it('can set and get setLocalDatastoreController', () => {
    const controller = {
      fromPinWithName: function() {},
      pinWithName: function() {},
      unPinWithName: function() {},
      getAllContents: function() {},
      clear: function() {}
    };

    CoreManager.setLocalDatastoreController(controller);
    expect(CoreManager.getLocalDatastoreController()).toBe(controller);
  });

  it('can set and get WebSocketController', () => {
    const controller = {
      onopen: function() {},
      onmessage: function() {},
      onclose: function() {},
      onerror: function() {},
      send: function() {},
      close: function() {},
    };

    CoreManager.setWebSocketController(controller);
    expect(CoreManager.getWebSocketController()).toBe(controller);
  });
});
