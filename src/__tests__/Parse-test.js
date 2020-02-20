/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../Parse');
jest.dontMock('../LocalDatastore');
jest.dontMock('crypto-js/aes');

const CoreManager = require('../CoreManager');
const Parse = require('../Parse');

describe('Parse module', () => {
  it('can be initialized with keys', () => {
    Parse.initialize('A', 'B');
    expect(CoreManager.get('APPLICATION_ID')).toBe('A');
    expect(CoreManager.get('JAVASCRIPT_KEY')).toBe('B');

    Parse._initialize('A', 'B', 'C');
    expect(CoreManager.get('APPLICATION_ID')).toBe('A');
    expect(CoreManager.get('JAVASCRIPT_KEY')).toBe('B');
    expect(CoreManager.get('MASTER_KEY')).toBe('C');
  });

  it('enables master key use in the node build', () => {
    expect(typeof Parse.Cloud.useMasterKey).toBe('function');
    Parse.Cloud.useMasterKey();
    expect(CoreManager.get('USE_MASTER_KEY')).toBe(true);
  });

  it('exposes certain keys as properties', () => {
    Parse.applicationId = '123';
    expect(CoreManager.get('APPLICATION_ID')).toBe('123');
    expect(Parse.applicationId).toBe('123');

    Parse.javaScriptKey = '456';
    expect(CoreManager.get('JAVASCRIPT_KEY')).toBe('456');
    expect(Parse.javaScriptKey).toBe('456');

    Parse.masterKey = '789';
    expect(CoreManager.get('MASTER_KEY')).toBe('789');
    expect(Parse.masterKey).toBe('789');
  });

  it('can set auth type and token', () => {
    Parse.serverAuthType = 'bearer';
    expect(CoreManager.get('SERVER_AUTH_TYPE')).toBe('bearer');
    expect(Parse.serverAuthType).toBe('bearer');

    Parse.serverAuthToken = 'some_token';
    expect(CoreManager.get('SERVER_AUTH_TOKEN')).toBe('some_token');
    expect(Parse.serverAuthToken).toBe('some_token');
  });

  it('can set LocalDatastoreController', () => {
    const controller = {
      fromPinWithName: function() {},
      pinWithName: function() {},
      unPinWithName: function() {},
      getAllContents: function() {},
      clear: function() {}
    };
    Parse.setLocalDatastoreController(controller);
    expect(CoreManager.getLocalDatastoreController()).toBe(controller);
  });

  it('can set AsyncStorage', () => {
    const controller = {
      getItem: function() {},
      setItem: function() {},
      removeItem: function() {},
      getItemAsync: function() {},
      setItemAsync: function() {},
      removeItemAsync: function() {},
      clear: function() {},
    };

    Parse.setAsyncStorage(controller);
    expect(CoreManager.getAsyncStorage()).toBe(controller);
  });

  it('can enable LocalDatastore', () => {
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    Parse.LocalDatastore.isEnabled = false;
    Parse.enableLocalDatastore();
    expect(Parse.LocalDatastore.isEnabled).toBe(true);
    expect(Parse.isLocalDatastoreEnabled()).toBe(true);
  });

  it('can dump LocalDatastore', async () => {
    Parse.LocalDatastore.isEnabled = false;
    let LDS = await Parse.dumpLocalDatastore();
    expect(LDS).toEqual({});
    Parse.LocalDatastore.isEnabled = true;
    const controller = {
      fromPinWithName: function() {},
      pinWithName: function() {},
      unPinWithName: function() {},
      getAllContents: function() {
        return Promise.resolve({ key: 'value' });
      },
      clear: function() {}
    };
    Parse.setLocalDatastoreController(controller);
    LDS = await Parse.dumpLocalDatastore();
    expect(LDS).toEqual({ key: 'value' });
  });

  it('can enable encrypter CurrentUser', () => {
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    process.env.PARSE_BUILD = 'browser';
    Parse.encryptedUser = false;
    Parse.enableEncryptedUser();
    expect(Parse.encryptedUser).toBe(true);
    expect(Parse.isEncryptedUserEnabled()).toBe(true);
  });

  it('can set an encrypt token as String', () => {
    Parse.secret = 'My Super secret key';
    expect(CoreManager.get('ENCRYPTED_KEY')).toBe('My Super secret key');
    expect(Parse.secret).toBe('My Super secret key');
  });

  it('can set and get request batch size', () => {
    expect(CoreManager.get('REQUEST_BATCH_SIZE')).toBe(20);
    CoreManager.set('REQUEST_BATCH_SIZE', 4);
    expect(CoreManager.get('REQUEST_BATCH_SIZE')).toBe(4);
    CoreManager.set('REQUEST_BATCH_SIZE', 20);
  });
});
