/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

import decode from './decode';
import encode from './encode';
import CoreManager from './CoreManager';
import CryptoController from './CryptoController';
import InstallationController from './InstallationController';
import * as ParseOp from './ParseOp';
import RESTController from './RESTController';

/**
 * Contains all Parse API classes and functions.
 * @static
 * @global
 * @class
 * @hideconstructor
 */
const Parse = {
  /**
   * Call this method first to set up your authentication tokens for Parse.
   * You can get your keys from the Data Browser on parse.com.
   * @param {String} applicationId Your Parse Application ID.
   * @param {String} javaScriptKey (optional) Your Parse JavaScript Key (Not needed for parse-server)
   * @param {String} masterKey (optional) Your Parse Master Key. (Node.js only!)
   * @static
   */
  initialize(applicationId: string, javaScriptKey: string) {
    if (process.env.PARSE_BUILD === 'browser' && CoreManager.get('IS_NODE') && !process.env.SERVER_RENDERING) {
      /* eslint-disable no-console */
      console.log(
        'It looks like you\'re using the browser version of the SDK in a ' +
        'node.js environment. You should require(\'parse/node\') instead.'
      );
      /* eslint-enable no-console */
    }
    Parse._initialize(applicationId, javaScriptKey);
  },

  _initialize(applicationId: string, javaScriptKey: string, masterKey: string) {
    CoreManager.set('APPLICATION_ID', applicationId);
    CoreManager.set('JAVASCRIPT_KEY', javaScriptKey);
    CoreManager.set('MASTER_KEY', masterKey);
    CoreManager.set('USE_MASTER_KEY', false);
  },

  /**
   * Call this method to set your AsyncStorage engine
   * Starting Parse@1.11, the ParseSDK do not provide a React AsyncStorage as the ReactNative module
   * is not provided at a stable path and changes over versions.
   * @param {AsyncStorage} storage a react native async storage.
   * @static
   */
  setAsyncStorage(storage: any) {
    CoreManager.setAsyncStorage(storage);
  },

  /**
   * Call this method to set your LocalDatastoreStorage engine
   * If using React-Native use {@link Parse.setAsyncStorage Parse.setAsyncStorage()}
   * @param {LocalDatastoreController} controller a data storage.
   * @static
   */
  setLocalDatastoreController(controller: any) {
    CoreManager.setLocalDatastoreController(controller);
  }
};

/** These legacy setters may eventually be deprecated **/
/**
 * @member Parse.applicationId
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'applicationId', {
  get() {
    return CoreManager.get('APPLICATION_ID');
  },
  set(value) {
    CoreManager.set('APPLICATION_ID', value);
  }
});

/**
 * @member Parse.javaScriptKey
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'javaScriptKey', {
  get() {
    return CoreManager.get('JAVASCRIPT_KEY');
  },
  set(value) {
    CoreManager.set('JAVASCRIPT_KEY', value);
  }
});

/**
 * @member Parse.masterKey
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'masterKey', {
  get() {
    return CoreManager.get('MASTER_KEY');
  },
  set(value) {
    CoreManager.set('MASTER_KEY', value);
  }
});

/**
 * @member Parse.serverURL
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'serverURL', {
  get() {
    return CoreManager.get('SERVER_URL');
  },
  set(value) {
    CoreManager.set('SERVER_URL', value);
  }
});

/**
 * @member Parse.serverAuthToken
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'serverAuthToken', {
  get() {
    return CoreManager.get('SERVER_AUTH_TOKEN');
  },
  set(value) {
    CoreManager.set('SERVER_AUTH_TOKEN', value);
  }
});

/**
 * @member Parse.serverAuthType
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'serverAuthType', {
  get() {
    return CoreManager.get('SERVER_AUTH_TYPE');
  },
  set(value) {
    CoreManager.set('SERVER_AUTH_TYPE', value);
  }
});

/**
 * @member Parse.liveQueryServerURL
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'liveQueryServerURL', {
  get() {
    return CoreManager.get('LIVEQUERY_SERVER_URL');
  },
  set(value) {
    CoreManager.set('LIVEQUERY_SERVER_URL', value);
  }
});

/**
 * @member Parse.encryptedUser
 * @type boolean
 * @static
 */
