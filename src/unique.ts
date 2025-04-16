import arrayContainsObject from './arrayContainsObject';
import CoreManager from './CoreManager';

export default function unique<T>(arr: T[]): T[] {
  const uniques: T[] = [];
  arr.forEach(value => {
    const ParseObject = CoreManager.getParseObject();
    if (value instanceof ParseObject) {
      if (!arrayContainsObject(uniques, value as typeof ParseObject)) {
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
