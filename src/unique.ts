/**
 * @flow
 */

import arrayContainsObject from './arrayContainsObject';
import ParseObject from './ParseObject';

export default function unique<T>(arr: Array<T>): Array<T> {
  const uniques = [];
  arr.forEach(value => {
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
