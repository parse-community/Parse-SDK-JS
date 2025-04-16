import type ParseObject from './ParseObject';
/**
 * Constructs a new Parse.Error object with the given code and message.
 *
 * Parse.CoreManager.set('PARSE_ERRORS', [{ code, message }]) can be use to override error messages.
 *
 * @alias Parse.Error
 */
declare class ParseError extends Error {
    code: number;
    message: string;
    object?: ParseObject;
    errors?: Error[];
    /**
     * @param {number} code An error code constant from <code>Parse.Error</code>.
     * @param {string} message A detailed description of the error.
     */
    constructor(code: number, message?: string);
    toString(): string;
    /**
     * Error code indicating some error other than those enumerated here.
     *
     * @property {number} OTHER_CAUSE
     * @static
     */
    static OTHER_CAUSE: number;
    /**
     * Error code indicating that something has gone wrong with the server.
     *
     * @property {number} INTERNAL_SERVER_ERROR
     * @static
     */
    static INTERNAL_SERVER_ERROR: number;
    /**
     * Error code indicating the connection to the Parse servers failed.
     *
     * @property {number} CONNECTION_FAILED
     * @static
     */
    static CONNECTION_FAILED: number;
    /**
     * Error code indicating the specified object doesn't exist.
     *
     * @property {number} OBJECT_NOT_FOUND
     * @static
     */
    static OBJECT_NOT_FOUND: number;
    /**
     * Error code indicating you tried to query with a datatype that doesn't
     * support it, like exact matching an array or object.
     *
     * @property {number} INVALID_QUERY
     * @static
     */
    static INVALID_QUERY: number;
    /**
     * Error code indicating a missing or invalid classname. Classnames are
     * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
     * only valid characters.
     *
     * @property {number} INVALID_CLASS_NAME
     * @static
     */
    static INVALID_CLASS_NAME: number;
    /**
     * Error code indicating an unspecified object id.
     *
     * @property {number} MISSING_OBJECT_ID
     * @static
     */
    static MISSING_OBJECT_ID: number;
    /**
     * Error code indicating an invalid key name. Keys are case-sensitive. They
     * must start with a letter, and a-zA-Z0-9_ are the only valid characters.
     *
     * @property {number} INVALID_KEY_NAME
     * @static
     */
    static INVALID_KEY_NAME: number;
    /**
     * Error code indicating a malformed pointer. You should not see this unless
     * you have been mucking about changing internal Parse code.
     *
     * @property {number} INVALID_POINTER
     * @static
     */
    static INVALID_POINTER: number;
    /**
     * Error code indicating that badly formed JSON was received upstream. This
     * either indicates you have done something unusual with modifying how
     * things encode to JSON, or the network is failing badly.
     *
     * @property {number} INVALID_JSON
     * @static
     */
    static INVALID_JSON: number;
    /**
     * Error code indicating that the feature you tried to access is only
     * available internally for testing purposes.
     *
     * @property {number} COMMAND_UNAVAILABLE
     * @static
     */
    static COMMAND_UNAVAILABLE: number;
    /**
     * You must call Parse.initialize before using the Parse library.
     *
     * @property {number} NOT_INITIALIZED
     * @static
     */
    static NOT_INITIALIZED: number;
    /**
     * Error code indicating that a field was set to an inconsistent type.
     *
     * @property {number} INCORRECT_TYPE
     * @static
     */
    static INCORRECT_TYPE: number;
    /**
     * Error code indicating an invalid channel name. A channel name is either
     * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
     * characters and starts with a letter.
     *
     * @property {number} INVALID_CHANNEL_NAME
     * @static
     */
    static INVALID_CHANNEL_NAME: number;
    /**
     * Error code indicating that push is misconfigured.
     *
     * @property {number} PUSH_MISCONFIGURED
     * @static
     */
    static PUSH_MISCONFIGURED: number;
    /**
     * Error code indicating that the object is too large.
     *
     * @property {number} OBJECT_TOO_LARGE
     * @static
     */
    static OBJECT_TOO_LARGE: number;
    /**
     * Error code indicating that the operation isn't allowed for clients.
     *
     * @property {number} OPERATION_FORBIDDEN
     * @static
     */
    static OPERATION_FORBIDDEN: number;
    /**
     * Error code indicating the result was not found in the cache.
     *
     * @property {number} CACHE_MISS
     * @static
     */
    static CACHE_MISS: number;
    /**
     * Error code indicating that an invalid key was used in a nested
     * JSONObject.
     *
     * @property {number} INVALID_NESTED_KEY
     * @static
     */
    static INVALID_NESTED_KEY: number;
    /**
     * Error code indicating that an invalid filename was used for ParseFile.
     * A valid file name contains only a-zA-Z0-9_. characters and is between 1
     * and 128 characters.
     *
     * @property {number} INVALID_FILE_NAME
     * @static
     */
    static INVALID_FILE_NAME: number;
    /**
     * Error code indicating an invalid ACL was provided.
     *
     * @property {number} INVALID_ACL
     * @static
     */
    static INVALID_ACL: number;
    /**
     * Error code indicating that the request timed out on the server. Typically
     * this indicates that the request is too expensive to run.
     *
     * @property {number} TIMEOUT
     * @static
     */
    static TIMEOUT: number;
    /**
     * Error code indicating that the email address was invalid.
     *
     * @property {number} INVALID_EMAIL_ADDRESS
     * @static
     */
    static INVALID_EMAIL_ADDRESS: number;
    /**
     * Error code indicating a missing content type.
     *
     * @property {number} MISSING_CONTENT_TYPE
     * @static
     */
    static MISSING_CONTENT_TYPE: number;
    /**
     * Error code indicating a missing content length.
     *
     * @property {number} MISSING_CONTENT_LENGTH
     * @static
     */
    static MISSING_CONTENT_LENGTH: number;
    /**
     * Error code indicating an invalid content length.
     *
     * @property {number} INVALID_CONTENT_LENGTH
     * @static
     */
    static INVALID_CONTENT_LENGTH: number;
    /**
     * Error code indicating a file that was too large.
     *
     * @property {number} FILE_TOO_LARGE
     * @static
     */
    static FILE_TOO_LARGE: number;
    /**
     * Error code indicating an error saving a file.
     *
     * @property {number} FILE_SAVE_ERROR
     * @static
     */
    static FILE_SAVE_ERROR: number;
    /**
     * Error code indicating that a unique field was given a value that is
     * already taken.
     *
     * @property {number} DUPLICATE_VALUE
     * @static
     */
    static DUPLICATE_VALUE: number;
    /**
     * Error code indicating that a role's name is invalid.
     *
     * @property {number} INVALID_ROLE_NAME
     * @static
     */
    static INVALID_ROLE_NAME: number;
    /**
     * Error code indicating that an application quota was exceeded.  Upgrade to
     * resolve.
     *
     * @property {number} EXCEEDED_QUOTA
     * @static
     */
    static EXCEEDED_QUOTA: number;
    /**
     * Error code indicating that a Cloud Code script failed.
     *
     * @property {number} SCRIPT_FAILED
     * @static
     */
    static SCRIPT_FAILED: number;
    /**
     * Error code indicating that a Cloud Code validation failed.
     *
     * @property {number} VALIDATION_ERROR
     * @static
     */
    static VALIDATION_ERROR: number;
    /**
     * Error code indicating that invalid image data was provided.
     *
     * @property {number} INVALID_IMAGE_DATA
     * @static
     */
    static INVALID_IMAGE_DATA: number;
    /**
     * Error code indicating an unsaved file.
     *
     * @property {number} UNSAVED_FILE_ERROR
     * @static
     */
    static UNSAVED_FILE_ERROR: number;
    /**
     * Error code indicating an invalid push time.
     *
     * @property {number} INVALID_PUSH_TIME_ERROR
     * @static
     */
    static INVALID_PUSH_TIME_ERROR: number;
    /**
     * Error code indicating an error deleting a file.
     *
     * @property {number} FILE_DELETE_ERROR
     * @static
     */
    static FILE_DELETE_ERROR: number;
    /**
     * Error code indicating an error deleting an unnamed file.
     *
     * @property {number} FILE_DELETE_UNNAMED_ERROR
     * @static
     */
    static FILE_DELETE_UNNAMED_ERROR: number;
    /**
     * Error code indicating that the application has exceeded its request
     * limit.
     *
     * @property {number} REQUEST_LIMIT_EXCEEDED
     * @static
     */
    static REQUEST_LIMIT_EXCEEDED: number;
    /**
     * Error code indicating that the request was a duplicate and has been discarded due to
     * idempotency rules.
     *
     * @property {number} DUPLICATE_REQUEST
     * @static
     */
    static DUPLICATE_REQUEST: number;
    /**
     * Error code indicating an invalid event name.
     *
     * @property {number} INVALID_EVENT_NAME
     * @static
     */
    static INVALID_EVENT_NAME: number;
    /**
     * Error code indicating that a field had an invalid value.
     *
     * @property {number} INVALID_VALUE
     * @static
     */
    static INVALID_VALUE: number;
    /**
     * Error code indicating that the username is missing or empty.
     *
     * @property {number} USERNAME_MISSING
     * @static
     */
    static USERNAME_MISSING: number;
    /**
     * Error code indicating that the password is missing or empty.
     *
     * @property {number} PASSWORD_MISSING
     * @static
     */
    static PASSWORD_MISSING: number;
    /**
     * Error code indicating that the username has already been taken.
     *
     * @property {number} USERNAME_TAKEN
     * @static
     */
    static USERNAME_TAKEN: number;
    /**
     * Error code indicating that the email has already been taken.
     *
     * @property {number} EMAIL_TAKEN
     * @static
     */
    static EMAIL_TAKEN: number;
    /**
     * Error code indicating that the email is missing, but must be specified.
     *
     * @property {number} EMAIL_MISSING
     * @static
     */
    static EMAIL_MISSING: number;
    /**
     * Error code indicating that a user with the specified email was not found.
     *
     * @property {number} EMAIL_NOT_FOUND
     * @static
     */
    static EMAIL_NOT_FOUND: number;
    /**
     * Error code indicating that a user object without a valid session could
     * not be altered.
     *
     * @property {number} SESSION_MISSING
     * @static
     */
    static SESSION_MISSING: number;
    /**
     * Error code indicating that a user can only be created through signup.
     *
     * @property {number} MUST_CREATE_USER_THROUGH_SIGNUP
     * @static
     */
    static MUST_CREATE_USER_THROUGH_SIGNUP: number;
    /**
     * Error code indicating that an an account being linked is already linked
     * to another user.
     *
     * @property {number} ACCOUNT_ALREADY_LINKED
     * @static
     */
    static ACCOUNT_ALREADY_LINKED: number;
    /**
     * Error code indicating that the current session token is invalid.
     *
     * @property {number} INVALID_SESSION_TOKEN
     * @static
     */
    static INVALID_SESSION_TOKEN: number;
    /**
     * Error code indicating an error enabling or verifying MFA
     *
     * @property {number} MFA_ERROR
     * @static
     */
    static MFA_ERROR: number;
    /**
     * Error code indicating that a valid MFA token must be provided
     *
     * @property {number} MFA_TOKEN_REQUIRED
     * @static
     */
    static MFA_TOKEN_REQUIRED: number;
    /**
     * Error code indicating that a user cannot be linked to an account because
     * that account's id could not be found.
     *
     * @property {number} LINKED_ID_MISSING
     * @static
     */
    static LINKED_ID_MISSING: number;
    /**
     * Error code indicating that a user with a linked (e.g. Facebook) account
     * has an invalid session.
     *
     * @property {number} INVALID_LINKED_SESSION
     * @static
     */
    static INVALID_LINKED_SESSION: number;
    /**
     * Error code indicating that a service being linked (e.g. Facebook or
     * Twitter) is unsupported.
     *
     * @property {number} UNSUPPORTED_SERVICE
     * @static
     */
    static UNSUPPORTED_SERVICE: number;
    /**
     * Error code indicating an invalid operation occured on schema
     *
     * @property {number} INVALID_SCHEMA_OPERATION
     * @static
     */
    static INVALID_SCHEMA_OPERATION: number;
    /**
     * Error code indicating that there were multiple errors. Aggregate errors
     * have an "errors" property, which is an array of error objects with more
     * detail about each error that occurred.
     *
     * @property {number} AGGREGATE_ERROR
     * @static
     */
    static AGGREGATE_ERROR: number;
    /**
     * Error code indicating the client was unable to read an input file.
     *
     * @property {number} FILE_READ_ERROR
     * @static
     */
    static FILE_READ_ERROR: number;
    /**
     * Error code indicating a real error code is unavailable because
     * we had to use an XDomainRequest object to allow CORS requests in
     * Internet Explorer, which strips the body from HTTP responses that have
     * a non-2XX status code.
     *
     * @property {number} X_DOMAIN_REQUEST
     * @static
     */
    static X_DOMAIN_REQUEST: number;
}
export default ParseError;
