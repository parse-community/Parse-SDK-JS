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

type Entity = Entity;
type UsersMap = { [userId: string]: boolean | any };
export type PermissionsMap = { [permission: string]: UsersMap };

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
VALID_PERMISSIONS_EXTENDED.set('protectedFields', {});

/**
 * Creates a new CLP.
 * If no argument is given, the CLP has no permissions for anyone.
 * If the argument is a Parse.User or Parse.Role, the CLP will have read and write
 *   permission for only that user or role.
 * If the argument is any other JSON object, that object will be interpretted
 *   as a serialized CLP created with toJSON().
 *
 * <p>A CLP, or Class Level Permissions can be added to any
 * <code>Parse.Schema</code> to restrict access to only a subset of users
 * of your application.</p>
 *
 * <p>
 * For get/count/find/create/update/delete/addField you can set the
 * requiresAuthentication and pointerFields using the following functions:
 *
 * getGetRequiresAuthentication()
 * setGetRequiresAuthentication()
 * getGetPointerFields()
 * setGetPointerFields()
 * getFindRequiresAuthentication()
 * setFindRequiresAuthentication()
 * getFindPointerFields()
 * setFindPointerFields()
 * getCountRequiresAuthentication()
 * setCountRequiresAuthentication()
 * getCountPointerFields()
 * setCountPointerFields()
 * getCreateRequiresAuthentication()
 * setCreateRequiresAuthentication()
 * getCreatePointerFields()
 * setCreatePointerFields()
 * getUpdateRequiresAuthentication()
 * setUpdateRequiresAuthentication()
 * getUpdatePointerFields()
 * setUpdatePointerFields()
 * getDeleteRequiresAuthentication()
 * setDeleteRequiresAuthentication()
 * getDeletePointerFields()
 * setDeletePointerFields()
 * getAddFieldRequiresAuthentication()
 * setAddFieldRequiresAuthentication()
 * getAddFieldPointerFields()
 * setAddFieldPointerFields()
 * </p>
 *
 * @alias Parse.CLP
 */
class ParseCLP {
  permissionsMap: PermissionsMap;

  /**
   * @param {(Parse.User | Parse.Role | object)} userId The user to initialize the CLP for
   */
  constructor(userId: ParseUser | ParseRole | PermissionsMap) {
    this.permissionsMap = {};
    // Initialize permissions Map with default permissions
    for (const [operation, group] of VALID_PERMISSIONS.entries()) {
      this.permissionsMap[operation] = Object.assign({}, group);
      const action = operation.charAt(0).toUpperCase() + operation.slice(1);

      // Create setters and getters for requiredAuthentication
      this[`get${action}RequiresAuthentication`] = function () {
        return this._getAccess(operation, 'requiresAuthentication');
      };
      this[`set${action}RequiresAuthentication`] = function (allowed) {
        this._setAccess(operation, 'requiresAuthentication', allowed);
      };

      // Create setters and getters for pointerFields
      this[`get${action}PointerFields`] = function () {
        return this._getAccess(operation, 'pointerFields', false);
      };
      this[`set${action}PointerFields`] = function (pointerFields) {
        this._setArrayAccess(operation, 'pointerFields', pointerFields);
      };
    }
    // Initialize permissions Map with default extended permissions
    for (const [operation, group] of VALID_PERMISSIONS_EXTENDED.entries()) {
      this.permissionsMap[operation] = Object.assign({}, group);
    }
    if (userId && typeof userId === 'object') {
      if (userId instanceof ParseUser) {
        this.setReadAccess(userId, true);
        this.setWriteAccess(userId, true);
      } else if (userId instanceof ParseRole) {
        this.setRoleReadAccess(userId, true);
        this.setRoleWriteAccess(userId, true);
      } else {
        for (const permission in userId) {
          const users = userId[permission];
          const isValidPermission = !!VALID_PERMISSIONS.get(permission);
          const isValidPermissionExtended = !!VALID_PERMISSIONS_EXTENDED.get(permission);
          const isValidGroupPermission = ['readUserFields', 'writeUserFields'].includes(permission);
          if (
            typeof permission !== 'string' ||
            !(isValidPermission || isValidPermissionExtended || isValidGroupPermission)
          ) {
            throw new TypeError('Tried to create an CLP with an invalid permission type.');
          }
          if (isValidGroupPermission) {
            if (users.every(pointer => typeof pointer === 'string')) {
              this.permissionsMap[permission] = users;
              continue;
            } else {
              throw new TypeError('Tried to create an CLP with an invalid permission value.');
            }
          }
          for (const user in users) {
            const allowed = users[user];
            if (
              typeof allowed !== 'boolean' &&
              !isValidPermissionExtended &&
              user !== 'pointerFields'
            ) {
              throw new TypeError('Tried to create an CLP with an invalid permission value.');
            }
            this.permissionsMap[permission][user] = allowed;
          }
        }
      }
    } else if (typeof userId === 'function') {
      throw new TypeError('ParseCLP constructed with a function. Did you forget ()?');
    }
  }

