/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
/* global File */
jest.autoMockOff();
jest.mock('http');
jest.mock('https');

const ParseFile = require('../ParseFile').default;
const CoreManager = require('../CoreManager');
const EventEmitter = require('../EventEmitter');

const mockHttp = require('http');
const mockHttps = require('https');

function generateSaveMock(prefix) {
  return function(name, payload, options) {
    if (options && typeof options.progress === 'function') {
      options.progress(0.5);
    }
    return Promise.resolve({
      name: name,
      url: prefix + name,
    });
  };
}

const defaultController = CoreManager.getFileController();

describe('ParseFile', () => {
  beforeEach(() => {
    CoreManager.setFileController({
      saveFile: generateSaveMock('http://files.parsetfss.com/a/'),
      saveBase64: generateSaveMock('http://files.parsetfss.com/a/'),
      download: () => Promise.resolve({
        base64: 'ParseA==',
        contentType: 'image/png',
      }),
    });
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('can create files with base64 encoding', () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('');
  });

  it('can extract data type from base64', () => {
    const file = new ParseFile('parse.txt', {
      base64: 'data:image/png;base64,ParseA=='
    });
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('image/png');
  });

  it('can create files with file uri', () => {
    const file = new ParseFile('parse-image', { uri:'http://example.com/image.png' });
    expect(file._source.format).toBe('uri');
    expect(file._source.uri).toBe('http://example.com/image.png');
  });

  it('can extract data type from base64 with data type containing a number', () => {
    const file = new ParseFile('parse.m4a', {
      base64: 'data:audio/m4a;base64,ParseA=='
    });
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('audio/m4a');
  });

  it('can extract data type from base64 with a complex mime type', () => {
    const file = new ParseFile('parse.kml', {
      base64: 'data:application/vnd.google-earth.kml+xml;base64,ParseA=='
    });
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('application/vnd.google-earth.kml+xml');
  });

  it('can extract data type from base64 with a charset param', () => {
    const file = new ParseFile('parse.kml', {
      base64: 'data:application/vnd.3gpp.pic-bw-var;charset=utf-8;base64,ParseA=='
    });
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('application/vnd.3gpp.pic-bw-var');
  });

  it('can create files with byte arrays', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('');
  });

  it('can create files with all types of characters', () => {
    const file = new ParseFile('parse.txt', [11, 239, 191, 215, 80, 52]);
    expect(file._source.base64).toBe('C++/11A0');
    expect(file._source.type).toBe('');
  });

  it('can create an empty file', () => {
    const file = new ParseFile('parse.txt');
    expect(file.name()).toBe('parse.txt');
    expect(file.url()).toBe(undefined);
  });

  it('throws when creating a file with invalid data', () => {
    expect(function() {
      new ParseFile('parse.txt', 12);
    }).toThrow('Cannot create a Parse.File with that data.');

    expect(function() {
      new ParseFile('parse.txt', null);
    }).toThrow('Cannot create a Parse.File with that data.');

    expect(function() {
      new ParseFile('parse.txt', 'string');
    }).toThrow('Cannot create a Parse.File with that data.');
  });

  it('returns secure url when specified', () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    return file.save().then(function(result) {
      expect(result).toBe(file);
      expect(result.url({ forceSecure: true }))
        .toBe('https://files.parsetfss.com/a/parse.txt');
    });
  });

  it('returns undefined when there is no url', () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    expect(file.url({ forceSecure: true })).toBeUndefined();
  });

  it('updates fields when saved', () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    expect(file.name()).toBe('parse.txt');
    expect(file.url()).toBe(undefined);
    return file.save().then(function(result) {
      expect(result).toBe(file);
      expect(result.name()).toBe('parse.txt');
      expect(result.url()).toBe('http://files.parsetfss.com/a/parse.txt');
    });
  });

  it('updates fields when saved with uri', () => {
    const file = new ParseFile('parse.png', { uri: 'https://example.com/image.png' });
    expect(file.name()).toBe('parse.png');
    expect(file.url()).toBe(undefined);
    return file.save().then(function(result) {
      expect(result).toBe(file);
      expect(result.name()).toBe('parse.png');
      expect(result.url()).toBe('http://files.parsetfss.com/a/parse.png');
    });
  });

  it('generates a JSON representation', () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    return file.save().then(function(result) {
      expect(result.toJSON()).toEqual({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      });
    });
  });

  it('can construct a file from a JSON object', () => {
    const f = ParseFile.fromJSON({
      __type: 'File',
      name: 'parse.txt',
      url: 'http://files.parsetfss.com/a/parse.txt'
    });
    expect(f).toBeTruthy();
    expect(f.name()).toBe('parse.txt');
    expect(f.url()).toBe('http://files.parsetfss.com/a/parse.txt');

    expect(ParseFile.fromJSON.bind(null, {}))
      .toThrow('JSON object does not represent a ParseFile');
  });

  it('can test equality against another ParseFile', () => {
    let a = new ParseFile('parse.txt', [61, 170, 236, 120]);
    let b = new ParseFile('parse.txt', [61, 170, 236, 120]);

    expect(a.equals(a)).toBe(true);
    // unsaved files are never equal
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

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

    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    b = ParseFile.fromJSON({
      __type: 'File',
      name: 'parse.txt',
      url: 'http://files.parsetfss.com/b/parse.txt'
    });

    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
  });

  it('reports progress during save when source is a File', () => {
    const file = new ParseFile('progress.txt', new File(["Parse"], "progress.txt"));

    const options = {
      progress: function(){}
    };
    jest.spyOn(options, 'progress');

    return file.save(options).then(function(f) {
      expect(options.progress).toHaveBeenCalledWith(0.5);
      expect(f).toBe(file);
      expect(f.name()).toBe('progress.txt');
      expect(f.url()).toBe('http://files.parsetfss.com/a/progress.txt');
    });
  });
});

