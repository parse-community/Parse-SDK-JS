/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise');
var RESTController = require('../RESTController');
var asyncHelper = require('./test_helpers/asyncHelper');
var mockXHR = require('./test_helpers/mockXHR');

CoreManager.setInstallationController({
  currentInstallationId() {
    return ParsePromise.as('iid');
  }
});
CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
CoreManager.set('VERSION', 'V');


describe('RESTController', () => {
  it('throws if there is no XHR implementation', () => {
    RESTController._setXHR(null);
    expect(RESTController.ajax.bind(null, 'GET', 'users/me', {})).toThrow(
      'Cannot make a request: No definition of XMLHttpRequest was found.'
    );
  });

  it('opens a XHR with the correct verb and headers', () => {
    var xhr = {
      setRequestHeader: jest.genMockFn(),
      open: jest.genMockFn(),
      send: jest.genMockFn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.ajax('GET', 'users/me', {}, { 'X-Parse-Session-Token': '123' });
    expect(xhr.setRequestHeader.mock.calls[0]).toEqual(
      [ 'X-Parse-Session-Token', '123' ]
    );
    expect(xhr.open.mock.calls[0]).toEqual([ 'GET', 'users/me', true ]);
    expect(xhr.send.mock.calls[0][0]).toEqual({});
  });

  it('resolves with the result of the AJAX request', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([{ status: 200, response: { success: true }}]));
    RESTController.ajax('POST', 'users', {}).then((response, status, xhr) => {
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
  }));

  it('retries on 5XX errors', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([
      { status: 500 },
      { status: 500 },
      { status: 200, response: { success: true }}
    ]));
    RESTController.ajax('POST', 'users', {}).then((response, status, xhr) => {
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
    jest.runAllTimers();
  }));

  it('retries on connection failure', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
    ]));
    RESTController.ajax('POST', 'users', {}).then(null, (err) => {
      expect(err).toBe('Unable to connect to the Parse API');
      done();
    });
    jest.runAllTimers();
  }));

  it('returns a connection error on network failure', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
      { status: 0 },
    ]));
    RESTController.request('GET', 'classes/MyObject', {}, { sessionToken: '1234' }).then(null, (err) => {
      expect(err.code).toBe(100);
      expect(err.message).toBe('XMLHttpRequest failed: "Unable to connect to the Parse API"');
      done();
    });
    jest.runAllTimers();
  }));

  it('aborts after too many failures', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 200, response: { success: true }}
    ]));
    RESTController.ajax('POST', 'users', {}).then(null, (xhr) => {
      expect(xhr).not.toBe(undefined);
      done();
    });
    jest.runAllTimers();
  }));

  it('rejects 1XX status codes', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([{ status: 100 }]));
    RESTController.ajax('POST', 'users', {}).then(null, (xhr) => {
      expect(xhr).not.toBe(undefined);
      done();
    });
    jest.runAllTimers();
  }));

  it('can make formal JSON requests', () => {
    var xhr = {
      setRequestHeader: jest.genMockFn(),
      open: jest.genMockFn(),
      send: jest.genMockFn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, { sessionToken: '1234' });
    expect(xhr.open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/classes/MyObject', true]
    );
    expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
      _SessionToken: '1234',
    });
  });

  it('handles request errors', asyncHelper((done) => {
    RESTController._setXHR(mockXHR([{
      status: 400, response: {
        code: -1,
        error: 'Something bad'
      }
    }]));
    RESTController.request('GET', 'classes/MyObject', {}, {})
      .then(null, (error) => {
        expect(error.code).toBe(-1);
        expect(error.message).toBe('Something bad');
        done();
      });
  }));
});
