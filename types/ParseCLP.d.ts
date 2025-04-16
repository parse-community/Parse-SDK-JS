import ParseRole from './ParseRole';
import ParseUser from './ParseUser';
type Entity = ParseUser | ParseRole | string;
type UsersMap = Record<string, boolean | any>;
export type PermissionsMap = {
    writeUserFields?: string[];
    readUserFields?: string[];
} & Record<string, UsersMap>;
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
 * For get/count/find/create/update/delete/addField using the following functions:
 *
 * Entity is type Parse.User or Parse.Role or string
 * Role is type Parse.Role or Name of Parse.Role
 *
 * getGetRequiresAuthentication()
 * setGetRequiresAuthentication(allowed: boolean)
 * getGetPointerFields()
 * setGetPointerFields(pointerFields: string[])
 * getGetAccess(entity: Entity)
 * setGetAccess(entity: Entity, allowed: boolean)
 * getPublicGetAccess()
 * setPublicGetAccess(allowed: boolean)
 * getRoleGetAccess(role: Role)
 * setRoleGetAccess(role: Role, allowed: boolean)
 * getFindRequiresAuthentication()
 * setFindRequiresAuthentication(allowed: boolean)
 * getFindPointerFields()
 * setFindPointerFields(pointerFields: string[])
 * getFindAccess(entity: Entity)
 * setFindAccess(entity: Entity, allowed: boolean)
 * getPublicFindAccess()
 * setPublicFindAccess(allowed: boolean)
 * getRoleFindAccess(role: Role)
 * setRoleFindAccess(role: Role, allowed: boolean)
 * getCountRequiresAuthentication()
 * setCountRequiresAuthentication(allowed: boolean)
 * getCountPointerFields()
 * setCountPointerFields(pointerFields: string[])
 * getCountAccess(entity: Entity)
 * setCountAccess(entity: Entity, allowed: boolean)
 * getPublicCountAccess()
 * setPublicCountAccess(allowed: boolean)
 * getRoleCountAccess(role: Role)
 * setRoleCountAccess(role: Role, allowed: boolean)
 * getCreateRequiresAuthentication()
 * setCreateRequiresAuthentication(allowed: boolean)
 * getCreatePointerFields()
 * setCreatePointerFields(pointerFields: string[])
 * getCreateAccess(entity: Entity)
 * setCreateAccess(entity: Entity, allowed: boolean)
 * getPublicCreateAccess()
 * setPublicCreateAccess(allowed: Boolean)
 * getRoleCreateAccess(role: Role)
 * setRoleCreateAccess(role: Role, allowed: boolean)
 * getUpdateRequiresAuthentication()
 * setUpdateRequiresAuthentication(allowed: boolean)
 * getUpdatePointerFields()
 * setUpdatePointerFields(pointerFields: string[])
 * getUpdateAccess(entity: Entity)
 * setUpdateAccess(entity: Entity, allowed: boolean)
 * getPublicUpdateAccess()
 * setPublicUpdateAccess(allowed: boolean)
 * getRoleUpdateAccess(role: Role)
 * setRoleUpdateAccess(role: Role, allowed: boolean)
 * getDeleteRequiresAuthentication()
 * setDeleteRequiresAuthentication(allowed: boolean)
 * getDeletePointerFields()
 * setDeletePointerFields(pointerFields: string[])
 * getDeleteAccess(entity: Entity)
 * setDeleteAccess(entity: Entity, allowed: boolean)
 * getPublicDeleteAccess()
 * setPublicDeleteAccess(allowed: boolean)
 * getRoleDeleteAccess(role: Role)
 * setRoleDeleteAccess(role: Role, allowed: boolean)
 * getAddFieldRequiresAuthentication()
 * setAddFieldRequiresAuthentication(allowed: boolean)
 * getAddFieldPointerFields()
 * setAddFieldPointerFields(pointerFields: string[])
 * getAddFieldAccess(entity: Entity)
 * setAddFieldAccess(entity: Entity, allowed: boolean)
 * getPublicAddFieldAccess()
 * setPublicAddFieldAccess(allowed: boolean)
 * getRoleAddFieldAccess(role: Role)
 * setRoleAddFieldAccess(role: Role, allowed: boolean)
 * </p>
 *
 * @alias Parse.CLP
 */
