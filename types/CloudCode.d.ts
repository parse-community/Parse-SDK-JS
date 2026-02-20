import type ParseObject from './ParseObject';
import type ParseUser from './ParseUser';
import type ParseFile from './ParseFile';
import type ParseQuery from './ParseQuery';
type ParseObjectConstructor<T extends ParseObject = ParseObject> = new (...args: any[]) => T;
/**
 * @typedef Parse.Cloud.FunctionRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} master If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {object} params The params passed to the cloud function.
 */
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
/**
 * @typedef Parse.Cloud.ConnectTriggerRequest
 * @property {string} installationId If set, the installationId triggering the request.
 * @property {boolean} useMasterKey If true, means the master key was used.
 * @property {Parse.User} user If set, the user that made the request.
 * @property {number} clients The number of clients connected.
 * @property {number} subscriptions The number of subscriptions connected.
 * @property {string} sessionToken If set, the session of the user that made the request.
 */
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
/**
 * @typedef Parse.Cloud.JobRequest
 * @property {object} params The params passed to the background job.
 * @property {Function} message If message is called with a string argument, will update the current message to be stored in the job status.
 */
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
/**
 * @typedef Parse.Cloud.HTTPOptions
 * @property {string | object} body The body of the request.
 * @property {boolean} followRedirects Whether to follow redirects caused by HTTP 3xx responses. Defaults to false.
 * @property {object} headers The headers for the request.
 * @property {string} method The method of the request. GET, POST, PUT, DELETE, HEAD, and OPTIONS are supported.
 * @property {string | object} params The query portion of the url.
 * @property {string} url The url to send the request to.
 */
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
/**
 * @typedef Parse.Cloud.HTTPResponse
 * @property {Buffer} buffer The raw byte representation of the response body.
 * @property {object} cookies The cookies sent by the server.
 * @property {object} data The parsed response body as a JavaScript object.
 * @property {object} headers The headers sent by the server.
 * @property {number} status The status code.
 * @property {string} text The raw text representation of the response body.
 */
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
/**
 * Defines a Cloud Function.
 *
 * **Available in Cloud Code only.**
 *
 * @param name The name of the Cloud Function
 * @param handler The Cloud Function to register. This function should take one parameter {@link FunctionRequest}
 * @param validator An optional function to validate the request
 */
export declare function define<T extends Record<string, any> = Record<string, any>>(name: string, handler: (request: FunctionRequest<T>) => any, validator?: ValidatorObject | ((request: FunctionRequest<T>) => any)): void;
/**
 * Defines a Background Job.
 *
 * **Available in Cloud Code only.**
 *
 * @param name The name of the Background Job
 * @param handler The Background Job to register. This function should take one parameter {@link JobRequest}
 */
export declare function job(name: string, handler: (request: JobRequest) => any): void;
/**
 * Registers a before save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}),
 * you should pass the class itself and not the String for arg1.
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
 * @param className The Parse.Object subclass to register the before save function for.
 * @param handler The function to run before a save.
 * @param validator An optional function to validate the request
 */
export declare function beforeSave<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: BeforeSaveRequest<T>) => void | T | undefined | Promise<void | T | undefined>, validator?: ValidatorObject | ((request: BeforeSaveRequest<T>) => any)): void;
/**
 * Registers an after save function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterSave for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}),
 * you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.afterSave('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.afterSave(Parse.User, (request) => {
 *   // code here
 * })
 * ```
 *
 * @param className The Parse.Object subclass to register the after save function for.
 * @param handler The function to run after a save.
 * @param validator An optional function to validate the request
 */
export declare function afterSave<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: AfterSaveRequest<T>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: AfterSaveRequest<T>) => any)): void;
/**
 * Registers a before delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use beforeDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}),
 * you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.beforeDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.beforeDelete(Parse.User, (request) => {
 *   // code here
 * })
 * ```
 *
 * @param className The Parse.Object subclass to register the before delete function for.
 * @param handler The function to run before a delete.
 * @param validator An optional function to validate the request
 */
export declare function beforeDelete<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: BeforeDeleteRequest<T>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: BeforeDeleteRequest<T>) => any)): void;
/**
 * Registers an after delete function.
 *
 * **Available in Cloud Code only.**
 *
 * If you want to use afterDelete for a predefined class in the Parse JavaScript SDK (e.g. {@link Parse.User}),
 * you should pass the class itself and not the String for arg1.
 *
 * ```
 * Parse.Cloud.afterDelete('MyCustomClass', (request) => {
 *   // code here
 * })
 *
 * Parse.Cloud.afterDelete(Parse.User, (request) => {
 *   // code here
 * })
 * ```
 *
 * @param className The Parse.Object subclass to register the after delete function for.
 * @param handler The function to run after a delete.
 * @param validator An optional function to validate the request
 */
export declare function afterDelete<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: AfterDeleteRequest<T>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: AfterDeleteRequest<T>) => any)): void;
/**
 * Registers a before find function.
 *
 * **Available in Cloud Code only.**
 *
 * @param className The Parse.Object subclass to register the before find function for.
 * @param handler The function to run before a find.
 * @param validator An optional function to validate the request
 */
export declare function beforeFind<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: BeforeFindRequest<T>) => void | ParseQuery<T> | undefined | Promise<void | ParseQuery<T> | undefined>, validator?: ValidatorObject | ((request: BeforeFindRequest<T>) => any)): void;
/**
 * Registers an after find function.
 *
 * **Available in Cloud Code only.**
 *
 * @param className The Parse.Object subclass to register the after find function for.
 * @param handler The function to run after a find.
 * @param validator An optional function to validate the request
 */
