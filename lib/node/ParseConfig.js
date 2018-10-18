"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

var _decode = _interopRequireDefault(require("./decode"));

var _escape = _interopRequireDefault(require("./escape"));

var _ParseError = _interopRequireDefault(require("./ParseError"));

var _Storage = _interopRequireDefault(require("./Storage"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
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


class ParseConfig {
  /*:: attributes: { [key: string]: any };*/

  /*:: _escapedAttributes: { [key: string]: any };*/
  constructor() {
    this.attributes = {};
    this._escapedAttributes = {};
  }
  /**
   * Gets the value of an attribute.
   * @param {String} attr The name of an attribute.
   */


  get(attr
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


  escape(attr
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
      escaped = (0, _escape.default)(val.toString());
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


  static current() {
    var controller = _CoreManager.default.getConfigController();

    return controller.current();
  }
  /**
   * Gets a new configuration object from the server.
   * @static
   * @return {Promise} A promise that is resolved with a newly-created
   *     configuration object when the get completes.
   */


  static get() {
    var controller = _CoreManager.default.getConfigController();

    return controller.get();
  }

}

var currentConfig = null;
var CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    var json = JSON.parse(data);

    if (json && typeof json === 'object') {
      return (0, _decode.default)(json);
    }
  } catch (e) {
    return null;
  }
}

var DefaultController = {
  current() {
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


    return _Storage.default.getItemAsync(storagePath).then(configData => {
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

  get() {
    var RESTController = _CoreManager.default.getRESTController();

    return RESTController.request('GET', 'config', {}, {}).then(response => {
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
      return _Storage.default.setItemAsync(_Storage.default.generatePath(CURRENT_CONFIG_KEY), JSON.stringify(response.params)).then(() => {
        return config;
      });
    });
  }

};

_CoreManager.default.setConfigController(DefaultController);

var _default = ParseConfig;
exports.default = _default;