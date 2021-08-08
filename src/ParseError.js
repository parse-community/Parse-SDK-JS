/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Constructs a new Parse.Error object with the given code and message.
 *
 */
class ParseError extends Error {
  /**
   * @alias Parse.Error
   * @param {number} code An error code constant from <code>Parse.Error</code>.
   * @param {string} message A detailed description of the error.
   *
   */
  constructor(code, message) {
    super(message);
    this.code = code;
    Object.defineProperty(this, 'message', {
      enumerable: true,
      value: message,
    });
  }

  toString() {
    return 'ParseError: ' + this.code + ' ' + this.message;
  }
}

/**
 * Error code indicating some error other than those enumerated here.
 *
 * @name ParseError.OTHER_CAUSE
 * @type {number}
 *
 */
ParseError.OTHER_CAUSE = -1;

/**
 * Error code indicating that something has gone wrong with the server.
 *
 * @name ParseError.INTERNAL_SERVER_ERROR
 * @type {number}
 */
ParseError.INTERNAL_SERVER_ERROR = 1;

/**
 * Error code indicating the connection to the Parse servers failed.
 *
 * @name ParseError.CONNECTION_FAILED
 * @type {number}
 */
ParseError.CONNECTION_FAILED = 100;

/**
 * Error code indicating the specified object doesn't exist.
 *
 * @name ParseError.OBJECT_NOT_FOUND
 * @type {number}
 */
ParseError.OBJECT_NOT_FOUND = 101;

/**
 * Error code indicating you tried to query with a datatype that doesn't
 * support it, like exact matching an array or object.
 *
 * @name ParseError.INVALID_QUERY
 * @type {number}
 */
ParseError.INVALID_QUERY = 102;

/**
 * Error code indicating a missing or invalid classname. Classnames are
 * case-sensitive. They must start with a letter, and a-zA-Z0-9_ are the
 * only valid characters.
 *
 * @name ParseError.INVALID_CLASS_NAME
 * @type {number}
 */
ParseError.INVALID_CLASS_NAME = 103;

/**
 * Error code indicating an unspecified object id.
 *
 * @name ParseError.MISSING_OBJECT_ID
 * @type {number}
 */
ParseError.MISSING_OBJECT_ID = 104;

/**
 * Error code indicating an invalid key name. Keys are case-sensitive. They
 * must start with a letter, and a-zA-Z0-9_ are the only valid characters.
 *
 * @name ParseError.INVALID_KEY_NAME
 * @type {number}
 */
ParseError.INVALID_KEY_NAME = 105;

/**
 * Error code indicating a malformed pointer. You should not see this unless
 * you have been mucking about changing internal Parse code.
 *
 * @name ParseError.INVALID_POINTER
 * @type {number}
 */
ParseError.INVALID_POINTER = 106;

/**
 * Error code indicating that badly formed JSON was received upstream. This
 * either indicates you have done something unusual with modifying how
 * things encode to JSON, or the network is failing badly.
 *
 * @name ParseError.INVALID_JSON
 * @type {number}
 */
ParseError.INVALID_JSON = 107;

/**
 * Error code indicating that the feature you tried to access is only
 * available internally for testing purposes.
 *
 * @name ParseError.COMMAND_UNAVAILABLE
 * @type {number}
 */
ParseError.COMMAND_UNAVAILABLE = 108;

/**
 * You must call Parse.initialize before using the Parse library.
 *
 * @name ParseError.NOT_INITIALIZED
 * @type {number}
 */
ParseError.NOT_INITIALIZED = 109;

/**
 * Error code indicating that a field was set to an inconsistent type.
 *
 * @name ParseError.INCORRECT_TYPE
 * @type {number}
 */
ParseError.INCORRECT_TYPE = 111;

/**
 * Error code indicating an invalid channel name. A channel name is either
 * an empty string (the broadcast channel) or contains only a-zA-Z0-9_
 * characters and starts with a letter.
 *
 * @name ParseError.INVALID_CHANNEL_NAME
 * @type {number}
 */
ParseError.INVALID_CHANNEL_NAME = 112;

/**
 * Error code indicating that push is misconfigured.
 *
 * @name ParseError.PUSH_MISCONFIGURED
 * @type {number}
 */
ParseError.PUSH_MISCONFIGURED = 115;

/**
 * Error code indicating that the object is too large.
 *
 * @name ParseError.OBJECT_TOO_LARGE
 * @type {number}
 */
ParseError.OBJECT_TOO_LARGE = 116;

/**
 * Error code indicating that the operation isn't allowed for clients.
 *
 * @name ParseError.OPERATION_FORBIDDEN
 * @type {number}
 */
ParseError.OPERATION_FORBIDDEN = 119;

/**
 * Error code indicating the result was not found in the cache.
 *
 * @name ParseError.CACHE_MISS
 * @type {number}
 */
