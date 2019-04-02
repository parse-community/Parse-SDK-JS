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
const DEFAULT_PIN = '_default';
const PIN_PREFIX = 'parsePin_';
const OBJECT_PREFIX = 'Parse_LDS_';

function isLocalDatastoreKey(key: string): boolean {
  return !!(key && (key === DEFAULT_PIN || key.startsWith(PIN_PREFIX) || key.startsWith(OBJECT_PREFIX)));
}

export {
  DEFAULT_PIN,
  PIN_PREFIX,
  OBJECT_PREFIX,
  isLocalDatastoreKey,
};
