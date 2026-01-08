import type ParseObject from './ParseObject';
import type ParseUser from './ParseUser';
import type ParseFile from './ParseFile';
import type ParseQuery from './ParseQuery';
export interface FunctionRequest<T = Record<string, any>> {
    installationId?: string;
    master: boolean;
    user?: ParseUser;
    params: T;
    ip: string;
    headers: Record<string, string>;
    log: any;
    functionName: string;
    context: Record<string, unknown>;
    config: any;
}
export interface FunctionResponse {
    success: (result?: any) => void;
    error: (message?: string) => void;
    status: (code: number) => FunctionResponse;
    header: (name: string, value: string) => FunctionResponse;
}
export interface TriggerRequest<T extends ParseObject = ParseObject> {
    installationId?: string;
    master: boolean;
    isChallenge: boolean;
    user?: ParseUser;
    object: T;
    original?: T;
    ip: string;
    headers: Record<string, string>;
    triggerName: string;
    log: any;
    context: Record<string, unknown>;
    config: any;
}
export type BeforeSaveRequest<T extends ParseObject = ParseObject> = TriggerRequest<T>;
export type AfterSaveRequest<T extends ParseObject = ParseObject> = TriggerRequest<T>;
export type BeforeDeleteRequest<T extends ParseObject = ParseObject> = TriggerRequest<T>;
export type AfterDeleteRequest<T extends ParseObject = ParseObject> = TriggerRequest<T>;
export interface BeforeFindRequest<T extends ParseObject = ParseObject> {
    installationId?: string;
    master: boolean;
    user?: ParseUser;
    query: ParseQuery<T>;
    ip: string;
    headers: Record<string, string>;
    triggerName: string;
    log: any;
    isGet: boolean;
    config: any;
    context: Record<string, unknown>;
    readPreference?: string;
    count?: boolean;
}
export interface AfterFindRequest<T extends ParseObject = ParseObject> {
    installationId?: string;
    master: boolean;
    user?: ParseUser;
    query: ParseQuery<T>;
    results: T[];
    ip: string;
    headers: Record<string, string>;
    triggerName: string;
    log: any;
    config: any;
    context: Record<string, unknown>;
}
export interface FileTriggerRequest {
    installationId?: string;
    master: boolean;
    user?: ParseUser;
    file: ParseFile;
    fileSize: number;
    contentLength: number;
    ip: string;
    headers: Record<string, string>;
    triggerName: string;
    log: any;
    config: any;
}
export interface ConnectTriggerRequest {
    installationId?: string;
    useMasterKey: boolean;
    user?: ParseUser;
    clients: number;
    subscriptions: number;
    sessionToken?: string;
}
export interface LiveQueryEventTrigger<T extends ParseObject = ParseObject> {
    installationId?: string;
    useMasterKey: boolean;
    user?: ParseUser;
    sessionToken?: string;
    event: string;
    object: T;
    original?: T;
    clients: number;
    subscriptions: number;
    sendEvent: boolean;
}
export interface JobRequest {
    params: Record<string, any>;
    message: (message: string) => void;
    config: any;
}
export interface ValidatorField {
    type?: any;
    constant?: boolean;
    default?: any;
    options?: any[] | (() => any[]) | any;
    required?: boolean;
    error?: string;
}
export interface ValidatorObject {
    requireUser?: boolean;
    requireMaster?: boolean;
    validateMasterKey?: boolean;
    skipWithMasterKey?: boolean;
    requireAnyUserRoles?: string[] | (() => string[]);
    requireAllUserRoles?: string[] | (() => string[]);
    requireUserKeys?: string[] | Record<string, ValidatorField>;
    fields?: string[] | Record<string, ValidatorField>;
    rateLimit?: {
        requestPath?: string;
        requestMethods?: string | string[];
        requestTimeWindow?: number;
        requestCount?: number;
        errorResponseMessage?: string;
        includeInternalRequests?: boolean;
        includeMasterKey?: boolean;
    };
}
export interface HTTPOptions {
    body?: string | object;
    error?: (response: HTTPResponse) => void;
    followRedirects?: boolean;
    headers?: Record<string, string>;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
    params?: string | Record<string, string>;
    success?: (response: HTTPResponse) => void;
    url: string;
}
export interface HTTPResponse {
    buffer?: Buffer;
    cookies?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    status: number;
    text?: string;
}
export declare enum ReadPreferenceOption {
    Primary = "PRIMARY",
    PrimaryPreferred = "PRIMARY_PREFERRED",
    Secondary = "SECONDARY",
    SecondaryPreferred = "SECONDARY_PREFERRED",
    Nearest = "NEAREST"
}
export declare function define<T extends Record<string, any> = Record<string, any>>(name: string, handler: (request: FunctionRequest<T>) => any, validator?: ValidatorObject | ((request: FunctionRequest<T>) => any)): void;
export declare function job(name: string, handler: (request: JobRequest) => any): void;
export declare function beforeSave<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: BeforeSaveRequest<T>) => T | undefined | Promise<T | undefined>, validator?: ValidatorObject | ((request: BeforeSaveRequest<T>) => any)): void;
export declare function afterSave<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: AfterSaveRequest<T>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: AfterSaveRequest<T>) => any)): void;
export declare function beforeDelete<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: BeforeDeleteRequest<T>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: BeforeDeleteRequest<T>) => any)): void;
export declare function afterDelete<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: AfterDeleteRequest<T>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: AfterDeleteRequest<T>) => any)): void;
export declare function beforeFind<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: BeforeFindRequest<T>) => ParseQuery<T> | undefined | Promise<ParseQuery<T> | undefined>, validator?: ValidatorObject | ((request: BeforeFindRequest<T>) => any)): void;
export declare function afterFind<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: AfterFindRequest<T>) => T[] | undefined | Promise<T[] | undefined>, validator?: ValidatorObject | ((request: AfterFindRequest<T>) => any)): void;
export declare function beforeLogin(handler: (request: TriggerRequest<ParseUser>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)): void;
export declare function afterLogin(handler: (request: TriggerRequest<ParseUser>) => Promise<void> | undefined): void;
export declare function afterLogout(handler: (request: TriggerRequest) => Promise<void> | undefined): void;
export declare function beforePasswordResetRequest(handler: (request: TriggerRequest<ParseUser>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)): void;
export declare function beforeSaveFile(handler: (request: FileTriggerRequest) => ParseFile | undefined | Promise<ParseFile | undefined>): void;
export declare function afterSaveFile(handler: (request: FileTriggerRequest) => Promise<void> | undefined): void;
export declare function beforeDeleteFile(handler: (request: FileTriggerRequest) => Promise<void> | undefined): void;
export declare function afterDeleteFile(handler: (request: FileTriggerRequest) => Promise<void> | undefined): void;
export declare function beforeConnect(handler: (request: ConnectTriggerRequest) => Promise<void> | undefined, validator?: ValidatorObject | ((request: ConnectTriggerRequest) => any)): void;
export declare function beforeSubscribe<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: TriggerRequest<T>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<T>) => any)): void;
export declare function afterLiveQueryEvent<T extends ParseObject = ParseObject>(className: string | (new () => T), handler: (request: LiveQueryEventTrigger<T>) => Promise<void> | undefined, validator?: ValidatorObject | ((request: LiveQueryEventTrigger<T>) => any)): void;
export declare function sendEmail(data: {
    from?: string;
    to: string;
    subject?: string;
    text?: string;
    html?: string;
}): Promise<void>;
export declare function httpRequest(options: HTTPOptions): Promise<HTTPResponse>;
/**
 * Defines a Cloud Function.
 *
 * **Available in Cloud Code only.**
 *
 * @function define
 * @name Parse.Cloud.define
 * @param {string} name The name of the Cloud Function
 * @param {Function} data The Cloud Function to register. This function should take one parameter {@link Parse.Cloud.FunctionRequest}
 */
