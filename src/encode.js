/**
 * @flow
 */

import ParseACL from './ParseACL';
import ParseFile from './ParseFile';
import ParseGeoPoint from './ParseGeoPoint';
import ParsePolygon from './ParsePolygon';
import ParseObject from './ParseObject';
import { Op } from './ParseOp';
import ParseRelation from './ParseRelation';
import { cyrb53 } from './CryptoUtils';

const MAX_RECURSIVE_CALLS = 999;

function encode(
  value: mixed,
  disallowObjects: boolean,
  forcePointers: boolean,
  seen: Array<mixed>,
  offline: boolean,
  counter: number,
  initialValue: mixed
): any {
  counter++;

  if (counter > MAX_RECURSIVE_CALLS) {
    const message = 'Encoding object failed due to high number of recursive calls, likely caused by circular reference within object.';
    console.error(message);
    console.error('Value causing potential infinite recursion:', initialValue);

    throw new Error(message);
  }

  if (value instanceof ParseObject) {
    if (disallowObjects) {
      throw new Error('Parse Objects not allowed here');
    }
    const entryIdentifier = value.id ? value.className + ':' + value.id : value;
    if (
      forcePointers ||
      seen.includes(entryIdentifier) ||
      value.dirty() ||
      Object.keys(value._getServerData()).length === 0
    ) {
      if (offline && value._getId().startsWith('local')) {
        return value.toOfflinePointer();
      }
      return value.toPointer();
    }
    seen.push(entryIdentifier);
    return value._toFullJSON(seen, offline);
  } else if (
    value instanceof Op ||
    value instanceof ParseACL ||
    value instanceof ParseGeoPoint ||
    value instanceof ParsePolygon ||
    value instanceof ParseRelation
  ) {
    return value.toJSON();
  } else if (value instanceof ParseFile) {
    if (!value.url()) {
      throw new Error('Tried to encode an unsaved file.');
    }
    return value.toJSON();
  } else if (Object.prototype.toString.call(value) === '[object Date]') {
    if (isNaN(value)) {
      throw new Error('Tried to encode an invalid date.');
    }
    return { __type: 'Date', iso: (value: any).toJSON() };
  } else if (
    Object.prototype.toString.call(value) === '[object RegExp]' &&
    typeof value.source === 'string'
  ) {
    return value.source;
  } else if (Array.isArray(value)) {
    return value.map(v => encode(v, disallowObjects, forcePointers, seen, offline, counter, initialValue));
  } else if (value && typeof value === 'object') {
    const output = {};
    for (const k in value) {
      try {
        // Attempts to get the name of the object's constructor
        // Ref: https://stackoverflow.com/a/332429/6456163
        const name = value[k].name || value[k].constructor.name;
        if (name && name != "undefined") {
          if (seen.includes(name)) {
            output[k] = value[k];
            continue;
          } else {
            seen.push(name);
          }
        }
      } catch (e) {
        // Support anonymous functions by hashing the function body,
        // preventing infinite recursion in the case of circular references
        if (value[k] instanceof Function) {
          const funcString = value[k].toString();
          if (seen.includes(funcString)) {
            output[k] = value[k];
            continue;
          } else {
            const hash = cyrb53(funcString);
            seen.push(hash);
          }
        }
      }
      output[k] = encode(value[k], disallowObjects, forcePointers, seen, offline, counter, initialValue);
    }
    return output;
  } else {
    return value;
  }
}

export default function (
  value: mixed,
  disallowObjects?: boolean,
  forcePointers?: boolean,
  seen?: Array<mixed>,
  offline?: boolean,
  counter?: number,
  initialValue?: mixed
): any {
  return encode(value, !!disallowObjects, !!forcePointers, seen || [], !!offline, counter || 0, initialValue || value);
}
