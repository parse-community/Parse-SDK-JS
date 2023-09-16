// @ts-nocheck

export default ParsePolygon;
/**
 * Creates a new Polygon with any of the following forms:<br>
 *   <pre>
 *   new Polygon([[0,0],[0,1],[1,1],[1,0]])
 *   new Polygon([GeoPoint, GeoPoint, GeoPoint])
 *   </pre>
 *
 * <p>Represents a coordinates that may be associated
 * with a key in a ParseObject or used as a reference point for geo queries.
 * This allows proximity-based queries on the key.</p>
 *
 * <p>Example:<pre>
 *   var polygon = new Parse.Polygon([[0,0],[0,1],[1,1],[1,0]]);
 *   var object = new Parse.Object("PlaceObject");
 *   object.set("area", polygon);
 *   object.save();</pre></p>
 *
 * @alias Parse.Polygon
 */
declare class ParsePolygon {
    /**
     * Validates that the list of coordinates can form a valid polygon
     *
     * @param {Array} coords the list of coordinates to validate as a polygon
     * @throws {TypeError}
     * @returns {number[][]} Array of coordinates if validated.
     */
    static _validate(coords: Array<Array<number>> | Array<ParseGeoPoint>): Array<Array<number>>;
    /**
     * @param {(number[][] | Parse.GeoPoint[])} coordinates An Array of coordinate pairs
     */
    constructor(coordinates: Array<Array<number>> | Array<ParseGeoPoint>);
    _coordinates: Array<Array<number>>;
    set coordinates(arg: number[][]);
    /**
     * Coordinates value for this Polygon.
     * Throws an exception if not valid type.
     *
     * @property {(number[][] | Parse.GeoPoint[])} coordinates list of coordinates
     * @returns {number[][]}
     */
    get coordinates(): number[][];
    /**
     * Returns a JSON representation of the Polygon, suitable for Parse.
     *
     * @returns {object}
     */
    toJSON(): {
        __type: string;
        coordinates: Array<Array<number>>;
    };
    /**
     * Checks if two polygons are equal
     *
     * @param {(Parse.Polygon | object)} other
     * @returns {boolean}
     */
    equals(other: mixed): boolean;
    /**
     *
     * @param {Parse.GeoPoint} point
     * @returns {boolean} Returns if the point is contained in the polygon
     */
    containsPoint(point: ParseGeoPoint): boolean;
}
import ParseGeoPoint from './ParseGeoPoint';
