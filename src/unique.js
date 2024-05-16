/**
 * @flow
 */

import arrayContainsObject from './arrayContainsObject';
import CoreManager from './CoreManager';

export default function unique<T>(arr: Array<T>): Array<T> {
  const uniques = [];
  arr.forEach(value => {
    const ParseObject = CoreManager.getParseObject();
    if (value instanceof ParseObject) {
      if (!arrayContainsObject(uniques, value)) {
        uniques.push(value);
      }
    } else {
      if (uniques.indexOf(value) < 0) {
        uniques.push(value);
      }
    }
  });
  return uniques;
}
