class Object<T extends Attributes = Attributes> {
  attributes: T;
  add<K extends { [K in keyof T]: T[K] extends any[] ? K : never }[keyof T]>(
    attr: K,
    item: T[K][number]
  ): this | false;
  addAll<K extends { [K in keyof T]: T[K] extends any[] ? K : never }[keyof T]>(
    attr: K,
    items: T[K]
  ): this | false;
  dirty(attr?: Extract<keyof T, string>): boolean;
  equals<T extends Object>(other: T): boolean;
  escape(attr: Extract<keyof T, string>): string;
  fetchWithInclude<K extends Extract<keyof T, string>>(
    keys: K | Array<K | K[]>,
    options?: RequestOptions
  ): Promise<this>;
  get<K extends Extract<keyof T, string>>(attr: K): T[K];
  has(attr: Extract<keyof T, string>): boolean;
  increment(attr: Extract<keyof T, string>, amount?: number): this | false;
  decrement(attr: Extract<keyof T, string>, amount?: number): this | false;
  op(attr: Extract<keyof T, string>): any;
  relation<R extends Object, K extends Extract<keyof T, string> = Extract<keyof T, string>>(
    attr: T[K] extends Relation ? K : never
  ): Relation<this, R>;
  revert(...keys: Array<Extract<keyof (T & CommonAttributes), string>>): void;
  save<K extends Extract<keyof T, string>>(
    attrs?: Pick<T, K> | T | null,
    options?: SaveOptions
  ): Promise<this>;
  save<K extends Extract<keyof T, string>>(
    key: K,
    value: T[K] extends undefined ? never : T[K],
    options?: SaveOptions
  ): Promise<this>;
  set<K extends Extract<keyof T, string>>(attrs: Pick<T, K> | T, options?: any): this | false;
  set<K extends Extract<keyof T, string>>(
    key: K,
    value: T[K] extends undefined ? never : T[K],
    options?: any
  ): this | false;
  toJSON(): ToJSON<T> & JSONBaseAttributes;
  unset(attr: Extract<keyof T, string>, options?: any): this | false;
}
class User<T extends Attributes = Attributes> extends Object<T> {}

class Relation<S extends Object = Object, T extends Object = Object> {
  parent: S;
  constructor(parent?: S, key?: string);

  // Adds a Parse.Object or an array of Parse.Objects to the relation.
  add(object: T | T[]): void;

  // Returns a Parse.Query that is limited to objects in this relation.
  query(): Query<T>;

  // Removes a Parse.Object or an array of Parse.Objects from this relation.
  remove(object: T | T[]): void;
}

class Query<T extends Object = Object> {
  constructor(objectClass: string | (new (...args: any[]) => T | Object));
  static and<U extends Object>(...args: Array<Query<U>>): Query<U>;
  static fromJSON<U extends Object>(className: string | (new () => U), json: any): Query<U>;
  static nor<U extends Object>(...args: Array<Query<U>>): Query<U>;
  static or<U extends Object>(...var_args: Array<Query<U>>): Query<U>;

