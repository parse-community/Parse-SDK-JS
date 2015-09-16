/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../escape');
jest.dontMock('../ParseConfig');
jest.dontMock('../ParseError');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParsePromise');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');
jest.dontMock('./test_helpers/asyncHelper');

var CoreManager = require('../CoreManager');
var ParseConfig = require('../ParseConfig');
var ParseGeoPoint = require('../ParseGeoPoint');
var ParsePromise = require('../ParsePromise');
var Storage = require('../Storage');

var asyncHelper = require('./test_helpers/asyncHelper');

CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');

describe('ParseConfig', () => {
  it('exposes attributes via get()', () => {
    var c = new ParseConfig();
    c.attributes = {
      str: 'hello',
      num: 44
    };
    expect(c.get('str')).toBe('hello');
    expect(c.get('num')).toBe(44);
    expect(c.get('nonexistent')).toBe(undefined);
  });

  it('exposes escaped attributes', () => {
    var c = new ParseConfig();
    c.attributes = {
      brackets: '<>',
      phone: 'AT&T'
    };
    expect(c.escape('brackets')).toBe('&lt;&gt;');
    expect(c.escape('phone')).toBe('AT&amp;T');
  });

  it('can retrieve the current config from disk or cache', () => {
    var path = Storage.generatePath('currentConfig');
    Storage.setItem(path, JSON.stringify({
      count: 12,
      point: {
        __type: 'GeoPoint',
        latitude: 20.02,
        longitude: 30.03
      }
    }));
    expect(ParseConfig.current().attributes).toEqual({
      count: 12,
      point: new ParseGeoPoint(20.02, 30.03)
    });
  });

  it('can get a config object from the network', asyncHelper((done) => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.as({
          params: {
            str: 'hello',
            num: 45,
            file: {
              __type: 'File',
              name: 'parse.txt',
              url: 'https://files.parsetfss.com/a/parse.txt'
            }
          }
        });
      },
      ajax() {}
    });
    ParseConfig.get().then((config) => {
      expect(config.get('str')).toBe('hello');
      expect(config.get('num')).toBe(45);
      expect(config.get('file').name()).toBe('parse.txt');
      var path = Storage.generatePath('currentConfig');
      expect(JSON.parse(Storage.getItem(path))).toEqual({
        str: 'hello',
        num: 45,
        file: {
          __type: 'File',
          name: 'parse.txt',
          url: 'https://files.parsetfss.com/a/parse.txt'
        }
      });

      done();
    });
  }));

  it('rejects the promise when an invalid payload comes back', asyncHelper((done) => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.as(null);
      },
      ajax() {}
    });
    ParseConfig.get().then(null, (error) => {
      expect(error.code).toBe(107);
      expect(error.message).toBe('Config JSON response invalid.');

      done();
    });
  }));

  it('rejects the promise when the http request fails', asyncHelper((done) => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.error('failure');
      },
      ajax() {}
    });
    ParseConfig.get().then(null, (error) => {
      expect(error).toBe('failure');
      done();
    });
  }));
});