/**
 * Registers an after delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.afterDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.afterDelete(Parse.User, (request) => {
 *   // code here
 * })
 *```
 *
 * @function afterDelete
 * @name Parse.Cloud.afterDelete
 * @param {(string | Parse.Object)} arg1 The Parse.Object subclass to register the after delete function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run after a delete. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
 */
/**
 *
 * Registers an after save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.afterSave('MyCustomClass', function(request) {
 *   // code here
 * })
 *
 * Parse.Cloud.afterSave(Parse.User, function(request) {
 *   // code here
 * })
 * ```
 *
 * @function afterSave
 * @name Parse.Cloud.afterSave
 * @param {(string | Parse.Object)} arg1 The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run after a save. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
 */
/**
 * Registers an before delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 * ```
 * Parse.Cloud.beforeDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeDelete(Parse.User, (request) => {
 *   // code here
 * })
 *```
 *
 * @function beforeDelete
 * @name Parse.Cloud.beforeDelete
 * @param {(string | Parse.Object)} arg1 The Parse.Object subclass to register the before delete function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run before a delete. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
 */
/**
 *
 * Registers an before save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}), you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.beforeSave('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeSave(Parse.User, (request) => {
 *   // code here
 * })
 * ```
 *
 * @function beforeSave
 * @name Parse.Cloud.beforeSave
 * @param {(string | Parse.Object)} arg1 The Parse.Object subclass to register the after save function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run before a save. This function should take just one parameter, {@link Parse.Cloud.TriggerRequest}.
 */
