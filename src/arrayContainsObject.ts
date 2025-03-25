import CoreManager from './CoreManager';
import type ParseObject from './ParseObject';

export default function arrayContainsObject(array: any[], object: ParseObject): boolean {
  if (array.indexOf(object) > -1) {
    return true;
  }
  const ParseObject = CoreManager.getParseObject();
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
