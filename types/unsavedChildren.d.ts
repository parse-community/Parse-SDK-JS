import ParseFile from './ParseFile';
import type ParseObject from './ParseObject';
/**
 * Return an array of unsaved children, which are either Parse Objects or Files.
 * If it encounters any dirty Objects without Ids, it will throw an exception.
 *
 * @param {Parse.Object} obj
 * @param {boolean} allowDeepUnsaved
 * @returns {Array}
 */
export default function unsavedChildren(obj: ParseObject, allowDeepUnsaved?: boolean): (ParseFile | ParseObject)[];