  /**
   * Returns a JSON-encoded version of the CLP.
   *
   * @returns {object}
   */
  toJSON(): PermissionsMap {
    return { ...this.permissionsMap };
  }

  /**
   * Returns whether this CLP is equal to another object
   *
   * @param other The other object to compare to
   * @returns {boolean}
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

  _getRoleName(role: ParseRole | string): string {
    let name = role;
    if (role instanceof ParseRole) {
      // Normalize to the String name
      name = role.getName();
    }
    if (typeof name !== 'string') {
      throw new TypeError('role must be a ParseRole or a String');
    }
    return `role:${name}`;
  }

  _setAccess(permission: string, userId: Entity, allowed: boolean) {
    if (userId instanceof ParseUser) {
      userId = userId.id;
    } else if (userId instanceof ParseRole) {
      userId = this._getRoleName(userId);
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

  _getAccess(permission: string, userId: Entity, returnBoolean = true): boolean | string[] {
    if (userId instanceof ParseUser) {
      userId = userId.id;
      if (!userId) {
        throw new Error('Cannot get access for a Parse.User without an id.');
      }
    } else if (userId instanceof ParseRole) {
      userId = this._getRoleName(userId);
    }

    const permissions = this.permissionsMap[permission][userId];
    if (returnBoolean) {
      if (!permissions) {
        return false;
      }
      return !!this.permissionsMap[permission][userId];
    }
    return permissions;
  }

  _setArrayAccess(permission: string, userId: Entity, fields: string) {
    if (userId instanceof ParseUser) {
      userId = userId.id;
    } else if (userId instanceof ParseRole) {
      userId = this._getRoleName(userId);
    }
    if (typeof userId !== 'string') {
      throw new TypeError('userId must be a string.');
    }
    const permissions = this.permissionsMap[permission][userId];
    if (!permissions) {
      this.permissionsMap[permission][userId] = [];
    }
    if (!fields || (Array.isArray(fields) && fields.length === 0)) {
      delete this.permissionsMap[permission][userId];
    } else if (Array.isArray(fields) && fields.every(field => typeof field === 'string')) {
      this.permissionsMap[permission][userId] = fields;
    } else {
      throw new TypeError('fields must be an array of strings or undefined.');
    }
  }

  _setGroupPointerPermission(operation: string, pointerFields: string[]) {
    const fields = this.permissionsMap[operation];
    if (!fields) {
      this.permissionsMap[operation] = [];
    }
    if (!pointerFields || (Array.isArray(pointerFields) && pointerFields.length === 0)) {
      delete this.permissionsMap[operation];
    } else if (
      Array.isArray(pointerFields) &&
      pointerFields.every(field => typeof field === 'string')
    ) {
      this.permissionsMap[operation] = pointerFields;
    } else {
      throw new TypeError(`${operation}.pointerFields must be an array of strings or undefined.`);
    }
  }

  _getGroupPointerPermissions(operation: string): string[] {
    return this.permissionsMap[operation];
  }

  /**
   * Sets user pointer fields to allow permission for get/count/find operations.
   *
   * @param {string[]} pointerFields User pointer fields
   */
  setReadUserFields(pointerFields: string[]) {
    this._setGroupPointerPermission('readUserFields', pointerFields);
  }

