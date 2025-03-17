'use strict';

const Parse = require('../../react-native');
const { resolvingPromise } = require('../../lib/react-native/promiseUtils');
const CryptoController = require('../../lib/react-native/CryptoController').default;
const LocalDatastoreController =
  require('../../lib/react-native/LocalDatastoreController.default').default;
const StorageController = require('../../lib/react-native/StorageController.default').default;
const RESTController = require('../../lib/react-native/RESTController').default;

RESTController._setXHR(require('xmlhttprequest').XMLHttpRequest);

describe('Parse React Native', () => {
  beforeEach(() => {
    // Set up missing controllers and configurations
    Parse.CoreManager.setWebSocketController(require('ws'));
    Parse.CoreManager.setEventEmitter(require('events').EventEmitter);
    Parse.CoreManager.setLocalDatastoreController(LocalDatastoreController);
    Parse.CoreManager.setStorageController(StorageController);
    Parse.CoreManager.setRESTController(RESTController);
    Parse.CoreManager.setCryptoController(CryptoController);

    Parse.initialize('integration');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.CoreManager.set('MASTER_KEY', 'notsosecret');
    Parse.enableLocalDatastore();
  });

  afterEach(async () => {
    await Parse.User.logOut();
    Parse.Storage._clear();
  });

  it('can log in a user', async () => {
    // Handle Storage Controller
    await Parse.User.signUp('asdf', 'zxcv');
    const user = await Parse.User.logIn('asdf', 'zxcv');
    expect(user.get('username')).toBe('asdf');
    expect(user.existed()).toBe(true);
  });

  it('can encrypt user', async () => {
    // Handle Crypto Controller
    Parse.User.enableUnsafeCurrentUser();
    Parse.enableEncryptedUser();
    Parse.secret = 'My Secret Key';
    const user = new Parse.User();
    user.setUsername('usernameENC');
    user.setPassword('passwordENC');
    await user.signUp();

    const path = Parse.Storage.generatePath('currentUser');
    const encryptedUser = Parse.Storage.getItem(path);

    const crypto = Parse.CoreManager.getCryptoController();

    const decryptedUser = crypto.decrypt(encryptedUser, Parse.CoreManager.get('ENCRYPTED_KEY'));
    expect(JSON.parse(decryptedUser).objectId).toBe(user.id);

    const currentUser = Parse.User.current();
    expect(currentUser).toEqual(user);

    const currentUserAsync = await Parse.User.currentAsync();
    expect(currentUserAsync).toEqual(user);
    await Parse.User.logOut();
    Parse.CoreManager.set('ENCRYPTED_USER', false);
    Parse.CoreManager.set('ENCRYPTED_KEY', null);
  });

  it('can pin saved object LDS', async () => {
    // Handle LocalDatastore Controller
    function LDS_KEY(object) {
      return Parse.LocalDatastore.getKeyForObject(object);
    }
    const object = new Parse.Object('TestObject');
    object.set('field', 'test');
    await object.save();
    await object.pin();
    const localDatastore = await Parse.LocalDatastore._getAllContents();
    const cachedObject = localDatastore[LDS_KEY(object)][0];
    expect(Object.keys(localDatastore).length).toBe(2);
    expect(cachedObject.objectId).toBe(object.id);
    expect(cachedObject.field).toBe('test');
  });

  it('can subscribe to query', async () => {
    // Handle WebSocket Controller
    const object = new Parse.Object('TestObject');
    await object.save();
    const installationId =
      await Parse.CoreManager.getInstallationController().currentInstallationId();

    const query = new Parse.Query('TestObject');
    query.equalTo('objectId', object.id);
    const subscription = await query.subscribe();
    const promise = resolvingPromise();
    subscription.on('update', (object, _, response) => {
      expect(object.get('foo')).toBe('bar');
      expect(response.installationId).toBe(installationId);
      promise.resolve();
    });
    object.set({ foo: 'bar' });
    await object.save();
    await promise;
  });
});
