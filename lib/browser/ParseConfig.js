"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _decode = _interopRequireDefault(require("./decode"));

var _escape2 = _interopRequireDefault(require("./escape"));

var _ParseError = _interopRequireDefault(require("./ParseError"));

var _Storage = _interopRequireDefault(require("./Storage"));
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

/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @alias Parse.Config
 */


var ParseConfig =
/*#__PURE__*/
function () {
  function ParseConfig() {
    (0, _classCallCheck2.default)(this, ParseConfig);
    (0, _defineProperty2.default)(this, "attributes", void 0);
    (0, _defineProperty2.default)(this, "_escapedAttributes", void 0);
    this.attributes = {};
    this._escapedAttributes = {};
  }
  /**
   * Gets the value of an attribute.
   * @param {String} attr The name of an attribute.
   */


  (0, _createClass2.default)(ParseConfig, [{
    key: "get",
    value: function (attr
    /*: string*/
    )
    /*: any*/
    {
      return this.attributes[attr];
    }
    /**
     * Gets the HTML-escaped value of an attribute.
     * @param {String} attr The name of an attribute.
     */

  }, {
    key: "escape",
    value: function (attr
    /*: string*/
    )
    /*: string*/
    {
      var html = this._escapedAttributes[attr];

      if (html) {
        return html;
      }

      var val = this.attributes[attr];
      var escaped = '';

      if (val != null) {
        escaped = (0, _escape2.default)(val.toString());
      }

      this._escapedAttributes[attr] = escaped;
      return escaped;
    }
    /**
     * Retrieves the most recently-fetched configuration object, either from
     * memory or from local storage if necessary.
     *
     * @static
     * @return {Config} The most recently-fetched Parse.Config if it
     *     exists, else an empty Parse.Config.
     */

  }], [{
    key: "current",
    value: function () {
      var controller = _CoreManager.default.getConfigController();

      return controller.current();
    }
    /**
     * Gets a new configuration object from the server.
     * @static
     * @return {Promise} A promise that is resolved with a newly-created
     *     configuration object when the get completes.
     */

  }, {
    key: "get",
    value: function () {
      var controller = _CoreManager.default.getConfigController();

      return controller.get();
    }
  }]);
  return ParseConfig;
}();

var currentConfig = null;
var CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    var json = JSON.parse(data);

    if (json && (0, _typeof2.default)(json) === 'object') {
      return (0, _decode.default)(json);
    }
  } catch (e) {
    return null;
  }
}

var DefaultController = {
  current: function () {
    if (currentConfig) {
      return currentConfig;
    }

    var config = new ParseConfig();

    var storagePath = _Storage.default.generatePath(CURRENT_CONFIG_KEY);

    var configData;

    if (!_Storage.default.async()) {
      configData = _Storage.default.getItem(storagePath);

      if (configData) {
        var attributes = decodePayload(configData);

        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }

      return config;
    } // Return a promise for async storage controllers


    return _Storage.default.getItemAsync(storagePath).then(function (configData) {
      if (configData) {
        var attributes = decodePayload(configData);

        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }

      return config;
    });
  },
  get: function () {
    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('GET', 'config', {}, {}).then(function (response) {
      if (!response || !response.params) {
        var error = new _ParseError.default(_ParseError.default.INVALID_JSON, 'Config JSON response invalid.');
        return Promise.reject(error);
      }

      var config = new ParseConfig();
      config.attributes = {};

      for (var attr in response.params) {
        config.attributes[attr] = (0, _decode.default)(response.params[attr]);
      }

      currentConfig = config;
      return _Storage.default.setItemAsync(_Storage.default.generatePath(CURRENT_CONFIG_KEY), JSON.stringify(response.params)).then(function () {
        return config;
      });
    });
  }
};

_CoreManager.default.setConfigController(DefaultController);

var _default = ParseConfig;
exports.default = _default;