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

/**
 * Represents a Role on the Parse server. Roles represent groupings of
 * Users for the purposes of granting permissions (e.g. specifying an ACL
 * for an Object). Roles are specified by their sets of child users and
 * child roles, all of which are granted any permissions that the parent
 * role has.
 *
 * <p>Roles must have a name (which cannot be changed after creation of the
 * role), and must specify an ACL.</p>
 * @class Parse.Role
 * @constructor
 * @param {String} name The name of the Role to create.
 * @param {Parse.ACL} acl The ACL for this role. Roles must have an ACL.
 * A Parse.Role is a local representation of a role persisted to the Parse
 * cloud.
 */
'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _ParseACL = require('./ParseACL');

var _ParseACL2 = _interopRequireDefault(_ParseACL);

var _ParseError = require('./ParseError');

var _ParseError2 = _interopRequireDefault(_ParseError);

var _ParseObject2 = require('./ParseObject');

var _ParseObject3 = _interopRequireDefault(_ParseObject2);

var ParseRole = (function (_ParseObject) {
  _inherits(ParseRole, _ParseObject);

  function ParseRole(name, acl) {
    _classCallCheck(this, ParseRole);

    _get(Object.getPrototypeOf(ParseRole.prototype), 'constructor', this).call(this, '_Role');
    if (typeof name === 'string' && acl instanceof _ParseACL2['default']) {
      this.setName(name);
      this.setACL(acl);
    }
  }

  /**
   * Gets the name of the role.  You can alternatively call role.get("name")
   *
   * @method getName
   * @return {String} the name of the role.
   */

  _createClass(ParseRole, [{
    key: 'getName',
    value: function getName() {
      return this.get('name');
    }

    /**
     * Sets the name for a role. This value must be set before the role has
     * been saved to the server, and cannot be set once the role has been
     * saved.
     *
     * <p>
     *   A role's name can only contain alphanumeric characters, _, -, and
     *   spaces.
     * </p>
     *
     * <p>This is equivalent to calling role.set("name", name)</p>
     *
     * @method setName
     * @param {String} name The name of the role.
     * @param {Object} options Standard options object with success and error
     *     callbacks.
     */
  }, {
    key: 'setName',
    value: function setName(name, options) {
      return this.set('name', name, options);
    }

    /**
     * Gets the Parse.Relation for the Parse.Users that are direct
     * children of this role. These users are granted any privileges that this
     * role has been granted (e.g. read or write access through ACLs). You can
     * add or remove users from the role through this relation.
     *
     * <p>This is equivalent to calling role.relation("users")</p>
     *
     * @method getUsers
     * @return {Parse.Relation} the relation for the users belonging to this
     *     role.
     */
  }, {
    key: 'getUsers',
    value: function getUsers() {
      return this.relation('users');
    }

    /**
     * Gets the Parse.Relation for the Parse.Roles that are direct
     * children of this role. These roles' users are granted any privileges that
     * this role has been granted (e.g. read or write access through ACLs). You
     * can add or remove child roles from this role through this relation.
     *
     * <p>This is equivalent to calling role.relation("roles")</p>
     *
     * @method getRoles
     * @return {Parse.Relation} the relation for the roles belonging to this
     *     role.
     */
  }, {
    key: 'getRoles',
    value: function getRoles() {
      return this.relation('roles');
    }
  }, {
    key: 'validate',
    value: function validate(attrs, options) {
      var isInvalid = _get(Object.getPrototypeOf(ParseRole.prototype), 'validate', this).call(this, attrs, options);
      if (isInvalid) {
        return isInvalid;
      }

      if ('name' in attrs && attrs.name !== this.getName()) {
        var newName = attrs.name;
        if (this.id && this.id !== attrs.objectId) {
          // Check to see if the objectId being set matches this.id
          // This happens during a fetch -- the id is set before calling fetch
          // Let the name be set in this case
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name can only be set before it has been saved.');
        }
        if (typeof newName !== 'string') {
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name must be a String.');
        }
        if (!/^[0-9a-zA-Z\-_ ]+$/.test(newName)) {
          return new _ParseError2['default'](_ParseError2['default'].OTHER_CAUSE, 'A role\'s name can be only contain alphanumeric characters, _, ' + '-, and spaces.');
        }
      }
      return false;
    }
  }]);

  return ParseRole;
})(_ParseObject3['default']);

exports['default'] = ParseRole;

_ParseObject3['default'].registerSubclass('_Role', ParseRole);
module.exports = exports['default'];