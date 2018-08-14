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

/* global localStorage */

import CoreManager from './CoreManager';

import type ParseObject from './ParseObject';

const DEFAULT_PIN = '_default';
const PIN_PREFIX = 'parsePin_';

const LocalDatastore = {
  fromPinWithName(name: string) {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.fromPinWithName(name);
  },

  pinWithName(name: string, value: any) {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.pinWithName(name, value);
  },

  unPinWithName(name: string) {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.unPinWithName(name);
  },

  _getLocalDatastore() {
    const controller = CoreManager.getLocalDatastoreController();
    return controller.getLocalDatastore();
  },

  _clear(): void {
    const controller = CoreManager.getLocalDatastoreController();
    controller.clear();
  },

  _handlePinWithName(name: string, object: ParseObject) {
    const pinName = this.getPinName(name);
    const objects = this._getChildren(object);
    objects[object._getId()] = object._toFullJSON();
    for (const objectId in objects) {
      this.pinWithName(objectId, objects[objectId]);
    }
    const pinned = this.fromPinWithName(pinName) || [];
    const objectIds = Object.keys(objects);
    const toPin = [...new Set([...pinned, ...objectIds])];
    this.pinWithName(pinName, toPin);
  },

  _handleUnPinWithName(name: string, object: ParseObject) {
    const pinName = this.getPinName(name);
    const objects = this._getChildren(object);
    const objectIds = Object.keys(objects);
    objectIds.push(object._getId());
    let pinned = this.fromPinWithName(pinName) || [];
    pinned = pinned.filter(item => !objectIds.includes(item));
    if (pinned.length == 0) {
      this.unPinWithName(pinName);
    } else {
      this.pinWithName(pinName, pinned);
    }
  },

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
      encountered[object.objectId] = object;
    }
    for (const key in object) {
      if (object[key].__type && object[key].__type === 'Object') {
        this._traverse(object[key], encountered);
      }
    }
  },

  _serializeObjectsFromPinName(name: string) {
    const localDatastore = this._getLocalDatastore();
    const allObjects = [];
    for (const key in localDatastore) {
      if (key !== DEFAULT_PIN && !key.startsWith(PIN_PREFIX)) {
        allObjects.push(localDatastore[key]);
      }
    }
    if (!name) {
      return allObjects;
    }
    const pinName = this.getPinName(name);
    const pinned = this.fromPinWithName(pinName);
    if (!Array.isArray(pinned)) {
      return [];
    }
    return pinned.map((objectId) => this.fromPinWithName(objectId));
  },

  _updateObjectIfPinned(object: ParseObject) {
    if (!this.isEnabled) {
      return;
    }
    const pinned = this.fromPinWithName(object.id);
    if (pinned) {
      this.pinWithName(object.id, object._toFullJSON());
    }
  },

  _destroyObjectIfPinned(object: ParseObject) {
    if (!this.isEnabled) {
      return;
    }
    const pin = this.fromPinWithName(object.id);
    if (!pin) {
      return;
    }
    this.unPinWithName(object.id);
    const localDatastore = this._getLocalDatastore();
    for (const key in localDatastore) {
      if (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX)) {
        let pinned = this.fromPinWithName(key) || [];
        if (pinned.includes(object.id)) {
          pinned = pinned.filter(item => item !== object.id);
          if (pinned.length == 0) {
            this.unPinWithName(key);
          } else {
            this.pinWithName(key, pinned);
          }
        }
      }
    }
  },

  _updateLocalIdForObjectId(localId, objectId) {
    const unsaved = this.fromPinWithName(localId);
    if (!unsaved) {
      return;
    }
    this.unPinWithName(localId);
    this.pinWithName(objectId, unsaved);

    const localDatastore = this._getLocalDatastore();

    for (const key in localDatastore) {
      if (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX)) {
        let pinned = this.fromPinWithName(key) || [];
        if (pinned.includes(localId)) {
          pinned = pinned.filter(item => item !== localId);
          pinned.push(objectId);
          this.pinWithName(key, pinned);
        }
      }
    }
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

function isLocalStorageEnabled() {
  const item = 'parse_is_localstorage_enabled';
  try {
    localStorage.setItem(item, item);
    localStorage.removeItem(item);
    return true;
  } catch (e) {
    return false;
  }
}
LocalDatastore.DEFAULT_PIN = DEFAULT_PIN;
LocalDatastore.PIN_PREFIX = PIN_PREFIX;
LocalDatastore.isLocalStorageEnabled = isLocalStorageEnabled;
LocalDatastore.isEnabled = false;
module.exports = LocalDatastore;

if (isLocalStorageEnabled()) {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.localStorage'));
} else {
  CoreManager.setLocalDatastoreController(require('./LocalDatastoreController.default'));
}
CoreManager.setLocalDatastore(LocalDatastore);
