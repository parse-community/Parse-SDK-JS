import decode from './decode';
import encode from './encode';
import CryptoController from './CryptoController';
import EQ from './EventuallyQueue';
import IndexedDBStorageController from './IndexedDBStorageController';
import InstallationController from './InstallationController';
import * as ParseOp from './ParseOp';
import RESTController from './RESTController';
import ACL from './ParseACL';
import * as Analytics from './Analytics';
import AnonymousUtils from './AnonymousUtils';
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import CoreManager from './CoreManager';
import EventEmitter from './EventEmitter';
import Config from './ParseConfig';
import ParseError from './ParseError';
import FacebookUtils from './FacebookUtils';
import File from './ParseFile';
import * as Hooks from './ParseHooks';
import GeoPoint from './ParseGeoPoint';
import Polygon from './ParsePolygon';
import Installation from './ParseInstallation';
import LocalDatastore from './LocalDatastore';
import ParseObject from './ParseObject';
import * as Push from './Push';
import Query from './ParseQuery';
import Relation from './ParseRelation';
import Role from './ParseRole';
import Schema from './ParseSchema';
import Session from './ParseSession';
import Storage from './Storage';
import User from './ParseUser';
import ParseLiveQuery from './ParseLiveQuery';
import LiveQueryClient from './LiveQueryClient';
import LocalDatastoreController from './LocalDatastoreController';
import StorageController from './StorageController';
import WebSocketController from './WebSocketController';
import type { EventuallyQueue } from './CoreManager';