describe('FileController', () => {
  beforeEach(() => {
    CoreManager.setFileController(defaultController);
    const request = function(method, path) {
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        name: name,
        url: 'https://files.parsetfss.com/a/' + name
      });
    };
    const ajax = function(method, path) {
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        response: {
          name: name,
          url: 'https://files.parsetfss.com/a/' + name
        }
      });
    };
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('saves files created with bytes', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    return file.save().then(function(f) {
      expect(f).toBe(file);
      expect(f.name()).toBe('parse.txt');
      expect(f.url()).toBe('https://files.parsetfss.com/a/parse.txt');
    });
  });

  it('saves files via ajax', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file._source.format = 'file';

    return file.save().then(function(f) {
      expect(f).toBe(file);
      expect(f.name()).toBe('/api.parse.com/1/files/parse.txt');
      expect(f.url()).toBe('https://files.parsetfss.com/a//api.parse.com/1/files/parse.txt');
    });
  });

  it('saveUri with uri type', async () => {
    const file = new ParseFile('parse.png', { uri: 'https://example.com/image.png' });
    const spy = jest.spyOn(
      defaultController,
      'download'
    )
      .mockImplementationOnce(() => {
        return Promise.resolve({
          base64: 'ParseA==',
          contentType: 'image/png',
        });
      });

    jest.spyOn(defaultController, 'saveBase64');
    await file.save();
    expect(defaultController.download).toHaveBeenCalledTimes(1);
    expect(defaultController.saveBase64).toHaveBeenCalledTimes(1);
    expect(defaultController.saveBase64.mock.calls[0]).toEqual([
      'parse.png',
      { format: 'base64', base64: 'ParseA==', type: 'image/png' },
      {}
    ]);
    spy.mockRestore();
  });

  it('download with base64 http', async () => {
    defaultController._setXHR(null);
    const mockResponse = Object.create(EventEmitter.prototype);
    EventEmitter.call(mockResponse);
    mockResponse.setEncoding = function() {}
    mockResponse.headers = {
      'content-type': 'image/png'
    };
    const spy = jest.spyOn(mockHttp, 'get')
      .mockImplementationOnce((uri, cb) => {
        cb(mockResponse);
        mockResponse.emit('data', 'base64String');
        mockResponse.emit('end');
        return {
          on: function() {}
        };
      });

    const data = await defaultController.download('http://example.com/image.png');
    expect(data.base64).toBe('base64String');
    expect(data.contentType).toBe('image/png');
    expect(mockHttp.get).toHaveBeenCalledTimes(1);
    expect(mockHttps.get).toHaveBeenCalledTimes(0);
    spy.mockRestore();
  });

  it('download with base64 https', async () => {
    defaultController._setXHR(null);
    const mockResponse = Object.create(EventEmitter.prototype);
    EventEmitter.call(mockResponse);
    mockResponse.setEncoding = function() {}
    mockResponse.headers = {
      'content-type': 'image/png'
    };
    const spy = jest.spyOn(mockHttps, 'get')
      .mockImplementationOnce((uri, cb) => {
        cb(mockResponse);
        mockResponse.emit('data', 'base64String');
        mockResponse.emit('end');
        return {
          on: function() {}
        };
      });

    const data = await defaultController.download('https://example.com/image.png');
    expect(data.base64).toBe('base64String');
    expect(data.contentType).toBe('image/png');
    expect(mockHttp.get).toHaveBeenCalledTimes(0);
    expect(mockHttps.get).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it('download with ajax', async () => {
    const mockXHR = function () {
      return {
        open: jest.fn(),
        send: jest.fn().mockImplementation(function() {
          this.response = [61, 170, 236, 120];
          this.readyState = 2;
          this.onreadystatechange();
          this.readyState = 4;
          this.onreadystatechange();
        }),
        getResponseHeader: function() {
          return 'image/png';
        }
      };
    };
    defaultController._setXHR(mockXHR);

    const data = await defaultController.download('https://example.com/image.png');
    expect(data.base64).toBe('ParseA==');
    expect(data.contentType).toBe('image/png');
  });

  it('download with ajax error', async () => {
    const mockXHR = function () {
      return {
        open: jest.fn(),
        send: jest.fn().mockImplementation(function() {
          this.onerror('error thrown');
        })
      };
    };
    defaultController._setXHR(mockXHR);

    try {
      await defaultController.download('https://example.com/image.png');
    } catch (e) {
      expect(e).toBe('error thrown');
    }
  });

  it('download with xmlhttprequest unsupported', async () => {
    defaultController._setXHR(null);
    process.env.PARSE_BUILD = 'browser';
    try {
      await defaultController.download('https://example.com/image.png');
    } catch (e) {
      expect(e).toBe('Cannot make a request: No definition of XMLHttpRequest was found.');
    }
  });

  it('getData', async () => {
    const file = new ParseFile('parse.png', [61, 170, 236, 120]);
    const data = await file.getData();
    expect(data).toBe('ParseA==');
  });

  it('getData unsaved file', async () => {
    const file = new ParseFile('parse.png');
    try {
      await file.getData();
    } catch (e) {
      expect(e.message).toBe('Cannot retrieve data for unsaved ParseFile.');
    }
  });

  it('getData via download', async () => {
    const file = new ParseFile('parse.txt', { base64: 'ParseA==' });
    file._data = null;
    const result = await file.save();

    const spy = jest.spyOn(
      defaultController,
      'download'
    )
      .mockImplementationOnce(() => {
        return Promise.resolve({
          base64: 'ParseA==',
          contentType: 'image/png',
        });
      });

    const data = await result.getData();
    expect(defaultController.download).toHaveBeenCalledTimes(1);
    expect(data).toBe('ParseA==');
    spy.mockRestore();
  });
});
