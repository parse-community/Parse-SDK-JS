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
 * @alias Parse.Polygon
 */

class ParsePolygon {
  /*:: _coordinates: Array;*/

  /**
   * @param {(Number[][]|Parse.GeoPoint[])} coordinates An Array of coordinate pairs
   */
  constructor(arg1
  /*: Array*/
  ) {
    this._coordinates = ParsePolygon._validate(arg1);
  }
  /**
   * Coordinates value for this Polygon.
   * Throws an exception if not valid type.
   * @property coordinates
   * @type Array
   */


  get coordinates()
  /*: Array*/
  {
    return this._coordinates;
  }

  set coordinates(coords
  /*: Array*/
  ) {
    this._coordinates = ParsePolygon._validate(coords);
  }
  /**
   * Returns a JSON representation of the Polygon, suitable for Parse.
   * @return {Object}
   */


  toJSON()
  /*: { __type: string; coordinates: Array;}*/
  {
    ParsePolygon._validate(this._coordinates);

    return {
      __type: 'Polygon',
      coordinates: this._coordinates
    };
  }
  /**
   * Checks if two polygons are equal
   * @param {(Parse.Polygon|Object)} other
   * @returns {Boolean}
   */


  equals(other
  /*: mixed*/
  )
  /*: boolean*/
  {
    if (!(other instanceof ParsePolygon) || this.coordinates.length !== other.coordinates.length) {
      return false;
    }

    let isEqual = true;

    for (let i = 1; i < this._coordinates.length; i += 1) {
      if (this._coordinates[i][0] != other.coordinates[i][0] || this._coordinates[i][1] != other.coordinates[i][1]) {
        isEqual = false;
        break;
      }
    }

    return isEqual;
  }
  /**
   *
   * @param {Parse.GeoPoint} point
   * @returns {Boolean} Returns if the point is contained in the polygon
   */


  containsPoint(point
  /*: ParseGeoPoint*/
  )
  /*: boolean*/
  {
    let minX = this._coordinates[0][0];
    let maxX = this._coordinates[0][0];
    let minY = this._coordinates[0][1];
    let maxY = this._coordinates[0][1];

    for (let i = 1; i < this._coordinates.length; i += 1) {
      const p = this._coordinates[i];
      minX = Math.min(p[0], minX);
      maxX = Math.max(p[0], maxX);
      minY = Math.min(p[1], minY);
      maxY = Math.max(p[1], maxY);
    }

    const outside = point.latitude < minX || point.latitude > maxX || point.longitude < minY || point.longitude > maxY;

    if (outside) {
      return false;
    }

    let inside = false;

    for (let i = 0, j = this._coordinates.length - 1; i < this._coordinates.length; j = i++) {
      const startX = this._coordinates[i][0];
      const startY = this._coordinates[i][1];
      const endX = this._coordinates[j][0];
      const endY = this._coordinates[j][1];
      const intersect = startY > point.longitude != endY > point.longitude && point.latitude < (endX - startX) * (point.longitude - startY) / (endY - startY) + startX;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  }
  /**
   * Validates that the list of coordinates can form a valid polygon
   * @param {Array} coords the list of coordinated to validate as a polygon
   * @throws {TypeError}
   */


  static _validate(coords
  /*: Array*/
  ) {
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

export default ParsePolygon;