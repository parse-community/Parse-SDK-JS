jest.autoMockOff();
jest.mock('../uuid', () => {
  let value = 1000;
  return () => (value++).toString();
});

const CoreManager = require('../CoreManager').default;
const RESTController = require('../RESTController').default;
const mockFetch = require('./test_helpers/mockFetch');
const mockWeChat = require('./test_helpers/mockWeChat');
const { TextDecoder } = require('util');

global.TextDecoder = TextDecoder;
global.wx = mockWeChat;
// Remove delay from setTimeout
global.setTimeout = (func) => func();

CoreManager.setInstallationController({
  currentInstallationId() {
    return Promise.resolve('iid');
  },
  currentInstallation() {},
  updateInstallationOnDisk() {},
});
CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
CoreManager.set('VERSION', 'V');

const headers = {
  'X-Parse-Job-Status-Id': '1234',
  'X-Parse-Push-Status-Id': '5678',
  'access-control-expose-headers': 'X-Parse-Job-Status-Id, X-Parse-Push-Status-Id',
};

describe('RESTController', () => {
  it('throws if there is no fetch implementation', async () => {
    global.fetch = undefined;
    await expect(RESTController.ajax('GET', 'users/me', {})).rejects.toThrowError(
      'Cannot make a request: Fetch API not found.'
    );
  });

  it('opens a request with the correct verb and headers', async () => {
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.ajax('GET', 'users/me', {}, { 'X-Parse-Session-Token': '123' });
    expect(fetch.mock.calls[0][0]).toEqual('users/me');
    expect(fetch.mock.calls[0][1].method).toEqual('GET');
    expect(fetch.mock.calls[0][1].headers['X-Parse-Session-Token']).toEqual('123');
  });

  it('resolves with the result of the AJAX request', async () => {
    mockFetch([{ status: 200, response: { success: true } }]);
    const { response, status } = await RESTController.ajax('POST', 'users', {});
    expect(response).toEqual({ success: true });
    expect(status).toBe(200);
  });

  it('retries on 5XX errors', async () => {
    mockFetch([{ status: 500 }, { status: 500 }, { status: 200, response: { success: true } }])
    const { response, status } = await RESTController.ajax('POST', 'users', {});
    expect(response).toEqual({ success: true });
    expect(status).toBe(200);
    expect(fetch.mock.calls.length).toBe(3);
  });

  it('retries on connection failure', async () => {
    mockFetch([{ status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }])
    await expect(RESTController.ajax('POST', 'users', {})).rejects.toEqual(
      'Unable to connect to the Parse API'
    );
    expect(fetch.mock.calls.length).toBe(5);
  });

  it('returns a connection error on network failure', async () => {
    expect.assertions(3);
    mockFetch([{ status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }, { status: 0 }]);
    try {
      await RESTController.request('GET', 'classes/MyObject', {}, { sessionToken: '1234' });
    } catch (err) {
      expect(err.code).toBe(100);
      expect(err.message).toBe('XMLHttpRequest failed: "Unable to connect to the Parse API"');
    }
    expect(fetch.mock.calls.length).toBe(5);
  });

  it('aborts after too many failures', async () => {
    expect.assertions(1);
    mockFetch([
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 500 },
      { status: 200, response: { success: true } },
    ]);
    try {
      await RESTController.ajax('POST', 'users', {});
    } catch (fetchError) {
      expect(fetchError).not.toBe(undefined);
    }
  });

  it('rejects 1XX status codes', async () => {
    expect.assertions(1);
    mockFetch([{ status: 100 }]);
    try {
      await RESTController.ajax('POST', 'users', {});
    } catch (fetchError) {
      expect(fetchError).not.toBe(undefined);
    }
  });

  it('can make formal JSON requests', async () => {
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request('GET', 'classes/MyObject', {}, { sessionToken: '1234' });
    expect(fetch.mock.calls[0][0]).toEqual('https://api.parse.com/1/classes/MyObject');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
      _SessionToken: '1234',
    });
  });

  it('handles request errors', async () => {
    expect.assertions(2);
    mockFetch([
      {
        status: 400,
        response: {
          code: -1,
          error: 'Something bad',
        },
      },
    ]);
    try {
      await RESTController.request('GET', 'classes/MyObject', {}, {});
    } catch (error) {
      expect(error.code).toBe(-1);
      expect(error.message).toBe('Something bad');
    }
  });

  it('handles request errors with message', async () => {
    expect.assertions(2);
    mockFetch([
      {
        status: 400,
        response: {
          code: 1,
          message: 'Internal server error.',
        },
      },
    ]);
    try {
      await RESTController.request('GET', 'classes/MyObject', {}, {});
    } catch (error) {
      expect(error.code).toBe(1);
      expect(error.message).toBe('Internal server error.');
    }
  });

  it('handles invalid responses', async () => {
    expect.assertions(2);
    mockFetch([{
      status: 400,
      response: {
        invalid: 'response',
      },
    }]);
    try {
      await RESTController.request('GET', 'classes/MyObject', {}, {});
    } catch (error) {
      expect(error.code).toBe(100);
      expect(error.message.indexOf('XMLHttpRequest failed')).toBe(0);
    }
  });

  it('handles X-Parse-Job-Status-Id header', async () => {
    mockFetch([{ status: 200, response: { results: [] } }], headers);
    const response = await RESTController.request(
      'GET',
      'classes/MyObject',
      {},
      { returnStatus: true }
    );
    expect(response._headers['X-Parse-Job-Status-Id']).toBe('1234');
  });

  it('handles X-Parse-Push-Status-Id header', async () => {
    mockFetch([{ status: 200, response: { results: [] } }], headers);
    const response = await RESTController.request('POST', 'push', {}, { returnStatus: true });
    expect(response._headers['X-Parse-Push-Status-Id']).toBe('5678');
  });

  it('idempotency - sends requestId header', async () => {
    CoreManager.set('IDEMPOTENCY', true);
    mockFetch([{ status: 200, response: { results: [] } }, { status: 200, response: { results: [] } }]);

    await RESTController.request('POST', 'classes/MyObject', {}, {});
    expect(fetch.mock.calls[0][1].headers['X-Parse-Request-Id']).toBe('1000');

    await RESTController.request('PUT', 'classes/MyObject', {}, {});
    expect(fetch.mock.calls[1][1].headers['X-Parse-Request-Id']).toBe('1001');
    CoreManager.set('IDEMPOTENCY', false);
  });

  it('idempotency - handle requestId on network retries', async () => {
    CoreManager.set('IDEMPOTENCY', true);
    mockFetch([{ status: 500 }, { status: 500 }, { status: 200, response: { success: true } }])
    const { response, status } = await RESTController.ajax('POST', 'users', {});
    // X-Parse-Request-Id should be the same for all retries
    const requestIdHeaders = fetch.mock.calls.map((call) => call[1].headers['X-Parse-Request-Id']);
    expect(requestIdHeaders.every(header => header === requestIdHeaders[0])).toBeTruthy();
    expect(requestIdHeaders.length).toBe(3);
    expect(response).toEqual({ success: true });
    expect(status).toBe(200);
    CoreManager.set('IDEMPOTENCY', false);
  });

  it('idempotency - should properly handle url method not POST / PUT', async () => {
    CoreManager.set('IDEMPOTENCY', true);
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.ajax('GET', 'users/me', {}, {});
    const requestIdHeaders = fetch.mock.calls.map((call) => call[1].headers['X-Parse-Request-Id']);
    expect(requestIdHeaders.length).toBe(1);
    expect(requestIdHeaders[0]).toBe(undefined);
    CoreManager.set('IDEMPOTENCY', false);
  });

  it('handles aborted requests', async () => {
    mockFetch([], {}, { name: 'AbortError' });
    const { results } = await RESTController.request('GET', 'classes/MyObject', {}, {});
    expect(results).toEqual([]);
  });

  it('handles ECONNREFUSED error', async () => {
    mockFetch([], {}, { cause: { code: 'ECONNREFUSED' } });
    await expect(RESTController.ajax('GET', 'classes/MyObject', {}, {})).rejects.toEqual(
      'Unable to connect to the Parse API'
    );
  });

  it('handles fetch errors', async () => {
    const error = { name: 'Error', message: 'Generic error' };
    mockFetch([], {}, error);
    await expect(RESTController.ajax('GET', 'classes/MyObject', {}, {})).rejects.toEqual(error);
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
    mockFetch([{ status: 200, response: { results: [] } }]);

    await RESTController.request('GET', 'classes/MyObject', {}, {});
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
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
    mockFetch([{ status: 200, response: { results: [] } }]);

    await RESTController.request('GET', 'classes/MyObject', {}, {});
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
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
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request('GET', 'classes/MyObject', {}, {});
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
      _RevocableSession: '1',
    });
    CoreManager.set('FORCE_REVOCABLE_SESSION', false); // Clean up
  });

  it('sends the master key when requested', async () => {
    CoreManager.set('MASTER_KEY', 'M');
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request('GET', 'classes/MyObject', {}, { useMasterKey: true });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _MasterKey: 'M',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
    });
  });

  it('sends the maintenance key when requested', async () => {
    CoreManager.set('MAINTENANCE_KEY', 'MK');
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request('GET', 'classes/MyObject', {}, { useMaintenanceKey: true });
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _MaintenanceKey: 'MK',
      _ClientVersion: 'V',
      _InstallationId: 'iid',
    });
  });

  it('includes the status code when requested', async () => {
    mockFetch([{ status: 200, response: { success: true } }]);
    const response = await RESTController.request('POST', 'users', {}, { returnStatus: true });
    expect(response).toEqual(expect.objectContaining({ success: true }));
    expect(response._status).toBe(200);
  });

  it('throws when attempted to use an unprovided master key', () => {
    CoreManager.set('MASTER_KEY', undefined);
    mockFetch([{ status: 200, response: { results: [] } }]);
    expect(function () {
      RESTController.request('GET', 'classes/MyObject', {}, { useMasterKey: true });
    }).toThrow('Cannot use the Master Key, it has not been provided.');
  });

  it('sends auth header when the auth type and token flags are set', async () => {
    CoreManager.set('SERVER_AUTH_TYPE', 'Bearer');
    CoreManager.set('SERVER_AUTH_TOKEN', 'some_random_token');
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request('GET', 'classes/MyObject', {}, {});
    expect(fetch.mock.calls[0][1].headers['Authorization']).toEqual('Bearer some_random_token');
    CoreManager.set('SERVER_AUTH_TYPE', null);
    CoreManager.set('SERVER_AUTH_TOKEN', null);
  });

  it('reports upload/download progress of the AJAX request when callback is provided', async () => {
    mockFetch([{ status: 200, response: { success: true } }], { 'Content-Length': 10 });
    const options = {
      progress: function () {},
    };
    jest.spyOn(options, 'progress');

    const { response, status } = await RESTController.ajax('POST', 'files/upload.txt', {}, {}, options);
    expect(options.progress).toHaveBeenCalledWith(1.6, 16, 10);
    expect(response).toEqual({ success: true });
    expect(status).toBe(200);
  });

  it('does not upload progress when total is uncomputable', async () => {
    mockFetch([{ status: 200, response: { success: true } }], { 'Content-Length': 0 });
    const options = {
      progress: function () {},
    };
    jest.spyOn(options, 'progress');

    const { response, status } = await RESTController.ajax('POST', 'files/upload.txt', {}, {}, options);
    expect(options.progress).toHaveBeenCalledWith(null, null, null);
    expect(response).toEqual({ success: true });
    expect(status).toBe(200);
  });

  it('opens a request with the custom headers', async () => {
    CoreManager.set('REQUEST_HEADERS', { 'Cache-Control': 'max-age=3600' });
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.ajax('GET', 'users/me', {}, { 'X-Parse-Session-Token': '123' });
    expect(fetch.mock.calls[0][0]).toEqual('users/me');
    expect(fetch.mock.calls[0][1].headers['Cache-Control']).toEqual('max-age=3600');
    expect(fetch.mock.calls[0][1].headers['X-Parse-Session-Token']).toEqual('123');
    CoreManager.set('REQUEST_HEADERS', {});
  });

  it('can handle installationId option', async () => {
    mockFetch([{ status: 200, response: { results: [] } }]);
    await RESTController.request(
      'GET',
      'classes/MyObject',
      {},
      { sessionToken: '1234', installationId: '5678' }
    );
    expect(fetch.mock.calls[0][0]).toEqual('https://api.parse.com/1/classes/MyObject');
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual({
      _method: 'GET',
      _ApplicationId: 'A',
      _JavaScriptKey: 'B',
      _ClientVersion: 'V',
      _InstallationId: '5678',
      _SessionToken: '1234',
    });
  });
});
