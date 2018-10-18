"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _decode = _interopRequireDefault(require("./decode"));

var _encode = _interopRequireDefault(require("./encode"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _InstallationController = _interopRequireDefault(require("./InstallationController"));

var ParseOp = _interopRequireWildcard(require("./ParseOp"));

var _RESTController = _interopRequireDefault(require("./RESTController"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Contains all Parse API classes and functions.
 * @static
 * @global
 * @class
 * @hideconstructor
 */


var Parse = {
  /**
   * Call this method first to set up your authentication tokens for Parse.
   * You can get your keys from the Data Browser on parse.com.
   * @param {String} applicationId Your Parse Application ID.
   * @param {String} javaScriptKey (optional) Your Parse JavaScript Key (Not needed for parse-server)
   * @param {String} masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @static
   */
  initialize: function (applicationId
  /*: string*/
  , javaScriptKey
  /*: string*/
  ) {
    if ("browser" === 'browser' && _CoreManager.default.get('IS_NODE') && !undefined) {
      /* eslint-disable no-console */
      console.log('It looks like you\'re using the browser version of the SDK in a ' + 'node.js environment. You should require(\'parse/node\') instead.');
      /* eslint-enable no-console */
    }

    Parse._initialize(applicationId, javaScriptKey);
  },
  _initialize: function (applicationId
  /*: string*/
  , javaScriptKey
  /*: string*/
  , masterKey
  /*: string*/
  ) {
    _CoreManager.default.set('APPLICATION_ID', applicationId);

    _CoreManager.default.set('JAVASCRIPT_KEY', javaScriptKey);

    _CoreManager.default.set('MASTER_KEY', masterKey);

    _CoreManager.default.set('USE_MASTER_KEY', false);
  },

  /**
   * Call this method to set your AsyncStorage engine
   * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
   * is not provided at a stable path and changes over versions.
   * @param {AsyncStorage} storage a react native async storage.
   * @static
   */
  setAsyncStorage: function (storage
  /*: any*/
  ) {
    _CoreManager.default.setAsyncStorage(storage);
  }
};
/** These legacy setters may eventually be deprecated **/

/**
 * @member Parse.applicationId
 * @type string
 * @static
 */

Object.defineProperty(Parse, 'applicationId', {
  get: function () {
    return _CoreManager.default.get('APPLICATION_ID');
  },
  set: function (value) {
    _CoreManager.default.set('APPLICATION_ID', value);
  }
});
/**
 * @member Parse.javaScriptKey
 * @type string
 * @static
 */

Object.defineProperty(Parse, 'javaScriptKey', {
  get: function () {
    return _CoreManager.default.get('JAVASCRIPT_KEY');
  },
  set: function (value) {
    _CoreManager.default.set('JAVASCRIPT_KEY', value);
  }
});
/**
 * @member Parse.masterKey
 * @type string
 * @static
 */

Object.defineProperty(Parse, 'masterKey', {
  get: function () {
    return _CoreManager.default.get('MASTER_KEY');
  },
  set: function (value) {
    _CoreManager.default.set('MASTER_KEY', value);
  }
});
/**
 * @member Parse.serverURL
 * @type string
 * @static
 */

Object.defineProperty(Parse, 'serverURL', {
  get: function () {
    return _CoreManager.default.get('SERVER_URL');
  },
  set: function (value) {
    _CoreManager.default.set('SERVER_URL', value);
  }
});
/**
 * @member Parse.liveQueryServerURL
 * @type string
 * @static
 */

Object.defineProperty(Parse, 'liveQueryServerURL', {
  get: function () {
    return _CoreManager.default.get('LIVEQUERY_SERVER_URL');
  },
  set: function (value) {
    _CoreManager.default.set('LIVEQUERY_SERVER_URL', value);
  }
});
/* End setters */

Parse.ACL = require('./ParseACL').default;
Parse.Analytics = require('./Analytics');
Parse.Cloud = require('./Cloud');
Parse.CoreManager = require('./CoreManager');
Parse.Config = require('./ParseConfig').default;
Parse.Error = require('./ParseError').default;
Parse.FacebookUtils = require('./FacebookUtils').default;
Parse.File = require('./ParseFile').default;
Parse.GeoPoint = require('./ParseGeoPoint').default;
Parse.Polygon = require('./ParsePolygon').default;
Parse.Installation = require('./ParseInstallation').default;
Parse.Object = require('./ParseObject').default;
Parse.Op = {
  Set: ParseOp.SetOp,
  Unset: ParseOp.UnsetOp,
  Increment: ParseOp.IncrementOp,
  Add: ParseOp.AddOp,
  Remove: ParseOp.RemoveOp,
  AddUnique: ParseOp.AddUniqueOp,
  Relation: ParseOp.RelationOp
};
Parse.Push = require('./Push');
Parse.Query = require('./ParseQuery').default;
Parse.Relation = require('./ParseRelation').default;
Parse.Role = require('./ParseRole').default;
Parse.Schema = require('./ParseSchema').default;
Parse.Session = require('./ParseSession').default;
Parse.Storage = require('./Storage');
Parse.User = require('./ParseUser').default;
Parse.LiveQuery = require('./ParseLiveQuery').default;
Parse.LiveQueryClient = require('./LiveQueryClient').default;

Parse._request = function () {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _CoreManager.default.getRESTController().request.apply(null, args);
};

Parse._ajax = function () {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _CoreManager.default.getRESTController().ajax.apply(null, args);
}; // We attempt to match the signatures of the legacy versions of these methods


Parse._decode = function (_, value) {
  return (0, _decode.default)(value);
};

Parse._encode = function (value, _, disallowObjects) {
  return (0, _encode.default)(value, disallowObjects);
};

Parse._getInstallationId = function () {
  return _CoreManager.default.getInstallationController().currentInstallationId();
};

_CoreManager.default.setInstallationController(_InstallationController.default);

_CoreManager.default.setRESTController(_RESTController.default);

// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;
module.exports = Parse;