/**
 *
 * Registers an before save file function. A new Parse.File can be returned to override the file that gets saved.
 * If you want to replace the rquesting Parse.File with a Parse.File that is already saved, simply return the already saved Parse.File.
 * You can also add metadata to the file that will be stored via whatever file storage solution you're using.
 *
 * **Available in Cloud Code only.**
 *
 * Example: Adding metadata and tags
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   file.addMetadata('foo', 'bar');
 *   file.addTag('createdBy', user.id);
 * });
 *
 * ```
 *
 * Example: replacing file with an already saved file
 *
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   return user.get('avatar');
 * });
 *
 * ```
 *
 * Example: replacing file with a different file
 *
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   const metadata = { foo: 'bar' };
 *   const tags = { createdBy: user.id };
 *   const newFile = new Parse.File(file.name(), <some other file data>, 'text/plain', metadata, tags);
 *   return newFile;
 * });
 *
 * ```
 *
 * @function beforeSaveFile
 * @name Parse.Cloud.beforeSaveFile
 * @param {Function} func The function to run before a file saves. This function should take one parameter, a {@link Parse.Cloud.FileTriggerRequest}.
 */
/**
 *
 * Registers an after save file function.
 *
 * **Available in Cloud Code only.**
 *
 * Example: creating a new object that references this file in a separate collection
 * ```
 * Parse.Cloud.afterSaveFile(async ({ file, user }) => {
 *   const fileObject = new Parse.Object('FileObject');
 *   fileObject.set('metadata', file.metadata());
 *   fileObject.set('tags', file.tags());
 *   fileObject.set('name', file.name());
 *   fileObject.set('createdBy', user);
 *   await fileObject.save({ sessionToken: user.getSessionToken() });
 * });
 *
 * @method afterSaveFile
 * @name Parse.Cloud.afterSaveFile
 * @param {Function} func The function to run after a file saves. This function should take one parameter, a {@link Parse.Cloud.FileTriggerRequest}.
 */
/**
 * @function beforeConnect
 * @name Parse.Cloud.beforeConnect
 * @param {Function} func The function to before connection is made. This function can be async and should take just one parameter, {@link Parse.Cloud.ConnectTriggerRequest}.
 */
/**
 *
 * Registers a before connect function.
 *
 * **Available in Cloud Code only.**
 *
 * Example: restrict LiveQueries to logged in users.
 * ```
 * Parse.Cloud.beforeConnect((request) => {
 *   if (!request.user) {
 *     throw "Please login before you attempt to connect."
 *   }
 * });
 * ```
 */
/**
 * @function beforeSubscribe
 * @name Parse.Cloud.beforeSubscribe
 * @param {(string | Parse.Object)} arg1 The Parse.Object subclass to register the before subscription function for. This can instead be a String that is the className of the subclass.
 * @param {Function} func The function to run before a subscription. This function can be async and should take one parameter, a {@link Parse.Cloud.TriggerRequest}.
 */
/**
 *
 * Registers a before subscribe function.
 *
 * **Available in Cloud Code only.**
 * Example: restrict subscriptions to MyObject to Admin accounts only.
 * ```
 *  Parse.Cloud.beforeSubscribe('MyObject', (request) => {
 *   if (!request.user.get('Admin')) {
 *       throw new Parse.Error(101, 'You are not authorized to subscribe to MyObject.');
 *   }
 *   let query = request.query; // the Parse.Query
 *   query.select("name","year")
 * });
 * ```
 */
