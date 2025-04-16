/**
 * matchesQuery -- Determines if an object would be returned by a Parse Query
 * It's a lightweight, where-clause only implementation of a full query engine.
 * Since we find queries that match objects, rather than objects that match
 * queries, we can avoid building a full-blown query tool.
 *
 * @param className
 * @param object
 * @param objects
 * @param query
 * @private
 * @returns {boolean}
 */
declare function matchesQuery(className: any, object: any, objects: any, query: any): boolean;
declare function validateQuery(query: any): void;
declare const OfflineQuery: {
    matchesQuery: typeof matchesQuery;
    validateQuery: typeof validateQuery;
};
export default OfflineQuery;
