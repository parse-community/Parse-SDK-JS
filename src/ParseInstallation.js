/**
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
