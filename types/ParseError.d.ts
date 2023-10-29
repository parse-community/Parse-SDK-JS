export default ParseError;
/**
 * Constructs a new Parse.Error object with the given code and message.
 *
 * @alias Parse.Error
 */
declare class ParseError extends Error {
    /**
     * @param {number} code An error code constant from <code>Parse.Error</code>.
     * @param {string} message A detailed description of the error.
     */
    constructor(code: number, message: string);
    code: number;
}
declare namespace ParseError {
    let OTHER_CAUSE: number;
    let INTERNAL_SERVER_ERROR: number;
    let CONNECTION_FAILED: number;
    let OBJECT_NOT_FOUND: number;
    let INVALID_QUERY: number;
    let INVALID_CLASS_NAME: number;
    let MISSING_OBJECT_ID: number;
    let INVALID_KEY_NAME: number;
    let INVALID_POINTER: number;
    let INVALID_JSON: number;
    let COMMAND_UNAVAILABLE: number;
    let NOT_INITIALIZED: number;
    let INCORRECT_TYPE: number;
    let INVALID_CHANNEL_NAME: number;
    let PUSH_MISCONFIGURED: number;
    let OBJECT_TOO_LARGE: number;
    let OPERATION_FORBIDDEN: number;
    let CACHE_MISS: number;
    let INVALID_NESTED_KEY: number;
    let INVALID_FILE_NAME: number;
    let INVALID_ACL: number;
    let TIMEOUT: number;
    let INVALID_EMAIL_ADDRESS: number;
    let MISSING_CONTENT_TYPE: number;
    let MISSING_CONTENT_LENGTH: number;
    let INVALID_CONTENT_LENGTH: number;
    let FILE_TOO_LARGE: number;
    let FILE_SAVE_ERROR: number;
    let DUPLICATE_VALUE: number;
    let INVALID_ROLE_NAME: number;
    let EXCEEDED_QUOTA: number;
    let SCRIPT_FAILED: number;
    let VALIDATION_ERROR: number;
    let INVALID_IMAGE_DATA: number;
    let UNSAVED_FILE_ERROR: number;
    let INVALID_PUSH_TIME_ERROR: number;
    let FILE_DELETE_ERROR: number;
    let FILE_DELETE_UNNAMED_ERROR: number;
    let REQUEST_LIMIT_EXCEEDED: number;
    let DUPLICATE_REQUEST: number;
    let INVALID_EVENT_NAME: number;
    let INVALID_VALUE: number;
    let USERNAME_MISSING: number;
    let PASSWORD_MISSING: number;
    let USERNAME_TAKEN: number;
    let EMAIL_TAKEN: number;
    let EMAIL_MISSING: number;
    let EMAIL_NOT_FOUND: number;
    let SESSION_MISSING: number;
    let MUST_CREATE_USER_THROUGH_SIGNUP: number;
    let ACCOUNT_ALREADY_LINKED: number;
    let INVALID_SESSION_TOKEN: number;
    let MFA_ERROR: number;
    let MFA_TOKEN_REQUIRED: number;
    let LINKED_ID_MISSING: number;
    let INVALID_LINKED_SESSION: number;
    let UNSUPPORTED_SERVICE: number;
    let INVALID_SCHEMA_OPERATION: number;
    let AGGREGATE_ERROR: number;
    let FILE_READ_ERROR: number;
    let X_DOMAIN_REQUEST: number;
}
