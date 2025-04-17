import ParseGeoPoint from './ParseGeoPoint';
type Coordinate = [number, number];
type Coordinates = Coordinate[];
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
    _coordinates: Coordinates;
    /**
     * @param {(Coordinates | Parse.GeoPoint[])} coordinates An Array of coordinate pairs
     */
    constructor(coordinates: Coordinates | ParseGeoPoint[]);
    /**
     * Coordinates value for this Polygon.
     * Throws an exception if not valid type.
     *
     * @property {(Coordinates | Parse.GeoPoint[])} coordinates list of coordinates
     * @returns {Coordinates}
     */
    get coordinates(): Coordinates;
    set coordinates(coords: Coordinates | ParseGeoPoint[]);
    /**
     * Returns a JSON representation of the Polygon, suitable for Parse.
     *
     * @returns {object}
     */
    toJSON(): {
        __type: string;
        coordinates: Coordinates;
    };
    /**
     * Checks if two polygons are equal
     *
     * @param {(Parse.Polygon | object)} other
     * @returns {boolean}
     */
    equals(other: ParsePolygon | any): boolean;
    /**
     *
     * @param {Parse.GeoPoint} point
     * @returns {boolean} Returns if the point is contained in the polygon
     */
    containsPoint(point: ParseGeoPoint): boolean;
    /**
     * Validates that the list of coordinates can form a valid polygon
     *
     * @param {Array} coords the list of coordinates to validate as a polygon
     * @throws {TypeError}
     * @returns {number[][]} Array of coordinates if validated.
     */
    static _validate(coords: Coordinates | ParseGeoPoint[]): Coordinates;
}
export default ParsePolygon;