declare class ParseCLP {
    permissionsMap: PermissionsMap;
    /**
     * @param {(Parse.User | Parse.Role | object)} userId The user to initialize the CLP for
     */
    constructor(userId: ParseUser | ParseRole | PermissionsMap);
    /**
     * Returns a JSON-encoded version of the CLP.
     *
     * @returns {object}
     */
    toJSON(): PermissionsMap;
    /**
     * Returns whether this CLP is equal to another object
     *
     * @param other The other object to compare to
     * @returns {boolean}
     */
    equals(other: ParseCLP): boolean;
    _getRoleName(role: ParseRole | string): string;
    _parseEntity(entity: Entity): string;
    _setAccess(permission: string, userId: Entity, allowed: boolean): void;
    _getAccess(permission: string, userId: Entity, returnBoolean?: boolean): boolean | string[];
    _setArrayAccess(permission: string, userId: Entity, fields: string[]): void;
    _setGroupPointerPermission(operation: string, pointerFields: string[]): void;
    _getGroupPointerPermissions(operation: 'readUserFields' | 'writeUserFields'): string[];
    /**
     * Sets user pointer fields to allow permission for get/count/find operations.
     *
     * @param {string[]} pointerFields User pointer fields
     */
    setReadUserFields(pointerFields: string[]): void;
    /**
     * @returns {string[]} User pointer fields
     */
    getReadUserFields(): string[];
    /**
     * Sets user pointer fields to allow permission for create/delete/update/addField operations
     *
     * @param {string[]} pointerFields User pointer fields
     */
    setWriteUserFields(pointerFields: string[]): void;
    /**
     * @returns {string[]} User pointer fields
     */
    getWriteUserFields(): string[];
    /**
     * Sets whether the given user is allowed to retrieve fields from this class.
     *
     * @param userId An instance of Parse.User or its objectId.
     * @param {string[]} fields fields to be protected
     */
    setProtectedFields(userId: Entity, fields: string[]): void;
    /**
     * Returns array of fields are accessable to this user.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @returns {string[]}
     */
    getProtectedFields(userId: Entity): string[];
    /**
     * Sets whether the given user is allowed to read from this class.
     *
     * @param userId An instance of Parse.User or its objectId.
     * @param {boolean} allowed whether that user should have read access.
     */
    setReadAccess(userId: Entity, allowed: boolean): void;
    /**
     * Get whether the given user id is *explicitly* allowed to read from this class.
     * Even if this returns false, the user may still be able to access it if
     * getPublicReadAccess returns true or a role that the user belongs to has
     * write access.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @returns {boolean}
     */
    getReadAccess(userId: Entity): boolean;
    /**
     * Sets whether the given user id is allowed to write to this class.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role..
     * @param {boolean} allowed Whether that user should have write access.
     */
    setWriteAccess(userId: Entity, allowed: boolean): void;
    /**
     * Gets whether the given user id is *explicitly* allowed to write to this class.
     * Even if this returns false, the user may still be able to write it if
     * getPublicWriteAccess returns true or a role that the user belongs to has
     * write access.
     *
     * @param userId An instance of Parse.User or its objectId, or a Parse.Role.
     * @returns {boolean}
     */
    getWriteAccess(userId: Entity): boolean;
    /**
     * Sets whether the public is allowed to read from this class.
     *
     * @param {boolean} allowed
     */
    setPublicReadAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to read from this class.
     *
     * @returns {boolean}
     */
    getPublicReadAccess(): boolean;
    /**
     * Sets whether the public is allowed to write to this class.
     *
     * @param {boolean} allowed
     */
    setPublicWriteAccess(allowed: boolean): void;
    /**
     * Gets whether the public is allowed to write to this class.
     *
     * @returns {boolean}
     */
    getPublicWriteAccess(): boolean;
    /**
     * Sets whether the public is allowed to protect fields in this class.
     *
     * @param {string[]} fields
     */
    setPublicProtectedFields(fields: string[]): void;
    /**
     * Gets whether the public is allowed to read fields from this class.
     *
     * @returns {string[]}
     */
    getPublicProtectedFields(): string[];
    /**
     * Gets whether users belonging to the given role are allowed
     * to read from this class. Even if this returns false, the role may
     * still be able to write it if a parent role has read access.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @returns {boolean} true if the role has read access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    getRoleReadAccess(role: ParseRole | string): boolean;
    /**
     * Gets whether users belonging to the given role are allowed
     * to write to this user. Even if this returns false, the role may
     * still be able to write it if a parent role has write access.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @returns {boolean} true if the role has write access. false otherwise.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    getRoleWriteAccess(role: ParseRole | string): boolean;
    /**
     * Sets whether users belonging to the given role are allowed
     * to read from this class.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @param {boolean} allowed Whether the given role can read this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    setRoleReadAccess(role: ParseRole | string, allowed: boolean): void;
    /**
     * Sets whether users belonging to the given role are allowed
     * to write to this class.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @param {boolean} allowed Whether the given role can write this object.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    setRoleWriteAccess(role: ParseRole | string, allowed: boolean): void;
    /**
     * Gets whether users belonging to the given role are allowed
     * to count to this user. Even if this returns false, the role may
     * still be able to count it if a parent role has count access.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @returns {string[]}
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    getRoleProtectedFields(role: ParseRole | string): string[];
    /**
     * Sets whether users belonging to the given role are allowed
     * to set access field in this class.
     *
     * @param role The name of the role, or a Parse.Role object.
     * @param {string[]} fields Fields to be protected by Role.
     * @throws {TypeError} If role is neither a Parse.Role nor a String.
     */
    setRoleProtectedFields(role: ParseRole | string, fields: string[]): void;
}
export default ParseCLP;
