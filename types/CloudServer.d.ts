/**
 * Server-side Cloud Code types for Parse Server.
 * These types are only available when using `parse/node` import.
 *
 * @module CloudServer
 */

import ParseObject from './ParseObject';
import ParseUser from './ParseUser';
import ParseFile from './ParseFile';
import ParseQuery from './ParseQuery';

// ============================================================================
// Request Interfaces
// ============================================================================

/**
 * Request object for Cloud Functions defined with `Parse.Cloud.define`.
 */
export interface FunctionRequest<T = Record<string, any>> {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  master: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The params passed to the cloud function.
   */
  params: T;
  /**
   * The IP address of the client making the request.
   */
  ip: string;
  /**
   * The original HTTP headers for the request.
   */
  headers: Record<string, string>;
  /**
   * The current logger inside Parse Server.
   */
  log: any;
  /**
   * The name of the Cloud function.
   */
  functionName: string;
  /**
   * A dictionary that is accessible in triggers.
   */
  context: Record<string, unknown>;
  /**
   * The Parse Server config.
   */
  config: any;
}

/**
 * Response object for Express-style Cloud Functions.
 */
export interface FunctionResponse {
  /**
   * Send a success response with optional result data.
   */
  success: (result?: any) => void;
  /**
   * Send an error response with optional message.
   */
  error: (message?: string) => void;
  /**
   * Set the HTTP status code for the response.
   */
  status: (code: number) => FunctionResponse;
  /**
   * Set a header on the response.
   */
  header: (name: string, value: string) => FunctionResponse;
}

/**
 * Base request object for trigger hooks (beforeSave, afterSave, etc.).
 */
export interface TriggerRequest<T extends ParseObject = ParseObject> {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  master: boolean;
  /**
   * If true, means the trigger is being invoked as a challenge.
   */
  isChallenge: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The object triggering the hook.
   */
  object: T;
  /**
   * If set, the object as currently stored (for updates).
   */
  original?: T;
  /**
   * The IP address of the client making the request.
   */
  ip: string;
  /**
   * The original HTTP headers for the request.
   */
  headers: Record<string, string>;
  /**
   * The name of the trigger (e.g., "beforeSave", "afterSave").
   */
  triggerName: string;
  /**
   * The current logger inside Parse Server.
   */
  log: any;
  /**
   * A dictionary that is accessible in triggers.
   */
  context: Record<string, unknown>;
  /**
   * The Parse Server config.
   */
  config: any;
}

/**
 * Request object for beforeSave triggers.
 */
export interface BeforeSaveRequest<T extends ParseObject = ParseObject> extends TriggerRequest<T> {}

/**
 * Request object for afterSave triggers.
 */
export interface AfterSaveRequest<T extends ParseObject = ParseObject> extends TriggerRequest<T> {}

/**
 * Request object for beforeDelete triggers.
 */
export interface BeforeDeleteRequest<T extends ParseObject = ParseObject> extends TriggerRequest<T> {}

/**
 * Request object for afterDelete triggers.
 */
export interface AfterDeleteRequest<T extends ParseObject = ParseObject> extends TriggerRequest<T> {}

/**
 * Request object for beforeFind triggers.
 */
export interface BeforeFindRequest<T extends ParseObject = ParseObject> {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  master: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The query being executed.
   */
  query: ParseQuery<T>;
  /**
   * The IP address of the client making the request.
   */
  ip: string;
  /**
   * The original HTTP headers for the request.
   */
  headers: Record<string, string>;
  /**
   * The name of the trigger.
   */
  triggerName: string;
  /**
   * The current logger inside Parse Server.
   */
  log: any;
  /**
   * If true, the query is a get operation.
   */
  isGet: boolean;
  /**
   * The Parse Server config.
   */
  config: any;
  /**
   * A dictionary that is accessible in triggers.
   */
  context: Record<string, unknown>;
  /**
   * If set, the read preference for the query.
   */
  readPreference?: string;
  /**
   * If true, the query is a count operation.
   */
  count?: boolean;
}

/**
 * Request object for afterFind triggers.
 */
export interface AfterFindRequest<T extends ParseObject = ParseObject> {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  master: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The query that was executed.
   */
  query: ParseQuery<T>;
  /**
   * The results returned by the query.
   */
  results: T[];
  /**
   * The IP address of the client making the request.
   */
  ip: string;
  /**
   * The original HTTP headers for the request.
   */
  headers: Record<string, string>;
  /**
   * The name of the trigger.
   */
  triggerName: string;
  /**
   * The current logger inside Parse Server.
   */
  log: any;
  /**
   * The Parse Server config.
   */
  config: any;
  /**
   * A dictionary that is accessible in triggers.
   */
  context: Record<string, unknown>;
}

