import * as ParseOp from './ParseOp';
import ACL from './ParseACL';
import * as Analytics from './Analytics';
import AnonymousUtils from './AnonymousUtils';
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import CoreManager from './CoreManager';
import Config from './ParseConfig';
import ParseError from './ParseError';
import FacebookUtils from './FacebookUtils';
import File from './ParseFile';
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
import type { EventuallyQueue } from './CoreManager';
/**
 * The interface for the Parse SDK.
 * This interface can be augmented in build-specific type definitions (e.g., node.d.ts)
 * to provide environment-specific type signatures.
 */
export interface Parse {
    ACL: typeof ACL;
    Analytics: typeof Analytics;
    AnonymousUtils: typeof AnonymousUtils;
    Cloud: typeof Cloud;
    CLP: typeof CLP;
    CoreManager: typeof CoreManager;
    Config: typeof Config;
    Error: typeof ParseError;
    FacebookUtils: typeof FacebookUtils;
    File: typeof File;
    GeoPoint: typeof GeoPoint;
    Polygon: typeof Polygon;
    Installation: typeof Installation;
    LocalDatastore: typeof LocalDatastore;
    Object: typeof ParseObject;
    Op: {
        Set: typeof ParseOp.SetOp;
        Unset: typeof ParseOp.UnsetOp;
        Increment: typeof ParseOp.IncrementOp;
        Add: typeof ParseOp.AddOp;
        Remove: typeof ParseOp.RemoveOp;
        AddUnique: typeof ParseOp.AddUniqueOp;
        Relation: typeof ParseOp.RelationOp;
    };
    Push: typeof Push;
    Query: typeof Query;
    Relation: typeof Relation;
    Role: typeof Role;
    Schema: typeof Schema;
    Session: typeof Session;
    Storage: typeof Storage;
    User: typeof User;
    LiveQueryClient: typeof LiveQueryClient;
    IndexedDB: any;
    Hooks: any;
    Parse: any;
    /**
     * @property {EventuallyQueue} Parse.EventuallyQueue
     * @static
     */
    EventuallyQueue: EventuallyQueue;
    /**
     * Call this method first to set up your authentication tokens for Parse.
     *
     * @param {string} applicationId Your Parse Application ID.
     * @param {string} javaScriptKey Your Parse JavaScript Key (Not needed for parse-server)
     * @note Node.js builds (parse/node) support additional parameters: masterKey and maintenanceKey.
     * @static
     */
    initialize(applicationId: string, javaScriptKey: string): void;
    _initialize(applicationId: string, javaScriptKey: string, masterKey?: string, maintenanceKey?: string): void;
    /**
     * Call this method to set your AsyncStorage engine
     * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
     * is not provided at a stable path and changes over versions.
     *
     * @param {AsyncStorage} storage a react native async storage.
     * @static
     */
    setAsyncStorage(storage: any): void;
    /**
     * Call this method to set your LocalDatastoreStorage engine
     * If using React-Native use {@link Parse.setAsyncStorage Parse.setAsyncStorage()}
     *
     * @param {LocalDatastoreController} controller a data storage.
     * @static
     */
    setLocalDatastoreController(controller: any): void;
    /**
     * Returns information regarding the current server's health
     *
     * @returns {Promise}
     * @static
     */
    getServerHealth(): Promise<any>;
    /**
     * @property {string} Parse.applicationId
     * @static
     */
    applicationId: string | undefined;
    /**
     * @property {string} Parse.javaScriptKey
     * @static
     */
    javaScriptKey: string | undefined;
    /**
     * @property {string} Parse.masterKey
     * @static
     */
    masterKey: string | undefined;
    /**
     * @property {string} Parse.maintenanceKey
     * @static
     */
    maintenanceKey: string | undefined;
    /**
     * @property {string} Parse.serverURL
     * @static
     */
    serverURL: string | undefined;
    /**
     * @property {ParseLiveQuery} Parse.LiveQuery
     * @static
     */
    LiveQuery: ParseLiveQuery;
    /**
     * @property {string} Parse.liveQueryServerURL
     * @static
     */
    liveQueryServerURL: string | undefined;
    /**
     * @property {boolean} Parse.encryptedUser
     * @static
     */
    encryptedUser: boolean;
    /**
     * @property {string} Parse.secret
     * @static
     */
    secret: string | undefined;
    /**
     * @property {boolean} Parse.idempotency
     * @static
     */
    idempotency: boolean | undefined;
    /**
     * @property {boolean} Parse.allowCustomObjectId
     * @static
     */
    allowCustomObjectId: boolean | undefined;
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
    nodeLogging: boolean | undefined;
    _request(...args: any[]): Promise<any>;
    _ajax(...args: any[]): Promise<any>;
    _decode(_: any, value: any): any;
    _encode(value: any, _: any, disallowObjects?: boolean): any;
    _getInstallationId(): Promise<string>;
    /**
     * Enable pinning in your application.
     * This must be called after `Parse.initialize` in your application.
     *
     * @param [polling] Allow pinging the server /health endpoint. Default true
     * @param [ms] Milliseconds to ping the server. Default 2000ms
     * @static
     */
    enableLocalDatastore(polling?: boolean, ms?: number): void;
    /**
     * Flag that indicates whether Local Datastore is enabled.
     *
     * @static
     * @returns {boolean}
     */
    isLocalDatastoreEnabled(): boolean;
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
    dumpLocalDatastore(): Promise<any>;
    /**
     * Enable the current user encryption.
     * This must be called before login any user.
     *
     * @static
     */
    enableEncryptedUser(): void;
    /**
     * Flag that indicates whether Encrypted User is enabled.
     *
     * @static
     * @returns {boolean}
     */
    isEncryptedUserEnabled(): boolean;
}
declare const Parse: Parse;
export default Parse;
