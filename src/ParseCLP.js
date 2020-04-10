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

type UsersMap = { [userId: string]: boolean | any };
type PermissionsMap = { [permission: string]: UsersMap };

const PUBLIC_KEY = '*';

const VALID_PERMISSIONS: Map<string, UsersMap> = new Map<string, UsersMap>();
VALID_PERMISSIONS.set('get', {});
VALID_PERMISSIONS.set('find', {});
VALID_PERMISSIONS.set('count', {});
VALID_PERMISSIONS.set('create', {});
VALID_PERMISSIONS.set('update', {});
VALID_PERMISSIONS.set('delete', {});
VALID_PERMISSIONS.set('addField', {});

const VALID_PERMISSIONS_EXTENDED: Map<string, UsersMap> = new Map<string, UsersMap>();
VALID_PERMISSIONS_EXTENDED.set('protectedFields', []);

/**
 * Creates a new CLP.
 * If no argument is given, the CLP has no permissions for anyone.
 * If the argument is a Parse.User, the CLP will have read and write
 *   permission for only that user.
 * If the argument is any other JSON object, that object will be interpretted
 *   as a serialized CLP created with toJSON().
 *
 * <p>A CLP, or Class Level Permissions can be added to any
 * <code>Parse.Schema</code> to restrict access to only a subset of users
 * of your application.</p>
 * @alias Parse.CLP
 */
class ParseCLP {
  permissionsMap: PermissionsMap;

  /**
   * @param {(Parse.User|Parse.Role|Object)} userId The user to initialize the CLP for
   */
  constructor(userId: ParseUser | ParseRole | PermissionsMap) {

    this.permissionsMap = {};
    // Initialize permissions Map with default permissions
    for (const permission of VALID_PERMISSIONS.entries()) {
      this.permissionsMap[permission[0]] = Object.assign({}, permission[1]);
    }
    // Initialize permissions Map with default extended permissions
    for (const permission of VALID_PERMISSIONS_EXTENDED.entries()) {
      this.permissionsMap[permission[0]] = Object.assign(permission[1] instanceof Array ? [] : {}, permission[1]);
    }


    if (userId && typeof userId === 'object') {
      if (userId instanceof ParseUser) {
        this.setReadAccess(userId, true);
        this.setWriteAccess(userId, true);
        this.setAddAccess(userId, true);
      } else if (userId instanceof ParseRole) {
        this.setRoleReadAccess(userId, true);
        this.setRoleWriteAccess(userId, true);
        this.setRoleAddAccess(userId, true);
      } else {
        for (const permission in userId) {
          if (userId.hasOwnProperty(permission)) {
            const users = userId[permission];
            const isValidPermission = !!VALID_PERMISSIONS.get(permission);
            const isValidPermissionExtended = !!VALID_PERMISSIONS_EXTENDED.get(permission);
            if (typeof permission !== 'string' || !(isValidPermission || isValidPermissionExtended)) {
              throw new TypeError('Tried to create an CLP with an invalid permission type.');
            }

            for (const user in users) {
              if (users.hasOwnProperty(user)) {
                const allowed = users[user];
                if (typeof user !== 'string') {
                  throw new TypeError('Tried to create an CLP with an invalid user.');
                }

                if (typeof allowed !== 'boolean' && !isValidPermissionExtended) {
                  throw new TypeError('Tried to create an CLP with an invalid permission value.');
                }
                this.permissionsMap[permission][user] = allowed;
              }
            }
          }
        }
      }
    } else if (typeof userId === 'function') {
      throw new TypeError(
        'ParseCLP constructed with a function. Did you forget ()?'
      );
    }
  }

  /**
   * Returns a JSON-encoded version of the CLP.
   * @return {Object}
   */
  toJSON(): PermissionsMap {
    const permissionsMap = {};
    for (const permission in this.permissionsMap) {
      if (this.permissionsMap.hasOwnProperty(permission)) {
        permissionsMap[permission] = this.permissionsMap[permission];
      }
    }
    return permissionsMap;
  }