/**
 * Request object for file triggers (beforeSaveFile, afterSaveFile, etc.).
 */
export interface FileTriggerRequest {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  master: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The file being saved or deleted.
   */
  file: ParseFile;
  /**
   * The size of the file in bytes.
   */
  fileSize: number;
  /**
   * The content length of the request.
   */
  contentLength: number;
  /**
   * The IP address of the client making the request.
   */
  ip: string;
  /**
   * The original HTTP headers for the request.
   */
  headers: Record<string, string>;
  /**
   * The name of the trigger.
   */
  triggerName: string;
  /**
   * The current logger inside Parse Server.
   */
  log: any;
  /**
   * The Parse Server config.
   */
  config: any;
}

/**
 * Request object for beforeConnect LiveQuery trigger.
 */
export interface ConnectTriggerRequest {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  useMasterKey: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The number of connected clients.
   */
  clients: number;
  /**
   * The number of active subscriptions.
   */
  subscriptions: number;
  /**
   * The session token if available.
   */
  sessionToken?: string;
}

/**
 * Request object for afterLiveQueryEvent trigger.
 */
export interface LiveQueryEventTrigger<T extends ParseObject = ParseObject> {
  /**
   * If set, the installationId triggering the request.
   */
  installationId?: string;
  /**
   * If true, means the master key was used.
   */
  useMasterKey: boolean;
  /**
   * If set, the user that made the request.
   */
  user?: ParseUser;
  /**
   * The session token if available.
   */
  sessionToken?: string;
  /**
   * The event type (create, update, delete, enter, leave).
   */
  event: string;
  /**
   * The object that triggered the event.
   */
  object: T;
  /**
   * The original object before modification (for updates).
   */
  original?: T;
  /**
   * The number of connected clients.
   */
  clients: number;
  /**
   * The number of active subscriptions.
   */
  subscriptions: number;
  /**
   * If false, the event will not be sent to clients.
   */
  sendEvent: boolean;
}

/**
 * Request object for background jobs defined with `Parse.Cloud.job`.
 */
export interface JobRequest {
  /**
   * The params passed to the background job.
   */
  params: Record<string, any>;
  /**
   * A function to update the status message of the job.
   */
  message: (message: string) => void;
  /**
   * The Parse Server config.
   */
  config: any;
}

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Configuration for a single field in the validator.
 */
export interface ValidatorField {
  /**
   * The expected type of the field.
   */
  type?: any;
  /**
   * If true, the field cannot be modified after creation.
   */
  constant?: boolean;
  /**
   * Default value for the field.
   */
  default?: any;
  /**
   * Valid options for the field value.
   */
  options?: any[] | (() => any[]) | any;
  /**
   * If true, the field is required.
   */
  required?: boolean;
  /**
   * Custom error message for validation failure.
   */
  error?: string;
}

/**
 * Validator configuration for Cloud Functions and triggers.
 */
export interface ValidatorObject {
  /**
   * If true, requires a user to be logged in.
   */
  requireUser?: boolean;
  /**
   * If true, requires the master key.
   */
  requireMaster?: boolean;
  /**
   * If true, validates the master key.
   */
  validateMasterKey?: boolean;
  /**
   * If true, skips validation when master key is used.
   */
  skipWithMasterKey?: boolean;
  /**
   * Requires the user to have any of these roles.
   */
  requireAnyUserRoles?: string[] | (() => string[]);
  /**
   * Requires the user to have all of these roles.
   */
  requireAllUserRoles?: string[] | (() => string[]);
  /**
   * Required keys on the user object.
   */
  requireUserKeys?: string[] | Record<string, ValidatorField>;
  /**
   * Field validation configuration.
   */
  fields?: string[] | Record<string, ValidatorField>;
  /**
   * Rate limiting configuration.
   */
  rateLimit?: {
    /**
     * The path to apply rate limiting to.
     */
    requestPath?: string;
    /**
     * HTTP methods to rate limit.
     */
    requestMethods?: string | string[];
    /**
     * Time window in milliseconds.
     */
    requestTimeWindow?: number;
    /**
     * Maximum number of requests in the time window.
     */
    requestCount?: number;
    /**
     * Custom error message when rate limit is exceeded.
     */
    errorResponseMessage?: string;
    /**
     * If true, includes internal requests in rate limiting.
     */
    includeInternalRequests?: boolean;
    /**
     * If true, includes master key requests in rate limiting.
     */
    includeMasterKey?: boolean;
  };
}

