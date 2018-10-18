"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _ParseError = _interopRequireDefault(require("./ParseError"));
/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

/* global XMLHttpRequest, XDomainRequest */


var XHR = null;

if (typeof XMLHttpRequest !== 'undefined') {
  XHR = XMLHttpRequest;
}

var useXDomainRequest = false;

if (typeof XDomainRequest !== 'undefined' && !('withCredentials' in new XMLHttpRequest())) {
  useXDomainRequest = true;
}

function ajaxIE9(method
/*: string*/
, url
/*: string*/
, data
/*: any*/
) {
  return new Promise(function (resolve, reject) {
    var xdr = new XDomainRequest();

    xdr.onload = function () {
      var response;

      try {
        response = JSON.parse(xdr.responseText);
      } catch (e) {
        reject(e);
      }

      if (response) {
        resolve({
          response: response
        });
      }
    };

    xdr.onerror = xdr.ontimeout = function () {
      // Let's fake a real error message.
      var fakeResponse = {
        responseText: JSON.stringify({
          code: _ParseError.default.X_DOMAIN_REQUEST,
          error: 'IE\'s XDomainRequest does not supply error info.'
        })
      };
      reject(fakeResponse);
    };

    xdr.onprogress = function () {};

    xdr.open(method, url);
    xdr.send(data);
  });
}

var RESTController = {
  ajax: function (method
  /*: string*/
  , url
  /*: string*/
  , data
  /*: any*/
  , headers
  /*:: ?: any*/
  ) {
    if (useXDomainRequest) {
      return ajaxIE9(method, url, data, headers);
    }

    var res, rej;
    var promise = new Promise(function (resolve, reject) {
      res = resolve;
      rej = reject;
    });
    promise.resolve = res;
    promise.reject = rej;
    var attempts = 0;

    var dispatch = function dispatch() {
      if (XHR == null) {
        throw new Error('Cannot make a request: No definition of XMLHttpRequest was found.');
      }

      var handled = false;
      var xhr = new XHR();

      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || handled) {
          return;
        }

        handled = true;

        if (xhr.status >= 200 && xhr.status < 300) {
          var response;

          try {
            response = JSON.parse(xhr.responseText);

            if (typeof xhr.getResponseHeader === 'function') {
              if ((xhr.getAllResponseHeaders() || '').includes('x-parse-job-status-id: ')) {
                response = xhr.getResponseHeader('x-parse-job-status-id');
              }
            }
          } catch (e) {
            promise.reject(e.toString());
          }

          if (response) {
            promise.resolve({
              response: response,
              status: xhr.status,
              xhr: xhr
            });
          }
        } else if (xhr.status >= 500 || xhr.status === 0) {
          // retry on 5XX or node-xmlhttprequest error
          if (++attempts < _CoreManager.default.get('REQUEST_ATTEMPT_LIMIT')) {
            // Exponentially-growing random delay
            var delay = Math.round(Math.random() * 125 * Math.pow(2, attempts));
            setTimeout(dispatch, delay);
          } else if (xhr.status === 0) {
            promise.reject('Unable to connect to the Parse API');
          } else {
            // After the retry limit is reached, fail
            promise.reject(xhr);
          }
        } else {
          promise.reject(xhr);
        }
      };

      headers = headers || {};

      if (typeof headers['Content-Type'] !== 'string') {
        headers['Content-Type'] = 'text/plain'; // Avoid pre-flight
      }

      if (_CoreManager.default.get('IS_NODE')) {
        headers['User-Agent'] = 'Parse/' + _CoreManager.default.get('VERSION') + ' (NodeJS ' + process.versions.node + ')';
      }

      xhr.open(method, url, true);

      for (var h in headers) {
        xhr.setRequestHeader(h, headers[h]);
      }

      xhr.send(data);
    };

    dispatch();
    return promise;
  },
  request: function (method
  /*: string*/
  , path
  /*: string*/
  , data
  /*: mixed*/
  , options
  /*:: ?: RequestOptions*/
  ) {
    options = options || {};

    var url = _CoreManager.default.get('SERVER_URL');

    if (url[url.length - 1] !== '/') {
      url += '/';
    }

    url += path;
    var payload = {};

    if (data && (0, _typeof2.default)(data) === 'object') {
      for (var k in data) {
        payload[k] = data[k];
      }
    }

    if (method !== 'POST') {
      payload._method = method;
      method = 'POST';
    }

    payload._ApplicationId = _CoreManager.default.get('APPLICATION_ID');

    var jsKey = _CoreManager.default.get('JAVASCRIPT_KEY');

    if (jsKey) {
      payload._JavaScriptKey = jsKey;
    }

    payload._ClientVersion = _CoreManager.default.get('VERSION');
    var useMasterKey = options.useMasterKey;

    if (typeof useMasterKey === 'undefined') {
      useMasterKey = _CoreManager.default.get('USE_MASTER_KEY');
    }

    if (useMasterKey) {
      if (_CoreManager.default.get('MASTER_KEY')) {
        delete payload._JavaScriptKey;
        payload._MasterKey = _CoreManager.default.get('MASTER_KEY');
      } else {
        throw new Error('Cannot use the Master Key, it has not been provided.');
      }
    }

    if (_CoreManager.default.get('FORCE_REVOCABLE_SESSION')) {
      payload._RevocableSession = '1';
    }

    var installationId = options.installationId;
    var installationIdPromise;

    if (installationId && typeof installationId === 'string') {
      installationIdPromise = Promise.resolve(installationId);
    } else {
      var installationController = _CoreManager.default.getInstallationController();

      installationIdPromise = installationController.currentInstallationId();
    }

    return installationIdPromise.then(function (iid) {
      payload._InstallationId = iid;

      var userController = _CoreManager.default.getUserController();

      if (options && typeof options.sessionToken === 'string') {
        return Promise.resolve(options.sessionToken);
      } else if (userController) {
        return userController.currentUserAsync().then(function (user) {
          if (user) {
            return Promise.resolve(user.getSessionToken());
          }

          return Promise.resolve(null);
        });
      }

      return Promise.resolve(null);
    }).then(function (token) {
      if (token) {
        payload._SessionToken = token;
      }

      var payloadString = JSON.stringify(payload);
      return RESTController.ajax(method, url, payloadString).then(function (_ref) {
        var response = _ref.response;
        return response;
      });
    }).catch(function (response
    /*: { responseText: string }*/
    ) {
      // Transform the error into an instance of ParseError by trying to parse
      // the error string as JSON
      var error;

      if (response && response.responseText) {
        try {
          var errorJSON = JSON.parse(response.responseText);
          error = new _ParseError.default(errorJSON.code, errorJSON.error);
        } catch (e) {
          // If we fail to parse the error text, that's okay.
          error = new _ParseError.default(_ParseError.default.INVALID_JSON, 'Received an error with invalid JSON from Parse: ' + response.responseText);
        }
      } else {
        error = new _ParseError.default(_ParseError.default.CONNECTION_FAILED, 'XMLHttpRequest failed: ' + JSON.stringify(response));
      }

      return Promise.reject(error);
    });
  },
  _setXHR: function (xhr
  /*: any*/
  ) {
    XHR = xhr;
  }
};
module.exports = RESTController;