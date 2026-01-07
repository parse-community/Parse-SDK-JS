import * as parse from './index';

// Augment Cloud module to include server-side types for parse/node
declare module './Cloud' {
  // Request types - alias to CloudServer definitions
  export type FunctionRequest<T = Record<string, any>> = import('./CloudServer').FunctionRequest<T>;
  export type TriggerRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').TriggerRequest<T>;
  export type BeforeSaveRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').BeforeSaveRequest<T>;
  export type AfterSaveRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').AfterSaveRequest<T>;
  export type BeforeDeleteRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').BeforeDeleteRequest<T>;
  export type AfterDeleteRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').AfterDeleteRequest<T>;
  export type BeforeFindRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').BeforeFindRequest<T>;
  export type AfterFindRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudServer').AfterFindRequest<T>;
  export type FileTriggerRequest = import('./CloudServer').FileTriggerRequest;
  export type ConnectTriggerRequest = import('./CloudServer').ConnectTriggerRequest;
  export type LiveQueryEventTrigger = import('./CloudServer').LiveQueryEventTrigger;
  export type JobRequest = import('./CloudServer').JobRequest;
  export type ValidatorField = import('./CloudServer').ValidatorField;
  export type ValidatorObject = import('./CloudServer').ValidatorObject;
  export type HTTPOptions = import('./CloudServer').HTTPOptions;
  export type HTTPResponse = import('./CloudServer').HTTPResponse;

  // Functions - reuse signatures from CloudServer
  export const define: typeof import('./CloudServer').define;
  export const job: typeof import('./CloudServer').job;
  export const beforeSave: typeof import('./CloudServer').beforeSave;
  export const afterSave: typeof import('./CloudServer').afterSave;
  export const beforeDelete: typeof import('./CloudServer').beforeDelete;
  export const afterDelete: typeof import('./CloudServer').afterDelete;
  export const beforeFind: typeof import('./CloudServer').beforeFind;
  export const afterFind: typeof import('./CloudServer').afterFind;
  export const beforeLogin: typeof import('./CloudServer').beforeLogin;
  export const afterLogin: typeof import('./CloudServer').afterLogin;
  export const afterLogout: typeof import('./CloudServer').afterLogout;
  export const beforeSaveFile: typeof import('./CloudServer').beforeSaveFile;
  export const afterSaveFile: typeof import('./CloudServer').afterSaveFile;
  export const beforeDeleteFile: typeof import('./CloudServer').beforeDeleteFile;
  export const afterDeleteFile: typeof import('./CloudServer').afterDeleteFile;
  export const beforeConnect: typeof import('./CloudServer').beforeConnect;
  export const beforeSubscribe: typeof import('./CloudServer').beforeSubscribe;
  export const afterLiveQueryEvent: typeof import('./CloudServer').afterLiveQueryEvent;
  export const httpRequest: typeof import('./CloudServer').httpRequest;
  export const sendEmail: typeof import('./CloudServer').sendEmail;
}

export = parse;
