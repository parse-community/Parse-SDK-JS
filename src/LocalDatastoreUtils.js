/**
 * @flow
 * @private
 */

const DEFAULT_PIN = '_default';
const PIN_PREFIX = 'parsePin_';
const OBJECT_PREFIX = 'Parse_LDS_';

function isLocalDatastoreKey(key: string): boolean {
  return !!(
    key &&
    (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX) || key.startsWith(OBJECT_PREFIX))
  );
}

export { DEFAULT_PIN, PIN_PREFIX, OBJECT_PREFIX, isLocalDatastoreKey };
