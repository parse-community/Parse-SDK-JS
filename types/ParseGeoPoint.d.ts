// @ts-nocheck
export default ParseGeoPoint;
/**
 * @flow
 */
/**
 * Creates a new GeoPoint with any of the following forms:<br>
 *   <pre>
 *   new GeoPoint(otherGeoPoint)
 *   new GeoPoint(30, 30)
 *   new GeoPoint([30, 30])
 *   new GeoPoint({latitude: 30, longitude: 30})
 *   new GeoPoint()  // defaults to (0, 0)
 *   </pre>
 * <p>Represents a latitude / longitude point that may be associated
 * with a key in a ParseObject or used as a reference point for geo queries.
 * This allows proximity-based queries on the key.</p>
 *
 * <p>Only one key in a class may contain a GeoPoint.</p>
 *
 * <p>Example:<pre>
 *   var point = new Parse.GeoPoint(30.0, -20.0);
 *   var object = new Parse.Object("PlaceObject");
 *   object.set("location", point);
 *   object.save();</pre></p>
 *
 * @alias Parse.GeoPoint
 */
declare class ParseGeoPoint {
    static _validate(latitude: number, longitude: number): void;
    /**
     * Creates a GeoPoint with the user's current location, if available.
     *
     * @static
     * @returns {Parse.GeoPoint} User's current location
     */
    static current(): Parse.GeoPoint;
    /**
     * @param {(number[] | object | number)} arg1 Either a list of coordinate pairs, an object with `latitude`, `longitude`, or the latitude or the point.
     * @param {number} arg2 The longitude of the GeoPoint
     */
    constructor(arg1: Array<number> | {
        latitude: number;
        longitude: number;
    } | number, arg2?: number);
    _latitude: number;
    _longitude: number;
    set latitude(arg: number);
    /**
     * North-south portion of the coordinate, in range [-90, 90].
     * Throws an exception if set out of range in a modern browser.
     *
     * @property {number} latitude
     * @returns {number}
     */
    get latitude(): number;
    set longitude(arg: number);
    /**
     * East-west portion of the coordinate, in range [-180, 180].
     * Throws if set out of range in a modern browser.
     *
     * @property {number} longitude
     * @returns {number}
     */
    get longitude(): number;
    /**
     * Returns a JSON representation of the GeoPoint, suitable for Parse.
     *
     * @returns {object}
     */
    toJSON(): {
        __type: string;
        latitude: number;
        longitude: number;
    };
    equals(other: mixed): boolean;
    /**
     * Returns the distance from this GeoPoint to another in radians.
     *
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @returns {number}
     */
    radiansTo(point: ParseGeoPoint): number;
    /**
     * Returns the distance from this GeoPoint to another in kilometers.
     *
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @returns {number}
     */
    kilometersTo(point: ParseGeoPoint): number;
    /**
     * Returns the distance from this GeoPoint to another in miles.
     *
     * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
     * @returns {number}
     */
    milesTo(point: ParseGeoPoint): number;
}