ParseError.CACHE_MISS = 120;

/**
 * Error code indicating that an invalid key was used in a nested
 * JSONObject.
 *
 * @name ParseError.INVALID_NESTED_KEY
 * @type {number}
 */
ParseError.INVALID_NESTED_KEY = 121;

/**
 * Error code indicating that an invalid filename was used for ParseFile.
 * A valid file name contains only a-zA-Z0-9_. characters and is between 1
 * and 128 characters.
 *
 * @name ParseError.INVALID_FILE_NAME
 * @type {number}
 */
ParseError.INVALID_FILE_NAME = 122;

/**
 * Error code indicating an invalid ACL was provided.
 *
 * @name ParseError.INVALID_ACL
 * @type {number}
 */
ParseError.INVALID_ACL = 123;

/**
 * Error code indicating that the request timed out on the server. Typically
 * this indicates that the request is too expensive to run.
 *
 * @name ParseError.TIMEOUT
 * @type {number}
 */
ParseError.TIMEOUT = 124;

/**
 * Error code indicating that the email address was invalid.
 *
 * @name ParseError.INVALID_EMAIL_ADDRESS
 * @type {number}
 */
ParseError.INVALID_EMAIL_ADDRESS = 125;

/**
 * Error code indicating a missing content type.
 *
 * @name ParseError.MISSING_CONTENT_TYPE
 * @type {number}
 */
ParseError.MISSING_CONTENT_TYPE = 126;

/**
 * Error code indicating a missing content length.
 *
 * @name ParseError.MISSING_CONTENT_LENGTH
 * @type {number}
 */
ParseError.MISSING_CONTENT_LENGTH = 127;

/**
 * Error code indicating an invalid content length.
 *
 * @name ParseError.INVALID_CONTENT_LENGTH
 * @type {number}
 */
ParseError.INVALID_CONTENT_LENGTH = 128;

/**
 * Error code indicating a file that was too large.
 *
 * @name ParseError.FILE_TOO_LARGE
 * @type {number}
 */
ParseError.FILE_TOO_LARGE = 129;

/**
 * Error code indicating an error saving a file.
 *
 * @name ParseError.FILE_SAVE_ERROR
 * @type {number}
 */
ParseError.FILE_SAVE_ERROR = 130;

/**
 * Error code indicating that a unique field was given a value that is
 * already taken.
 *
 * @name ParseError.DUPLICATE_VALUE
 * @type {number}
 */
ParseError.DUPLICATE_VALUE = 137;

/**
 * Error code indicating that a role's name is invalid.
 *
 * @name ParseError.INVALID_ROLE_NAME
 * @type {number}
 */
ParseError.INVALID_ROLE_NAME = 139;

/**
 * Error code indicating that an application quota was exceeded.  Upgrade to
 * resolve.
 *
 * @name ParseError.EXCEEDED_QUOTA
 * @type {number}
 */
ParseError.EXCEEDED_QUOTA = 140;

/**
 * Error code indicating that a Cloud Code script failed.
 *
 * @name ParseError.SCRIPT_FAILED
 * @type {number}
 */
ParseError.SCRIPT_FAILED = 141;

/**
 * Error code indicating that a Cloud Code validation failed.
 *
 * @name ParseError.VALIDATION_ERROR
 * @type {number}
 */
ParseError.VALIDATION_ERROR = 142;

/**
 * Error code indicating that invalid image data was provided.
 *
 * @name ParseError.INVALID_IMAGE_DATA
 * @type {number}
 */
ParseError.INVALID_IMAGE_DATA = 143;

/**
 * Error code indicating an unsaved file.
 *
 * @name ParseError.UNSAVED_FILE_ERROR
 * @type {number}
 */
ParseError.UNSAVED_FILE_ERROR = 151;

/**
 * Error code indicating an invalid push time.
 *
 * @name ParseError.INVALID_PUSH_TIME_ERROR
 * @type {number}
 */
ParseError.INVALID_PUSH_TIME_ERROR = 152;

/**
 * Error code indicating an error deleting a file.
 *
 * @name ParseError.FILE_DELETE_ERROR
 * @type {number}
 */
ParseError.FILE_DELETE_ERROR = 153;

/**
 * Error code indicating an error deleting an unnamed file.
 *
 * @name ParseError.FILE_DELETE_UNNAMED_ERROR
 * @type {number}
 */
ParseError.FILE_DELETE_UNNAMED_ERROR = 161;

/**
 * Error code indicating that the application has exceeded its request
 * limit.
 *
 * @name ParseError.REQUEST_LIMIT_EXCEEDED
 * @type {number}
 */
ParseError.REQUEST_LIMIT_EXCEEDED = 155;

/**
 * Error code indicating that the request was a duplicate and has been discarded due to
 * idempotency rules.
 *
 * @name ParseError.DUPLICATE_REQUEST
 * @type {number}
 */
