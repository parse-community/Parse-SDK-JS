/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();
jest.useFakeTimers();

const CoreManager = require('../CoreManager');
const RESTController = require('../RESTController');
const mockXHR = require('./test_helpers/mockXHR');

CoreManager.setInstallationController({
  currentInstallationId() {
    return Promise.resolve('iid');
  }
});
CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
CoreManager.set('VERSION', 'V');

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('RESTController', () => {
  it('throws if there is no XHR implementation', () => {
    RESTController._setXHR(null);
    expect(RESTController.ajax.bind(null, 'GET', 'users/me', {})).toThrow(
      'Cannot make a request: No definition of XMLHttpRequest was found.'
    );
  });

  it('opens a XHR with the correct verb and headers', () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.ajax('GET', 'users/me', {}, { 'X-Parse-Session-Token': '123' });
    expect(xhr.setRequestHeader.mock.calls[0]).toEqual(
      [ 'X-Parse-Session-Token', '123' ]
    );
    expect(xhr.open.mock.calls[0]).toEqual([ 'GET', 'users/me', true ]);
    expect(xhr.send.mock.calls[0][0]).toEqual({});
  });

  it('resolves with the result of the AJAX request', (done) => {
    RESTController._setXHR(mockXHR([{ status: 200, response: { success: true }}]));
    RESTController.ajax('POST', 'users', {}).then(({ response, status }) => {
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
  });

  it('retries on 5XX errors', (done) => {
    RESTController._setXHR(mockXHR([
      { status: 500 },
      { status: 500 },
      { status: 200, response: { success: true }}
    ]));
    RESTController.ajax('POST', 'users', {}).then(({ response, status }) => {
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
    jest.runAllTimers();
  });

  it('retries on connection failure', (done) => {
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
  });

  it('returns a connection error on network failure', async (done) => {
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
    await new Promise((resolve) => setImmediate(resolve));
    jest.runAllTimers();
  });

  it('aborts after too many failures', async (done) => {
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
    await new Promise((resolve) => setImmediate(resolve));
    jest.runAllTimers();
  });

  it('rejects 1XX status codes', (done) => {
    RESTController._setXHR(mockXHR([{ status: 100 }]));
    RESTController.ajax('POST', 'users', {}).then(null, (xhr) => {
      expect(xhr).not.toBe(undefined);
      done();
    });
    jest.runAllTimers();
  });

  it('can make formal JSON requests', async () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, { sessionToken: '1234' });
    await flushPromises();
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

  it('handles request errors', (done) => {
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
  });

  it('handles invalid responses', (done) => {
    const XHR = function() { };
    XHR.prototype = {
      open: function() { },
      setRequestHeader: function() { },
      send: function() {
        this.status = 200;
        this.responseText = '{';
        this.readyState = 4;
        this.onreadystatechange();
      }
    };
    RESTController._setXHR(XHR);
    RESTController.request('GET', 'classes/MyObject', {}, {})
      .then(null, (error) => {
        expect(error.code).toBe(100);
        expect(error.message.indexOf('XMLHttpRequest failed')).toBe(0);
        done();
      });
  });

  it('handles invalid errors', (done) => {
    const XHR = function() { };
    XHR.prototype = {
      open: function() { },
      setRequestHeader: function() { },
      send: function() {
        this.status = 400;
        this.responseText = '{';
        this.readyState = 4;
        this.onreadystatechange();
      }
    };
    RESTController._setXHR(XHR);
    RESTController.request('GET', 'classes/MyObject', {}, {})
      .then(null, (error) => {
        expect(error.code).toBe(107);
        expect(error.message).toBe('Received an error with invalid JSON from Parse: {');
        done();
      });
  });

  it('handles x-parse-job-status-id header', async () => {
    const XHR = function() { };
    XHR.prototype = {
      open: function() { },
      setRequestHeader: function() { },
      getResponseHeader: function() { return 1234; },
      send: function() {
        this.status = 200;
        this.responseText = '{}';
        this.readyState = 4;
        this.onreadystatechange();
      },
      getAllResponseHeaders: function() {
        return 'x-parse-job-status-id: 1234';
      }
    };
    RESTController._setXHR(XHR);
    const response = await RESTController.request('GET', 'classes/MyObject', {}, {})
    expect(response).toBe(1234);
  });

  it('handles invalid header', async () => {
    const XHR = function() { };
    XHR.prototype = {
      open: function() { },
      setRequestHeader: function() { },
      getResponseHeader: function() { return null; },
      send: function() {
        this.status = 200;
        this.responseText = '{"result":"hello"}';
        this.readyState = 4;
        this.onreadystatechange();
      },
      getAllResponseHeaders: function() {
        return null;
      }
    };
    RESTController._setXHR(XHR);
    const response = await RESTController.request('GET', 'classes/MyObject', {}, {})
    expect(response.result).toBe('hello');
  });

  it('handles aborted requests', (done) => {
    const XHR = function() { };
    XHR.prototype = {
      open: function() { },
      setRequestHeader: function() { },
      send: function() {
        this.status = 0;
        this.responseText = '{"foo":"bar"}';
        this.readyState = 4;
        this.onabort();
        this.onreadystatechange();
      }
    };
    RESTController._setXHR(XHR);
    RESTController.request('GET', 'classes/MyObject', {}, {})
      .then(() => {
        done();
      });
  });

  it('attaches the session token of the current user', async () => {
    CoreManager.setUserController({
      currentUserAsync() {
        return Promise.resolve({ getSessionToken: () => '5678' });
      },
      setCurrentUser() {},
      currentUser() {},
      signUp() {},
      logIn() {},
      become() {},
      logOut() {},
      me() {},
      requestPasswordReset() {},
      upgradeToRevocableSession() {},
      linkWith() {},
      requestEmailVerification() {},
      verifyPassword() {},
    });

    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, {});
    await flushPromises();
    expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
      _SessionToken: '5678',
    });
    CoreManager.set('UserController', undefined); // Clean up
  });

  it('attaches no session token when there is no current user', async () => {
    CoreManager.setUserController({
      currentUserAsync() {
        return Promise.resolve(null);
      },
      setCurrentUser() {},
      currentUser() {},
      signUp() {},
      logIn() {},
      become() {},
      logOut() {},
      me() {},
      requestPasswordReset() {},
      upgradeToRevocableSession() {},
      linkWith() {},
      requestEmailVerification() {},
      verifyPassword() {},
    });

    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, {});
    await flushPromises();
    expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
    });
    CoreManager.set('UserController', undefined); // Clean up
  });

  it('sends the revocable session upgrade header when the config flag is set', async () => {
    CoreManager.set('FORCE_REVOCABLE_SESSION', true);
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, {});
    await flushPromises();
    xhr.onreadystatechange();
    expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
      _RevocableSession: '1'
    });
    CoreManager.set('FORCE_REVOCABLE_SESSION', false); // Clean up
  });

  it('sends the master key when requested', async () => {
    CoreManager.set('MASTER_KEY', 'M');
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, { useMasterKey: true });
    await flushPromises();
    expect(JSON.parse(xhr.send.mock.calls[0][0])).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _MasterKey: 'M',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
    });
  });

  it('includes the status code when requested', (done) => {
    RESTController._setXHR(mockXHR([{ status: 200, response: { success: true }}]));
    RESTController.request('POST', 'users', {}, { returnStatus: true })
      .then((response) => {
        expect(response).toEqual(expect.objectContaining({ success: true }));
        expect(response._status).toBe(200);
        done();
      });
  });

  it('throws when attempted to use an unprovided master key', () => {
    CoreManager.set('MASTER_KEY', undefined);
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    expect(function() {
      RESTController.request('GET', 'classes/MyObject', {}, { useMasterKey: true });
    }).toThrow(
      'Cannot use the Master Key, it has not been provided.'
    );
  });

  it('sends auth header when the auth type and token flags are set', async () => {
    CoreManager.set('SERVER_AUTH_TYPE', 'Bearer');
    CoreManager.set('SERVER_AUTH_TOKEN', 'some_random_token');
    const credentialsHeader = (header) => "Authorization" === header[0];
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.request('GET', 'classes/MyObject', {}, {});
    await flushPromises();
    expect(xhr.setRequestHeader.mock.calls.filter(credentialsHeader)).toEqual(
      [["Authorization", "Bearer some_random_token"]]
    );
    CoreManager.set('SERVER_AUTH_TYPE', null);
    CoreManager.set('SERVER_AUTH_TOKEN', null);
  });

  it('reports upload/download progress of the AJAX request when callback is provided', (done) => {
    const xhr = mockXHR([{ status: 200, response: { success: true } }], {
      progress: {
        lengthComputable: true,
        loaded: 5,
        total: 10
      }
    });
    RESTController._setXHR(xhr);

    const options = {
      progress: function(){}
    };
    jest.spyOn(options, 'progress');

    RESTController.ajax('POST', 'files/upload.txt', {}, {}, options).then(({ response, status }) => {
      expect(options.progress).toHaveBeenCalledWith(0.5, 5, 10, { type: 'download' });
      expect(options.progress).toHaveBeenCalledWith(0.5, 5, 10, { type: 'upload' });
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
  });

  it('does not upload progress when total is uncomputable', (done) => {
    const xhr = mockXHR([{ status: 200, response: { success: true } }], {
      progress: {
        lengthComputable: false,
        loaded: 5,
        total: 0
      }
    });
    RESTController._setXHR(xhr);

    const options = {
      progress: function(){}
    };
    jest.spyOn(options, 'progress');

    RESTController.ajax('POST', 'files/upload.txt', {}, {}, options).then(({ response, status }) => {
      expect(options.progress).toHaveBeenCalledWith(null, null, null, { type: 'upload' });
      expect(response).toEqual({ success: true });
      expect(status).toBe(200);
      done();
    });
  });

  it('opens a XHR with the custom headers', () => {
    CoreManager.set('REQUEST_HEADERS', { 'Cache-Control' : 'max-age=3600' });
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    RESTController.ajax('GET', 'users/me', {}, { 'X-Parse-Session-Token': '123' });
    expect(xhr.setRequestHeader.mock.calls[3]).toEqual(
      [ 'Cache-Control', 'max-age=3600' ]
    );
    expect(xhr.open.mock.calls[0]).toEqual([ 'GET', 'users/me', true ]);
    expect(xhr.send.mock.calls[0][0]).toEqual({});
    CoreManager.set('REQUEST_HEADERS', {});
  });
});