export declare function afterFind<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: AfterFindRequest<T>) => void | T[] | undefined | Promise<void | T[] | undefined>, validator?: ValidatorObject | ((request: AfterFindRequest<T>) => any)): void;
/**
 * Registers a before login function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run before a login.
 * @param validator An optional function to validate the request
 */
export declare function beforeLogin(handler: (request: TriggerRequest<ParseUser>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)): void;
/**
 * Registers an after login function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run after a login.
 */
export declare function afterLogin(handler: (request: TriggerRequest<ParseUser>) => void | Promise<void> | undefined): void;
/**
 * Registers an after logout function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run after a logout.
 */
export declare function afterLogout(handler: (request: TriggerRequest) => void | Promise<void> | undefined): void;
/**
 * Registers a before password reset request function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run before a password reset request.
 * @param validator An optional function to validate the request
 */
export declare function beforePasswordResetRequest(handler: (request: TriggerRequest<ParseUser>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)): void;
/**
 * Registers a before save file function.
 *
 * **Available in Cloud Code only.**
 *
 * A new Parse.File can be returned to override the file that gets saved.
 *
 * ```
 * Parse.Cloud.beforeSaveFile(({ file, user }) => {
 *   file.addMetadata('foo', 'bar');
 *   file.addTag('createdBy', user.id);
 * });
 * ```
 *
 * @param handler The function to run before a file saves.
 */
export declare function beforeSaveFile(handler: (request: FileTriggerRequest) => void | ParseFile | undefined | Promise<void | ParseFile | undefined>): void;
/**
 * Registers an after save file function.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.afterSaveFile(async ({ file, user }) => {
 *   const fileObject = new Parse.Object('FileObject');
 *   fileObject.set('name', file.name());
 *   fileObject.set('createdBy', user);
 *   await fileObject.save({ sessionToken: user.getSessionToken() });
 * });
 * ```
 *
 * @param handler The function to run after a file saves.
 */
export declare function afterSaveFile(handler: (request: FileTriggerRequest) => void | Promise<void> | undefined): void;
/**
 * Registers a before delete file function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run before a file is deleted.
 */
export declare function beforeDeleteFile(handler: (request: FileTriggerRequest) => void | Promise<void> | undefined): void;
/**
 * Registers an after delete file function.
 *
 * **Available in Cloud Code only.**
 *
 * @param handler The function to run after a file is deleted.
 */
export declare function afterDeleteFile(handler: (request: FileTriggerRequest) => void | Promise<void> | undefined): void;
/**
 * Registers a before connect function for LiveQuery.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.beforeConnect((request) => {
 *   if (!request.user) {
 *     throw "Please login before you attempt to connect."
 *   }
 * });
 * ```
 *
 * @param handler The function to run before a LiveQuery connection is made.
 * @param validator An optional function to validate the request
 */
export declare function beforeConnect(handler: (request: ConnectTriggerRequest) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: ConnectTriggerRequest) => any)): void;
/**
 * Registers a before subscribe function for LiveQuery.
 *
 * **Available in Cloud Code only.**
 *
 * ```
 * Parse.Cloud.beforeSubscribe('MyObject', (request) => {
 *   if (!request.user.get('Admin')) {
 *     throw new Parse.Error(101, 'You are not authorized to subscribe to MyObject.');
 *   }
 *   let query = request.query;
 *   query.select("name", "year");
 * });
 * ```
 *
 * @param className The Parse.Object subclass to register the before subscribe function for.
 * @param handler The function to run before a subscription.
 * @param validator An optional function to validate the request
 */
export declare function beforeSubscribe<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: TriggerRequest<T>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: TriggerRequest<T>) => any)): void;
/**
 * Registers an after live query event function.
 *
 * **Available in Cloud Code only.**
 *
 * @param className The Parse.Object subclass to register the after live query event function for.
 * @param handler The function to run after a live query event.
 * @param validator An optional function to validate the request
 */
export declare function afterLiveQueryEvent<T extends ParseObject = ParseObject>(className: string | ParseObjectConstructor<T>, handler: (request: LiveQueryEventTrigger<T>) => void | Promise<void> | undefined, validator?: ValidatorObject | ((request: LiveQueryEventTrigger<T>) => any)): void;
/**
 * Sends an email.
 *
 * **Available in Cloud Code only.**
 *
 * @param data The email data.
 * @param data.from The sender email address.
 * @param data.to The recipient email address.
 * @param data.subject The email subject.
 * @param data.text The plain text content.
 * @param data.html The HTML content.
 */
export declare function sendEmail(data: {
    from?: string;
    to: string;
    subject?: string;
    text?: string;
    html?: string;
}): Promise<void>;
/**
 * Makes an HTTP Request.
 *
 * **Available in Cloud Code only.**
 *
 * By default, Parse.Cloud.httpRequest does not follow redirects caused by HTTP 3xx response codes.
 * You can use the followRedirects option in the {@link HTTPOptions} object to change this behavior.
 *
 * ```
 * Parse.Cloud.httpRequest({
 *   url: 'http://www.example.com/'
 * }).then(function(httpResponse) {
 *   console.log(httpResponse.text);
 * }, function(httpResponse) {
 *   console.error('Request failed with response code ' + httpResponse.status);
 * });
 * ```
 *
 * @param options The HTTPOptions object that makes the request.
 * @returns A promise that will be resolved with a {@link HTTPResponse} object when the request completes.
 */
export declare function httpRequest(options: HTTPOptions): Promise<HTTPResponse>;
export {};
