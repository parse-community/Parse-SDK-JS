import EventuallyQueue from './EventuallyQueue';
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
import Object from './ParseObject';
import * as Push from './Push';
import Query from './ParseQuery';
import Relation from './ParseRelation';
import Role from './ParseRole';
import Schema from './ParseSchema';
import Session from './ParseSession';
import Storage from './Storage';
import User from './ParseUser';
import LiveQuery from './ParseLiveQuery';
import LiveQueryClient from './LiveQueryClient';
/**
 * Contains all Parse API classes and functions.
 *
 * @static
 * @global
 * @class
 * @hideconstructor
*/
interface ParseType {
    ACL: typeof ACL;
    Parse?: ParseType;
    Analytics: typeof Analytics;
    AnonymousUtils: typeof AnonymousUtils;
    Cloud: typeof Cloud;
    CLP: typeof CLP;
    CoreManager: typeof CoreManager;
    Config: typeof Config;
    Error: typeof ParseError;
    EventuallyQueue: typeof EventuallyQueue;
    FacebookUtils: typeof FacebookUtils;
    File: typeof File;
    GeoPoint: typeof GeoPoint;
    Hooks?: any;
    Polygon: typeof Polygon;
    Installation: typeof Installation;
    LocalDatastore: typeof LocalDatastore;
    Object: typeof Object;
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
    LiveQuery: typeof LiveQuery;
    LiveQueryClient: typeof LiveQueryClient;
    initialize(applicationId: string, javaScriptKey: string): void;
    _initialize(applicationId: string, javaScriptKey: string, masterKey?: string): void;
    setAsyncStorage(storage: any): void;
    setLocalDatastoreController(controller: any): void;
    getServerHealth(): Promise<any>;
    applicationId: string;
    javaScriptKey: string;
    masterKey: string;
    serverURL: string;
    serverAuthToken: string;
    serverAuthType: string;
    liveQueryServerURL: string;
    encryptedUser: boolean;
    secret: string;
    idempotency: boolean;
    allowCustomObjectId: boolean;
    IndexedDB?: any;
    _request(...args: any[]): void;
    _ajax(...args: any[]): void;
    _decode(...args: any[]): void;
    _encode(...args: any[]): void;
    _getInstallationId?(): string;
    enableLocalDatastore(polling: boolean, ms: number): void;
    isLocalDatastoreEnabled(): boolean;
    dumpLocalDatastore(): void;
    enableEncryptedUser(): void;
    isEncryptedUserEnabled(): void;
}
declare const Parse: ParseType;
export default Parse;
