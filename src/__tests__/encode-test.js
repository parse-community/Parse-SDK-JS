/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../encode');
jest.dontMock('../ParseACL');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');

const mockObject = function (className) {
  this.className = className;
};
mockObject.registerSubclass = function () {};
mockObject.prototype = {
  _getServerData() {
    return this._serverData;
  },
  toPointer() {
    return 'POINTER';
  },
  toOfflinePointer() {
    return 'OFFLINE_POINTER';
  },
  _getId() {
    return 'local1234';
  },
  dirty() {},
  toJSON() {
    return this.attributes;
  },
  _toFullJSON(seen, offline) {
    const json = {
      __type: 'Object',
      className: this.className,
    };
    for (const attr in this.attributes) {
      json[attr] = encode(this.attributes[attr], false, false, seen.concat(this), offline);
    }
    return json;
  },
};
jest.setMock('../ParseObject', mockObject);

const encode = require('../encode').default;
const ParseACL = require('../ParseACL').default;
const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseObject = require('../ParseObject');
const ParseRelation = require('../ParseRelation').default;

describe('encode', () => {
  it('ignores primitives', () => {
    expect(encode(undefined)).toBe(undefined);
    expect(encode(null)).toBe(null);
    expect(encode(true)).toBe(true);
    expect(encode(12)).toBe(12);
    expect(encode('string')).toBe('string');
  });

  it('encodes dates', () => {
    expect(encode(new Date(Date.UTC(2015, 1)))).toEqual({
      __type: 'Date',
      iso: '2015-02-01T00:00:00.000Z',
    });
    expect(encode.bind(null, new Date(Date.parse(null)))).toThrow(
      'Tried to encode an invalid date.'
    );
  });

  it('encodes regular expressions', () => {
    expect(encode(new RegExp('^hello'))).toEqual('^hello');
    expect(encode(/a[^b]+c/g)).toEqual('a[^b]+c');
  });

  it('encodes GeoPoints', () => {
    const point = new ParseGeoPoint(40.5, 50.4);
    expect(encode(point)).toEqual({
      __type: 'GeoPoint',
      latitude: 40.5,
      longitude: 50.4,
    });
  });

  it('encodes Files', () => {
    const file = new ParseFile('parse.txt');
    expect(encode.bind(null, file)).toThrow('Tried to encode an unsaved file.');
    file._url = 'https://files.parsetfss.com/a/parse.txt';
    expect(encode(file)).toEqual({
      __type: 'File',
      name: 'parse.txt',
      url: 'https://files.parsetfss.com/a/parse.txt',
    });
  });

  it('encodes Relations', () => {
    const rel = new ParseRelation();
    encode(rel);
    expect(rel.toJSON.mock.calls.length).toBe(1);
  });

  it('encodes ACLs', () => {
    const acl = new ParseACL({ aUserId: { read: true, write: false } });
    expect(encode(acl)).toEqual({
      aUserId: {
        read: true,
        write: false,
      },
    });
  });

  it('encodes ParseObjects', () => {
    const obj = new ParseObject('Item');
    obj._serverData = {};
    expect(encode(obj)).toEqual('POINTER');

    obj._serverData = obj.attributes = {
      str: 'string',
      date: new Date(Date.UTC(2015, 1, 1)),
    };
    expect(encode(obj)).toEqual({
      __type: 'Object',
      className: 'Item',
      str: 'string',
      date: {
        __type: 'Date',
        iso: '2015-02-01T00:00:00.000Z',
      },
    });

    obj.attributes.self = obj;
    expect(encode(obj)).toEqual({
      __type: 'Object',
      className: 'Item',
      str: 'string',
      date: {
        __type: 'Date',
        iso: '2015-02-01T00:00:00.000Z',
      },
      self: 'POINTER',
    });
  });

  it('encodes ParseObjects offline', () => {
    const obj = new ParseObject('Item');
    obj._serverData = {};
    expect(encode(obj, false, false, undefined, true)).toEqual('OFFLINE_POINTER');
    obj._serverData = obj.attributes = {
      str: 'string',
      date: new Date(Date.UTC(2015, 1, 1)),
    };
    obj.attributes.self = obj;

    expect(encode(obj, false, false, undefined, true)).toEqual({
      __type: 'Object',
      className: 'Item',
      str: 'string',
      date: {
        __type: 'Date',
        iso: '2015-02-01T00:00:00.000Z',
      },
      self: 'OFFLINE_POINTER',
    });
  });

  it('does not encode ParseObjects when they are disallowed', () => {
    const obj = new ParseObject('Item');
    expect(encode.bind(null, obj, true)).toThrow('Parse Objects not allowed here');
  });

  it('iterates over arrays', () => {
    let arr = [12, new Date(Date.UTC(2015, 1)), 'str'];
    expect(encode(arr)).toEqual([12, { __type: 'Date', iso: '2015-02-01T00:00:00.000Z' }, 'str']);

    arr = [arr];
    expect(encode(arr)).toEqual([[12, { __type: 'Date', iso: '2015-02-01T00:00:00.000Z' }, 'str']]);
  });

  it('iterates over objects', () => {
    const obj = {
      num: 12,
      date: new Date(Date.UTC(2015, 1)),
      str: 'abc',
    };
    expect(encode(obj)).toEqual({
      num: 12,
      date: { __type: 'Date', iso: '2015-02-01T00:00:00.000Z' },
      str: 'abc',
    });
  });
});
