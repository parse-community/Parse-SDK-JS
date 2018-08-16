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

import type ParseObject from './ParseObject';

const DEFAULT_PIN = '_default';
const PIN_PREFIX = 'parsePin_';

const LocalDatastore = {
  fromPinWithName(name: string): Promise {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.fromPinWithName(name);
  },

  pinWithName(name: string, value: any): Promise {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.pinWithName(name, value);
  },

  unPinWithName(name: string): Promise {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.unPinWithName(name);
  },

  _getAllContents(): Promise {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.getAllContents();
  },

  _clear(): Promise {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.clear();
  },

  // Pin the object and children recursively
  // Saves the object and children key to Pin Name
  async _handlePinWithName(name: string, object: ParseObject): Promise {
    const pinName = this.getPinName(name);
    const objects = this._getChildren(object);
    objects[this.getKeyForObject(object)] = object._toFullJSON();
    for (const objectKey in objects) {
      await this.pinWithName(objectKey, objects[objectKey]);
    }
    const pinned = await this.fromPinWithName(pinName) || [];
    const objectIds = Object.keys(objects);
    const toPin = [...new Set([...pinned, ...objectIds])];
    await this.pinWithName(pinName, toPin);
  },

  // Removes object and children keys from pin name
  // Keeps the object and children pinned
  async _handleUnPinWithName(name: string, object: ParseObject) {
    const pinName = this.getPinName(name);
    const objects = this._getChildren(object);
    const objectIds = Object.keys(objects);
    objectIds.push(this.getKeyForObject(object));
    let pinned = await this.fromPinWithName(pinName) || [];
    pinned = pinned.filter(item => !objectIds.includes(item));
    if (pinned.length == 0) {
      await this.unPinWithName(pinName);
    } else {
      await this.pinWithName(pinName, pinned);
    }
  },

  // Retrieve all pointer fields from object recursively
  _getChildren(object: ParseObject) {
    const encountered = {};
    const json = object._toFullJSON();
    for (const key in json) {
      if (json[key].__type && json[key].__type === 'Object') {
        this._traverse(json[key], encountered);
      }
    }
    return encountered;
  },

  _traverse(object: any, encountered: any) {
    if (!object.objectId) {
      return;
    } else {
      const objectKey = this.getKeyForObject(object);
      encountered[objectKey] = object;
    }
    for (const key in object) {
      if (object[key].__type && object[key].__type === 'Object') {
        this._traverse(object[key], encountered);
      }
    }
  },

  // Transform keys in pin name to objects
  // TODO: Transform children?
  async _serializeObjectsFromPinName(name: string) {
    const localDatastore = await this._getAllContents();
    const allObjects = [];
    for (const key in localDatastore) {
      if (key !== DEFAULT_PIN && !key.startsWith(PIN_PREFIX)) {
        allObjects.push(localDatastore[key]);
      }
    }
    if (!name) {
      return Promise.resolve(allObjects);
    }
    const pinName = await this.getPinName(name);
    const pinned = await this.fromPinWithName(pinName);
    if (!Array.isArray(pinned)) {
      return Promise.resolve([]);
    }
    const objects = pinned.map(async (objectKey) => await this.fromPinWithName(objectKey));
    return Promise.all(objects);
  },

  // Called when an object is save / fetched
  // Update object pin value
  async _updateObjectIfPinned(object: ParseObject) {
    if (!this.isEnabled) {
      return;
    }
    const objectKey = this.getKeyForObject(object);
    const pinned = await this.fromPinWithName(objectKey);
    if (pinned) {
      await this.pinWithName(objectKey, object._toFullJSON());
    }
  },

  // Called when object is destroyed
  // Unpin object and remove all references from pin names
  // TODO: Destroy children?
  async _destroyObjectIfPinned(object: ParseObject) {
    if (!this.isEnabled) {
      return;
    }
    const objectKey = this.getKeyForObject(object);
    const pin = await this.fromPinWithName(objectKey);
    if (!pin) {
      return;
    }
    await this.unPinWithName(objectKey);
    const localDatastore = await this._getAllContents();
    for (const key in localDatastore) {
      if (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX)) {
        let pinned = await this.fromPinWithName(key) || [];
        if (pinned.includes(objectKey)) {
          pinned = pinned.filter(item => item !== objectKey);
          if (pinned.length == 0) {
            await this.unPinWithName(key);
          } else {
            await this.pinWithName(key, pinned);
          }
        }
      }
    }
  },

  // Update pin and references of the unsaved object
  async _updateLocalIdForObject(localId, object: ParseObject) {
    if (!this.isEnabled) {
      return;
    }
    const localKey = `${object.className}_${localId}`;
    const objectKey = this.getKeyForObject(object);

    const unsaved = await this.fromPinWithName(localKey);
    if (!unsaved) {
      return;
    }
    await this.unPinWithName(localKey);
    await this.pinWithName(objectKey, unsaved);

    const localDatastore = await this._getAllContents();

    for (const key in localDatastore) {
      if (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX)) {
        let pinned = await this.fromPinWithName(key) || [];
        if (pinned.includes(localKey)) {
          pinned = pinned.filter(item => item !== localKey);
          pinned.push(objectKey);
          await this.pinWithName(key, pinned);
        }
      }
    }
  },

  getKeyForObject(object: any) {
    const objectId = object.objectId || object._getId();
    return `${object.className}_${objectId}`;
  },

  getPinName(pinName: ?string) {
    if (!pinName || pinName === DEFAULT_PIN) {
      return DEFAULT_PIN;
    }
    return PIN_PREFIX + pinName;
  },

  checkIfEnabled() {
    if (!this.isEnabled) {
      console.log('Parse.enableLocalDatastore() must be called first'); // eslint-disable-line no-console
    }
    return this.isEnabled;
  }
};

LocalDatastore.DEFAULT_PIN = DEFAULT_PIN;
LocalDatastore.PIN_PREFIX = PIN_PREFIX;
LocalDatastore.isEnabled = false;

module.exports = LocalDatastore;

if (process.env.PARSE_BUILD === 'react-native') {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.react-native'));
} else if (process.env.PARSE_BUILD === 'browser') {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.browser'));
} else {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.default'));
}
CoreManager.setLocalDatastore(LocalDatastore);
