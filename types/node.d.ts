import * as parse from './index';

// Augment Parse interface for Node.js builds
// In Node.js, Parse.initialize is reassigned to Parse._initialize at runtime,
// which accepts masterKey and maintenanceKey parameters
declare module './Parse' {
  interface Parse {
    /**
     * Call this method first to set up your authentication tokens for Parse.
     *
     * @param {string} applicationId Your Parse Application ID.
     * @param {string} [javaScriptKey] Your Parse JavaScript Key (Not needed for parse-server)
     * @param {string} [masterKey] Your Parse Master Key.
     * @param {string} [maintenanceKey] Your Parse Maintenance Key.
     * @static
     */
    initialize(
      applicationId: string,
      javaScriptKey?: string,
      masterKey?: string,
      maintenanceKey?: string
    ): void;
  }
}

// Augment Cloud module to include server-side types for parse/node
declare module './Cloud' {
  // Request types - alias to CloudCode definitions
  export type FunctionRequest<T = Record<string, any>> = import('./CloudCode').FunctionRequest<T>;
  export type FunctionResponse = import('./CloudCode').FunctionResponse;
  export type TriggerRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').TriggerRequest<T>;
  export type BeforeSaveRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').BeforeSaveRequest<T>;
  export type AfterSaveRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').AfterSaveRequest<T>;
  export type BeforeDeleteRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').BeforeDeleteRequest<T>;
  export type AfterDeleteRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').AfterDeleteRequest<T>;
  export type BeforeFindRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').BeforeFindRequest<T>;
  export type AfterFindRequest<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').AfterFindRequest<T>;
  export type FileTriggerRequest = import('./CloudCode').FileTriggerRequest;
  export type ConnectTriggerRequest = import('./CloudCode').ConnectTriggerRequest;
  export type LiveQueryEventTrigger<T extends import('./ParseObject').default = import('./ParseObject').default> = import('./CloudCode').LiveQueryEventTrigger<T>;
  export type JobRequest = import('./CloudCode').JobRequest;
  export type ValidatorField = import('./CloudCode').ValidatorField;
  export type ValidatorObject = import('./CloudCode').ValidatorObject;
  export type HTTPOptions = import('./CloudCode').HTTPOptions;
  export type HTTPResponse = import('./CloudCode').HTTPResponse;
  export const ReadPreferenceOption: typeof import('./CloudCode').ReadPreferenceOption;

  // Functions - reuse signatures from CloudCode
  export const define: typeof import('./CloudCode').define;
  export const job: typeof import('./CloudCode').job;
  export const beforeSave: typeof import('./CloudCode').beforeSave;
  export const afterSave: typeof import('./CloudCode').afterSave;
  export const beforeDelete: typeof import('./CloudCode').beforeDelete;
  export const afterDelete: typeof import('./CloudCode').afterDelete;
  export const beforeFind: typeof import('./CloudCode').beforeFind;
  export const afterFind: typeof import('./CloudCode').afterFind;
  export const beforeLogin: typeof import('./CloudCode').beforeLogin;
  export const afterLogin: typeof import('./CloudCode').afterLogin;
  export const afterLogout: typeof import('./CloudCode').afterLogout;
  export const beforePasswordResetRequest: typeof import('./CloudCode').beforePasswordResetRequest;
  export const beforeSaveFile: typeof import('./CloudCode').beforeSaveFile;
  export const afterSaveFile: typeof import('./CloudCode').afterSaveFile;
  export const beforeDeleteFile: typeof import('./CloudCode').beforeDeleteFile;
  export const afterDeleteFile: typeof import('./CloudCode').afterDeleteFile;
  export const beforeConnect: typeof import('./CloudCode').beforeConnect;
  export const beforeSubscribe: typeof import('./CloudCode').beforeSubscribe;
  export const afterLiveQueryEvent: typeof import('./CloudCode').afterLiveQueryEvent;
  export const httpRequest: typeof import('./CloudCode').httpRequest;
  export const sendEmail: typeof import('./CloudCode').sendEmail;
}

export = parse;