  /**
   * @returns {string[]} User pointer fields
   */
  getReadUserFields(): string[] {
    return this._getGroupPointerPermissions('readUserFields');
  }

  /**
   * Sets user pointer fields to allow permission for create/delete/update/addField operations
   *
   * @param {string[]} pointerFields User pointer fields
   */
  setWriteUserFields(pointerFields: string[]) {
    this._setGroupPointerPermission('writeUserFields', pointerFields);
  }

  /**
   * @returns {string[]} User pointer fields
   */
  getWriteUserFields(): string[] {
    return this._getGroupPointerPermissions('writeUserFields');
  }

  /**
   * Sets whether the given user is allowed to retrieve fields from this class.
   *
   * @param userId An instance of Parse.User or its objectId.
   * @param {string[]} fields fields to be protected
   */
  setProtectedFields(userId: Entity, fields: string[]) {
    this._setArrayAccess('protectedFields', userId, fields);
  }

  /**
   * Returns array of fields are accessable to this user.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {string[]}
   */
  getProtectedFields(userId: Entity): string[] {
    return this._getAccess('protectedFields', userId, false);
  }

  /**
   * Sets whether the given user is allowed to read from this class.
   *
   * @param userId An instance of Parse.User or its objectId.
   * @param {boolean} allowed whether that user should have read access.
   */
  setReadAccess(userId: Entity, allowed: boolean) {
    this._setAccess('find', userId, allowed);
    this._setAccess('get', userId, allowed);
    this._setAccess('count', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to read from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicReadAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getReadAccess(userId: Entity): boolean {
    return (
      this._getAccess('find', userId) &&
      this._getAccess('get', userId) &&
      this._getAccess('count', userId)
    );
  }

  /**
   * Sets whether the given user is allowed to find from this class.
   *
   * @param userId An instance of Parse.User or its objectId.
   * @param {boolean} allowed whether that user should have read access.
   */
  setFindAccess(userId: Entity, allowed: boolean) {
    this._setAccess('find', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to find from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicFindAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getFindAccess(userId: Entity): boolean {
    return this._getAccess('find', userId);
  }

  /**
   * Sets whether the given user is allowed to get from this class.
   *
   * @param userId An instance of Parse.User or its objectId.
   * @param {boolean} allowed whether that user should have read access.
   */
  setGetAccess(userId: Entity, allowed: boolean) {
    this._setAccess('get', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to get from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicGetAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getGetAccess(userId: Entity): boolean {
    return this._getAccess('get', userId);
  }

  /**
   * Sets whether the given user is allowed to count from this class.
   *
   * @param userId An instance of Parse.User or its objectId.
   * @param {boolean} allowed whether that user should have read access.
   */
  setCountAccess(userId: Entity, allowed: boolean) {
    this._setAccess('count', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to count from this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicCountAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getCountAccess(userId: Entity): boolean {
    return this._getAccess('count', userId);
  }

  /**
   * Sets whether the given user id is allowed to write to this class.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {boolean} allowed Whether that user should have write access.
   */
  setWriteAccess(userId: Entity, allowed: boolean) {
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
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getWriteAccess(userId: Entity): boolean {
    return (
      this._getAccess('create', userId) &&
      this._getAccess('update', userId) &&
      this._getAccess('delete', userId) &&
      this._getAccess('addField', userId)
    );
  }

  /**
   * Sets whether the given user id is allowed to create field to this class.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {boolean} allowed Whether that user should have write access.
   */
  setCreateAccess(userId: Entity, allowed: boolean) {
    this._setAccess('create', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to create field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicCreateAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getCreateAccess(userId: Entity): boolean {
    return this._getAccess('create', userId);
  }

  /**
   * Sets whether the given user id is allowed to update field to this class.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {boolean} allowed Whether that user should have write access.
   */
  setUpdateAccess(userId: Entity, allowed: boolean) {
    this._setAccess('update', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to update field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicUpdateAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getUpdateAccess(userId: Entity): boolean {
    return this._getAccess('update', userId);
  }

  /**
   * Sets whether the given user id is allowed to delete field to this class.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {boolean} allowed Whether that user should have write access.
   */
  setDeleteAccess(userId: Entity, allowed: boolean) {
    this._setAccess('delete', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to delete field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicDeleteAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getDeleteAccess(userId: Entity): boolean {
    return this._getAccess('delete', userId);
  }

  /**
   * Sets whether the given user id is allowed to add field to this class.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
   * @param {boolean} allowed Whether that user should have write access.
   */
  setAddFieldAccess(userId: Entity, allowed: boolean) {
    this._setAccess('addField', userId, allowed);
  }

  /**
   * Get whether the given user id is *explicitly* allowed to add field to this class.
   * Even if this returns false, the user may still be able to access it if
   * getPublicReadAccess returns true or a role that the user belongs to has
   * write access.
   *
   * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
   * @returns {boolean}
   */
  getAddFieldAccess(userId: Entity): boolean {
    return this._getAccess('addField', userId);
  }

  /**
   * Sets whether the public is allowed to read from this class.
   *
   * @param {boolean} allowed
   */
  setPublicReadAccess(allowed: boolean) {
    this.setReadAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to read from this class.
   *
   * @returns {boolean}
   */
  getPublicReadAccess(): boolean {
    return this.getReadAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to find from this class.
   *
   * @param {boolean} allowed
   */
  setPublicFindAccess(allowed: boolean) {
    this.setFindAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to find from this class.
   *
   * @returns {boolean}
   */
  getPublicFindAccess(): boolean {
    return this.getFindAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to get from this class.
   *
   * @param {boolean} allowed
   */
  setPublicGetAccess(allowed: boolean) {
    this.setGetAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to get from this class.
   *
   * @returns {boolean}
   */
  getPublicGetAccess(): boolean {
    return this.getGetAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to count from this class.
   *
   * @param {boolean} allowed
   */
  setPublicCountAccess(allowed: boolean) {
    this.setCountAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to count from this class.
   *
   * @returns {boolean}
   */
  getPublicCountAccess(): boolean {
    return this.getCountAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to write to this class.
   *
   * @param {boolean} allowed
   */
  setPublicWriteAccess(allowed: boolean) {
    this.setWriteAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to write to this class.
   *
   * @returns {boolean}
   */
  getPublicWriteAccess(): boolean {
    return this.getWriteAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to create to this class.
   *
   * @param {boolean} allowed
   */
  setPublicCreateAccess(allowed: boolean) {
    this.setCreateAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to create to this class.
   *
   * @returns {boolean}
   */
  getPublicCreateAccess(): boolean {
    return this.getCreateAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to update to this class.
   *
   * @param {boolean} allowed
   */
  setPublicUpdateAccess(allowed: boolean) {
    this.setUpdateAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to update to this class.
   *
   * @returns {boolean}
   */
  getPublicUpdateAccess(): boolean {
    return this.getUpdateAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to delete to this class.
   *
   * @param {boolean} allowed
   */
  setPublicDeleteAccess(allowed: boolean) {
    this.setDeleteAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to delete to this class.
   *
   * @returns {boolean}
   */
  getPublicDeleteAccess(): boolean {
    return this.getDeleteAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to add fields to this class.
   *
   * @param {boolean} allowed
   */
  setPublicAddFieldAccess(allowed: boolean) {
    this.setAddFieldAccess(PUBLIC_KEY, allowed);
  }

  /**
   * Gets whether the public is allowed to add fields to this class.
   *
   * @returns {boolean}
   */
  getPublicAddFieldAccess(): boolean {
    return this.getAddFieldAccess(PUBLIC_KEY);
  }

  /**
   * Sets whether the public is allowed to protect fields in this class.
   *
   * @param {string[]} fields
   */
  setPublicProtectedFields(fields: string[]) {
    this.setProtectedFields(PUBLIC_KEY, fields);
  }

  /**
   * Gets whether the public is allowed to read fields from this class.
   *
   * @returns {string[]}
   */
  getPublicProtectedFields(): string[] {
    return this.getProtectedFields(PUBLIC_KEY);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to read from this class. Even if this returns false, the role may
   * still be able to write it if a parent role has read access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has read access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleReadAccess(role: ParseRole | string): boolean {
    return this.getReadAccess(this._getRoleName(role));
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to write to this user. Even if this returns false, the role may
   * still be able to write it if a parent role has write access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has write access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleWriteAccess(role: ParseRole | string): boolean {
    return this.getWriteAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to read from this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can read this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleReadAccess(role: ParseRole | string, allowed: boolean) {
    this.setReadAccess(this._getRoleName(role), allowed);
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to write to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleWriteAccess(role: ParseRole | string, allowed: boolean) {
    this.setWriteAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to find to this user. Even if this returns false, the role may
   * still be able to find it if a parent role has find access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has find access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleFindAccess(role: ParseRole | string): boolean {
    return this.getFindAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to find field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleFindAccess(role: ParseRole | string, allowed: boolean) {
    this.setFindAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to get to this user. Even if this returns false, the role may
   * still be able to get it if a parent role has get access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has get access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleGetAccess(role: ParseRole | string): boolean {
    return this.getGetAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to get field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleGetAccess(role: ParseRole | string, allowed: boolean) {
    this.setGetAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to count to this user. Even if this returns false, the role may
   * still be able to count it if a parent role has count access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has count access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleCountAccess(role: ParseRole | string): boolean {
    return this.getCountAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to count field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleCountAccess(role: ParseRole | string, allowed: boolean) {
    this.setCountAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to create to this user. Even if this returns false, the role may
   * still be able to create it if a parent role has create access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has create access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleCreateAccess(role: ParseRole | string): boolean {
    return this.getCreateAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to create field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleCreateAccess(role: ParseRole | string, allowed: boolean) {
    this.setCreateAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to update to this user. Even if this returns false, the role may
   * still be able to update it if a parent role has update access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has update access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleUpdateAccess(role: ParseRole | string): boolean {
    return this.getUpdateAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to update field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleUpdateAccess(role: ParseRole | string, allowed: boolean) {
    this.setUpdateAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to delete to this user. Even if this returns false, the role may
   * still be able to delete it if a parent role has delete access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has delete access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleDeleteAccess(role: ParseRole | string): boolean {
    return this.getDeleteAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to delete field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleDeleteAccess(role: ParseRole | string, allowed: boolean) {
    this.setDeleteAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to add to this user. Even if this returns false, the role may
   * still be able to add it if a parent role has add access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {boolean} true if the role has add access. false otherwise.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleAddFieldAccess(role: ParseRole | string): boolean {
    return this.getAddFieldAccess(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to add field to this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {boolean} allowed Whether the given role can write this object.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleAddFieldAccess(role: ParseRole | string, allowed: boolean) {
    this.setAddFieldAccess(this._getRoleName(role), allowed);
  }

  /**
   * Gets whether users belonging to the given role are allowed
   * to count to this user. Even if this returns false, the role may
   * still be able to count it if a parent role has count access.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @returns {string[]}
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  getRoleProtectedFields(role: ParseRole | string): string[] {
    return this.getProtectedFields(this._getRoleName(role));
  }

  /**
   * Sets whether users belonging to the given role are allowed
   * to set access field in this class.
   *
   * @param role The name of the role, or a Parse.Role object.
   * @param {string[]} fields Fields to be protected by Role.
   * @throws {TypeError} If role is neither a Parse.Role nor a String.
   */
  setRoleProtectedFields(role: ParseRole | string, fields: string[]) {
    this.setProtectedFields(this._getRoleName(role), fields);
  }
}

export default ParseCLP;
