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

import type { AttributeMap } from './ObjectStateMutations';

export default class Installation extends ParseObject {
  constructor(attributes: ?AttributeMap) {
    super('_Installation');
    if (attributes && typeof attributes === 'object') {
      if (!this.set(attributes || {})) {
        throw new Error("Can't create an invalid Installation");
      }
    }
  }
}

ParseObject.registerSubclass('_Installation', Installation);