// ============================================================================
// HTTP Request Types
// ============================================================================

/**
 * Options for `Parse.Cloud.httpRequest`.
 */
export interface HTTPOptions {
  /**
   * The body of the request.
   */
  body?: string | object;
  /**
   * Callback for error responses.
   */
  error?: (response: HTTPResponse) => void;
  /**
   * If true, follows HTTP redirects.
   */
  followRedirects?: boolean;
  /**
   * HTTP headers for the request.
   */
  headers?: Record<string, string>;
  /**
   * HTTP method for the request.
   */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';
  /**
   * Query parameters for the request.
   */
  params?: string | Record<string, string>;
  /**
   * Callback for success responses.
   */
  success?: (response: HTTPResponse) => void;
  /**
   * The URL to send the request to.
   */
  url: string;
}

/**
 * Response from `Parse.Cloud.httpRequest`.
 */
export interface HTTPResponse {
  /**
   * The raw response buffer.
   */
  buffer?: Buffer;
  /**
   * Cookies from the response.
   */
  cookies?: Record<string, any>;
  /**
   * The parsed response data.
   */
  data?: any;
  /**
   * HTTP headers from the response.
   */
  headers?: Record<string, string>;
  /**
   * HTTP status code.
   */
  status: number;
  /**
   * The raw response text.
   */
  text?: string;
}

// ============================================================================
// Read Preference Enum
// ============================================================================

/**
 * Read preference options for MongoDB queries.
 */
export enum ReadPreferenceOption {
  Primary = 'PRIMARY',
  PrimaryPreferred = 'PRIMARY_PREFERRED',
  Secondary = 'SECONDARY',
  SecondaryPreferred = 'SECONDARY_PREFERRED',
  Nearest = 'NEAREST',
}

// ============================================================================
// Cloud Function Declarations
// ============================================================================

/**
 * Defines a Cloud Function.
 *
 * @example
 * ```typescript
 * Parse.Cloud.define('hello', (request) => {
 *   return `Hello, ${request.params.name}!`;
 * });
 * ```
 *
 * @param name - The name of the Cloud Function.
 * @param handler - The function to execute.
 * @param validator - Optional validator configuration.
 */
export function define<T extends Record<string, any> = Record<string, any>>(
  name: string,
  handler: (request: FunctionRequest<T>) => any,
  validator?: ValidatorObject | ((request: FunctionRequest<T>) => any)
): void;

/**
 * Defines a Cloud Function with Express-style response object.
 *
 * @param name - The name of the Cloud Function.
 * @param handler - The function to execute with request and response objects.
 * @param validator - Optional validator configuration.
 */
export function define<T extends Record<string, any> = Record<string, any>>(
  name: string,
  handler: (request: FunctionRequest<T>, response: FunctionResponse) => any,
  validator?: ValidatorObject | ((request: FunctionRequest<T>) => any)
): void;

/**
 * Defines a background job.
 *
 * @example
 * ```typescript
 * Parse.Cloud.job('myJob', (request) => {
 *   request.message('Processing...');
 *   // Do background work
 * });
 * ```
 *
 * @param name - The name of the background job.
 * @param handler - The function to execute.
 */
export function job(name: string, handler: (request: JobRequest) => any): void;

// ============================================================================
// Object Lifecycle Hooks
// ============================================================================

