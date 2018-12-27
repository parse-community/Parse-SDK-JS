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

import ParseObject from './ParseObject';

export default function arrayContainsObject(
  array: Array<any>,
  object: ParseObject
): boolean {
  if (array.indexOf(object) > -1) {
    return true;
  }
  for (let i = 0; i < array.length; i++) {
    if ((array[i] instanceof ParseObject) &&
      array[i].className === object.className &&
      array[i]._getId() === object._getId()
    ) {
      return true;
    }
  }
  return false;
}