/**
 * Makes an HTTP Request.
 *
 * **Available in Cloud Code only.**
 *
 * By default, Parse.Cloud.httpRequest does not follow redirects caused by HTTP 3xx response codes. You can use the followRedirects option in the {@link Parse.Cloud.HTTPOptions} object to change this behavior.
 *
 * Sample request:
 * ```
 * Parse.Cloud.httpRequest({
 *   url: 'http://www.example.com/'
 * }).then(function(httpResponse) {
 *   // success
 *   console.log(httpResponse.text);
 * },function(httpResponse) {
 *   // error
 *   console.error('Request failed with response code ' + httpResponse.status);
 * });
 * ```
 *
 * @function httpRequest
 * @name Parse.Cloud.httpRequest
 * @param {Parse.Cloud.HTTPOptions} options The Parse.Cloud.HTTPOptions object that makes the request.
 * @returns {Promise<Parse.Cloud.HTTPResponse>} A promise that will be resolved with a {@link Parse.Cloud.HTTPResponse} object when the request completes.
 */
/**
 * Defines a Background Job.
 *
 * **Available in Cloud Code only.**
 *
 * @function job
 * @name Parse.Cloud.job
 * @param {string} name The name of the Background Job
 * @param {Function} func The Background Job to register. This function should take two parameters a {@link Parse.Cloud.JobRequest} and a {@link Parse.Cloud.JobStatus}
 */
/**
 * @typedef Parse.Cloud.TriggerRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.Object} object The object triggering the hook.
 * @property {string} ip The IP address of the client making the request.
 * @property {object} headers The original HTTP headers for the request.
 * @property {string} triggerName The name of the trigger (`beforeSave`, `afterSave`, ...)
 * @property {object} log The current logger inside Parse Server.
 * @property {Parse.Object} original If set, the object, as currently stored.
 */
/**
 * @typedef Parse.Cloud.FileTriggerRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {Parse.File} file The file triggering the hook.
 * @property {string} ip The IP address of the client making the request.
 * @property {object} headers The original HTTP headers for the request.
 * @property {string} triggerName The name of the trigger (`beforeSaveFile`, `afterSaveFile`, ...)
 * @property {object} log The current logger inside Parse Server.
 */
/**
 * @typedef Parse.Cloud.ConnectTriggerRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} useMasterKey If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {number} clients The number of clients connected.
 * @property {number} subscriptions The number of subscriptions connected.
 * @property {string} sessionToken If set, the session of the user that made the request.
 */
/**
 * @typedef Parse.Cloud.FunctionRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {object} params The params passed to the cloud function.
 */
/**
 * @typedef Parse.Cloud.JobRequest
 * @property {object} params The params passed to the background job.
 */
/**
 * @typedef Parse.Cloud.JobStatus
 * @property {Function} error If error is called, will end the job unsuccessfully with an optional completion message to be stored in the job status.
 * @property {Function} message If message is called with a string argument, will update the current message to be stored in the job status.
 * @property {Function} success If success is called, will end the job successfullly with the optional completion message to be stored in the job status.
 */
/**
 * @typedef Parse.Cloud.HTTPOptions
 * @property {string | object} body The body of the request. If it is a JSON object, then the Content-Type set in the headers must be application/x-www-form-urlencoded or application/json. You can also set this to a {@link Buffer} object to send raw bytes. If you use a Buffer, you should also set the Content-Type header explicitly to describe what these bytes represent.
 * @property {Function} error The function that is called when the request fails. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {boolean} followRedirects Whether to follow redirects caused by HTTP 3xx responses. Defaults to false.
 * @property {object} headers The headers for the request.
 * @property {string} method The method of the request. GET, POST, PUT, DELETE, HEAD, and OPTIONS are supported. Will default to GET if not specified.
 * @property {string | object} params The query portion of the url. You can pass a JSON object of key value pairs like params: {q : 'Sean Plott'} or a raw string like params:q=Sean Plott.
 * @property {Function} success The function that is called when the request successfully completes. It will be passed a Parse.Cloud.HTTPResponse object.
 * @property {string} url The url to send the request to.
 */
/**
 * @typedef Parse.Cloud.HTTPResponse
 * @property {Buffer} buffer The raw byte representation of the response body. Use this to receive binary data. See Buffer for more details.
 * @property {object} cookies The cookies sent by the server. The keys in this object are the names of the cookies. The values are Parse.Cloud.Cookie objects.
 * @property {object} data The parsed response body as a JavaScript object. This is only available when the response Content-Type is application/x-www-form-urlencoded or application/json.
 * @property {object} headers The headers sent by the server. The keys in this object are the names of the headers. We do not support multiple response headers with the same name. In the common case of Set-Cookie headers, please use the cookies field instead.
 * @property {number} status The status code.
 * @property {string} text The raw text representation of the response body.
 */
