// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b23a36e669fa127d1035e22ca93faab85b98e49f/types/parse/index.d.ts#L11

import parse from './Parse';
export default parse;

// All exports beyond this point will be included in the Parse namespace
export as namespace Parse;
import ACL from './ParseACL';
import * as Analytics from './Analytics';
import AnonymousUtils from './AnonymousUtils';
import * as Cloud from './Cloud';
import CLP from './ParseCLP';
import CoreManager from './CoreManager';
import Config from './ParseConfig';
import Error from './ParseError';
import FacebookUtils from './FacebookUtils';
import File from './ParseFile';
import GeoPoint from './ParseGeoPoint';
import * as Hooks from './ParseHooks';
import IndexedDB from './IndexedDBStorageController';
import Polygon from './ParsePolygon';
import Installation from './ParseInstallation';
import LiveQuery from './ParseLiveQuery';
import LiveQueryClient from './LiveQueryClient';
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
import LiveQuerySubscription from './LiveQuerySubscription';

export type { AuthProvider, AuthData, SignUpOptions } from './ParseUser';
export type { Pointer, Attributes, BaseAttributes, JSONBaseAttributes, ObjectStatic, FetchOptions as ObjectFetchOptions, SaveOptions as ObjectSaveOptions, SetOptions as ObjectSetOptions, DestroyOptions as ObjectDestroyOptions } from './ParseObject';
export type { FullOptions, RequestOptions } from './RESTController';
export type { RestSchema, TYPE } from './ParseSchema';
export type { FindOptions, QueryOptions, QueryJSON, WhereClause } from './ParseQuery';
export { LiveQuerySubscription };
export {
  ACL,
  Analytics,
  AnonymousUtils,
  Cloud,
  CLP,
  CoreManager,
  Config,
  Error,
  FacebookUtils,
  File,
  GeoPoint,
  Polygon,
  Installation,
  LiveQuery,
  LocalDatastore,
  Object,
  Push,
  Query,
  Relation,
  Role,
  Schema,
  Session,
  Storage,
  User,
  LiveQueryClient,
  IndexedDB,
  Hooks,
};

// Namespace-scoped option types for backwards compatibility
// These augment the class namespaces with additional types
export namespace Object {
  /** Options for destroying objects */
  export interface DestroyOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    context?: Record<string, unknown>;
  }
  /** Options for fetching objects */
  export interface FetchOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    include?: string | string[];
    context?: Record<string, unknown>;
  }
  /** Options for saving objects */
  export interface SaveOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    cascadeSave?: boolean;
    context?: Record<string, unknown>;
  }
  /** Options for setting attributes */
  export interface SetOptions {
    ignoreValidation?: boolean;
    unset?: boolean;
  }
}

export namespace Query {
  /** Options for find operations */
  export interface FindOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    context?: Record<string, unknown>;
    json?: boolean;
  }
  /** Options for first operations */
  export interface FirstOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    context?: Record<string, unknown>;
    json?: boolean;
  }
  /** Options for get operations */
  export interface GetOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
    context?: Record<string, unknown>;
    json?: boolean;
  }
  /** Options for count operations */
  export interface CountOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
  }
  /** Options for each operations */
  export interface EachOptions {
    useMasterKey?: boolean;
    sessionToken?: string;
  }
  /** Options for batch operations */
  export interface BatchOptions {
    useMasterKey?: boolean;
    useMaintenanceKey?: boolean;
    sessionToken?: string;
    batchSize?: number;
    context?: Record<string, unknown>;
    json?: boolean;
  }
  /** Options for full text search */
  export interface FullTextOptions {
    language?: string;
    caseSensitive?: boolean;
    diacriticSensitive?: boolean;
  }
  /** Options for aggregation queries */
  export interface AggregationOptions {
    group?: (Record<string, unknown> & { objectId?: string });
    match?: Record<string, unknown>;
    project?: Record<string, unknown>;
    limit?: number;
    skip?: number;
    sort?: Record<string, 1 | -1>;
    sample?: { size: number };
    count?: string;
    lookup?: {
      from: string;
      localField: string;
      foreignField: string;
      as: string;
    } | {
      from: string;
      let?: Record<string, unknown>;
      pipeline: Record<string, unknown>;
      as: string;
    };
    graphLookup?: {
      from: string;
      startWith?: string;
      connectFromField: string;
      connectToField: string;
      as: string;
      maxDepth?: number;
      depthField?: string;
      restrictSearchWithMatch?: Record<string, unknown>;
    };
    facet?: Record<string, Array<Record<string, unknown>>>;
    unwind?: {
      path: string;
      includeArrayIndex?: string;
      preserveNullAndEmptyArrays?: boolean;
    } | string;
  }
}

export namespace Schema {
  /** Field type for Parse Schema */
  export type TYPE = 'String' | 'Number' | 'Bytes' | 'Boolean' | 'Date' | 'File' | 'GeoPoint' | 'Polygon' | 'Array' | 'Object' | 'Pointer' | 'Relation';
}

