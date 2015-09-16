/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../InstallationController');
jest.dontMock('../ParsePromise');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');
jest.dontMock('./test_helpers/asyncHelper');

var CoreManager = require('../CoreManager');
var InstallationController = require('../InstallationController');
var Storage = require('../Storage');
var asyncHelper = require('./test_helpers/asyncHelper');

describe('InstallationController', () => {
  beforeEach(() => {
    CoreManager.set('APPLICATION_ID', 'A');
    CoreManager.set('JAVASCRIPT_KEY', 'B');
    Storage._clear();
    InstallationController._clearCache();
  });

  it('generates a new installation id when there is none', asyncHelper((done) => {
    InstallationController.currentInstallationId().then((iid) => {
      expect(typeof iid).toBe('string');
      expect(iid.length).toBeGreaterThan(0);
      done();
    });
  }));

  it('caches the installation id', asyncHelper((done) => {
    var iid = null;
    InstallationController.currentInstallationId().then((i) => {
      iid = i;
      Storage._clear();
      return InstallationController.currentInstallationId();
    }).then((i) => {
      expect(i).toBe(iid);
      done();
    });
  }));

  it('permanently stores the installation id', asyncHelper((done) => {
    var iid = null;
    InstallationController.currentInstallationId().then((i) => {
      iid = i;
      InstallationController._clearCache();
      return InstallationController.currentInstallationId();
    }).then((i) => {
      expect(i).toBe(iid);
      done();
    });
  }));
});
