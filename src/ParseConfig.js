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

import CoreManager from './CoreManager';
import decode from './decode';
import encode from './encode';
import escape from './escape';
import ParseError from './ParseError';
import Storage from './Storage';

import type { RequestOptions } from './RESTController';

/**
 * Parse.Config is a local representation of configuration data that
 * can be set from the Parse dashboard.
 *
 * @alias Parse.Config
 */

class ParseConfig {
  attributes: { [key: string]: any };
  _escapedAttributes: { [key: string]: any };

  constructor() {
    this.attributes = {};
    this._escapedAttributes = {};
  }

  /**
   * Gets the value of an attribute.
   * @param {String} attr The name of an attribute.
   */
  get(attr: string): any {
    return this.attributes[attr];
  }

  /**
   * Gets the HTML-escaped value of an attribute.
   * @param {String} attr The name of an attribute.
   */
  escape(attr: string): string {
    const html = this._escapedAttributes[attr];
    if (html) {
      return html;
    }
    const val = this.attributes[attr];
    let escaped = '';
    if (val != null) {
      escaped = escape(val.toString());
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
    const controller = CoreManager.getConfigController();
    return controller.current();
  }

  /**
   * Gets a new configuration object from the server.
   * @static
   * @param {Object} options
   * Valid options are:<ul>
   *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
   *     be used for this request.
   * </ul>
   * @return {Promise} A promise that is resolved with a newly-created
   *     configuration object when the get completes.
   */
  static get(options: RequestOptions = {}) {
    const controller = CoreManager.getConfigController();
    return controller.get(options);
  }

  /**
   * Save value keys to the server.
   * @static
   * @param {Object} attrs The config parameters and values.
   * @param {Object} masterKeyOnlyFlags The flags that define whether config parameters listed
   * in `attrs` should be retrievable only by using the master key.
   * For example: `param1: true` makes `param1` only retrievable by using the master key.
   * If a parameter is not provided or set to `false`, it can be retrieved without
   * using the master key.
   * @return {Promise} A promise that is resolved with a newly-created
   *     configuration object or with the current with the update.
   */
  static save(attrs: { [key: string]: any }, masterKeyOnlyFlags: { [key: string]: any }) {
    const controller = CoreManager.getConfigController();
    //To avoid a mismatch with the local and the cloud config we get a new version
    return controller.save(attrs, masterKeyOnlyFlags).then(() => {
      return controller.get({ useMasterKey: true });
    },(error) => {
      return Promise.reject(error);
    });
  }
}

let currentConfig = null;

const CURRENT_CONFIG_KEY = 'currentConfig';

function decodePayload(data) {
  try {
    const json = JSON.parse(data);
    if (json && typeof json === 'object') {
      return decode(json);
    }
  } catch(e) {
    return null;
  }
}

const DefaultController = {
  current() {
    if (currentConfig) {
      return currentConfig;
    }

    const config = new ParseConfig();
    const storagePath = Storage.generatePath(CURRENT_CONFIG_KEY);
    let configData;
    if (!Storage.async()) {
      configData = Storage.getItem(storagePath);

      if (configData) {
        const attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    }
    // Return a promise for async storage controllers
    return Storage.getItemAsync(storagePath).then((configData) => {
      if (configData) {
        const attributes = decodePayload(configData);
        if (attributes) {
          config.attributes = attributes;
          currentConfig = config;
        }
      }
      return config;
    });
  },

  get(options: RequestOptions = {}) {
    const RESTController = CoreManager.getRESTController();

    return RESTController.request(
      'GET', 'config', {}, options
    ).then((response) => {
      if (!response || !response.params) {
        const error = new ParseError(
          ParseError.INVALID_JSON,
          'Config JSON response invalid.'
        );
        return Promise.reject(error);
      }

      const config = new ParseConfig();
      config.attributes = {};
      for (const attr in response.params) {
        config.attributes[attr] = decode(response.params[attr]);
      }
      currentConfig = config;
      return Storage.setItemAsync(
        Storage.generatePath(CURRENT_CONFIG_KEY),
        JSON.stringify(response.params)
      ).then(() => {
        return config;
      });
    });
  },

  save(attrs: { [key: string]: any }, masterKeyOnlyFlags: { [key: string]: any }) {
    const RESTController = CoreManager.getRESTController();
    const encodedAttrs = {};
    for(const key in attrs){
      encodedAttrs[key] = encode(attrs[key])
    }
    return RESTController.request(
      'PUT',
      'config',
      { params: encodedAttrs, masterKeyOnly: masterKeyOnlyFlags },
      { useMasterKey: true }
    ).then(response => {
      if(response && response.result){
        return Promise.resolve()
      } else {
        const error = new ParseError(
          ParseError.INTERNAL_SERVER_ERROR,
          'Error occured updating Config.'
        );
        return Promise.reject(error)
      }
    })
  }
};

CoreManager.setConfigController(DefaultController);

export default ParseConfig;
