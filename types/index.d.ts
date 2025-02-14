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

export type { AuthProvider, AuthData } from './ParseUser';
export type { Pointer } from './ParseObject';
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