ParseError.DUPLICATE_REQUEST = 159;

/**
 * Error code indicating an invalid event name.
 *
 * @name ParseError.INVALID_EVENT_NAME
 * @type {number}
 */
ParseError.INVALID_EVENT_NAME = 160;

/**
 * Error code indicating that a field had an invalid value.
 *
 * @name ParseError.INVALID_VALUE
 * @type {number}
 */
ParseError.INVALID_VALUE = 162;

/**
 * Error code indicating that the username is missing or empty.
 *
 * @name ParseError.USERNAME_MISSING
 * @type {number}
 */
ParseError.USERNAME_MISSING = 200;

/**
 * Error code indicating that the password is missing or empty.
 *
 * @name ParseError.PASSWORD_MISSING
 * @type {number}
 */
ParseError.PASSWORD_MISSING = 201;

/**
 * Error code indicating that the username has already been taken.
 *
 * @name ParseError.USERNAME_TAKEN
 * @type {number}
 */
ParseError.USERNAME_TAKEN = 202;

/**
 * Error code indicating that the email has already been taken.
 *
 * @name ParseError.EMAIL_TAKEN
 * @type {number}
 */
ParseError.EMAIL_TAKEN = 203;

/**
 * Error code indicating that the email is missing, but must be specified.
 *
 * @name ParseError.EMAIL_MISSING
 * @type {number}
 */
ParseError.EMAIL_MISSING = 204;

/**
 * Error code indicating that a user with the specified email was not found.
 *
 * @name ParseError.EMAIL_NOT_FOUND
 * @type {number}
 */
ParseError.EMAIL_NOT_FOUND = 205;

/**
 * Error code indicating that a user object without a valid session could
 * not be altered.
 *
 * @name ParseError.SESSION_MISSING
 * @type {number}
 */
ParseError.SESSION_MISSING = 206;

/**
 * Error code indicating that a user can only be created through signup.
 *
 * @name ParseError.MUST_CREATE_USER_THROUGH_SIGNUP
 * @type {number}
 */
ParseError.MUST_CREATE_USER_THROUGH_SIGNUP = 207;

/**
 * Error code indicating that an an account being linked is already linked
 * to another user.
 *
 * @name ParseError.ACCOUNT_ALREADY_LINKED
 * @type {number}
 */
ParseError.ACCOUNT_ALREADY_LINKED = 208;

/**
 * Error code indicating that the current session token is invalid.
 *
 * @name ParseError.INVALID_SESSION_TOKEN
 * @type {number}
 */
ParseError.INVALID_SESSION_TOKEN = 209;

/**
 * Error code indicating an error enabling or verifying MFA
 *
 * @name ParseError.MFA_ERROR
 * @type {number}
 */
ParseError.MFA_ERROR = 210;

/**
 * Error code indicating that a valid MFA token must be provided
 *
 * @name ParseError.MFA_TOKEN_REQUIRED
 * @type {number}
 */
ParseError.MFA_TOKEN_REQUIRED = 211;

/**
 * Error code indicating that a user cannot be linked to an account because
 * that account's id could not be found.
 *
 * @name ParseError.LINKED_ID_MISSING
 * @type {number}
 */
ParseError.LINKED_ID_MISSING = 250;

/**
 * Error code indicating that a user with a linked (e.g. Facebook) account
 * has an invalid session.
 *
 * @name ParseError.INVALID_LINKED_SESSION
 * @type {number}
 */
ParseError.INVALID_LINKED_SESSION = 251;

/**
 * Error code indicating that a service being linked (e.g. Facebook or
 * Twitter) is unsupported.
 *
 * @name ParseError.UNSUPPORTED_SERVICE
 * @type {number}
 */
ParseError.UNSUPPORTED_SERVICE = 252;

/**
 * Error code indicating an invalid operation occured on schema
 *
 * @name ParseError.INVALID_SCHEMA_OPERATION
 * @type {number}
 */
ParseError.INVALID_SCHEMA_OPERATION = 255;

/**
 * Error code indicating that there were multiple errors. Aggregate errors
 * have an "errors" property, which is an array of error objects with more
 * detail about each error that occurred.
 *
 * @name ParseError.AGGREGATE_ERROR
 * @type {number}
 */
ParseError.AGGREGATE_ERROR = 600;

/**
 * Error code indicating the client was unable to read an input file.
 *
 * @name ParseError.FILE_READ_ERROR
 * @type {number}
 */
ParseError.FILE_READ_ERROR = 601;

/**
 * Error code indicating a real error code is unavailable because
 * we had to use an XDomainRequest object to allow CORS requests in
 * Internet Explorer, which strips the body from HTTP responses that have
 * a non-2XX status code.
 *
 * @name ParseError.X_DOMAIN_REQUEST
 * @type {number}
 */
ParseError.X_DOMAIN_REQUEST = 602;

export default ParseError;
