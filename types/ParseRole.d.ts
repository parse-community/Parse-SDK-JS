import ParseACL from './ParseACL';
import ParseError from './ParseError';
import ParseObject, { Attributes, SetOptions } from './ParseObject';
import type { AttributeMap } from './ObjectStateMutations';
import type ParseRelation from './ParseRelation';
import type ParseUser from './ParseUser';
/**
 * Represents a Role on the Parse server. Roles represent groupings of
 * Users for the purposes of granting permissions (e.g. specifying an ACL
 * for an Object). Roles are specified by their sets of child users and
 * child roles, all of which are granted any permissions that the parent
 * role has.
 *
 * <p>Roles must have a name (which cannot be changed after creation of the
 * role), and must specify an ACL.</p>
 *
 * @alias Parse.Role
 * @augments Parse.Object
 */
declare class ParseRole<T extends Attributes = Attributes> extends ParseObject<T> {
    /**
     * @param {string} name The name of the Role to create.
     * @param {Parse.ACL} acl The ACL for this role. Roles must have an ACL.
     * A Parse.Role is a local representation of a role persisted to the Parse
     * cloud.
     */
    constructor(name: string, acl: ParseACL);
    /**
     * Gets the name of the role.  You can alternatively call role.get("name")
     *
     * @returns {string} the name of the role.
     */
    getName(): string | null;
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
     * @param {string} name The name of the role.
     * @param {object} options Standard options object with success and error
     *     callbacks.
     * @returns {Parse.Object} Returns the object, so you can chain this call.
     */
    setName(name: string, options?: SetOptions): this;
    /**
     * Gets the Parse.Relation for the Parse.Users that are direct
     * children of this role. These users are granted any privileges that this
     * role has been granted (e.g. read or write access through ACLs). You can
     * add or remove users from the role through this relation.
     *
     * <p>This is equivalent to calling role.relation("users")</p>
     *
     * @returns {Parse.Relation} the relation for the users belonging to this
     *     role.
     */
    getUsers<U extends ParseUser>(): ParseRelation<ParseRole, U>;
    /**
     * Gets the Parse.Relation for the Parse.Roles that are direct
     * children of this role. These roles' users are granted any privileges that
     * this role has been granted (e.g. read or write access through ACLs). You
     * can add or remove child roles from this role through this relation.
     *
     * <p>This is equivalent to calling role.relation("roles")</p>
     *
     * @returns {Parse.Relation} the relation for the roles belonging to this
     *     role.
     */
    getRoles(): ParseRelation<ParseRole, ParseRole>;
    _validateName(newName: any): void;
    validate(attrs: AttributeMap, options?: any): ParseError | boolean;
}
export default ParseRole;