  /**
   * Returns whether this CLP is equal to another object
   * @param other The other object to compare to
   * @return {Boolean}
   */
  equals(other: ParseCLP): boolean {
    if (!(other instanceof ParseCLP)) {
      return false;
    }
    const permissions = Object.keys(this.permissionsMap);
    const otherPermissions = Object.keys(other.permissionsMap);
    if (permissions.length !== otherPermissions.length) {
      return false;
    }
    for (const permission in this.permissionsMap) {
      if (!other.permissionsMap[permission]) {
        return false;
      }

      const users = Object.keys(this.permissionsMap[permission]);
      const otherUsers = Object.keys(other.permissionsMap[permission]);
      if (users.length !== otherUsers.length) {
        return false;
      }

      for (const user in this.permissionsMap[permission]) {
        if (!other.permissionsMap[permission][user]) {
          return false;
        }
        if (this.permissionsMap[permission][user] !== other.permissionsMap[permission][user]) {
          return false;
        }
      }
    }
    return true;
  }


  _setAccess(permission: string, userId: ParseUser | ParseRole | string, allowed: boolean) {
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
    const permissions = this.permissionsMap[permission][userId];
    if (!permissions) {
      if (!allowed) {
        // The user already doesn't have this permission, so no action is needed
        return;
      } else {
        this.permissionsMap[permission][userId] = {};
      }
    }

    if (allowed) {
      this.permissionsMap[permission][userId] = true;
    } else {
      delete this.permissionsMap[permission][userId];
    }
  }

  _getAccess(permission: string, userId: ParseUser | ParseRole | string): boolean {
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

    const permissions = this.permissionsMap[permission][userId];
    if (!permissions) {
      return false;
    }
    return !!this.permissionsMap[permission][userId];
  }

  /**
   * Sets whether the given user is allowed to read from this class.
   * @param userId An instance of Parse.User or its objectId.
   * @param {Boolean} allowed whether that user should have read access.
   */
  setReadAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('find', userId, allowed);
    this._setAccess('get', userId, allowed);
    this._setAccess('count', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to read from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicReadAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getReadAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('find', userId) &&
      this._getAccess('get', userId) &&
      this._getAccess('count', userId);
  }

  /**
   * Sets whether the given user is allowed to find from this class.
   * @param userId An instance of Parse.User or its objectId.
   * @param {Boolean} allowed whether that user should have read access.
   */
  setFindAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('find', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to find from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicFindAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getFindAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('find', userId);
  }


  /**
   * Sets whether the given user is allowed to get from this class.
   * @param userId An instance of Parse.User or its objectId.
   * @param {Boolean} allowed whether that user should have read access.
   */
  setGetAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('get', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to get from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicGetAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getGetAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('get', userId);
  }

  /**
   * Sets whether the given user is allowed to count from this class.
   * @param userId An instance of Parse.User or its objectId.
   * @param {Boolean} allowed whether that user should have read access.
   */
  setCountAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('count', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to count from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicCountAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getCountAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('count', userId);
  }

