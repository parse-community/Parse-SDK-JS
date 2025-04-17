jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../LocalDatastore');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseInstallation');
jest.dontMock('../promiseUtils');
jest.dontMock('../RESTController');
jest.dontMock('../TaskQueue');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../UniqueInstanceStateController');

const ParseError = require('../ParseError').default;
const LocalDatastore = require('../LocalDatastore').default;
const ParseInstallation = require('../ParseInstallation').default;
const CoreManager = require('../CoreManager').default;

describe('ParseInstallation', () => {
  it('can create ParseInstallation', () => {
    let installation = new ParseInstallation();
    expect(installation.className).toBe('_Installation');

    installation = new ParseInstallation({});
    expect(installation.className).toBe('_Installation');

    installation = new ParseInstallation({ deviceToken: 'token' });
    expect(installation.get('deviceToken')).toBe('token');

    expect(() => {
      new ParseInstallation({ 'invalid#name': 'foo' });
    }).toThrow("Can't create an invalid Installation");
  });

  it('can get device types', () => {
    expect(ParseInstallation.DEVICE_TYPES.WEB).toEqual('web');
    expect(ParseInstallation.DEVICE_TYPES.IOS).toEqual('ios');
    expect(ParseInstallation.DEVICE_TYPES.MACOS).toEqual('macos');
    expect(ParseInstallation.DEVICE_TYPES.TVOS).toEqual('tvos');
    expect(ParseInstallation.DEVICE_TYPES.FCM).toEqual('fcm');
    expect(ParseInstallation.DEVICE_TYPES.ANDROID).toEqual('android');
  });

  it('can retrieve getters', () => {
    const data = {
      deviceType: 'web',
      installationId: '1234',
      deviceToken: '1234',
      badge: 1,
      appIdentifier: 'com.parse.server',
      appName: 'Parse JS SDK',
      appVersion: '1.0.0',
      parseVersion: '1.0.0',
      localeIdentifier: 'en-US',
      timeZone: 'GMT',
      channels: ['test'],
      GCMSenderId: '1234',
      pushType: 'test',
    };
    const installation = new ParseInstallation(data);
    Object.keys(data).forEach(key => {
      expect(installation[key]).toEqual(data[key]);
    });
  });

  it('can save to disk', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    CoreManager.setInstallationController(InstallationController);
    CoreManager.setRESTController({
      request() {
        return Promise.resolve({}, 200);
      },
      ajax() {},
    });
    CoreManager.setLocalDatastore(LocalDatastore);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    installation.set('deviceToken', '1234');
    await installation.save();
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(1);
  });

  it('can save if object not found', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    let once = true; // save will be called twice first time will reject
    CoreManager.setInstallationController(InstallationController);
    CoreManager.setRESTController({
      request() {
        if (!once) {
          return Promise.resolve({}, 200);
        }
        once = false;
        const parseError = new ParseError(ParseError.OBJECT_NOT_FOUND, 'Object not found.');
        return Promise.reject(parseError);
      },
      ajax() {},
    });
    CoreManager.setLocalDatastore(LocalDatastore);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    installation.set('deviceToken', '1234');
    jest.spyOn(installation, '_markAllFieldsDirty');
    await installation.save();
    expect(installation._markAllFieldsDirty).toHaveBeenCalledTimes(1);
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(1);
  });

  it('can save and handle errors', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    CoreManager.setInstallationController(InstallationController);
    CoreManager.setRESTController({
      request() {
        const parseError = new ParseError(
          ParseError.INTERNAL_SERVER_ERROR,
          'Cannot save installation on client.'
        );
        return Promise.reject(parseError);
      },
      ajax() {},
    });
    CoreManager.setLocalDatastore(LocalDatastore);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    installation.set('deviceToken', '1234');
    try {
      await installation.save();
    } catch (e) {
      expect(e.message).toEqual('Cannot save installation on client.');
    }
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(0);
  });

  it('can get current installation', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    CoreManager.setInstallationController(InstallationController);
    jest.spyOn(InstallationController, 'currentInstallation').mockImplementationOnce(() => {
      const installation = new ParseInstallation({ deviceType: 'web', installationId: '1234' });
      return installation;
    });
    const installation = await ParseInstallation.currentInstallation();
    expect(InstallationController.currentInstallation).toHaveBeenCalledTimes(1);
    expect(installation.deviceType).toEqual('web');
    expect(installation.installationId).toEqual('1234');
  });

  it('can fetch and save to disk', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    CoreManager.setInstallationController(InstallationController);
    CoreManager.setRESTController({
      request() {
        return Promise.resolve({}, 200);
      },
      ajax() {},
    });
    CoreManager.setLocalDatastore(LocalDatastore);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    installation.id = 'abc';
    await installation.fetch();
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(1);
  });

  it('can fetch if object not found', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    let once = true;
    CoreManager.setInstallationController(InstallationController);
    CoreManager.setRESTController({
      request() {
        if (!once) {
          // save() results
          return Promise.resolve({}, 200);
        }
        once = false;
        // fetch() results
        const parseError = new ParseError(ParseError.OBJECT_NOT_FOUND, 'Object not found.');
        return Promise.reject(parseError);
      },
      ajax() {},
    });
    CoreManager.setLocalDatastore(LocalDatastore);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    installation.id = '1234';
    jest.spyOn(installation, '_markAllFieldsDirty');
    await installation.fetch();
    expect(installation._markAllFieldsDirty).toHaveBeenCalledTimes(1);
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(1);
  });

  it('can fetch and handle errors', async () => {
    const InstallationController = {
      async updateInstallationOnDisk() {},
      async currentInstallationId() {},
      async currentInstallation() {},
    };
    CoreManager.setInstallationController(InstallationController);
    jest.spyOn(InstallationController, 'updateInstallationOnDisk').mockImplementationOnce(() => {});
    const installation = new ParseInstallation();
    try {
      await installation.fetch();
    } catch (e) {
      expect(e.message).toEqual('Object does not have an ID');
    }
    expect(InstallationController.updateInstallationOnDisk).toHaveBeenCalledTimes(0);
  });
});
