import type ParseObject from './ParseObject';
import type ParseQuery from './ParseQuery';
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
 *
 * @alias Parse.Relation
 */
declare class ParseRelation<S extends ParseObject = ParseObject, T extends ParseObject = ParseObject> {
    parent?: S;
    key?: string;
    targetClassName?: string | null;
    /**
     * @param {Parse.Object} parent The parent of this relation.
     * @param {string} key The key for this relation on the parent.
     */
    constructor(parent?: S, key?: string);
    _ensureParentAndKey(parent: S, key: string): void;
    /**
     * Adds a Parse.Object or an array of Parse.Objects to the relation.
     *
     * @param {(Parse.Object|Array)} objects The item or items to add.
     * @returns {Parse.Object} The parent of the relation.
     */
    add(objects: T | T[]): S;
    /**
     * Removes a Parse.Object or an array of Parse.Objects from this relation.
     *
     * @param {(Parse.Object|Array)} objects The item or items to remove.
     */
    remove(objects: T | T[]): void;
    /**
     * Returns a JSON version of the object suitable for saving to disk.
     *
     * @returns {object} JSON representation of Relation
     */
    toJSON(): {
        __type: 'Relation';
        className: string | null;
    };
    /**
     * Returns a Parse.Query that is limited to objects in this
     * relation.
     *
     * @returns {Parse.Query} Relation Query
     */
    query(): ParseQuery<T>;
}
export default ParseRelation;
