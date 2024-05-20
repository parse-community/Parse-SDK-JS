import CoreManager from './CoreManager';
import type ParseObject from './ParseObject';

/**
 * Constructs a new Parse.Error object with the given code and message.
 *
 * Parse.CoreManager.set('PARSE_ERRORS', [{ code, message }]) can be use to override error messages.
 *
 * @alias Parse.Error
 */
class ParseError extends Error {
  code: number;
  message: string;
  object?: ParseObject;
  errors?: Error[];
  /**
   * @param {number} code An error code constant from <code>Parse.Error</code>.
   * @param {string} message A detailed description of the error.
   */
  constructor(code: number, message?: string) {
    super(message);
    this.code = code;
    let customMessage = message;
    CoreManager.get('PARSE_ERRORS').forEach(error => {
      if (error.code === code && error.code) {
        customMessage = error.message;
      }
    });
    Object.defineProperty(this, 'message', {
      enumerable: true,
      value: customMessage,
    });
  }

  toString() {
    return 'ParseError: ' + this.code + ' ' + this.message;
  }

  /**
   * Error code indicating some error other than those enumerated here.
   *
   * @property {number} OTHER_CAUSE
   * @static
   */
  static OTHER_CAUSE = -1;

  /**
   * Error code indicating that something has gone wrong with the server.
   *
   * @property {number} INTERNAL_SERVER_ERROR
   * @static
   */
  static INTERNAL_SERVER_ERROR = 1;

  /**
   * Error code indicating the connection to the Parse servers failed.
   *
   * @property {number} CONNECTION_FAILED
   * @static
   */
  static CONNECTION_FAILED = 100;

  /**
   * Error code indicating the specified object doesn't exist.
   *
   * @property {number} OBJECT_NOT_FOUND
   * @static
   */
  static OBJECT_NOT_FOUND = 101;

  /**
   * Error code indicating you tried to query with a datatype that doesn't
   * support it, like exact matching an array or object.
   *
   * @property {number} INVALID_QUERY
   * @static
   */
  static INVALID_QUERY = 102;

  /**
   * Error code indicating a missing or invalid classname. Classnames are
   * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
   * only valid characters.
   *
   * @property {number} INVALID_CLASS_NAME
   * @static
   */
  static INVALID_CLASS_NAME = 103;

  /**
   * Error code indicating an unspecified object id.
   *
   * @property {number} MISSING_OBJECT_ID
   * @static
   */
  static MISSING_OBJECT_ID = 104;

  /**
   * Error code indicating an invalid key name. Keys are case-sensitive. They
   * must start with a letter, and a-zA-Z0-9_ are the only valid characters.
   *
   * @property {number} INVALID_KEY_NAME
   * @static
   */
  static INVALID_KEY_NAME = 105;

  /**
   * Error code indicating a malformed pointer. You should not see this unless
   * you have been mucking about changing internal Parse code.
   *
   * @property {number} INVALID_POINTER
   * @static
   */
  static INVALID_POINTER = 106;

  /**
   * Error code indicating that badly formed JSON was received upstream. This
   * either indicates you have done something unusual with modifying how
   * things encode to JSON, or the network is failing badly.
   *
   * @property {number} INVALID_JSON
   * @static
   */
  static INVALID_JSON = 107;

  /**
   * Error code indicating that the feature you tried to access is only
   * available internally for testing purposes.
   *
   * @property {number} COMMAND_UNAVAILABLE
   * @static
   */
  static COMMAND_UNAVAILABLE = 108;

  /**
   * You must call Parse.initialize before using the Parse library.
   *
   * @property {number} NOT_INITIALIZED
   * @static
   */
  static NOT_INITIALIZED = 109;

  /**
   * Error code indicating that a field was set to an inconsistent type.
   *
   * @property {number} INCORRECT_TYPE
   * @static
   */
  static INCORRECT_TYPE = 111;

  /**
   * Error code indicating an invalid channel name. A channel name is either
   * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
   * characters and starts with a letter.
   *
   * @property {number} INVALID_CHANNEL_NAME
   * @static
   */
  static INVALID_CHANNEL_NAME = 112;

  /**
   * Error code indicating that push is misconfigured.
   *
   * @property {number} PUSH_MISCONFIGURED
   * @static
   */
  static PUSH_MISCONFIGURED = 115;

  /**
   * Error code indicating that the object is too large.
   *
   * @property {number} OBJECT_TOO_LARGE
   * @static
   */
  static OBJECT_TOO_LARGE = 116;

  /**
   * Error code indicating that the operation isn't allowed for clients.
   *
   * @property {number} OPERATION_FORBIDDEN
   * @static
   */
  static OPERATION_FORBIDDEN = 119;