const Parse = {
  ACL,
  Analytics,
  AnonymousUtils,
  Cloud,
  CLP,
  CoreManager,
  Config,
  Error: ParseError,
  FacebookUtils,
  File,
  GeoPoint,
  Polygon,
  Installation,
  LocalDatastore,
  Object: ParseObject,
  Op: {
    Set: ParseOp.SetOp,
    Unset: ParseOp.UnsetOp,
    Increment: ParseOp.IncrementOp,
    Add: ParseOp.AddOp,
    Remove: ParseOp.RemoveOp,
    AddUnique: ParseOp.AddUniqueOp,
    Relation: ParseOp.RelationOp,
  },
  Push,
  Query,
  Relation,
  Role,
  Schema,
  Session,
  Storage,
  User,
  LiveQueryClient,
  IndexedDB: undefined,
  Hooks: undefined,
  Parse: undefined,

  /**
   * @property {EventuallyQueue} Parse.EventuallyQueue
   * @static
   */
  set EventuallyQueue(queue: EventuallyQueue) {
    CoreManager.setEventuallyQueue(queue);
  },

  get EventuallyQueue(): EventuallyQueue {
    return CoreManager.getEventuallyQueue();
  },

  /**
   * Call this method first to set up your authentication tokens for Parse.
   *
   * @param {string} applicationId Your Parse Application ID.
   * @param {string} [javaScriptKey] Your Parse JavaScript Key (Not needed for parse-server)
   * @param {string} [masterKey] Your Parse Master Key. (Node.js only!)
   * @static
   */
  initialize(applicationId: string, javaScriptKey: string) {
    if (
      process.env.PARSE_BUILD === 'browser' &&
      CoreManager.get('IS_NODE') &&
      !process.env.SERVER_RENDERING
    ) {
      console.log(
        "It looks like you're using the browser version of the SDK in a " +
          "node.js environment. You should require('parse/node') instead."
      );
    }
    Parse._initialize(applicationId, javaScriptKey);
  },

  _initialize(
    applicationId: string,
    javaScriptKey: string,
    masterKey?: string,
    maintenanceKey?: string
  ) {
    CoreManager.set('APPLICATION_ID', applicationId);
    CoreManager.set('JAVASCRIPT_KEY', javaScriptKey);
    CoreManager.set('MAINTENANCE_KEY', maintenanceKey);
    CoreManager.set('MASTER_KEY', masterKey);
    CoreManager.set('USE_MASTER_KEY', false);
    CoreManager.setIfNeeded('EventEmitter', EventEmitter);
    CoreManager.setIfNeeded('LiveQuery', new ParseLiveQuery());
    CoreManager.setIfNeeded('CryptoController', CryptoController);
    CoreManager.setIfNeeded('EventuallyQueue', EQ);
    CoreManager.setIfNeeded('InstallationController', InstallationController);
    CoreManager.setIfNeeded('LocalDatastoreController', LocalDatastoreController);
    CoreManager.setIfNeeded('StorageController', StorageController);
    CoreManager.setIfNeeded('WebSocketController', WebSocketController);

    if (process.env.PARSE_BUILD === 'browser') {
      Parse.IndexedDB = CoreManager.setIfNeeded(
        'IndexedDBStorageController',
        IndexedDBStorageController
      );
    }
  },

  /**
   * Call this method to set your AsyncStorage engine
   * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
   * is not provided at a stable path and changes over versions.
   *
   * @param {AsyncStorage} storage a react native async storage.
   * @static
   */
  setAsyncStorage(storage: any) {
    CoreManager.setAsyncStorage(storage);
  },

  /**
   * Call this method to set your LocalDatastoreStorage engine
   * If using React-Native use {@link Parse.setAsyncStorage Parse.setAsyncStorage()}
   *
   * @param {LocalDatastoreController} controller a data storage.
   * @static
   */
  setLocalDatastoreController(controller: any) {
    CoreManager.setLocalDatastoreController(controller);
  },

  /**
   * Returns information regarding the current server's health
   *
   * @returns {Promise}
   * @static
   */
  getServerHealth() {
    return CoreManager.getRESTController().request('GET', 'health');
  },

  /**
   * @property {string} Parse.applicationId
   * @static
   */
  set applicationId(value) {
    CoreManager.set('APPLICATION_ID', value);
  },
  get applicationId() {
    return CoreManager.get('APPLICATION_ID');
  },

  /**
   * @property {string} Parse.javaScriptKey
   * @static
   */
  set javaScriptKey(value) {
    CoreManager.set('JAVASCRIPT_KEY', value);
  },
  get javaScriptKey() {
    return CoreManager.get('JAVASCRIPT_KEY');
  },

  /**
   * @property {string} Parse.masterKey
   * @static
   */
  set masterKey(value) {
    CoreManager.set('MASTER_KEY', value);
  },
  get masterKey() {
    return CoreManager.get('MASTER_KEY');
  },

  /**
   * @property {string} Parse.maintenanceKey
   * @static
   */
  set maintenanceKey(value) {
    CoreManager.set('MAINTENANCE_KEY', value);
  },
  get maintenanceKey() {
    return CoreManager.get('MAINTENANCE_KEY');
  },

  /**
   * @property {string} Parse.serverURL
   * @static
   */
  set serverURL(value) {
    CoreManager.set('SERVER_URL', value);
  },
  get serverURL() {
    return CoreManager.get('SERVER_URL');
  },

  /**
   * @property {string} Parse.serverAuthToken
   * @static
   */
  set serverAuthToken(value) {
    CoreManager.set('SERVER_AUTH_TOKEN', value);
  },
  get serverAuthToken() {
    return CoreManager.get('SERVER_AUTH_TOKEN');
  },

  /**
   * @property {string} Parse.serverAuthType
   * @static
   */
  set serverAuthType(value) {
    CoreManager.set('SERVER_AUTH_TYPE', value);
  },
  get serverAuthType() {
    return CoreManager.get('SERVER_AUTH_TYPE');
  },

  /**
   * @property {ParseLiveQuery} Parse.LiveQuery
   * @static
   */
  set LiveQuery(liveQuery: ParseLiveQuery) {
    CoreManager.setLiveQuery(liveQuery);
  },
  get LiveQuery(): ParseLiveQuery {
    return CoreManager.getLiveQuery();
  },

  /**
   * @property {string} Parse.liveQueryServerURL
   * @static
   */
  set liveQueryServerURL(value) {
    CoreManager.set('LIVEQUERY_SERVER_URL', value);
  },
  get liveQueryServerURL() {
    return CoreManager.get('LIVEQUERY_SERVER_URL');
  },

  /**
   * @property {boolean} Parse.encryptedUser
   * @static
   */
  set encryptedUser(value: boolean) {
    CoreManager.set('ENCRYPTED_USER', value);
  },
  get encryptedUser() {
    return CoreManager.get('ENCRYPTED_USER');
  },

  /**
   * @property {string} Parse.secret
   * @static
   */
  set secret(value) {
    CoreManager.set('ENCRYPTED_KEY', value);
  },
  get secret() {
    return CoreManager.get('ENCRYPTED_KEY');
  },

  /**
   * @property {boolean} Parse.idempotency
   * @static
   */
  set idempotency(value) {
    CoreManager.set('IDEMPOTENCY', value);
  },
  get idempotency() {
    return CoreManager.get('IDEMPOTENCY');
  },

  /**
   * @property {boolean} Parse.allowCustomObjectId
   * @static
   */
  set allowCustomObjectId(value) {
    CoreManager.set('ALLOW_CUSTOM_OBJECT_ID', value);
  },
  get allowCustomObjectId() {
    return CoreManager.get('ALLOW_CUSTOM_OBJECT_ID');
  },

  /**
   * Setting this property to `true` enables enhanced logging for `Parse.Object`
   * in Node.js environments. Specifically, it will log:
   *
   * ```
   * ParseObject: className: <CLASS_NAME>, id: <OBJECT_ID>
   * Attributes: <OBJECT_ATTRIBUTES>
   * ```
   *
   * @warning This should not be enabled in production environments as this may
   * expose sensitive information in server logs.
   *
   * @property {boolean} Parse.nodeLogging
   * @static
   */
  set nodeLogging(value) {
    CoreManager.set('NODE_LOGGING', value);
  },
  get nodeLogging() {
    return CoreManager.get('NODE_LOGGING');
  },

  _request(...args) {
    return CoreManager.getRESTController().request.apply(null, args);
  },

  _ajax(...args) {
    return CoreManager.getRESTController().ajax.apply(null, args);
  },

  // We attempt to match the signatures of the legacy versions of these methods
  _decode(_, value) {
    return decode(value);
  },

  _encode(value, _, disallowObjects) {
    return encode(value, disallowObjects);
  },

  _getInstallationId() {
    return CoreManager.getInstallationController().currentInstallationId();
  },
  /**
   * Enable pinning in your application.
   * This must be called after `Parse.initialize` in your application.
   *
   * @param [polling] Allow pinging the server /health endpoint. Default true
   * @param [ms] Milliseconds to ping the server. Default 2000ms
   * @static
   */
  enableLocalDatastore(polling?: boolean, ms?: number) {
    if (!this.applicationId) {
      console.log("'enableLocalDataStore' must be called after 'initialize'");
      return;
    }
    if (!this.LocalDatastore.isEnabled) {
      this.LocalDatastore.isEnabled = true;
      if (polling || typeof polling === 'undefined') {
        CoreManager.getEventuallyQueue().poll(ms || 2000);
      }
    }
  },
  /**
   * Flag that indicates whether Local Datastore is enabled.
   *
   * @static
   * @returns {boolean}
   */
  isLocalDatastoreEnabled(): boolean {
    return this.LocalDatastore.isEnabled;
  },
  /**
   * Gets all contents from Local Datastore
   *
   * <pre>
   * await Parse.dumpLocalDatastore();
   * </pre>
   *
   * @static
   * @returns {object}
   */
  dumpLocalDatastore() {
    if (!this.LocalDatastore.isEnabled) {
      console.log('Parse.enableLocalDatastore() must be called first');
      return Promise.resolve({});
    } else {
      return Parse.LocalDatastore._getAllContents();
    }
  },

  /**
   * Enable the current user encryption.
   * This must be called before login any user.
   *
   * @static
   */
  enableEncryptedUser() {
    this.encryptedUser = true;
  },

  /**
   * Flag that indicates whether Encrypted User is enabled.
   *
   * @static
   * @returns {boolean}
   */
  isEncryptedUserEnabled() {
    return this.encryptedUser;
  },
};

CoreManager.setRESTController(RESTController);

if (process.env.PARSE_BUILD === 'node') {
  Parse.initialize = Parse._initialize;
  Parse.Cloud = { ...(Parse.Cloud || ({} as any)) };
  (Parse.Cloud as any).useMasterKey = function () {
    CoreManager.set('USE_MASTER_KEY', true);
  };
  Parse.Hooks = Hooks;
}
if (process.env.PARSE_BUILD === 'browser') {
  (globalThis as any).Parse = Parse;
}
// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;

export default Parse;
