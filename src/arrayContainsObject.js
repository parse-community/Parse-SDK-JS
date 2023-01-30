/**
 * @flow
 */

import ParseObject from './ParseObject';

export default function arrayContainsObject(array: Array<any>, object: ParseObject): boolean {
  if (array.indexOf(object) > -1) {
    return true;
  }
  for (let i = 0; i < array.length; i++) {
    if (
      array[i] instanceof ParseObject &&
      array[i].className === object.className &&
      array[i]._getId() === object._getId()
    ) {
      return true;
    }
  }
  return false;
}
