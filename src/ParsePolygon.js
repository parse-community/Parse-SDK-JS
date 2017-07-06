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

import ParseGeoPoint from './ParseGeoPoint';

/**
 * Creates a new Polygon with any of the following forms:<br>
 *   <pre>
 *   new Polygon([[0,0],[0,1],[1,1],[1,0]])
 *   new Polygon([GeoPoint, GeoPoint, GeoPoint])
 *   </pre>
 * @class Parse.GeoPoint
 * @constructor
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
 */
export default class ParsePolygon {
  _coordinates: Array;

  constructor(
    arg1: Array,
  ) {
    this._coordinates = ParsePolygon._validate(arg1);
  }

  /**
   * Coordinates value for this Polygon.
   * Throws an exception if not valid type.
   * @property coordinates
   * @type Array
   */
  get coordinates(): Array {
    return this._coordinates;
  }

  set coordinates(coords: Array) {
    this._coordinates = ParsePolygon._validate(coords);
  }

  /**
   * Returns a JSON representation of the GeoPoint, suitable for Parse.
   * @method toJSON
   * @return {Object}
   */
  toJSON(): { __type: string; coordinates: Array;} {
    ParsePolygon._validate(this._coordinates);
    return {
      __type: 'Polygon',
      coordinates: this._coordinates,
    };
  }

  equals(other: mixed): boolean {
    return (
      (other instanceof ParsePolygon) &&
      this.coordinates === other.coordinates
    );
  }

  /**
   * Throws an exception if the given lat-long is out of bounds.
   * @return {Array}
   */
  static _validate(coords: Array) {
    if (!Array.isArray(coords)) {
      throw new TypeError('Coordinates must be an Array');
    }
    if (coords.length < 3) {
      throw new TypeError('Polygon must have at least 3 GeoPoints or Points');
    }
    const points = [];
    for (let i = 0; i < coords.length; i += 1) {
      const coord = coords[i];
      let geoPoint;
      if (coord instanceof ParseGeoPoint) {
        geoPoint = coord;
      } else if (Array.isArray(coord) && coord.length === 2) {
        geoPoint = new ParseGeoPoint(coord[0], coord[1]);
      } else {
        throw new TypeError('Coordinates must be an Array of GeoPoints or Points');
      }
      points.push([geoPoint.latitude, geoPoint.longitude]);
    }
    return points;
  }
}
