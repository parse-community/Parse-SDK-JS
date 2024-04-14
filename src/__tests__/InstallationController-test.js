jest.dontMock('../CoreManager');
jest.dontMock('../InstallationController');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');
jest.mock('../uuid', () => {
  let value = 0;
  return () => value++ + '';
});

const CoreManager = require('../CoreManager');
const InstallationController = require('../InstallationController');
const Storage = require('../Storage');

CoreManager.setStorageController(require('../StorageController.default'));

describe('InstallationController', () => {
  beforeEach(() => {
    CoreManager.set('APPLICATION_ID', 'A');
    CoreManager.set('JAVASCRIPT_KEY', 'B');
    Storage._clear();
    InstallationController._clearCache();
  });

  it('generates a new installation id when there is none', done => {
    InstallationController.currentInstallationId().then(iid => {
      expect(typeof iid).toBe('string');
      expect(iid.length).toBeGreaterThan(0);
      done();
    });
  });

  it('caches the installation id', done => {
    let iid = null;
    InstallationController.currentInstallationId()
      .then(i => {
        iid = i;
        Storage._clear();
        return InstallationController.currentInstallationId();
      })
      .then(i => {
        expect(i).toBe(iid);
        done();
      });
  });

  it('permanently stores the installation id', done => {
    let iid = null;
    InstallationController.currentInstallationId()
      .then(i => {
        iid = i;
        InstallationController._clearCache();
        return InstallationController.currentInstallationId();
      })
      .then(i => {
        expect(i).toBe(iid);
        done();
      });
  });

  it('can set installation id', done => {
    const iid = '12345678';
    InstallationController._setInstallationIdCache(iid);
    InstallationController.currentInstallationId().then(i => {
      expect(i).toBe(iid);
      done();
    });
  });
});
