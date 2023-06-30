import * as ParseOp from './ParseOp';
import GeoPoint from './ParseGeoPoint';
import Object from './ParseObject';
import Query from './ParseQuery';
import Relation from './ParseRelation';
import User from './ParseUser';
/**
 * Contains all Parse API classes and functions.
 *
 * @static
 * @global
 * @class
 * @hideconstructor
*/
interface Parse {
    ACL: any;
    Parse?: Parse;
    Analytics: any;
    AnonymousUtils: any;
    Cloud: any;
    CLP: any;
    CoreManager: any;
    Config: any;
    Error: any;
    EventuallyQueue: any;
    FacebookUtils: any;
    File: any;
    GeoPoint: typeof GeoPoint;
    Hooks?: any;
    Polygon: any;
    Installation: any;
    LocalDatastore: any;
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
    Push: any;
    Query: typeof Query;
    Relation: typeof Relation;
    Role: any;
    Schema: any;
    Session: any;
    Storage: any;
    User: typeof User;
    LiveQuery: any;
    LiveQueryClient: any;
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
    encryptedUser: string;
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
declare const Parse: Parse;
export default Parse;
