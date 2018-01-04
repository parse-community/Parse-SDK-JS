/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import ParsePromise from './ParsePromise';

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
 * @alias Parse.GeoPoint
 */
class ParseGeoPoint {
  _latitude: number;
  _longitude: number;

  /**
   * @param {(Number[]|Object|Number)} options Either a list of coordinate pairs, an object with `latitude`, `longitude`, or the latitude or the point. 
   * @param {Number} longitude The longitude of the GeoPoint
   */
  constructor(
    arg1: Array<number> |
    { latitude: number; longitude: number } |
    number, arg2?: number
  ) {
    if (Array.isArray(arg1)) {
      ParseGeoPoint._validate(arg1[0], arg1[1]);
      this._latitude = arg1[0];
      this._longitude = arg1[1];
    } else if (typeof arg1 === 'object') {
      ParseGeoPoint._validate(arg1.latitude, arg1.longitude);
      this._latitude = arg1.latitude;
      this._longitude = arg1.longitude;
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
      ParseGeoPoint._validate(arg1, arg2);
      this._latitude = arg1;
      this._longitude = arg2;
    } else {
      this._latitude = 0;
      this._longitude = 0;
    }
  }

  /**
   * North-south portion of the coordinate, in range [-90, 90].
   * Throws an exception if set out of range in a modern browser.
   * @property latitude
   * @type Number
   */
  get latitude(): number {
    return this._latitude;
  }

  set latitude(val: number) {
    ParseGeoPoint._validate(val, this.longitude);
    this._latitude = val;
  }

  /**
   * East-west portion of the coordinate, in range [-180, 180].
   * Throws if set out of range in a modern browser.
   * @property longitude
   * @type Number
   */
  get longitude(): number {
    return this._longitude;
  }

  set longitude(val: number) {
    ParseGeoPoint._validate(this.latitude, val);
    this._longitude = val;
  }

  /**
   * Returns a JSON representation of the GeoPoint, suitable for Parse.

   * @return {Object}
   */
  toJSON(): { __type: string; latitude: number; longitude: number } {
    ParseGeoPoint._validate(this._latitude, this._longitude);
    return {
      __type: 'GeoPoint',
      latitude: this._latitude,
      longitude: this._longitude
    };
  }

  equals(other: mixed): boolean {
    return (
      (other instanceof ParseGeoPoint) &&
      this.latitude === other.latitude &&
      this.longitude === other.longitude
    );
  }

  /**
   * Returns the distance from this GeoPoint to another in radians.

   * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
   * @return {Number}
   */
  radiansTo(point: ParseGeoPoint): number {
    var d2r = Math.PI / 180.0;
    var lat1rad = this.latitude * d2r;
    var long1rad = this.longitude * d2r;
    var lat2rad = point.latitude * d2r;
    var long2rad = point.longitude * d2r;
    var deltaLat = lat1rad - lat2rad;
    var deltaLong = long1rad - long2rad;
    var sinDeltaLatDiv2 = Math.sin(deltaLat / 2);
    var sinDeltaLongDiv2 = Math.sin(deltaLong / 2);
    // Square of half the straight line chord distance between both points.
    var a = ((sinDeltaLatDiv2 * sinDeltaLatDiv2) +
             (Math.cos(lat1rad) * Math.cos(lat2rad) *
              sinDeltaLongDiv2 * sinDeltaLongDiv2));
    a = Math.min(1.0, a);
    return 2 * Math.asin(Math.sqrt(a));
  }

  /**
   * Returns the distance from this GeoPoint to another in kilometers.

   * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
   * @return {Number}
   */
  kilometersTo(point: ParseGeoPoint): number {
    return this.radiansTo(point) * 6371.0;
  }

  /**
   * Returns the distance from this GeoPoint to another in miles.

   * @param {Parse.GeoPoint} point the other Parse.GeoPoint.
   * @return {Number}
   */
  milesTo(point: ParseGeoPoint): number {
    return this.radiansTo(point) * 3958.8;
  }

  /*
   * Throws an exception if the given lat-long is out of bounds.
   */
  static _validate(latitude: number, longitude: number) {
    if (latitude !== latitude || longitude !== longitude) {
      throw new TypeError(
        'GeoPoint latitude and longitude must be valid numbers'
      );
    }
    if (latitude < -90.0) {
      throw new TypeError(
        'GeoPoint latitude out of bounds: ' + latitude + ' < -90.0.'
      );
    }
    if (latitude > 90.0) {
      throw new TypeError(
        'GeoPoint latitude out of bounds: ' + latitude + ' > 90.0.'
      );
    }
    if (longitude < -180.0) {
      throw new TypeError(
        'GeoPoint longitude out of bounds: ' + longitude + ' < -180.0.'
      );
    }
    if (longitude > 180.0) {
      throw new TypeError(
        'GeoPoint longitude out of bounds: ' + longitude + ' > 180.0.'
      );
    }
  }

  /**
   * Creates a GeoPoint with the user's current location, if available.
   * Calls options.success with a new GeoPoint instance or calls options.error.

   * @param {Object} options An object with success and error callbacks.
   * @static
   */
  static current(options) {
    var promise = new ParsePromise();
    navigator.geolocation.getCurrentPosition(function(location) {
      promise.resolve(
        new ParseGeoPoint(location.coords.latitude, location.coords.longitude)
      );
    }, function(error) {
      promise.reject(error);
    });

    return promise._thenRunCallbacks(options);
  }
}

export default ParseGeoPoint;
