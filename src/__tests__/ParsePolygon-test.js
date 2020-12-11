jest.autoMockOff();

const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParsePolygon = require('../ParsePolygon').default;

const points = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 0],
  [0, 0],
];

describe('Polygon', () => {
  it('can initialize with points', () => {
    const polygon = new ParsePolygon(points);
    expect(polygon.coordinates).toEqual(points);
  });

  it('can initialize with geopoints', () => {
    const geopoints = [
      new ParseGeoPoint(0, 0),
      new ParseGeoPoint(0, 1),
      new ParseGeoPoint(1, 1),
      new ParseGeoPoint(1, 0),
      new ParseGeoPoint(0, 0),
    ];
    const polygon = new ParsePolygon(geopoints);
    expect(polygon.coordinates).toEqual(points);
  });

  it('can set points', () => {
    const newPoints = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ];

    const polygon = new ParsePolygon(points);
    expect(polygon.coordinates).toEqual(points);

    polygon.coordinates = newPoints;
    expect(polygon.coordinates).toEqual(newPoints);
  });

  it('toJSON', () => {
    const polygon = new ParsePolygon(points);
    expect(polygon.toJSON()).toEqual({
      __type: 'Polygon',
      coordinates: points,
    });
  });

  it('equals', () => {
    const polygon1 = new ParsePolygon(points);
    const polygon2 = new ParsePolygon(points);
    const geopoint = new ParseGeoPoint(0, 0);

    expect(polygon1.equals(polygon2)).toBe(true);
    expect(polygon1.equals(geopoint)).toBe(false);

    const newPoints = [
      [0, 0],
      [0, 10],
      [10, 10],
      [10, 0],
      [0, 0],
    ];
    polygon1.coordinates = newPoints;
    expect(polygon1.equals(polygon2)).toBe(false);
  });

  it('containsPoint', () => {
    const polygon = new ParsePolygon(points);
    const outside = new ParseGeoPoint(10, 10);
    const inside = new ParseGeoPoint(0.5, 0.5);

    expect(polygon.containsPoint(inside)).toBe(true);
    expect(polygon.containsPoint(outside)).toBe(false);
  });

  it('throws error on invalid input', () => {
    expect(() => {
      new ParsePolygon();
    }).toThrow('Coordinates must be an Array');

    expect(() => {
      new ParsePolygon([]);
    }).toThrow('Polygon must have at least 3 GeoPoints or Points');

    expect(() => {
      new ParsePolygon([1, 2, 3]);
    }).toThrow('Coordinates must be an Array of GeoPoints or Points');
  });
});
