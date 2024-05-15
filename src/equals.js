import CoreManager from './CoreManager';
import ParseACL from './ParseACL';
import ParseFile from './ParseFile';
import ParseGeoPoint from './ParseGeoPoint';

export default function equals(a, b) {
  const toString = Object.prototype.toString;
  if (toString.call(a) === '[object Date]' || toString.call(b) === '[object Date]') {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return +dateA === +dateB;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (!a || typeof a !== 'object') {
    // a is a primitive
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
      return false;
    }
    if (a.length !== b.length) {
      return false;
    }
    for (let i = a.length; i--;) {
      if (!equals(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  const ParseObject = CoreManager.getParseObject();
  if (
    a instanceof ParseACL ||
    a instanceof ParseFile ||
    a instanceof ParseGeoPoint ||
    a instanceof ParseObject
  ) {
    return a.equals(b);
  }
  if (b instanceof ParseObject) {
    if (a.__type === 'Object' || a.__type === 'Pointer') {
      return a.objectId === b.id && a.className === b.className;
    }
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (const k in a) {
    if (!equals(a[k], b[k])) {
      return false;
    }
  }
  return true;
}