  /**
   * Error code indicating the result was not found in the cache.
   *
   * @property {number} CACHE_MISS
   * @static
   */
  static CACHE_MISS = 120;

  /**
   * Error code indicating that an invalid key was used in a nested
   * JSONObject.
   *
   * @property {number} INVALID_NESTED_KEY
   * @static
   */
  static INVALID_NESTED_KEY = 121;

  /**
   * Error code indicating that an invalid filename was used for ParseFile.
   * A valid file name contains only a-zA-Z0-9_. characters and is between 1
   * and 128 characters.
   *
   * @property {number} INVALID_FILE_NAME
   * @static
   */
  static INVALID_FILE_NAME = 122;

  /**
   * Error code indicating an invalid ACL was provided.
   *
   * @property {number} INVALID_ACL
   * @static
   */
  static INVALID_ACL = 123;

  /**
   * Error code indicating that the request timed out on the server. Typically
   * this indicates that the request is too expensive to run.
   *
   * @property {number} TIMEOUT
   * @static
   */
  static TIMEOUT = 124;

  /**
   * Error code indicating that the email address was invalid.
   *
   * @property {number} INVALID_EMAIL_ADDRESS
   * @static
   */
  static INVALID_EMAIL_ADDRESS = 125;

  /**
   * Error code indicating a missing content type.
   *
   * @property {number} MISSING_CONTENT_TYPE
   * @static
   */
  static MISSING_CONTENT_TYPE = 126;

  /**
   * Error code indicating a missing content length.
   *
   * @property {number} MISSING_CONTENT_LENGTH
   * @static
   */
  static MISSING_CONTENT_LENGTH = 127;

  /**
   * Error code indicating an invalid content length.
   *
   * @property {number} INVALID_CONTENT_LENGTH
   * @static
   */
  static INVALID_CONTENT_LENGTH = 128;

  /**
   * Error code indicating a file that was too large.
   *
   * @property {number} FILE_TOO_LARGE
   * @static
   */
  static FILE_TOO_LARGE = 129;

  /**
   * Error code indicating an error saving a file.
   *
   * @property {number} FILE_SAVE_ERROR
   * @static
   */
  static FILE_SAVE_ERROR = 130;

  /**
   * Error code indicating that a unique field was given a value that is
   * already taken.
   *
   * @property {number} DUPLICATE_VALUE
   * @static
   */
  static DUPLICATE_VALUE = 137;

  /**
   * Error code indicating that a role's name is invalid.
   *
   * @property {number} INVALID_ROLE_NAME
   * @static
   */
  static INVALID_ROLE_NAME = 139;

  /**
   * Error code indicating that an application quota was exceeded.  Upgrade to
   * resolve.
   *
   * @property {number} EXCEEDED_QUOTA
   * @static
   */
  static EXCEEDED_QUOTA = 140;

  /**
   * Error code indicating that a Cloud Code script failed.
   *
   * @property {number} SCRIPT_FAILED
   * @static
   */
  static SCRIPT_FAILED = 141;

  /**
   * Error code indicating that a Cloud Code validation failed.
   *
   * @property {number} VALIDATION_ERROR
   * @static
   */
  static VALIDATION_ERROR = 142;

  /**
   * Error code indicating that invalid image data was provided.
   *
   * @property {number} INVALID_IMAGE_DATA
   * @static
   */
  static INVALID_IMAGE_DATA = 143;

  /**
   * Error code indicating an unsaved file.
   *
   * @property {number} UNSAVED_FILE_ERROR
   * @static
   */
  static UNSAVED_FILE_ERROR = 151;

  /**
   * Error code indicating an invalid push time.
   *
   * @property {number} INVALID_PUSH_TIME_ERROR
   * @static
   */
  static INVALID_PUSH_TIME_ERROR = 152;

  /**
   * Error code indicating an error deleting a file.
   *
   * @property {number} FILE_DELETE_ERROR
   * @static
   */
  static FILE_DELETE_ERROR = 153;

  /**
   * Error code indicating an error deleting an unnamed file.
   *
   * @property {number} FILE_DELETE_UNNAMED_ERROR
   * @static
   */
  static FILE_DELETE_UNNAMED_ERROR = 161;

  /**
   * Error code indicating that the application has exceeded its request
   * limit.
   *
   * @property {number} REQUEST_LIMIT_EXCEEDED
   * @static
   */
  static REQUEST_LIMIT_EXCEEDED = 155;

