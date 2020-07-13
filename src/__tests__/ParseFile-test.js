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
jest.mock('../ParseACL');

const ParseError = require('../ParseError').default;
const ParseFile = require('../ParseFile').default;
const ParseObject = require('../ParseObject').default;
const CoreManager = require('../CoreManager');
const EventEmitter = require('../EventEmitter');

const mockHttp = require('http');
const mockHttps = require('https');

const mockLocalDatastore = {
  _updateLocalIdForObject: jest.fn(),
  _updateObjectIfPinned: jest.fn(),
};
jest.setMock('../LocalDatastore', mockLocalDatastore);

function generateSaveMock(prefix) {
  return function(name, payload, options) {
    if (options && typeof options.progress === 'function') {
      options.progress(0.5, 5, 10, { type: 'upload' });
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
      expect(options.progress).toHaveBeenCalledWith(0.5, 5, 10, { type: 'upload' });
      expect(f).toBe(file);
      expect(f.name()).toBe('progress.txt');
      expect(f.url()).toBe('http://files.parsetfss.com/a/progress.txt');
    });
  });

  it('can cancel file upload', () => {
    const mockRequestTask = {
      abort: () => {},
    };
    CoreManager.setFileController({
      saveFile: function(name, payload, options) {
        options.requestTask(mockRequestTask);
        return Promise.resolve({});
      },
      saveBase64: () => {},
      download: () => {},
    });
    const file = new ParseFile('progress.txt', new File(["Parse"], "progress.txt"));

    jest.spyOn(mockRequestTask, 'abort');
    file.cancel();
    expect(mockRequestTask.abort).toHaveBeenCalledTimes(0);

    file.save();

    expect(file._requestTask).toEqual(mockRequestTask);
    file.cancel();
    expect(mockRequestTask.abort).toHaveBeenCalledTimes(1);
  });

  it('should save file with metadata and tag options', async () => {
    const fileController = {
      saveFile: jest.fn().mockResolvedValue({}),
      saveBase64: () => {},
      download: () => {},
    };
    CoreManager.setFileController(fileController);
    const file = new ParseFile('donald_duck.txt', new File(['Parse'], 'donald_duck.txt'));
    file.addMetadata('foo', 'bar');
    file.addTag('bar', 'foo');
    await file.save();
    expect(fileController.saveFile).toHaveBeenCalledWith(
      'donald_duck.txt',
      {
        file: expect.any(File),
        format: 'file',
        type: ''
      },
      {
        metadata: { foo: 'bar' },
        tags: { bar: 'foo' },
        requestTask: expect.any(Function),
      },
    );
  });

  it('should create new ParseFile with metadata and tags', () => {
    const metadata = { foo: 'bar' };
    const tags = { bar: 'foo' };
    const file = new ParseFile('parse.txt', [61, 170, 236, 120], '', metadata, tags);
    expect(file._source.base64).toBe('ParseA==');
    expect(file._source.type).toBe('');
    expect(file.metadata()).toBe(metadata);
    expect(file.tags()).toBe(tags);
  });

  it('should set metadata', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.setMetadata({ foo: 'bar' });
    expect(file.metadata()).toEqual({ foo: 'bar' });
  });

  it('should set metadata key', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.addMetadata('foo', 'bar');
    expect(file.metadata()).toEqual({ foo: 'bar' });
  });

  it('should not set metadata if key is not a string', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.addMetadata(10, '');
    expect(file.metadata()).toEqual({});
  });

  it('should set tags', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.setTags({ foo: 'bar' });
    expect(file.tags()).toEqual({ foo: 'bar' });
  });

  it('should set tag key', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.addTag('foo', 'bar');
    expect(file.tags()).toEqual({ foo: 'bar' });
  });

  it('should not set tag if key is not a string', () => {
    const file = new ParseFile('parse.txt', [61, 170, 236, 120]);
    file.addTag(10, 'bar');
    expect(file.tags()).toEqual({});
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
    // eslint-disable-next-line no-undef
    const blob = new Blob([61, 170, 236, 120]);
    const file = new ParseFile('parse.txt', blob);
    file._source.format = 'file';

    return file.save().then(function(f) {
      expect(f).toBe(file);
      expect(f.name()).toBe('parse.txt');
      expect(f.url()).toBe('https://files.parsetfss.com/a/parse.txt');
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

    const spy2 = jest.spyOn(defaultController, 'saveBase64');
    await file.save();
    expect(defaultController.download).toHaveBeenCalledTimes(1);
    expect(defaultController.saveBase64).toHaveBeenCalledTimes(1);
    expect(defaultController.saveBase64.mock.calls[0][0]).toEqual('parse.png');
    expect(defaultController.saveBase64.mock.calls[0][1]).toEqual({
      format: 'base64', base64: 'ParseA==', type: 'image/png'
    });
    spy.mockRestore();
    spy2.mockRestore();
  });

  it('save with uri download abort', async () => {
    const file = new ParseFile('parse.png', { uri: 'https://example.com/image.png' });
    const spy = jest.spyOn(
      defaultController,
      'download'
    )
      .mockImplementationOnce(() => {
        return Promise.resolve({});
      });

    const spy2 = jest.spyOn(defaultController, 'saveBase64');
    await file.save();
    expect(defaultController.download).toHaveBeenCalledTimes(1);
    expect(defaultController.saveBase64).toHaveBeenCalledTimes(0);
    spy.mockRestore();
    spy2.mockRestore();
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

  it('download with base64 http abort', async () => {
    defaultController._setXHR(null);
    const mockRequest = Object.create(EventEmitter.prototype);
    const mockResponse = Object.create(EventEmitter.prototype);
    EventEmitter.call(mockRequest);
    EventEmitter.call(mockResponse);
    mockResponse.setEncoding = function() {}
    mockResponse.headers = {
      'content-type': 'image/png'
    };
    const spy = jest.spyOn(mockHttp, 'get')
      .mockImplementationOnce((uri, cb) => {
        cb(mockResponse);
        return mockRequest;
      });
    const options = {
      requestTask: () => {},
    };
    defaultController.download('http://example.com/image.png', options).then((data) => {
      expect(data).toEqual({});
    });
    mockRequest.emit('abort');
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
        DONE: 4,
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
    const options = {
      requestTask: () => {},
    };
    const data = await defaultController.download('https://example.com/image.png', options);
    expect(data.base64).toBe('ParseA==');
    expect(data.contentType).toBe('image/png');
  });

  it('download with ajax abort', async () => {
    const mockXHR = function () {
      return {
        open: jest.fn(),
        send: jest.fn().mockImplementation(function() {
          this.response = [61, 170, 236, 120];
          this.readyState = 2;
          this.onreadystatechange();
        }),
        getResponseHeader: function() {
          return 'image/png';
        },
        abort: function() {
          this.status = 0;
          this.response = undefined;
          this.readyState = 4;
          this.onreadystatechange()
        }
      };
    };
    defaultController._setXHR(mockXHR);
    let _requestTask;
    const options = {
      requestTask: (task) => _requestTask = task,
    };
    defaultController.download('https://example.com/image.png', options).then((data) => {
      expect(data).toEqual({});
    });
    _requestTask.abort();
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
    const options = {
      requestTask: () => {},
    };
    try {
      await defaultController.download('https://example.com/image.png', options);
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
      .mockImplementationOnce((uri, options) => {
        options.requestTask(null);
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

  it('saves files via ajax with sessionToken option', () => {
    const request = function(method, path) {
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        name: name,
        url: 'https://files.parsetfss.com/a/' + name
      });
    };
    const ajax = function(method, path, data, headers) {
      expect(headers['X-Parse-Session-Token']).toBe('testing_sessionToken')
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        response: {
          name: name,
          url: 'https://files.parsetfss.com/a/' + name
        }
      });
    };
    CoreManager.setRESTController({ request, ajax });
    // eslint-disable-next-line no-undef
    const blob = new Blob([61, 170, 236, 120]);
    const file = new ParseFile('parse.txt', blob);
    file._source.format = 'file';

    return file.save({ sessionToken: 'testing_sessionToken' }).then(function(f) {
      expect(f).toBe(file);
      expect(f.name()).toBe('parse.txt');
      expect(f.url()).toBe('https://files.parsetfss.com/a/parse.txt');
    });
  });

  it('saves files via ajax currentUser sessionToken', () => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'currentUserToken';
          }
        });
      }
    });
    const request = function(method, path) {
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        name: name,
        url: 'https://files.parsetfss.com/a/' + name
      });
    };
    const ajax = function(method, path, data, headers) {
      expect(headers['X-Parse-Session-Token']).toBe('currentUserToken')
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        response: {
          name: name,
          url: 'https://files.parsetfss.com/a/' + name
        }
      });
    };
    CoreManager.setRESTController({ request, ajax });
    // eslint-disable-next-line no-undef
    const blob = new Blob([61, 170, 236, 120]);
    const file = new ParseFile('parse.txt', blob);
    file._source.format = 'file';

    return file.save().then(function(f) {
      expect(f).toBe(file);
      expect(f.name()).toBe('parse.txt');
      expect(f.url()).toBe('https://files.parsetfss.com/a/parse.txt');
    });
  });

  it('should save file using saveFile with metadata and tags', async () => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'currentUserToken';
          }
        });
      }
    });
    const request = jest.fn((method, path) => {
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        name: name,
        url: 'https://files.parsetfss.com/a/' + name
      });
    });
    const ajax = function(method, path, data, headers, options) {
      expect(options.sessionToken).toBe('currentUserToken')
      const name = path.substr(path.indexOf('/') + 1);
      return Promise.resolve({
        response: {
          name: name,
          url: 'https://files.parsetfss.com/a/' + name
        }
      });
    };
    CoreManager.setRESTController({ request, ajax });
    // eslint-disable-next-line no-undef
    const blob = new Blob([61, 170, 236, 120]);
    const file = new ParseFile('parse.txt', blob);
    file._source.format = 'file';
    file.addMetadata('foo', 'bar');
    file.addTag('bar', 'foo');
    const f = await file.save();
    expect(f).toBe(file);
    expect(f.name()).toBe('parse.txt');
    expect(f.url()).toBe('https://files.parsetfss.com/a/parse.txt');
    expect(request).toHaveBeenCalledWith(
      'POST',
      'files/parse.txt',
      {
        base64: 'NjExNzAyMzYxMjA=',
        fileData: {
          metadata: {
            foo: 'bar',
          },
          tags: {
            bar: 'foo',
          },
        },
      },
      { requestTask: expect.any(Function) },
    );
  });

  it('saves files via object saveAll options', async () => {
    const ajax = async () => {};
    const request = jest.fn(async (method, path, data, options) => {
      if (path.indexOf('files/') === 0) {
        expect(options.sessionToken).toBe('testToken');
        return {
          name: 'parse.txt',
          url: 'http://files.parsetfss.com/a/parse.txt'
        };
      }
      return [ { success: { objectId: 'child' } } ];
    });
    CoreManager.setRESTController({ ajax, request });
    CoreManager.setLocalDatastore(mockLocalDatastore);

    // eslint-disable-next-line no-undef
    const blob = new Blob([61, 170, 236, 120]);
    const file = new ParseFile('parse.txt', blob);
    file._source.format = 'file';
    const object = ParseObject.fromJSON({ className: 'TestObject' });
    object.set('file', file);
    await ParseObject.saveAll([object], { sessionToken: 'testToken' });
    expect(request).toHaveBeenCalled();
  });

  it('should throw error if file deleted without name', async (done) => {
    const file = new ParseFile('', [1, 2, 3]);
    try {
      await file.destroy();
    } catch (e) {
      expect(e.message).toBe('Cannot delete an unsaved ParseFile.');
      done();
    }
  });

  it('should delete file', async () => {
    const file = new ParseFile('filename', [1, 2, 3]);
    const ajax = jest.fn().mockResolvedValueOnce({ foo: 'bar' });
    CoreManager.setRESTController({ ajax, request: () => {} });
    const result = await file.destroy();
    expect(result).toEqual(file);
    expect(ajax).toHaveBeenCalledWith('DELETE', 'https://api.parse.com/1/files/filename', '', {
      "X-Parse-Application-ID": null,
      "X-Parse-Master-Key": null,
    });
  });

  it('should handle delete file error', async () => {
    const file = new ParseFile('filename', [1, 2, 3]);
    const ajax = jest.fn().mockResolvedValueOnce(Promise.reject(new ParseError(403, 'Cannot delete file.')));
    const handleError = jest.fn();
    CoreManager.setRESTController({ ajax, request: () => {}, handleError });
    const result = await file.destroy();
    expect(result).toEqual(file);
    expect(ajax).toHaveBeenCalledWith('DELETE', 'https://api.parse.com/1/files/filename', '', {
      "X-Parse-Application-ID": null,
      "X-Parse-Master-Key": null,
    });
    expect(handleError).toHaveBeenCalled();
  });

  it('should handle delete file error invalid server response', async () => {
    const file = new ParseFile('filename', [1, 2, 3]);
    const response = null;
    const ajax = jest.fn().mockResolvedValueOnce(Promise.reject(response));
    const handleError = jest.fn();
    CoreManager.setRESTController({ ajax, request: () => {}, handleError });
    const result = await file.destroy();
    expect(result).toEqual(file);
    expect(ajax).toHaveBeenCalledWith('DELETE', 'https://api.parse.com/1/files/filename', '', {
      "X-Parse-Application-ID": null,
      "X-Parse-Master-Key": null,
    });
    expect(handleError).not.toHaveBeenCalled();
  });
});
