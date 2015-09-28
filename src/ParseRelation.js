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

import { RelationOp } from './ParseOp';
import ParseObject from './ParseObject';
import ParseQuery from './ParseQuery';

/**
 * Creates a new Relation for the given parent object and key. This
 * constructor should rarely be used directly, but rather created by
 * Parse.Object.relation.
 * @class Parse.Relation
 * @constructor
 * @param {Parse.Object} parent The parent of this relation.
 * @param {String} key The key for this relation on the parent.
 *
 * <p>
 * A class that is used to access all of the children of a many-to-many
 * relationship.  Each instance of Parse.Relation is associated with a
 * particular parent object and key.
 * </p>
 */
export default class ParseRelation {
  parent: ParseObject;
  key: ?string;
  targetClassName: ?string;

  constructor(parent: ParseObject, key: ?string) {
    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }

  /**
   * Makes sure that this relation has the right parent and key.
   */
  _ensureParentAndKey(parent: ParseObject, key: string) {
    this.key = this.key || key;
    if (this.key !== key) {
      throw new Error(
        'Internal Error. Relation retrieved from two different keys.'
      );
    }
    if (this.parent) {
      if (this.parent.className !== parent.className) {
        throw new Error(
          'Internal Error. Relation retrieved from two different Objects.'
        );
      }
      if (this.parent.id) {
        if (this.parent.id !== parent.id) {
          throw new Error(
            'Internal Error. Relation retrieved from two different Objects.'
          );
        }
      } else if (parent.id) {
        this.parent = parent;
      }
    } else {
      this.parent = parent;
    }
  }

  /**
   * Adds a Parse.Object or an array of Parse.Objects to the relation.
   * @method add
   * @param {} objects The item or items to add.
   */
  add(objects: ParseObject | Array<ParseObject>): ParseObject {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new RelationOp(objects, []);
    this.parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
    return this.parent;
  }

  /**
   * Removes a Parse.Object or an array of Parse.Objects from this relation.
   * @method remove
   * @param {} objects The item or items to remove.
   */
  remove(objects: ParseObject | Array<ParseObject>) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new RelationOp([], objects);
    this.parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
  }

  /**
   * Returns a JSON version of the object suitable for saving to disk.
   * @method toJSON
   * @return {Object}
   */
  toJSON(): { __type: 'Relation', className: ?string } {
    return {
      __type: 'Relation',
      className: this.targetClassName
    };
  }

  /**
   * Returns a Parse.Query that is limited to objects in this
   * relation.
   * @method query
   * @return {Parse.Query}
   */
  query(): ParseQuery {
    var query;
    if (!this.targetClassName) {
      query = new ParseQuery(this.parent.className);
      query._extraOptions.redirectClassNameForKey = this.key;
    } else {
      query = new ParseQuery(this.targetClassName)
    }
    query._addCondition('$relatedTo', 'object', {
      __type: 'Pointer',
      className: this.parent.className,
      objectId: this.parent.id
    });
    query._addCondition('$relatedTo', 'key', this.key);

    return query;
  }
}
