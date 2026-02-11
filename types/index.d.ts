// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/b23a36e669fa127d1035e22ca93faab85b98e49f/types/parse/index.d.ts#L11

import parse from './Parse';
export default parse;

// All exports beyond this point will be included in the Parse namespace
export as namespace Parse;
export let serverURL: import('./Parse').Parse['serverURL'];
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
export type { Pointer, Attributes, BaseAttributes, JSONBaseAttributes, ObjectStatic, ObjectConstructor, FetchOptions, SaveOptions, SetOptions, DestroyOptions, DestroyAllOptions, SaveAllOptions, FetchAllOptions, Encode, ToJSON } from './ParseObject';
export type { PushData, SendOptions } from './Push';
export type { FullOptions, RequestOptions } from './RESTController';
export type { RestSchema, TYPE } from './ParseSchema';
export type { FindOptions, QueryOptions, QueryJSON, WhereClause, FullTextOptions, BatchOptions, CountOptions, GetOptions, FirstOptions } from './ParseQuery';
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

// ============================================================================
// Namespace re-exports for backward compatibility
// These enable Parse.Object.FetchOptions, Parse.Query.FindOptions etc.
// ============================================================================

export namespace Object {
  export type DestroyOptions = import('./ParseObject').DestroyOptions;
  export type DestroyAllOptions = import('./ParseObject').DestroyAllOptions;
  export type FetchOptions = import('./ParseObject').FetchOptions;
  export type FetchAllOptions = import('./ParseObject').FetchAllOptions;
  export type SaveOptions = import('./ParseObject').SaveOptions;
  export type SaveAllOptions = import('./ParseObject').SaveAllOptions;
  export type SetOptions = import('./ParseObject').SetOptions;
  export type Encode<T> = import('./ParseObject').Encode<T>;
  export type ToJSON<T> = import('./ParseObject').ToJSON<T>;
}

export namespace Query {
  export type FindOptions = import('./ParseQuery').FindOptions;
  export type QueryOptions = import('./ParseQuery').QueryOptions;
  export type FullTextOptions = import('./ParseQuery').FullTextOptions;
  export type BatchOptions = import('./ParseQuery').BatchOptions;
  export type CountOptions = import('./ParseQuery').CountOptions;
  export type GetOptions = import('./ParseQuery').GetOptions;
  export type FirstOptions = import('./ParseQuery').FirstOptions;
}

export namespace Schema {
  export type TYPE = import('./ParseSchema').TYPE;
  export type FieldType = import('./ParseSchema').FieldType;
  export type FieldOptions<
    T extends import('./ParseSchema').SupportedFieldTypes = any
  > = import('./ParseSchema').FieldOptions<T>;
  export type Index = import('./ParseSchema').Index;
  export type CLP = import('./ParseSchema').CLP;
  export type CLPField = import('./ParseSchema').CLPField;
  export type AttrType<T extends import('./ParseObject').default, V> = import('./ParseSchema').AttrType<T, V>;
}
