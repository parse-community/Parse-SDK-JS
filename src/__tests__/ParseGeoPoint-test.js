/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const ParseGeoPoint = require('../ParseGeoPoint').default;

describe('GeoPoint', () => {
  it('can be constructed from various inputs', () => {
    let point = new ParseGeoPoint();
    expect(point.latitude).toBe(0);
    expect(point.longitude).toBe(0);

    point = new ParseGeoPoint(42, 36);
    expect(point.latitude).toBe(42);
    expect(point.longitude).toBe(36);

    point = new ParseGeoPoint([12, 24]);
    expect(point.latitude).toBe(12);
    expect(point.longitude).toBe(24);

    point = new ParseGeoPoint({ latitude: 8, longitude: 88 });
    expect(point.latitude).toBe(8);
    expect(point.longitude).toBe(88);
  });

  it('throws when created with non numbers values', () => {
    [
      [NaN, NaN],
      [false, true],
      ["29", "10"],
      [29, "10"],
      ["29", 10],
      [["29", "10"]],
      [{ latitude: "29", longitude: "10" }],
    ].forEach(case_test => {
      expect(function() {
        new ParseGeoPoint(...case_test);
      }).toThrow('GeoPoint latitude and longitude must be valid numbers');
    });
  });

  it('can set latitude and longitude', () => {
    const point = new ParseGeoPoint();
    expect(point.latitude).toBe(0);
    expect(point.longitude).toBe(0);

    point.latitude = 5.5;
    expect(point.latitude).toBe(5.5);

    point.latitude = 10;
    expect(point.latitude).toBe(10);

    point.longitude = 12.1;
    expect(point.longitude).toBe(12.1);

    point.longitude = 14.9;
    expect(point.longitude).toBe(14.9);
  });

  it('throws for points out of bounds', () => {
    expect(() => {
      new ParseGeoPoint(90.01, 0.0);
    }).toThrow();

    expect(() => {
      new ParseGeoPoint(-90.01, 0.0);
    }).toThrow();

    expect(() => {
      new ParseGeoPoint(0.0, 180.01);
    }).toThrow();

    expect(() => {
      new ParseGeoPoint(0.0, -180.01);
    }).toThrow();
  });

  it('can calculate distance in radians', () => {
    const d2r = Math.PI / 180.0;
    const pointA = new ParseGeoPoint();
    const pointB = new ParseGeoPoint();

    // Zero
    expect(pointA.radiansTo(pointB)).toBe(0);
    expect(pointB.radiansTo(pointA)).toBe(0);

    // Wrap Long
    pointA.longitude = 179.0;
    pointB.longitude = -179.0;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(2 * d2r, 5);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(2 * d2r, 5);

    // North South Lat
    pointA.latitude = 89.0;
    pointA.longitude = 0.0;
    pointB.latitude = -89.0;
    pointB.longitude = 0.0;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(178 * d2r, 5);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(178 * d2r, 5);

    // Long wrap Lat
    pointA.latitude = 89.0;
    pointA.longitude = 0.0;
    pointB.latitude = -89.0;
    pointB.longitude = 179.9999;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(180 * d2r, 5);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(180 * d2r, 5);

    pointA.latitude = 79.0;
    pointA.longitude = 90.0;
    pointB.latitude = -79.0;
    pointB.longitude = -90;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(180 * d2r, 5);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(180 * d2r, 5);

    // Wrap near pole - somewhat ill conditioned case due to pole proximity
    pointA.latitude = 85.0;
    pointA.longitude = 90.0;
    pointB.latitude = 85.0;
    pointB.longitude = -90;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(10 * d2r, 5);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(10 * d2r, 5);

    // Reference cities
    // Sydney Australia
    pointA.latitude = -34.0;
    pointA.longitude = 151.0;
    // Buenos Aires
    pointB.latitude = -34.5;
    pointB.longitude = -58.35;
    expect(pointA.radiansTo(pointB)).toBeCloseTo(1.85, 2);
    expect(pointB.radiansTo(pointA)).toBeCloseTo(1.85, 2);
  });

  it('can calculate distances in mi and km', () => {
    // [SAC]  38.52  -121.50  Sacramento,CA
    const sacramento = new ParseGeoPoint(38.52, -121.50);

    // [HNL]  21.35  -157.93  Honolulu Int,HI
    const honolulu = new ParseGeoPoint(21.35, -157.93);

    // [51Q]  37.75  -122.68  San Francisco,CA
    const sanfran = new ParseGeoPoint(37.75, -122.68);

    // Vorkuta 67.509619,64.085999
    const vorkuta = new ParseGeoPoint(67.509619, 64.085999);

    // London
    const london = new ParseGeoPoint(51.501904,-0.115356);

    // Northampton
    const northampton = new ParseGeoPoint(52.241256,-0.895386);

    // Powell St BART station
    const powell = new ParseGeoPoint(37.785071,-122.407007);

    // Apple store
    const astore = new ParseGeoPoint(37.785809,-122.406363);

    // Self
    expect(honolulu.kilometersTo(honolulu)).toBeCloseTo(0.0, 3);
    expect(honolulu.milesTo(honolulu)).toBeCloseTo(0.0, 3);

    // Symmetric
    expect(sacramento.kilometersTo(honolulu)).toBeCloseTo(3964.8, -2);
    expect(honolulu.kilometersTo(sacramento)).toBeCloseTo(3964.8, -2);
    expect(sacramento.milesTo(honolulu)).toBeCloseTo(2463.6, -1);
    expect(honolulu.milesTo(sacramento)).toBeCloseTo(2463.6, -1);

    // Semi-local
    expect(london.kilometersTo(northampton)).toBeCloseTo(98.4, 0);
    expect(london.milesTo(northampton)).toBeCloseTo(61.2, 0);

    expect(sacramento.kilometersTo(sanfran)).toBeCloseTo(134.5, 0);
    expect(sacramento.milesTo(sanfran)).toBeCloseTo(84.8, -1);

    // Very local
    expect(powell.kilometersTo(astore)).toBeCloseTo(0.1, 2);

    // Far (for error tolerance's sake)
    expect(sacramento.kilometersTo(vorkuta)).toBeCloseTo(8303.8, -3);
    expect(sacramento.milesTo(vorkuta)).toBeCloseTo(5159.7, -3);
  });

  it('can test equality against another GeoPoint', () => {
    let a = new ParseGeoPoint(40, 40);
    expect(a.equals(a)).toBe(true);

    let b = new ParseGeoPoint(40, 40);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    b = new ParseGeoPoint(50, 40);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    a = new ParseGeoPoint(40.001, 40.001);
    b = new ParseGeoPoint(40.001, 40.001);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    b = new ParseGeoPoint(40, 40);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    a = new ParseGeoPoint(40, 50);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
  });
});
