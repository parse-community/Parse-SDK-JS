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
    EventuallyQueue: EventuallyQueue;
    /**
     * Call this method first to set up your authentication tokens for Parse.
     *
     * @param applicationId Your Parse Application ID.
     * @param javaScriptKey Your Parse JavaScript Key (Not needed for parse-server)
     */
    initialize(applicationId: string, javaScriptKey: string): void;
    _initialize(applicationId: string, javaScriptKey: string, masterKey?: string, maintenanceKey?: string): void;
    setAsyncStorage(storage: any): void;
    setLocalDatastoreController(controller: any): void;
    getServerHealth(): Promise<any>;
    applicationId: string | undefined;
    javaScriptKey: string | undefined;
    masterKey: string | undefined;
    maintenanceKey: string | undefined;
    serverURL: string | undefined;
    LiveQuery: ParseLiveQuery;
    liveQueryServerURL: string | undefined;
    encryptedUser: boolean;
    secret: string | undefined;
    idempotency: boolean | undefined;
    allowCustomObjectId: boolean | undefined;
    nodeLogging: boolean | undefined;
    _request(...args: any[]): Promise<any>;
    _ajax(...args: any[]): Promise<any>;
    _decode(_: any, value: any): any;
    _encode(value: any, _: any, disallowObjects?: boolean): any;
    _getInstallationId(): Promise<string>;
    enableLocalDatastore(polling?: boolean, ms?: number): void;
    isLocalDatastoreEnabled(): boolean;
    dumpLocalDatastore(): Promise<any>;
    enableEncryptedUser(): void;
    isEncryptedUserEnabled(): boolean;
}
declare const Parse: Parse;
export default Parse;
