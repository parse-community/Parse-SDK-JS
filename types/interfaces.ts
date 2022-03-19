interface BaseAttributes {
  createdAt: Date;
  objectId: string;
  updatedAt: Date;
}

interface CommonAttributes {
  ACL: Parse.ACL;
}

interface JSONBaseAttributes {
  createdAt: string;
  objectId: string;
  updatedAt: string;
}

type Encode<T> = T extends Parse.Object
? ReturnType<T["toJSON"]> | Parse.Pointer
: T extends Parse.ACL | Parse.GeoPoint | Parse.Polygon | Parse.Relation | Parse.File
? ReturnType<T["toJSON"]>
: T extends Date
? { __type: "Date"; iso: string }
: T extends RegExp
? string
: T extends Array<infer R>
? // This recursion is unsupported in <=3.6
  Array<Encode<R>>
: T extends object
? ToJSON<T>
: T;

type ToJSON<T> = {
[K in keyof T]: Encode<T[K]>;
};

interface GenericTriggerRequest<T = Parse.Object> {
  installationId?: string;
  master: boolean;
  user?: Parse.User;
  object: T;
  ip: string;
  headers: any;
  triggerName: string;
  log: any;
  original?: T;
  context: {
    [key: string]: object;
  };
}

interface BeforeFindRequest<T extends Parse.Object = Parse.Object> extends GenericTriggerRequest<T> {
  query: Parse.Query<T>;
}
interface AfterFindRequest<T = Parse.Object> extends GenericTriggerRequest<T> {
  objects: T[];
}
