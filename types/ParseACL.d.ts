import type ParseRole from './ParseRole';
import type ParseUser from './ParseUser';
type PermissionsMap = Record<string, boolean>;
type ByIdMap = Record<string, PermissionsMap>;
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
 *
 * @alias Parse.ACL
 */
declare class ParseACL {
    permissionsById: ByIdMap;
    /**
     * @param {(Parse.User | object | null)} arg1 The user to initialize the ACL for
     */
    constructor(arg1?: ParseUser | ByIdMap | null);
    /**
     * Returns a JSON-encoded version of the ACL.
     *
     * @returns {object}
     */
    toJSON(): ByIdMap;
    /**
     * Returns whether this ACL is equal to another object
     *
     * @param {ParseACL} other The other object's ACL to compare to
     * @returns {boolean}
     */
    equals(other: ParseACL): boolean;
    _setAccess(accessType: string, userId: ParseUser | ParseRole | string, allowed: boolean): void;
    _getAccess(accessType: string, userId: ParseUser | ParseRole | string): boolean;
    /**
     * Sets whether the given user is allowed to read this object.
     *
     * @param userId An instance of Parse.User or its objectId.
     * @param {boolean} allowed Whether that user should have read access.
     */
    setReadAccess(userId: ParseUser | ParseRole | string, allowed: boolean): void;
    /**
     * Get whether the given user id is *explicitly* allowed to read this object.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @returns {boolean}
     */
    getReadAccess(userId: ParseUser | ParseRole | string): boolean;
    /**
     * Sets whether the given user id is allowed to write this object.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
     * @param {boolean} allowed Whether that user should have write access.
     */
    setWriteAccess(userId: ParseUser | ParseRole | string, allowed: boolean): void;
    /**
     * Gets whether the given user id is *explicitly* allowed to write this object.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @returns {boolean}
     */
    getWriteAccess(userId: ParseUser | ParseRole | string): boolean;
    /**
     * Sets whether the public is allowed to read this object.
     *
     * @param {boolean} allowed
     */
    setPublicReadAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to read this object.
     *
     * @returns {boolean}
     */
    getPublicReadAccess(): boolean;
    /**
     * Sets whether the public is allowed to write this object.
     *
     * @param {boolean} allowed
     */
    setPublicWriteAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to write this object.
     *
     * @returns {boolean}
     */
    getPublicWriteAccess(): boolean;
    /**
     * Gets whether users belonging to the given role are allowed
     * to read this object. Even if this returns false, the role may
     * still be able to write it if a parent role has read access.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @returns {boolean} true if the role has read access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    getRoleReadAccess(role: ParseRole | string): boolean;
    /**
     * Gets whether users belonging to the given role are allowed
     * to write this object. Even if this returns false, the role may
     * still be able to write it if a parent role has write access.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @returns {boolean} true if the role has write access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    getRoleWriteAccess(role: ParseRole | string): boolean;
    /**
     * Sets whether users belonging to the given role are allowed
     * to read this object.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @param {boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    setRoleReadAccess(role: ParseRole | string, allowed: boolean): void;
    /**
     * Sets whether users belonging to the given role are allowed
     * to write this object.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @param {boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    setRoleWriteAccess(role: ParseRole | string, allowed: boolean): void;
}
export default ParseACL;