  /**
   * Error code indicating that the request was a duplicate and has been discarded due to
   * idempotency rules.
   *
   * @property {number} DUPLICATE_REQUEST
   * @static
   */
  static DUPLICATE_REQUEST = 159;

  /**
   * Error code indicating an invalid event name.
   *
   * @property {number} INVALID_EVENT_NAME
   * @static
   */
  static INVALID_EVENT_NAME = 160;

  /**
   * Error code indicating that a field had an invalid value.
   *
   * @property {number} INVALID_VALUE
   * @static
   */
  static INVALID_VALUE = 162;

  /**
   * Error code indicating that the username is missing or empty.
   *
   * @property {number} USERNAME_MISSING
   * @static
   */
  static USERNAME_MISSING = 200;

  /**
   * Error code indicating that the password is missing or empty.
   *
   * @property {number} PASSWORD_MISSING
   * @static
   */
  static PASSWORD_MISSING = 201;

  /**
   * Error code indicating that the username has already been taken.
   *
   * @property {number} USERNAME_TAKEN
   * @static
   */
  static USERNAME_TAKEN = 202;

  /**
   * Error code indicating that the email has already been taken.
   *
   * @property {number} EMAIL_TAKEN
   * @static
   */
  static EMAIL_TAKEN = 203;

  /**
   * Error code indicating that the email is missing, but must be specified.
   *
   * @property {number} EMAIL_MISSING
   * @static
   */
  static EMAIL_MISSING = 204;

  /**
   * Error code indicating that a user with the specified email was not found.
   *
   * @property {number} EMAIL_NOT_FOUND
   * @static
   */
  static EMAIL_NOT_FOUND = 205;

  /**
   * Error code indicating that a user object without a valid session could
   * not be altered.
   *
   * @property {number} SESSION_MISSING
   * @static
   */
  static SESSION_MISSING = 206;

  /**
   * Error code indicating that a user can only be created through signup.
   *
   * @property {number} MUST_CREATE_USER_THROUGH_SIGNUP
   * @static
   */
  static MUST_CREATE_USER_THROUGH_SIGNUP = 207;

  /**
   * Error code indicating that an an account being linked is already linked
   * to another user.
   *
   * @property {number} ACCOUNT_ALREADY_LINKED
   * @static
   */
  static ACCOUNT_ALREADY_LINKED = 208;

  /**
   * Error code indicating that the current session token is invalid.
   *
   * @property {number} INVALID_SESSION_TOKEN
   * @static
   */
  static INVALID_SESSION_TOKEN = 209;

  /**
   * Error code indicating an error enabling or verifying MFA
   *
   * @property {number} MFA_ERROR
   * @static
   */
  static MFA_ERROR = 210;

  /**
   * Error code indicating that a valid MFA token must be provided
   *
   * @property {number} MFA_TOKEN_REQUIRED
   * @static
   */
  static MFA_TOKEN_REQUIRED = 211;

  /**
   * Error code indicating that a user cannot be linked to an account because
   * that account's id could not be found.
   *
   * @property {number} LINKED_ID_MISSING
   * @static
   */
  static LINKED_ID_MISSING = 250;

  /**
   * Error code indicating that a user with a linked (e.g. Facebook) account
   * has an invalid session.
   *
   * @property {number} INVALID_LINKED_SESSION
   * @static
   */
  static INVALID_LINKED_SESSION = 251;

  /**
   * Error code indicating that a service being linked (e.g. Facebook or
   * Twitter) is unsupported.
   *
   * @property {number} UNSUPPORTED_SERVICE
   * @static
   */
  static UNSUPPORTED_SERVICE = 252;

  /**
   * Error code indicating an invalid operation occured on schema
   *
   * @property {number} INVALID_SCHEMA_OPERATION
   * @static
   */
  static INVALID_SCHEMA_OPERATION = 255;

  /**
   * Error code indicating that there were multiple errors. Aggregate errors
   * have an "errors" property, which is an array of error objects with more
   * detail about each error that occurred.
   *
   * @property {number} AGGREGATE_ERROR
   * @static
   */
  static AGGREGATE_ERROR = 600;

  /**
   * Error code indicating the client was unable to read an input file.
   *
   * @property {number} FILE_READ_ERROR
   * @static
   */
  static FILE_READ_ERROR = 601;

  /**
   * Error code indicating a real error code is unavailable because
   * we had to use an XDomainRequest object to allow CORS requests in
   * Internet Explorer, which strips the body from HTTP responses that have
   * a non-2XX status code.
   *
   * @property {number} X_DOMAIN_REQUEST
   * @static
   */
  static X_DOMAIN_REQUEST = 602;
}

export default ParseError;
