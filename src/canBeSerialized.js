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

import ParseFile from './ParseFile';
import ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';

export default function canBeSerialized(obj: ParseObject): boolean {
  if (!(obj instanceof ParseObject)) {
    return true;
  }
  const attributes = obj.attributes;
  for (const attr in attributes) {
    const val = attributes[attr];
    if (!canBeSerializedHelper(val)) {
      return false;
    }
  }
  return true;
}

function canBeSerializedHelper(value: any): boolean {
  if (typeof value !== 'object') {
    return true;
  }
  if (value instanceof ParseRelation) {
    return true;
  }
  if (value instanceof ParseObject) {
    return !!value.id;
  }
  if (value instanceof ParseFile) {
    if (value.url()) {
      return true;
    }
    return false;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!canBeSerializedHelper(value[i])) {
        return false;
      }
    }
    return true;
  }
  for (const k in value) {
    if (!canBeSerializedHelper(value[k])) {
      return false;
    }
  }
  return true;
}