/**
 * Registers a beforeSave trigger for a class.
 *
 * @example
 * ```typescript
 * Parse.Cloud.beforeSave('MyClass', (request) => {
 *   request.object.set('updatedBy', request.user);
 * });
 * ```
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeSave<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: BeforeSaveRequest<T>) => T | void | Promise<T | void>,
  validator?: ValidatorObject | ((request: BeforeSaveRequest<T>) => any)
): void;

/**
 * Registers an afterSave trigger for a class.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function afterSave<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: AfterSaveRequest<T>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: AfterSaveRequest<T>) => any)
): void;

/**
 * Registers a beforeDelete trigger for a class.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeDelete<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: BeforeDeleteRequest<T>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: BeforeDeleteRequest<T>) => any)
): void;

/**
 * Registers an afterDelete trigger for a class.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function afterDelete<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: AfterDeleteRequest<T>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: AfterDeleteRequest<T>) => any)
): void;

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Registers a beforeFind trigger for a class.
 *
 * @example
 * ```typescript
 * Parse.Cloud.beforeFind('MyClass', (request) => {
 *   // Modify the query
 *   request.query.equalTo('active', true);
 *   return request.query;
 * });
 * ```
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeFind<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: BeforeFindRequest<T>) => ParseQuery<T> | void | Promise<ParseQuery<T> | void>,
  validator?: ValidatorObject | ((request: BeforeFindRequest<T>) => any)
): void;

/**
 * Registers an afterFind trigger for a class.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function afterFind<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: AfterFindRequest<T>) => T[] | void | Promise<T[] | void>,
  validator?: ValidatorObject | ((request: AfterFindRequest<T>) => any)
): void;

// ============================================================================
// Auth Hooks
// ============================================================================

/**
 * Registers a beforeLogin trigger.
 *
 * @example
 * ```typescript
 * Parse.Cloud.beforeLogin((request) => {
 *   if (request.object.get('banned')) {
 *     throw new Error('User is banned');
 *   }
 * });
 * ```
 *
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeLogin(
  handler: (request: TriggerRequest<ParseUser>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)
): void;

/**
 * Registers an afterLogin trigger.
 *
 * @param handler - The trigger function.
 */
export function afterLogin(handler: (request: TriggerRequest<ParseUser>) => void | Promise<void>): void;

/**
 * Registers an afterLogout trigger.
 *
 * @param handler - The trigger function.
 */
export function afterLogout(handler: (request: TriggerRequest) => void | Promise<void>): void;

/**
 * Registers a beforePasswordResetRequest trigger.
 *
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforePasswordResetRequest(
  handler: (request: TriggerRequest<ParseUser>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: TriggerRequest<ParseUser>) => any)
): void;

// ============================================================================
// File Hooks
// ============================================================================

/**
 * Registers a beforeSaveFile trigger.
 *
 * @example
 * ```typescript
 * Parse.Cloud.beforeSaveFile((request) => {
 *   // Validate or modify file before saving
 *   if (request.fileSize > 10 * 1024 * 1024) {
 *     throw new Error('File too large');
 *   }
 * });
 * ```
 *
 * @param handler - The trigger function.
 */
export function beforeSaveFile(
  handler: (request: FileTriggerRequest) => ParseFile | void | Promise<ParseFile | void>
): void;

/**
 * Registers an afterSaveFile trigger.
 *
 * @param handler - The trigger function.
 */
export function afterSaveFile(handler: (request: FileTriggerRequest) => void | Promise<void>): void;

/**
 * Registers a beforeDeleteFile trigger.
 *
 * @param handler - The trigger function.
 */
export function beforeDeleteFile(handler: (request: FileTriggerRequest) => void | Promise<void>): void;

/**
 * Registers an afterDeleteFile trigger.
 *
 * @param handler - The trigger function.
 */
export function afterDeleteFile(handler: (request: FileTriggerRequest) => void | Promise<void>): void;

// ============================================================================
// LiveQuery Hooks
// ============================================================================

/**
 * Registers a beforeConnect trigger for LiveQuery.
 *
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeConnect(
  handler: (request: ConnectTriggerRequest) => void | Promise<void>,
  validator?: ValidatorObject | ((request: ConnectTriggerRequest) => any)
): void;

/**
 * Registers a beforeSubscribe trigger for LiveQuery.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function beforeSubscribe<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: TriggerRequest<T>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: TriggerRequest<T>) => any)
): void;

/**
 * Registers an afterLiveQueryEvent trigger.
 *
 * @param className - The class name or constructor.
 * @param handler - The trigger function.
 * @param validator - Optional validator configuration.
 */
export function afterLiveQueryEvent<T extends ParseObject = ParseObject>(
  className: string | { new (): T },
  handler: (request: LiveQueryEventTrigger<T>) => void | Promise<void>,
  validator?: ValidatorObject | ((request: LiveQueryEventTrigger<T>) => any)
): void;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sends an email using the configured email adapter.
 *
 * @param data - Email configuration.
 */
export function sendEmail(data: {
  from?: string;
  to: string;
  subject?: string;
  text?: string;
  html?: string;
}): Promise<void>;

/**
 * Makes an HTTP request.
 *
 * @example
 * ```typescript
 * const response = await Parse.Cloud.httpRequest({
 *   url: 'https://api.example.com/data',
 *   method: 'GET',
 *   headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * });
 * console.log(response.data);
 * ```
 *
 * @param options - HTTP request options.
 * @returns The HTTP response.
 */
export function httpRequest(options: HTTPOptions): Promise<HTTPResponse>;
