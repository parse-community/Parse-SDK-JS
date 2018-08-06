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

import ParseRole from './ParseRole';
import ParseUser from './ParseUser';

type PermissionsMap = { [permission: string]: boolean };
type ByIdMap = { [userId: string]: PermissionsMap };

var PUBLIC_KEY = '*';

/**
 * Creates a new ACL.
 * If no argument is given, the ACL has no permissions for anyone.
 * If the argument is a Parse.User, the ACL will have read and write
 *   permission for only that user.
 * If the argument is any other JSON object, that object will be interpretted
 *   as a serialized ACL created with toJSON().
 * 
 * <p>An ACL, or Access Control List can be added to any
 * <code>Parse.Object</code> to restrict access to only a subset of users
 * of your application.</p>
 * @alias Parse.ACL
 */
class ParseACL {
  permissionsById: ByIdMap;

  /**
   * @param {(Parse.User|Object)} user The user to initialize the ACL for
   */
  constructor(arg1: ParseUser | ByIdMap) {
    this.permissionsById = {};
    if (arg1 && typeof arg1 === 'object') {
      if (arg1 instanceof ParseUser) {
        this.setReadAccess(arg1, true);
        this.setWriteAccess(arg1, true);
      } else {
        for (var userId in arg1) {
          var accessList = arg1[userId];
          if (typeof userId !== 'string') {
            throw new TypeError(
              'Tried to create an ACL with an invalid user id.'
            );
          }
          this.permissionsById[userId] = {};
          for (var permission in accessList) {
            var allowed = accessList[permission];
            if (permission !== 'read' && permission !== 'write') {
              throw new TypeError(
                'Tried to create an ACL with an invalid permission type.'
              );
            }
            if (typeof allowed !== 'boolean') {
              throw new TypeError(
                'Tried to create an ACL with an invalid permission value.'
              );
            }
            this.permissionsById[userId][permission] = allowed;
          }
        }
      }
    } else if (typeof arg1 === 'function') {
      throw new TypeError(
        'ParseACL constructed with a function. Did you forget ()?'
      );
    }
  }

  /**
   * Returns a JSON-encoded version of the ACL.
   * @return {Object}
   */
  toJSON(): ByIdMap {
    var permissions = {};
    for (var p in this.permissionsById) {
      permissions[p] = this.permissionsById[p];
    }
    return permissions;
  }

  /**
   * Returns whether this ACL is equal to another object
   * @param other The other object to compare to
   * @return {Boolean}
   */
  equals(other: ParseACL): boolean {
    if (!(other instanceof ParseACL)) {
      return false;
    }
    var users = Object.keys(this.permissionsById);
    var otherUsers = Object.keys(other.permissionsById);
    if (users.length !== otherUsers.length) {
      return false;
    }
    for (var u in this.permissionsById) {
      if (!other.permissionsById[u]) {
        return false;
      }
      if (this.permissionsById[u].read !== other.permissionsById[u].read) {
        return false;
      }
      if (this.permissionsById[u].write !== other.permissionsById[u].write) {
        return false;
      }
    }
    return true;
  }

  _setAccess(accessType: string, userId: ParseUser | ParseRole | string, allowed: boolean) {
    if (userId instanceof ParseUser) {
      userId = userId.id;
    } else if (userId instanceof ParseRole) {
      const name = userId.getName();
      if (!name) {
        throw new TypeError('Role must have a name');
      }
      userId = 'role:' + name;
    }
    if (typeof userId !== 'string') {
      throw new TypeError('userId must be a string.');
    }
    if (typeof allowed !== 'boolean') {
      throw new TypeError('allowed must be either true or false.');
    }
    var permissions = this.permissionsById[userId];
    if (!permissions) {
      if (!allowed) {
        // The user already doesn't have this permission, so no action is needed
        return;
      } else {
        permissions = {};
        this.permissionsById[userId] = permissions;
      }
    }

    if (allowed) {
      this.permissionsById[userId][accessType] = true;
    } else {
      delete permissions[accessType];
      if (Object.keys(permissions).length === 0) {
        delete this.permissionsById[userId];
      }
    }
  }

  _getAccess(
    accessType: string,
    userId: ParseUser | ParseRole | string
  ): boolean {
    if (userId instanceof ParseUser) {
      userId = userId.id;
      if (!userId) {
        throw new Error('Cannot get access for a ParseUser without an ID');
      }
    } else if (userId instanceof ParseRole) {
      const name = userId.getName();
      if (!name) {
        throw new TypeError('Role must have a name');
      }
      userId = 'role:' + name;
    }
    var permissions = this.permissionsById[userId];
    if (!permissions) {
      return false;
    }
    return !!permissions[accessType];
  }

  /**
   * Sets whether the given user is allowed to read this object.
   * @param userId An instance of Parse.User or its objectId.
   * @param {Boolean} allowed Whether that user should have read access.
   */
  setReadAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('read', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to read this object.
   * Even if this returns false, the user may still be able to access it if
   * getPublicReadAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getReadAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('read', userId);
  }

  /**
   * Sets whether the given user id is allowed to write this object.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setWriteAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('write', userId, allowed);
  }

  /**
   * Gets whether the given user id is *explicitly* allowed to write this object.
   * Even if this returns false, the user may still be able to write it if
   * getPublicWriteAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getWriteAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('write', userId);
  }

  /**
   * Sets whether the public is allowed to read this object.
   * @param {Boolean} allowed
   */
  setPublicReadAccess(allowed: boolean) {
    this.setReadAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to read this object.
   * @return {Boolean}
   */
  getPublicReadAccess(): boolean {
    return this.getReadAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to write this object.
   * @param {Boolean} allowed
   */
  setPublicWriteAccess(allowed: boolean) {
    this.setWriteAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to write this object.
   * @return {Boolean}
   */
  getPublicWriteAccess(): boolean {
    return this.getWriteAccess(PUBLIC_KEY);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to read this object. Even if this returns false, the role may
   * still be able to write it if a parent role has read access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has read access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleReadAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError(
        'role must be a ParseRole or a String'
      );
    }
    return this.getReadAccess('role:' + role);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to write this object. Even if this returns false, the role may
   * still be able to write it if a parent role has write access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has write access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleWriteAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError(
        'role must be a ParseRole or a String'
      );
    }
    return this.getWriteAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to read this object.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can read this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleReadAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError(
        'role must be a ParseRole or a String'
      );
    }
    this.setReadAccess('role:' + role, allowed);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to write this object.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleWriteAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError(
        'role must be a ParseRole or a String'
      );
    }
    this.setWriteAccess('role:' + role, allowed);
  }
}

export default ParseACL;
