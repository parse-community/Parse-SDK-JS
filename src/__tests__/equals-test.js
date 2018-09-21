/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

const equals = require('../equals').default;
const ParseACL = require('../ParseACL').default;
const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseObject = require('../ParseObject').default;

describe('equals', () => {
  it('tests equality of primitives', () => {
    expect(equals(1, 'string')).toBe(false);
    expect(equals(1, true)).toBe(false);
    expect(equals(1, undefined)).toBe(false);
    expect(equals(1, null)).toBe(false);
    expect(equals(1, {})).toBe(false);
    expect(equals(1, 4)).toBe(false);
    expect(equals(1, 1)).toBe(true);

    expect(equals(null, 'string')).toBe(false);
    expect(equals(true, 'string')).toBe(false);
    expect(equals(undefined, 'string')).toBe(false);
    expect(equals(true, 'string')).toBe(false);
    expect(equals({}, 'string')).toBe(false);
    expect(equals('abc', 'def')).toBe(false);
    expect(equals('abc', 'abc')).toBe(true);

    expect(equals(false, false)).toBe(true);
    expect(equals(true, true)).toBe(true);
    expect(equals(true, false)).toBe(false);

    expect(equals(null, null)).toBe(true);
    expect(equals(undefined, undefined)).toBe(true);
    expect(equals(null, undefined)).toBe(false);
  });

  it('tests equality of objects and arrays', () => {
    const a = {};
    expect(equals(a, a)).toBe(true);
    expect(equals({}, {})).toBe(true);
    expect(equals({ a: 1 }, { a: 1 })).toBe(true);
    expect(equals({ a: 1 }, { a: 2 })).toBe(false);
    expect(equals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(equals({ a: 1, b: 2 }, { b: 2 })).toBe(false);
    expect(equals({ a: {} }, { a: {} })).toBe(true);

    expect(equals([], [])).toBe(true);
    expect(equals([], {})).toBe(false);
    expect(equals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(equals([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(equals([1, 2, 3], [1, 2])).toBe(false);
    expect(equals([{ c: 3 }, 2, 1], [{ c: 3 }, 2, 1])).toBe(true);
  });

  it('tests equality of ACLs', () => {
    // Defer to ParseACL tests for the majority of testing
    const a = new ParseACL();
    const b = new ParseACL();

    expect(equals(a, a)).toBe(true);
    expect(equals(a, b)).toBe(true);
    expect(equals(b, a)).toBe(true);

    a.setPublicReadAccess(true);
    expect(equals(a, a)).toBe(true);
    expect(equals(a, b)).toBe(false);
    expect(equals(b, a)).toBe(false);
  });

  it('tests equality of GeoPoints', () => {
    // Defer to ParseGeoPoint tests for the majority of testing
    const a = new ParseGeoPoint(40, 40);
    expect(equals(a, a)).toBe(true);

    let b = new ParseGeoPoint(40, 40);
    expect(equals(a, b)).toBe(true);
    expect(equals(b, a)).toBe(true);

    b = new ParseGeoPoint(50, 40);
    expect(equals(a, b)).toBe(false);
    expect(equals(b, a)).toBe(false);
  });

  it('tests equality of Files', () => {
    // Defer to ParseFile tests for the majority of testing
    let a = new ParseFile('parse.txt', [61, 170, 236, 120]);
    let b = new ParseFile('parse.txt', [61, 170, 236, 120]);

    expect(equals(a, a)).toBe(true);
    // unsaved files are never equal
    expect(equals(a, b)).toBe(false);
    a = ParseFile.fromJSON({
      __type: 'File',
      name: 'parse.txt',
      url: 'http://files.parsetfss.com/a/parse.txt'
    });
    b = ParseFile.fromJSON({
      __type: 'File',
      name: 'parse.txt',
      url: 'http://files.parsetfss.com/a/parse.txt'
    });

    expect(equals(a, b)).toBe(true);
  });

  it('tests equality of ParseObjects', () => {
    // Defer to ParseObject tests for the majority of testing
    const a = new ParseObject('Item');
    const b = new ParseObject('Item');
    expect(equals(a, a)).toBe(true);
    expect(equals(a, b)).toBe(false);

    a.id = 'myobj';
    b.id = 'myobj';
    expect(equals(a, b)).toBe(true);

    const c = {
      __type: 'Pointer',
      className: 'Item',
      objectId: 'myobj',
    };
    const d = {
      __type: 'Object',
      className: 'Item',
      objectId: 'myobj',
    };
    const e = {
      __type: 'Unknown',
      className: 'Item',
      objectId: 'myobj',
    };
    expect(equals(c, b)).toBe(true);
    expect(equals(d, b)).toBe(true);
    expect(equals(e, b)).toBe(false);
  });

  it('tests equality of Date', () => {
    const a = new Date('2018-08-09T00:01:53.964Z');
    const b = new Date('2018-08-10T00:00:00.000Z');

    expect(equals(a, a)).toBe(true);
    expect(equals(a, b)).toBe(false);
    expect(equals(b, a)).toBe(false);

    const c = [];
    expect(equals(a, c)).toBe(false);
  });
});
