/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseOp = require('./ParseOp');

var _ParseObject = require('./ParseObject');

var _ParseObject2 = _interopRequireDefault(_ParseObject);

var _ParseQuery = require('./ParseQuery');

var _ParseQuery2 = _interopRequireDefault(_ParseQuery);

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

var ParseRelation = (function () {
  function ParseRelation(parent, key) {
    _classCallCheck(this, ParseRelation);

    this.parent = parent;
    this.key = key;
    this.targetClassName = null;
  }

  /**
   * Makes sure that this relation has the right parent and key.
   */

  _createClass(ParseRelation, [{
    key: '_ensureParentAndKey',
    value: function _ensureParentAndKey(parent, key) {
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
     * @method add
     * @param {} objects The item or items to add.
     */
  }, {
    key: 'add',
    value: function add(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp(objects, []);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
      return this.parent;
    }

    /**
     * Removes a Parse.Object or an array of Parse.Objects from this relation.
     * @method remove
     * @param {} objects The item or items to remove.
     */
  }, {
    key: 'remove',
    value: function remove(objects) {
      if (!Array.isArray(objects)) {
        objects = [objects];
      }

      var change = new _ParseOp.RelationOp([], objects);
      this.parent.set(this.key, change);
      this.targetClassName = change._targetClassName;
    }

    /**
     * Returns a JSON version of the object suitable for saving to disk.
     * @method toJSON
     * @return {Object}
     */
  }, {
    key: 'toJSON',
    value: function toJSON() {
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
  }, {
    key: 'query',
    value: function query() {
      var query;
      if (!this.targetClassName) {
        query = new _ParseQuery2['default'](this.parent.className);
        query._extraOptions.redirectClassNameForKey = this.key;
      } else {
        query = new _ParseQuery2['default'](this.targetClassName);
      }
      query._addCondition('$relatedTo', 'object', {
        __type: 'Pointer',
        className: this.parent.className,
        objectId: this.parent.id
      });
      query._addCondition('$relatedTo', 'key', this.key);

      return query;
    }
  }]);

  return ParseRelation;
})();

exports['default'] = ParseRelation;
module.exports = exports['default'];