  /**
   * Sets whether the given user id is allowed to write to this class.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setWriteAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('create', userId, allowed);
    this._setAccess('update', userId, allowed);
    this._setAccess('delete', userId, allowed);
    this._setAccess('addField', userId, allowed);
  }

  /**
   * Gets whether the given user id is *explicitly* allowed to write to this class.
   * Even if this returns false, the user may still be able to write it if
   * getPublicWriteAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getWriteAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('create', userId) &&
      this._getAccess('update', userId) &&
      this._getAccess('delete', userId) &&
      this._getAccess('addField', userId);
  }

  /**
   * Sets whether the given user id is allowed to create field to this class.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setCreateAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('create', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to create field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicCreateAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getCreateAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('create', userId);
  }

  /**
   * Sets whether the given user id is allowed to update field to this class.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setUpdateAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('update', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to update field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicUpdateAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getUpdateAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('update', userId);
  }

  /**
   * Sets whether the given user id is allowed to delete field to this class.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setDeleteAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('delete', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to delete field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicDeleteAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getDeleteAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('delete', userId);
  }

  /**
   * Sets whether the given user id is allowed to add field to this class.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {Boolean} allowed Whether that user should have write access.
   */
  setAddAccess(userId: ParseUser | ParseRole | string, allowed: boolean) {
    this._setAccess('addField', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to add field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicReadAccess returns true or a role that the user belongs to has
   * write access.
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @return {Boolean}
   */
  getAddAccess(userId: ParseUser | ParseRole | string): boolean {
    return this._getAccess('addField', userId);
  }

  /**
   * Sets whether the public is allowed to read from this class.
   * @param {Boolean} allowed
   */
  setPublicReadAccess(allowed: boolean) {
    this.setReadAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to read from this class.
   * @return {Boolean}
   */
  getPublicReadAccess(): boolean {
    return this.getReadAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to find from this class.
   * @param {Boolean} allowed
   */
  setPublicFindAccess(allowed: boolean) {
    this.setFindAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to find from this class.
   * @return {Boolean}
   */
  getPublicFindAccess(): boolean {
    return this.getFindAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to get from this class.
   * @param {Boolean} allowed
   */
  setPublicGetAccess(allowed: boolean) {
    this.setGetAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to get from this class.
   * @return {Boolean}
   */
  getPublicGetAccess(): boolean {
    return this.getGetAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to count from this class.
   * @param {Boolean} allowed
   */
  setPublicCountAccess(allowed: boolean) {
    this.setCountAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to count from this class.
   * @return {Boolean}
   */
  getPublicCountAccess(): boolean {
    return this.countCountAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to write to this class.
   * @param {Boolean} allowed
   */
  setPublicWriteAccess(allowed: boolean) {
    this.setWriteAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to write to this class.
   * @return {Boolean}
   */
  getPublicWriteAccess(): boolean {
    return this.getWriteAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to create to this class.
   * @param {Boolean} allowed
   */
  setPublicCreateAccess(allowed: boolean) {
    this.setCreateAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to create to this class.
   * @return {Boolean}
   */
  getPublicCreateAccess(): boolean {
    return this.getCreateAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to update to this class.
   * @param {Boolean} allowed
   */
  setPublicUpdateAccess(allowed: boolean) {
    this.setUpdateAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to update to this class.
   * @return {Boolean}
   */
  getPublicUpdateAccess(): boolean {
    return this.getUpdateAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to delete to this class.
   * @param {Boolean} allowed
   */
  setPublicDeleteAccess(allowed: boolean) {
    this.setDeleteAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to delete to this class.
   * @return {Boolean}
   */
  getPublicDeleteAccess(): boolean {
    return this.getDeleteAccess(PUBLIC_KEY);
  }


  /**
   * Gets whether users belonging to the given role are allowed
   * to read from this class. Even if this returns false, the role may
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
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getReadAccess('role:' + role);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to write to this user. Even if this returns false, the role may
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
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getWriteAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to read from this class.
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
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setReadAccess('role:' + role, allowed);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to write to this class.
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
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setWriteAccess('role:' + role, allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to find to this user. Even if this returns false, the role may
   * still be able to find it if a parent role has find access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has find access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleFindAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getFindAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to find field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleFindAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setFindAccess('role:' + role, allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to get to this user. Even if this returns false, the role may
   * still be able to get it if a parent role has get access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has get access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleGetAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getGetAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to get field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleGetAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setGetAccess('role:' + role, allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to count to this user. Even if this returns false, the role may
   * still be able to count it if a parent role has count access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has count access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleCountAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getCountAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to count field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleCountAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setCountAccess('role:' + role, allowed);
  }


  /**
   * Gets whether users belonging to the given role are allowed
   * to create to this user. Even if this returns false, the role may
   * still be able to create it if a parent role has create access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has create access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleCreateAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getCreateAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to create field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleCreateAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setCreateAccess('role:' + role, allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to update to this user. Even if this returns false, the role may
   * still be able to update it if a parent role has update access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has update access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleUpdateAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getUpdateAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to update field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleUpdateAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setUpdateAccess('role:' + role, allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to delete to this user. Even if this returns false, the role may
   * still be able to delete it if a parent role has delete access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has delete access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleDeleteAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getDeleteAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to delete field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleDeleteAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setDeleteAccess('role:' + role, allowed);
  }


  /**
   * Gets whether users belonging to the given role are allowed
   * to add to this user. Even if this returns false, the role may
   * still be able to add it if a parent role has add access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @return {Boolean} true if the role has add access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleAddAccess(role: ParseRole | string): boolean {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return this.getAddAccess('role:' + role);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to add field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {Boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleAddAccess(role: ParseRole | string, allowed: boolean) {
    if (role instanceof ParseRole) {
      // Normalize to the String name
      role = role.getName();
    }
    if (typeof role !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    this.setAddAccess('role:' + role, allowed);
  }


}

export default ParseCLP;
