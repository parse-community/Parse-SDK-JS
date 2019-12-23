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
jest.dontMock('../encode');
jest.dontMock('../escape');
jest.dontMock('../ParseConfig');
jest.dontMock('../ParseError');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');

const CoreManager = require('../CoreManager');
const ParseConfig = require('../ParseConfig').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const Storage = require('../Storage');

CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');

describe('ParseConfig', () => {
  it('exposes attributes via get()', () => {
    const c = new ParseConfig();
    c.attributes = {
      str: 'hello',
      num: 44
    };
    expect(c.get('str')).toBe('hello');
    expect(c.get('num')).toBe(44);
    expect(c.get('nonexistent')).toBe(undefined);
  });

  it('exposes escaped attributes', () => {
    const c = new ParseConfig();
    c.attributes = {
      brackets: '<>',
      phone: 'AT&T'
    };
    expect(c.escape('brackets')).toBe('&lt;&gt;');
    expect(c.escape('phone')).toBe('AT&amp;T');
  });

  it('can retrieve the current config from disk or cache', () => {
    const path = Storage.generatePath('currentConfig');
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

  it('can get a config object from the network', (done) => {
    CoreManager.setRESTController({
      request() {
        return Promise.resolve({
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
      const path = Storage.generatePath('currentConfig');
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
  });

  it('can save a config object with masterkey', (done) => {
    //Load a request that match the get() & save() request
    CoreManager.setRESTController({
      request() {
        return Promise.resolve({
          params : {
            str : 'hello2',
            num : 46
          },
          result: true
        });
      },
      ajax() {}
    });
    ParseConfig.save({str: 'hello2','num':46}).then((config) => {
      expect(config.get('str')).toBe('hello2');
      expect(config.get('num')).toBe(46);
      const path = Storage.generatePath('currentConfig');
      expect(JSON.parse(Storage.getItem(path))).toEqual({
        str: 'hello2',
        num: 46
      });
      done();
    });
  });

  it('can save a config object that be retrieved with masterkey only', async () => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        if (method === 'PUT') {
          expect(method).toBe('PUT');
          expect(path).toBe('config');
          expect(body).toEqual({
            params: { internal: 'i', number: 12 },
            masterKeyOnly: { internal: true },
          });
          expect(options).toEqual({ useMasterKey: true });
          return Promise.resolve({
            params: {
              internal: 'i',
              number: 12
            },
            result: true,
          });
        } else if (method === 'GET') {
          expect(method).toBe('GET');
          expect(path).toBe('config');
          expect(body).toEqual({});
          expect(options).toEqual({ useMasterKey: true });
          return Promise.resolve({
            params: {
              internal: 'i',
              number: 12
            },
          });
        }
      },
      ajax() {}
    });
    const config = await ParseConfig.save(
      { internal: 'i', number: 12 },
      { internal: true }
    );
    expect(config.get('internal')).toBe('i');
    expect(config.get('number')).toBe(12);
  });

  it('can get a config object with master key', async () => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('GET');
        expect(path).toBe('config');
        expect(body).toEqual({});
        expect(options).toEqual({ useMasterKey: true });
        return Promise.resolve({
          params: {
            str: 'hello',
            num: 45
          }
        });
      },
      ajax() {}
    });
    const config = await ParseConfig.get({ useMasterKey: true });
    expect(config.get('str')).toBe('hello');
    expect(config.get('num')).toBe(45);
    const path = Storage.generatePath('currentConfig');
    expect(JSON.parse(Storage.getItem(path))).toEqual({
      str: 'hello',
      num: 45,
    });
  });

  it('rejects save on invalid response', (done) => {
    CoreManager.setRESTController({
      request() {
        return Promise.resolve({result: false});
      },
      ajax() {}
    });
    ParseConfig.save({str: 'hello2','num':46}).then((config) => {
      expect(config).toBe(1)
      done();
    },(error) => {
      expect(error.code).toBe(1)
      done();
    });
  });

  it('rejects the promise when an invalid payload comes back', (done) => {
    CoreManager.setRESTController({
      request() {
        return Promise.resolve(null);
      },
      ajax() {}
    });
    ParseConfig.get().then(null, (error) => {
      expect(error.code).toBe(107);
      expect(error.message).toBe('Config JSON response invalid.');
      done();
    });
  });

  it('rejects the promise when the http request fails', (done) => {
    CoreManager.setRESTController({
      request() {
        return Promise.reject('failure');
      },
      ajax() {}
    });
    ParseConfig.get().then(null, (error) => {
      expect(error).toBe('failure');
      done();
    });
  });
});