Object.defineProperty(Parse, 'encryptedUser', {
  get() {
    return CoreManager.get('ENCRYPTED_USER');
  },
  set(value) {
    CoreManager.set('ENCRYPTED_USER', value);
  }
});

/**
 * @member Parse.secret
 * @type string
 * @static
 */
Object.defineProperty(Parse, 'secret', {
  get() {
    return CoreManager.get('ENCRYPTED_KEY');
  },
  set(value) {
    CoreManager.set('ENCRYPTED_KEY', value);
  }
});
/* End setters */

Parse.ACL = require('./ParseACL').default;
Parse.Analytics = require('./Analytics');
Parse.AnonymousUtils = require('./AnonymousUtils').default;
Parse.Cloud = require('./Cloud');
Parse.CoreManager = require('./CoreManager');
Parse.Config = require('./ParseConfig').default;
Parse.Error = require('./ParseError').default;
Parse.FacebookUtils = require('./FacebookUtils').default;
Parse.File = require('./ParseFile').default;
Parse.GeoPoint = require('./ParseGeoPoint').default;
Parse.Polygon = require('./ParsePolygon').default;
Parse.Installation = require('./ParseInstallation').default;
Parse.LocalDatastore = require('./LocalDatastore');
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

Parse._request = function(...args) {
  return CoreManager.getRESTController().request.apply(null, args);
};
Parse._ajax = function(...args) {
  return CoreManager.getRESTController().ajax.apply(null, args);
};
// We attempt to match the signatures of the legacy versions of these methods
Parse._decode = function(_, value) {
  return decode(value);
}
Parse._encode = function(value, _, disallowObjects) {
  return encode(value, disallowObjects);
}
Parse._getInstallationId = function() {
  return CoreManager.getInstallationController().currentInstallationId();
}
/**
 * Enable pinning in your application.
 * This must be called before your application can use pinning.
 *
 * @static
 */
Parse.enableLocalDatastore = function() {
  Parse.LocalDatastore.isEnabled = true;
}
/**
 * Flag that indicates whether Local Datastore is enabled.
 *
 * @static
 */
Parse.isLocalDatastoreEnabled = function() {
  return Parse.LocalDatastore.isEnabled;
}
/**
 * Gets all contents from Local Datastore
 *
 * <pre>
 * await Parse.dumpLocalDatastore();
 * </pre>
 *
 * @static
 */
Parse.dumpLocalDatastore = function() {
  if (!Parse.LocalDatastore.isEnabled) {
    console.log('Parse.enableLocalDatastore() must be called first'); // eslint-disable-line no-console
    return Promise.resolve({});
  } else {
    return Parse.LocalDatastore._getAllContents();
  }
}

/**
 * Enable the current user encryption.
 * This must be called before login any user.
 *
 * @static
 */
Parse.enableEncryptedUser = function() {
  Parse.encryptedUser = true;
}

/**
 * Flag that indicates whether Encrypted User is enabled.
 *
 * @static
 */
Parse.isEncryptedUserEnabled = function() {
  return Parse.encryptedUser;
}

CoreManager.setCryptoController(CryptoController);
CoreManager.setInstallationController(InstallationController);
CoreManager.setRESTController(RESTController);

if (process.env.PARSE_BUILD === 'node') {
  Parse.initialize = Parse._initialize;
  Parse.Cloud = Parse.Cloud || {};
  Parse.Cloud.useMasterKey = function() {
    CoreManager.set('USE_MASTER_KEY', true);
  }
  Parse.Hooks = require('./ParseHooks');
}

// For legacy requires, of the form `var Parse = require('parse').Parse`
Parse.Parse = Parse;

module.exports = Parse;
