/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../decode');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParsePolygon');

const decode = require('../decode').default;

const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseObject = require('../ParseObject').default;
const ParsePolygon = require('../ParsePolygon').default;

describe('decode', () => {
  it('ignores primitives', () => {
    expect(decode(undefined)).toBe(undefined);
    expect(decode(null)).toBe(null);
    expect(decode(true)).toBe(true);
    expect(decode(12)).toBe(12);
    expect(decode('string')).toBe('string');
  });

  it('decodes dates', () => {
    expect(decode({
      __type: 'Date',
      iso: '2015-02-01T00:00:00.000Z'
    })).toEqual(new Date(Date.UTC(2015, 1)));
  });

  it('decodes GeoPoints', () => {
    const point = decode({
      __type: 'GeoPoint',
      latitude: 40.5,
      longitude: 50.4
    });
    expect(point instanceof ParseGeoPoint).toBe(true);
    expect(point.latitude).toBe(40.5);
    expect(point.longitude).toBe(50.4);
  });

  it('decodes Polygons', () => {
    const points = [[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]];
    const polygon = decode({
      __type: 'Polygon',
      coordinates: points,
    });
    expect(polygon instanceof ParsePolygon).toBe(true);
    expect(polygon.coordinates).toEqual(points);
  });

  it('decodes Files', () => {
    const file = decode({
      __type: 'File',
      name: 'parse.txt',
      url: 'https://files.parsetfss.com/a/parse.txt'
    });
    expect(file instanceof ParseFile).toBe(true);
    expect(file.name()).toBe('parse.txt');
    expect(file.url()).toBe('https://files.parsetfss.com/a/parse.txt');
  });

  it('decodes Relations', () => {
    const obj = decode({
      __type: 'Relation',
      className: 'Delivery'
    });
    expect(obj.constructor.mock.calls[0]).toEqual([
      null,
      null
    ]);
    expect(obj.targetClassName).toBe('Delivery');
  });

  it('decodes Pointers', () => {
    const data = {
      __type: 'Pointer',
      className: 'Item',
      objectId: '1001'
    };
    decode(data);
    expect(ParseObject.fromJSON.mock.calls[0][0]).toEqual(data);
  });

  it('decodes ParseObjects', () => {
    const data = {
      __type: 'Object',
      className: 'Item',
      objectId: '1001'
    };
    decode(data);
    expect(ParseObject.fromJSON.mock.calls[1][0]).toEqual(data);
  });

  it('iterates over arrays', () => {
    expect(decode([
      { __type: 'Date', iso: '2015-02-01T00:00:00.000Z' },
      12,
      'string'
    ])).toEqual([
      new Date(Date.UTC(2015, 1)),
      12,
      'string'
    ]);
  });

  it('iterates over objects', () => {
    expect(decode({
      empty: null,
      when: { __type: 'Date', iso: '2015-04-01T00:00:00.000Z' },
      count: 15
    })).toEqual({
      empty: null,
      when: new Date(Date.UTC(2015, 3)),
      count: 15
    });
  });
});
