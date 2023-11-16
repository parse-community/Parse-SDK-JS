import decode from './decode';
import encode from './encode';
import CryptoController from './CryptoController';
import EventuallyQueue from './EventuallyQueue';
import IndexedDBStorageController from './IndexedDBStorageController';
import InstallationController from './InstallationController';
import * as ParseOp from './ParseOp';
import RESTController from './RESTController';
import ACL from './ParseACL';
import * as Analytics from './Analytics'
import AnonymousUtils from './AnonymousUtils'
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import CoreManager from './CoreManager';
import EventEmitter from './EventEmitter';
import Config from './ParseConfig'
import ParseError from './ParseError'
import FacebookUtils from './FacebookUtils'
import File from './ParseFile'
import GeoPoint from './ParseGeoPoint'
import Polygon from './ParsePolygon'
import Installation from './ParseInstallation'
import LocalDatastore from './LocalDatastore'
import Object from './ParseObject'
import * as Push from './Push'
import Query from './ParseQuery'
import Relation from './ParseRelation'
import Role from './ParseRole'
import Schema from './ParseSchema'
import Session from './ParseSession'
import Storage from './Storage'
import User from './ParseUser'
import LiveQuery from './ParseLiveQuery'
import LiveQueryClient from './LiveQueryClient'

/**
 * Contains all Parse API classes and functions.
 *
 * @static
 * @global
 * @class
 * @hideconstructor
*/

interface ParseType {
  ACL: typeof ACL,
  Parse?: ParseType,
  Analytics: typeof Analytics,
  AnonymousUtils: typeof AnonymousUtils,
  Cloud: typeof Cloud,
  CLP: typeof CLP,
  CoreManager: typeof CoreManager,
  Config: typeof Config,
  Error: typeof ParseError,
  EventuallyQueue: typeof EventuallyQueue,
  FacebookUtils: typeof FacebookUtils,
  File: typeof File,
  GeoPoint: typeof GeoPoint,
  Hooks?: any,
  Polygon: typeof Polygon,
  Installation: typeof Installation,
  LocalDatastore: typeof LocalDatastore,
  Object: typeof Object,
  Op: {
    Set: typeof ParseOp.SetOp,
    Unset: typeof ParseOp.UnsetOp,
    Increment: typeof ParseOp.IncrementOp,
    Add: typeof ParseOp.AddOp,
    Remove: typeof ParseOp.RemoveOp,
    AddUnique: typeof ParseOp.AddUniqueOp,
    Relation: typeof ParseOp.RelationOp,
  };
  Push: typeof Push,
  Query: typeof Query,
  Relation: typeof Relation,
  Role: typeof Role,
  Schema: typeof Schema,
  Session: typeof Session,
  Storage: typeof Storage,
  User: typeof User,
  LiveQuery?: typeof LiveQuery,
  LiveQueryClient: typeof LiveQueryClient,

  initialize(applicationId: string, javaScriptKey: string): void,
  _initialize(applicationId: string, javaScriptKey: string, masterKey?: string): void,
  setAsyncStorage(storage: any): void,
  setLocalDatastoreController(controller: any): void,
  getServerHealth(): Promise<any>

  applicationId: string,
  javaScriptKey: string,
  masterKey: string,
  serverURL: string,
  serverAuthToken: string,
  serverAuthType: string,
  liveQueryServerURL: string,
  encryptedUser: boolean,
  secret: string,
  idempotency: boolean,
  allowCustomObjectId: boolean,
  IndexedDB?: any,
  _request(...args: any[]): void,
  _ajax(...args: any[]): void,
  _decode(...args: any[]): void,
  _encode(...args: any[]): void,
  _getInstallationId?(): string,
  enableLocalDatastore(polling: boolean, ms: number): void,
  isLocalDatastoreEnabled(): boolean,
  dumpLocalDatastore(): void,
  enableEncryptedUser(): void,
  isEncryptedUserEnabled(): void,
}

