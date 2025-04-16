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
    _latitude: number;
    _longitude: number;
    /**
     * @param {(number[] | object | number)} arg1 Either a list of coordinate pairs, an object with `latitude`, `longitude`, or the latitude or the point.
     * @param {number} arg2 The longitude of the GeoPoint
     */
    constructor(arg1?: [number, number] | {
        latitude: number;
        longitude: number;
    } | number, arg2?: number);
    /**
     * North-south portion of the coordinate, in range [-90, 90].
     * Throws an exception if set out of range in a modern browser.
     *
     * @property {number} latitude
     * @returns {number}
     */
    get latitude(): number;
    set latitude(val: number);
    /**
     * East-west portion of the coordinate, in range [-180, 180].
     * Throws if set out of range in a modern browser.
     *
     * @property {number} longitude
     * @returns {number}
     */
    get longitude(): number;
    set longitude(val: number);
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
    equals(other: any): boolean;
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
    static _validate(latitude: number, longitude: number): void;
    /**
     * Creates a GeoPoint with the user's current location, if available.
     *
     * @param {object} options The options.
     * @param {boolean} [options.enableHighAccuracy] A boolean value that indicates the application would like to receive the best possible results.
     *  If true and if the device is able to provide a more accurate position, it will do so.
     *  Note that this can result in slower response times or increased power consumption (with a GPS chip on a mobile device for example).
     *  On the other hand, if false, the device can take the liberty to save resources by responding more quickly and/or using less power. Default: false.
     * @param {number} [options.timeout] A positive long value representing the maximum length of time (in milliseconds) the device is allowed to take in order to return a position.
     *  The default value is Infinity, meaning that getCurrentPosition() won't return until the position is available.
     * @param {number} [options.maximumAge] A positive long value indicating the maximum age in milliseconds of a possible cached position that is acceptable to return.
     *  If set to 0, it means that the device cannot use a cached position and must attempt to retrieve the real current position.
     *  If set to Infinity the device must return a cached position regardless of its age. Default: 0.
     * @static
     * @returns {Promise<Parse.GeoPoint>} User's current location
     */
    static current(options: any): Promise<ParseGeoPoint>;
}
export default ParseGeoPoint;
