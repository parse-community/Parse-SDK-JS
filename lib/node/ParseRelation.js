"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _ParseOp = require("./ParseOp");

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _ParseQuery = _interopRequireDefault(require("./ParseQuery"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
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

/**
 * Creates a new Relation for the given parent object and key. This
 * constructor should rarely be used directly, but rather created by
 * Parse.Object.relation.
 *
 * <p>
 * A class that is used to access all of the children of a many-to-many
 * relationship.  Each instance of Parse.Relation is associated with a
 * particular parent object and key.
 * </p>
 * @alias Parse.Relation
 */


class ParseRelation {
  /*:: parent: ?ParseObject;*/

  /*:: key: ?string;*/

  /*:: targetClassName: ?string;*/

  /**
   * @param {Parse.Object} parent The parent of this relation.
   * @param {String} key The key for this relation on the parent.
   */
  constructor(parent
  /*: ?ParseObject*/
  , key
  /*: ?string*/
  ) {
    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }
  /*
   * Makes sure that this relation has the right parent and key.
   */


  _ensureParentAndKey(parent
  /*: ParseObject*/
  , key
  /*: string*/
  ) {
    this.key = this.key || key;

    if (this.key !== key) {
      throw new Error('Internal Error. Relation retrieved from two different keys.');
    }

    if (this.parent) {
      if (this.parent.className !== parent.className) {
        throw new Error('Internal Error. Relation retrieved from two different Objects.');
      }

      if (this.parent.id) {
        if (this.parent.id !== parent.id) {
          throw new Error('Internal Error. Relation retrieved from two different Objects.');
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
    * @param {} objects The item or items to add.
   */


  add(objects
  /*: ParseObject | Array<ParseObject | string>*/
  )
  /*: ParseObject*/
  {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new _ParseOp.RelationOp(objects, []);
    var parent = this.parent;

    if (!parent) {
      throw new Error('Cannot add to a Relation without a parent');
    }

    parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
    return parent;
  }
  /**
   * Removes a Parse.Object or an array of Parse.Objects from this relation.
    * @param {} objects The item or items to remove.
   */


  remove(objects
  /*: ParseObject | Array<ParseObject | string>*/
  ) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    var change = new _ParseOp.RelationOp([], objects);

    if (!this.parent) {
      throw new Error('Cannot remove from a Relation without a parent');
    }

    this.parent.set(this.key, change);
    this.targetClassName = change._targetClassName;
  }
  /**
   * Returns a JSON version of the object suitable for saving to disk.
    * @return {Object}
   */


  toJSON()
  /*: { __type: 'Relation', className: ?string }*/
  {
    return {
      __type: 'Relation',
      className: this.targetClassName
    };
  }
  /**
   * Returns a Parse.Query that is limited to objects in this
   * relation.
    * @return {Parse.Query}
   */


  query()
  /*: ParseQuery*/
  {
    var query;
    var parent = this.parent;

    if (!parent) {
      throw new Error('Cannot construct a query for a Relation without a parent');
    }

    if (!this.targetClassName) {
      query = new _ParseQuery.default(parent.className);
      query._extraOptions.redirectClassNameForKey = this.key;
    } else {
      query = new _ParseQuery.default(this.targetClassName);
    }

    query._addCondition('$relatedTo', 'object', {
      __type: 'Pointer',
      className: parent.className,
      objectId: parent.id
    });

    query._addCondition('$relatedTo', 'key', this.key);

    return query;
  }

}

var _default = ParseRelation;
exports.default = _default;