  addAscending<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K | K[]): this;
  addDescending<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K | K[]): this;
  ascending<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K | K[]): this;
  aggregate<V = any>(pipeline: AggregationPipeline | AggregationPipeline[]): Promise<V>;
  containedBy<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    values: Array<T['attributes'][K] | (T['attributes'][K] extends Object ? string : never)>
  ): this;
  containedIn<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    values: Array<T['attributes'][K] | (T['attributes'][K] extends Object ? string : never)>
  ): this;
  contains<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K, substring: string): this;
  containsAll<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K, values: any[]): this;
  containsAllStartingWith<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    values: any[]
  ): this;
  descending<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K | K[]): this;
  doesNotExist<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K): this;
  doesNotMatchKeyInQuery<
    U extends Object,
    K extends keyof T['attributes'] | keyof BaseAttributes,
    X extends Extract<keyof U['attributes'], string>
  >(key: K, queryKey: X, query: Query<U>): this;
  doesNotMatchQuery<U extends Object, K extends keyof T['attributes']>(
    key: K,
    query: Query<U>
  ): this;
  distinct<K extends keyof T['attributes'], V = T['attributes'][K]>(key: K): Promise<V[]>;
  eachBatch(
    callback: (objs: T[]) => PromiseLike<void> | void,
    options?: BatchOptions
  ): Promise<void>;
  each(callback: (obj: T) => PromiseLike<void> | void, options?: BatchOptions): Promise<void>;
  map<U>(
    callback: (currentObject: T, index: number, query: Query) => PromiseLike<U> | U,
    options?: BatchOptions
  ): Promise<U[]>;
  reduce(
    callback: (accumulator: T, currentObject: T, index: number) => PromiseLike<T> | T,
    initialValue?: undefined,
    options?: BatchOptions
  ): Promise<T>;
  reduce<U>(
    callback: (accumulator: U, currentObject: T, index: number) => PromiseLike<U> | U,
    initialValue: U,
    options?: BatchOptions
  ): Promise<U>;
  filter(
    callback: (currentObject: T, index: number, query: Query) => PromiseLike<boolean> | boolean,
    options?: BatchOptions
  ): Promise<T[]>;
  endsWith<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K, suffix: string): this;
  equalTo<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value:
      | T['attributes'][K]
      | (T['attributes'][K] extends Object
          ? Pointer
          : T['attributes'][K] extends Array<infer E>
          ? E
          : never)
  ): this;
  exclude<K extends keyof T['attributes'] | keyof BaseAttributes>(...keys: K[]): this;
  exists<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K): this;
  find(options?: QueryOptions): Promise<T[]>;
  findAll(options?: BatchOptions): Promise<T[]>;
  first(options?: QueryOptions): Promise<T | undefined>;
  fromNetwork(): this;
  fromLocalDatastore(): this;
  fromPin(): this;
  fromPinWithName(name: string): this;
  cancel(): this;
  fullText<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value: string,
    options?: FullTextOptions
  ): this;
  get(objectId: string, options?: QueryOptions): Promise<T>;
  greaterThan<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value: T['attributes'][K]
  ): this;
  greaterThanOrEqualTo<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value: T['attributes'][K]
  ): this;
  include<K extends keyof T['attributes'] | keyof BaseAttributes>(...key: K[]): this;
  include<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K[]): this;
  includeAll(): Query<T>;
  lessThan<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value: T['attributes'][K]
  ): this;
  lessThanOrEqualTo<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value: T['attributes'][K]
  ): this;
  limit(n: number): Query<T>;
  matches<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    regex: RegExp,
    modifiers?: string
  ): this;
  matchesKeyInQuery<
    U extends Object,
    K extends keyof T['attributes'],
    X extends Extract<keyof U['attributes'], string>
  >(key: K, queryKey: X, query: Query<U>): this;
  matchesQuery<U extends Object, K extends keyof T['attributes']>(key: K, query: Query<U>): this;
  near<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K, point: GeoPoint): this;
  notContainedIn<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    values: Array<T['attributes'][K]>
  ): this;
  notEqualTo<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    value:
      | T['attributes'][K]
      | (T['attributes'][K] extends Object
          ? Pointer
          : T['attributes'][K] extends Array<infer E>
          ? E
          : never)
  ): this;
  polygonContains<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    point: GeoPoint
  ): this;
  select<K extends keyof T['attributes'] | keyof BaseAttributes>(...keys: K[]): this;
  select<K extends keyof T['attributes'] | keyof BaseAttributes>(keys: K[]): this;
  skip(n: number): Query<T>;
  sortByTextScore(): this;
  startsWith<K extends keyof T['attributes'] | keyof BaseAttributes>(key: K, prefix: string): this;
  withinGeoBox<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    southwest: GeoPoint,
    northeast: GeoPoint
  ): this;
  withinKilometers<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    point: GeoPoint,
    maxDistance: number,
    sorted?: boolean
  ): this;
  withinMiles<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    point: GeoPoint,
    maxDistance: number,
    sorted?: boolean
  ): this;
  withinPolygon<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    points: number[][]
  ): this;
  withinRadians<K extends keyof T['attributes'] | keyof BaseAttributes>(
    key: K,
    point: GeoPoint,
    maxDistance: number
  ): this;
}
class Cloud {
  static run<T extends () => any>(
    name: string,
    data?: null,
    options?: RequestOptions
  ): Promise<ReturnType<T>>;
  static run<T extends (param: { [P in keyof Parameters<T>[0]]: Parameters<T>[0][P] }) => any>(
    name: string,
    data: Parameters<T>[0],
    options?: RequestOptions
  ): Promise<ReturnType<T>>;
  static afterDelete<T extends Object = Object>(
    arg1: { new (): T } | string,
    func?: (request: GenericTriggerRequest<T>) => Promise<void> | void,
    validator?: Parse.Cloud.ValidatorObject | ((request: GenericTriggerRequest<T>) => any),
  ): void;
  static afterSave<T extends Object = Object>(
    arg1: { new (): T } | string,
    func?: (request: GenericTriggerRequest<T>) => Promise<void> | void,
    validator?: Parse.Cloud.ValidatorObject | ((request: GenericTriggerRequest<T>) => any),
): void;
static beforeDelete<T extends Object = Object>(
  arg1: { new (): T } | string,
  func?: (request: GenericTriggerRequest<T>) => Promise<void> | void,
  validator?: Parse.Cloud.ValidatorObject | ((request: GenericTriggerRequest<T>) => any),
): void;
static beforeSave<T extends Object = Object>(
  arg1: { new (): T } | string,
  func?: (request: GenericTriggerRequest<T>) => Promise<void> | void,
  validator?: Parse.Cloud.ValidatorObject | ((request: GenericTriggerRequest<T>) => any),
): void;
static beforeFind<T extends Object = Object>(
  arg1: { new (): T } | string,
  func?: (request: BeforeFindRequest<T>) => Promise<Query<T>> | Promise<void> | Query<T> | void,
  validator?: Parse.Cloud.ValidatorObject | ((request: BeforeFindRequest<T>) => any),
): void;
static afterFind<T extends Object = Object>(
  arg1: { new (): T } | string,
  func?: (request: AfterFindRequest<T>) => any,
  validator?: Parse.Cloud.ValidatorObject | ((request: AfterFindRequest<T>) => any),
): void;
}
