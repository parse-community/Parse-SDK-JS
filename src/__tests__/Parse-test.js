/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../Parse');

jest.dontMock('../ReduxCacheHelper');

var CoreManager = require('../CoreManager');
var Parse = require('../Parse');

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
});
