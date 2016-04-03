/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _decode = require('./decode');

var _decode2 = _interopRequireDefault(_decode);

var _encode = require('./encode');

var _encode2 = _interopRequireDefault(_encode);

var _CoreManager = require('./CoreManager');

var _CoreManager2 = _interopRequireDefault(_CoreManager);

var _InstallationController = require('./InstallationController');

var _InstallationController2 = _interopRequireDefault(_InstallationController);

var _ParseOp = require('./ParseOp');

var ParseOp = _interopRequireWildcard(_ParseOp);

var _RESTController = require('./RESTController');

var _RESTController2 = _interopRequireDefault(_RESTController);

/**
 * Contains all Parse API classes and functions.
 * @class Parse
 * @static
 */
var Parse = {
  /**
   * Call this method first to set up your authentication tokens for Parse.
   * You can get your keys from the Data Browser on parse.com.
   * @method initialize
   * @param {String} applicationId Your Parse Application ID.
   * @param {String} javaScriptKey (optional) Your Parse JavaScript Key (Not needed for parse-server)
   * @param {String} masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @static
   */
  initialize: function initialize(applicationId, javaScriptKey) {
    if ('browser' === 'browser' && _CoreManager2['default'].get('IS_NODE')) {
      console.log('It looks like you\'re using the browser version of the SDK in a ' + 'node.js environment. You should require(\'parse/node\') instead.');
    }
    Parse._initialize(applicationId, javaScriptKey);
  },

  _initialize: function _initialize(applicationId, javaScriptKey, masterKey) {
    _CoreManager2['default'].set('APPLICATION_ID', applicationId);
    _CoreManager2['default'].set('JAVASCRIPT_KEY', javaScriptKey);
    _CoreManager2['default'].set('MASTER_KEY', masterKey);
    _CoreManager2['default'].set('USE_MASTER_KEY', false);
  }
};

/** These legacy setters may eventually be deprecated **/
Object.defineProperty(Parse, 'applicationId', {
  get: function get() {
    return _CoreManager2['default'].get('APPLICATION_ID');
  },
  set: function set(value) {
    _CoreManager2['default'].set('APPLICATION_ID', value);
  }
});
Object.defineProperty(Parse, 'javaScriptKey', {
  get: function get() {
    return _CoreManager2['default'].get('JAVASCRIPT_KEY');
  },
  set: function set(value) {
    _CoreManager2['default'].set('JAVASCRIPT_KEY', value);
  }
});
Object.defineProperty(Parse, 'masterKey', {
  get: function get() {
    return _CoreManager2['default'].get('MASTER_KEY');
  },
  set: function set(value) {
    _CoreManager2['default'].set('MASTER_KEY', value);
  }
});
Object.defineProperty(Parse, 'serverURL', {
  get: function get() {
    return _CoreManager2['default'].get('SERVER_URL');
  },
  set: function set(value) {
    _CoreManager2['default'].set('SERVER_URL', value);
  }
});
Object.defineProperty(Parse, 'liveQueryServerURL', {
  get: function get() {
    return _CoreManager2['default'].get('LIVEQUERY_SERVER_URL');
  },
  set: function set(value) {
    _CoreManager2['default'].set('LIVEQUERY_SERVER_URL', value);
  }
});
/** End setters **/

Parse.ACL = require('./ParseACL');
Parse.Analytics = require('./Analytics');
Parse.Cloud = require('./Cloud');
Parse.CoreManager = require('./CoreManager');
Parse.Config = require('./ParseConfig');
Parse.Error = require('./ParseError');
Parse.FacebookUtils = require('./FacebookUtils');
Parse.File = require('./ParseFile');
Parse.GeoPoint = require('./ParseGeoPoint');
Parse.Installation = require('./ParseInstallation');
Parse.Object = require('./ParseObject');
Parse.Op = {
  Set: ParseOp.SetOp,
  Unset: ParseOp.UnsetOp,
  Increment: ParseOp.IncrementOp,
  Add: ParseOp.AddOp,
  Remove: ParseOp.RemoveOp,
  AddUnique: ParseOp.AddUniqueOp,
  Relation: ParseOp.RelationOp
};
Parse.Promise = require('./ParsePromise');
Parse.Push = require('./Push');
Parse.Query = require('./ParseQuery');
Parse.Relation = require('./ParseRelation');
Parse.Role = require('./ParseRole');
Parse.Session = require('./ParseSession');
Parse.Storage = require('./Storage');
Parse.User = require('./ParseUser');
Parse.LiveQuery = require('./ParseLiveQuery');
Parse.LiveQueryClient = require('./LiveQueryClient');

Parse._request = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _CoreManager2['default'].getRESTController().request.apply(null, args);
};
Parse._ajax = function () {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _CoreManager2['default'].getRESTController().ajax.apply(null, args);
};
// We attempt to match the signatures of the legacy versions of these methods
Parse._decode = function (_, value) {
  return (0, _decode2['default'])(value);
};
Parse._encode = function (value, _, disallowObjects) {
  return (0, _encode2['default'])(value, disallowObjects);
};
Parse._getInstallationId = function () {
  return _CoreManager2['default'].getInstallationController().currentInstallationId();
};

_CoreManager2['default'].setInstallationController(_InstallationController2['default']);
_CoreManager2['default'].setRESTController(_RESTController2['default']);

// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;

module.exports = Parse;