/**
 * @flow
 */

import ParseFile from './ParseFile';
import ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';

type EncounterMap = {
  objects: { [identifier: string]: ParseObject | boolean },
  files: Array<ParseFile>,
};

/**
 * Return an array of unsaved children, which are either Parse Objects or Files.
 * If it encounters any dirty Objects without Ids, it will throw an exception.
 *
 * @param {Parse.Object} obj
 * @param {boolean} allowDeepUnsaved
 * @returns {Array}
 */
export default function unsavedChildren(
  obj: ParseObject,
  allowDeepUnsaved?: boolean
): Array<ParseFile | ParseObject> {
  const encountered = {
    objects: {},
    files: [],
  };
  const identifier = obj.className + ':' + obj._getId();
  encountered.objects[identifier] = obj.dirty() ? obj : true;
  const attributes = obj.attributes;
  for (const attr in attributes) {
    if (typeof attributes[attr] === 'object') {
      traverse(attributes[attr], encountered, false, !!allowDeepUnsaved);
    }
  }
  const unsaved = [];
  for (const id in encountered.objects) {
    if (id !== identifier && encountered.objects[id] !== true) {
      unsaved.push(encountered.objects[id]);
    }
  }
  return unsaved.concat(encountered.files);
}

function traverse(
  obj: ParseObject | ParseFile | ParseRelation | Array<ParseObject | ParseFile | ParseRelation>,
  encountered: EncounterMap,
  shouldThrow: boolean,
  allowDeepUnsaved: boolean
) {
  if (obj instanceof ParseObject) {
    if (!obj.id && shouldThrow) {
      throw new Error('Cannot create a pointer to an unsaved Object.');
    }
    const identifier = obj.className + ':' + obj._getId();
    if (!encountered.objects[identifier]) {
      encountered.objects[identifier] = obj.dirty() ? obj : true;
      const attributes = obj.attributes;
      for (const attr in attributes) {
        if (typeof attributes[attr] === 'object') {
          traverse(attributes[attr], encountered, !allowDeepUnsaved, allowDeepUnsaved);
        }
      }
    }
    return;
  }
  if (obj instanceof ParseFile) {
    if (!obj.url() && encountered.files.indexOf(obj) < 0) {
      encountered.files.push(obj);
    }
    return;
  }
  if (obj instanceof ParseRelation) {
    return;
  }
  if (Array.isArray(obj)) {
    obj.forEach(el => {
      if (typeof el === 'object') {
        traverse(el, encountered, shouldThrow, allowDeepUnsaved);
      }
    });
  }
  for (const k in obj) {
    if (typeof obj[k] === 'object') {
      traverse(obj[k], encountered, shouldThrow, allowDeepUnsaved);
    }
  }
}