const Parse: ParseType = {
  ACL: ACL,
  Analytics: Analytics,
  AnonymousUtils:  AnonymousUtils,
  Cloud: Cloud,
  CLP: CLP,
  CoreManager:  CoreManager,
  Config:  Config,
  Error:  ParseError,
  EventuallyQueue:  EventuallyQueue,
  FacebookUtils: FacebookUtils,
  File:  File,
  GeoPoint:  GeoPoint,
  Polygon:  Polygon,
  Installation:  Installation,
  LocalDatastore:  LocalDatastore,
  Object:  Object,
  Op: {
    Set:  ParseOp.SetOp,
    Unset:  ParseOp.UnsetOp,
    Increment:  ParseOp.IncrementOp,
    Add:  ParseOp.AddOp,
    Remove:  ParseOp.RemoveOp,
    AddUnique:  ParseOp.AddUniqueOp,
    Relation:  ParseOp.RelationOp,
  },
  Push:  Push,
  Query:  Query,
  Relation:  Relation,
  Role:  Role,
  Schema:  Schema,
  Session:  Session,
  Storage:  Storage,
  User:  User,
  LiveQueryClient:  LiveQueryClient,
  LiveQuery:  undefined,
  IndexedDB: undefined,
  Hooks: undefined,
  Parse: undefined,

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
      /* eslint-disable no-console */
      console.log(
        "It looks like you're using the browser version of the SDK in a " +
          "node.js environment. You should require('parse/node') instead."
      );
      /* eslint-enable no-console */
    }
    Parse._initialize(applicationId, javaScriptKey);
  },

  _initialize(applicationId: string, javaScriptKey: string, masterKey?: string) {
    CoreManager.set('APPLICATION_ID', applicationId);
    CoreManager.set('JAVASCRIPT_KEY', javaScriptKey);
    CoreManager.set('MASTER_KEY', masterKey);
    CoreManager.set('USE_MASTER_KEY', false);
    CoreManager.setIfNeeded('EventEmitter', EventEmitter);

    Parse.LiveQuery = new LiveQuery();
    CoreManager.setIfNeeded('LiveQuery', Parse.LiveQuery);

    if (process.env.PARSE_BUILD === 'browser') {
      Parse.IndexedDB = CoreManager.setIfNeeded('IndexedDBStorageController', IndexedDBStorageController);
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
   * @member {string} Parse.applicationId
   * @static
   */
  set applicationId(value) {
    CoreManager.set('APPLICATION_ID', value);
  },
  get applicationId() {
    return CoreManager.get('APPLICATION_ID');
  },

  /**
   * @member {string} Parse.javaScriptKey
   * @static
   */
  set javaScriptKey(value) {
    CoreManager.set('JAVASCRIPT_KEY', value);
  },
  get javaScriptKey() {
    return CoreManager.get('JAVASCRIPT_KEY');
  },

  /**
   * @member {string} Parse.masterKey
   * @static
   */
  set masterKey(value) {
    CoreManager.set('MASTER_KEY', value);
  },
  get masterKey() {
    return CoreManager.get('MASTER_KEY');
  },

  /**
   * @member {string} Parse.serverURL
   * @static
   */
  set serverURL(value) {
    CoreManager.set('SERVER_URL', value);
  },
  get serverURL() {
    return CoreManager.get('SERVER_URL');
  },

  /**
   * @member {string} Parse.serverAuthToken
   * @static
   */
  set serverAuthToken(value) {
    CoreManager.set('SERVER_AUTH_TOKEN', value);
  },
  get serverAuthToken() {
    return CoreManager.get('SERVER_AUTH_TOKEN');
  },

  /**
   * @member {string} Parse.serverAuthType
   * @static
   */
  set serverAuthType(value) {
    CoreManager.set('SERVER_AUTH_TYPE', value);
  },
  get serverAuthType() {
    return CoreManager.get('SERVER_AUTH_TYPE');
  },

  /**
   * @member {string} Parse.liveQueryServerURL
   * @static
   */
  set liveQueryServerURL(value) {
    CoreManager.set('LIVEQUERY_SERVER_URL', value);
  },
  get liveQueryServerURL() {
    return CoreManager.get('LIVEQUERY_SERVER_URL');
  },

  /**
   * @member {boolean} Parse.encryptedUser
   * @static
   */
  set encryptedUser(value: boolean) {
    CoreManager.set('ENCRYPTED_USER', value);
  },
  get encryptedUser() {
    return CoreManager.get('ENCRYPTED_USER');
  },

  /**
   * @member {string} Parse.secret
   * @static
   */
  set secret(value) {
    CoreManager.set('ENCRYPTED_KEY', value);
  },
  get secret() {
    return CoreManager.get('ENCRYPTED_KEY');
  },

  /**
   * @member {boolean} Parse.idempotency
   * @static
   */
  set idempotency(value) {
    CoreManager.set('IDEMPOTENCY', value);
  },
  get idempotency() {
    return CoreManager.get('IDEMPOTENCY');
  },

  /**
   * @member {boolean} Parse.allowCustomObjectId
   * @static
   */
  set allowCustomObjectId(value) {
    CoreManager.set('ALLOW_CUSTOM_OBJECT_ID', value);
  },
  get allowCustomObjectId() {
    return CoreManager.get('ALLOW_CUSTOM_OBJECT_ID');
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

  _getInstallationId () {
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
  enableLocalDatastore(polling = true, ms: number = 2000) {
    if (!this.applicationId) {
      console.log("'enableLocalDataStore' must be called after 'initialize'");
      return;
    }
    if (!this.LocalDatastore.isEnabled) {
      this.LocalDatastore.isEnabled = true;
      if (polling) {
        EventuallyQueue.poll(ms);
      }
    }
  },
  /**
   * Flag that indicates whether Local Datastore is enabled.
   *
   * @static
   * @returns {boolean}
   */
  isLocalDatastoreEnabled () {
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
      console.log('Parse.enableLocalDatastore() must be called first'); // eslint-disable-line no-console
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
  enableEncryptedUser () {
    this.encryptedUser = true;
  },

  /**
   * Flag that indicates whether Encrypted User is enabled.
   *
   * @static
   * @returns {boolean}
   */
  isEncryptedUserEnabled () {
    return this.encryptedUser;
  },
};

CoreManager.setCryptoController(CryptoController);
CoreManager.setInstallationController(InstallationController);
CoreManager.setRESTController(RESTController);

if (process.env.PARSE_BUILD === 'node') {
  Parse.initialize = Parse._initialize;
  Parse.Cloud = Parse.Cloud || {};
  Parse.Cloud.useMasterKey = function () {
    CoreManager.set('USE_MASTER_KEY', true);
  };
  Parse.Hooks = require('./ParseHooks');
}

// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;

module.exports = Parse;
export default Parse;
