jest.dontMock('../decode');
jest.dontMock('../CoreManager');
jest.dontMock('../isDangerousKey');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseObject');
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
    expect(
      decode({
        __type: 'Date',
        iso: '2015-02-01T00:00:00.000Z',
      })
    ).toEqual(new Date(Date.UTC(2015, 1)));
  });

  it('decodes GeoPoints', () => {
    const point = decode({
      __type: 'GeoPoint',
      latitude: 40.5,
      longitude: 50.4,
    });
    expect(point instanceof ParseGeoPoint).toBe(true);
    expect(point.latitude).toBe(40.5);
    expect(point.longitude).toBe(50.4);
  });

  it('decodes Polygons', () => {
    const points = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0],
    ];
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
      url: 'https://files.parsetfss.com/a/parse.txt',
    });
    expect(file instanceof ParseFile).toBe(true);
    expect(file.name()).toBe('parse.txt');
    expect(file.url()).toBe('https://files.parsetfss.com/a/parse.txt');
  });

  it('decodes Relations', () => {
    const obj = decode({
      __type: 'Relation',
      className: 'Delivery',
    });
    expect(obj.constructor.mock.calls[0]).toEqual([null, null]);
    expect(obj.targetClassName).toBe('Delivery');
  });

  it('decodes Pointers', () => {
    const spy = jest.spyOn(ParseObject, 'fromJSON');
    const data = {
      __type: 'Pointer',
      className: 'Item',
      objectId: '1001',
    };
    decode(data);
    expect(spy.mock.calls[0][0]).toEqual(data);
  });

  it('decodes ParseObjects', () => {
    const spy = jest.spyOn(ParseObject, 'fromJSON');
    const data = {
      __type: 'Object',
      className: 'Item',
      objectId: '1001',
    };
    decode(data);
    expect(spy.mock.calls[1][0]).toEqual(data);
  });

  it('iterates over arrays', () => {
    expect(decode([{ __type: 'Date', iso: '2015-02-01T00:00:00.000Z' }, 12, 'string'])).toEqual([
      new Date(Date.UTC(2015, 1)),
      12,
      'string',
    ]);
  });

  it('iterates over objects', () => {
    expect(
      decode({
        empty: null,
        when: { __type: 'Date', iso: '2015-04-01T00:00:00.000Z' },
        count: 15,
      })
    ).toEqual({
      empty: null,
      when: new Date(Date.UTC(2015, 3)),
      count: 15,
    });
  });

  describe('Prototype Pollution Protection', () => {
    beforeEach(() => {
      // Clear any pollution before each test
      delete Object.prototype.polluted;
      delete Object.prototype.malicious;
      delete Object.prototype.exploit;
    });

    afterEach(() => {
      // Clean up after tests
      delete Object.prototype.polluted;
      delete Object.prototype.malicious;
      delete Object.prototype.exploit;
    });

    it('should not pollute Object.prototype when decoding object with __proto__ key', () => {
      const testObj = {};
      const maliciousInput = {
        normalKey: 'value',
        __proto__: { polluted: 'yes' },
      };

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();

      // Verify result only has own property
      expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
      expect(result.normalKey).toBe('value');
    });

    it('should not pollute Object.prototype when decoding object with constructor key', () => {
      const testObj = {};
      const maliciousInput = {
        normalKey: 'value',
        constructor: { polluted: 'yes' },
      };

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();

      // Verify result doesn't contain constructor from prototype chain
      expect(result.normalKey).toBe('value');
    });

    it('should not pollute Object.prototype when decoding object with prototype key', () => {
      const testObj = {};
      const maliciousInput = {
        normalKey: 'value',
        prototype: { polluted: 'yes' },
      };

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();

      // Verify result contains only own properties
      expect(result.normalKey).toBe('value');
    });

    it('should not pollute Object.prototype when decoding nested objects with dangerous keys', () => {
      const testObj = {};
      const maliciousInput = {
        nested: {
          __proto__: { polluted: 'nested' },
          data: 'value',
        },
        normal: 'key',
      };

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();

      // Verify result structure
      expect(result.normal).toBe('key');
      expect(result.nested).toBeDefined();
      expect(result.nested.data).toBe('value');
      expect(Object.prototype.hasOwnProperty.call(result.nested, '__proto__')).toBe(false);
    });

    it('should not pollute Object.prototype when decoding arrays with objects containing dangerous keys', () => {
      const testObj = {};
      const maliciousInput = [
        { __proto__: { polluted: 'array1' } },
        { constructor: { malicious: 'array2' } },
        { normalKey: 'value' },
      ];

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect(testObj.malicious).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect({}.malicious).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
      expect(Object.prototype.malicious).toBeUndefined();

      // Verify result array
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[2].normalKey).toBe('value');
    });

    it('should only decode own properties, not inherited ones', () => {
      const parent = { inherited: 'parent' };
      const child = Object.create(parent);
      child.own = 'child';

      const result = decode(child);

      // Should only include own property
      expect(result.own).toBe('child');
      expect(result.inherited).toBeUndefined();
    });

    it('should not decode properties from prototype chain', () => {
      Object.prototype.exploit = 'malicious';
      const obj = { normalKey: 'value' };

      const result = decode(obj);

      // Should not include prototype property
      expect(result.normalKey).toBe('value');
      expect(Object.prototype.hasOwnProperty.call(result, 'exploit')).toBe(false);

      delete Object.prototype.exploit;
    });

    it('should not pollute Object.prototype when decoding Parse type with dangerous className', () => {
      const testObj = {};
      const maliciousInput = {
        __type: 'Pointer',
        className: '__proto__',
        objectId: 'test123',
      };

      // This should be handled by ParseObject.fromJSON
      decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
    });

    it('should not pollute Object.prototype when decoding deeply nested dangerous keys', () => {
      const testObj = {};
      const maliciousInput = {
        level1: {
          level2: {
            level3: {
              __proto__: { polluted: 'deep' },
              normalData: 'value',
            },
          },
        },
      };

      const result = decode(maliciousInput);

      // Verify Object.prototype was not polluted
      expect(testObj.polluted).toBeUndefined();
      expect({}.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();

      // Verify result structure is preserved (without dangerous keys)
      expect(result.level1.level2.level3.normalData).toBe('value');
      expect(Object.prototype.hasOwnProperty.call(result.level1.level2.level3, '__proto__')).toBe(
        false
      );
    });
  });
});
