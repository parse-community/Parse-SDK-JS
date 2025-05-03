/* global XMLHttpRequest, XDomainRequest */
import uuidv4 from './uuid';
import CoreManager from './CoreManager';
import ParseError from './ParseError';
import { resolvingPromise } from './promiseUtils';
import { polyfillFetch } from './Xhr.weapp';

export interface RequestOptions {
  useMasterKey?: boolean;
  useMaintenanceKey?: boolean;
  sessionToken?: string;
  installationId?: string;
  returnStatus?: boolean;
  batchSize?: number;
  include?: any;
  progress?: any;
  context?: any;
  usePost?: boolean;
  ignoreEmailVerification?: boolean;
  transaction?: boolean;
}

export interface FullOptions {
  success?: any;
  error?: any;
  useMasterKey?: boolean;
  useMaintenanceKey?: boolean;
  sessionToken?: string;
  installationId?: string;
  progress?: any;
  usePost?: boolean;
}

interface PayloadType {
  _context?: any;
  _method?: string;
  _ApplicationId: string;
  _JavaScriptKey?: string;
  _ClientVersion: string;
  _MasterKey?: string;
  _MaintenanceKey?: string;
  _RevocableSession?: string;
  _InstallationId?: string;
  _SessionToken?: string;
}

if (process.env.PARSE_BUILD === 'weapp') {
  polyfillFetch();
}

let useXDomainRequest = false;
// @ts-ignore
if (typeof XDomainRequest !== 'undefined' && !('withCredentials' in new XMLHttpRequest())) {
  useXDomainRequest = true;
}

function ajaxIE9(method: string, url: string, data: any, _headers?: any, options?: FullOptions) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const xdr = new XDomainRequest();
    xdr.onload = function () {
      let response;
      try {
        response = JSON.parse(xdr.responseText);
      } catch (e) {
        reject(e);
      }
      if (response) {
        resolve({ response });
      }
    };
    xdr.onerror = xdr.ontimeout = function () {
      // Let's fake a real error message.
      const fakeResponse = {
        responseText: JSON.stringify({
          code: ParseError.X_DOMAIN_REQUEST,
          error: "IE's XDomainRequest does not supply error info.",
        }),
      };
      reject(fakeResponse);
    };
    xdr.onprogress = function () {
      if (options && typeof options.progress === 'function') {
        options.progress(xdr.responseText);
      }
    };
    xdr.open(method, url);
    xdr.send(data);
    // @ts-ignore
    if (options && typeof options.requestTask === 'function') {
      // @ts-ignore
      options.requestTask(xdr);
    }
  });
}

const RESTController = {
  async ajax(method: string, url: string, data: any, headers?: any, options?: FullOptions) {
    if (useXDomainRequest) {
      return ajaxIE9(method, url, data, headers, options);
    }
    if (typeof fetch !== 'function') {
      throw new Error('Cannot make a request: Fetch API not found.');
    }
    const promise = resolvingPromise();
    const isIdempotent = CoreManager.get('IDEMPOTENCY') && ['POST', 'PUT'].includes(method);
    const requestId = isIdempotent ? uuidv4() : '';
    let attempts = 0;

    const dispatch = async function () {
      const controller = new AbortController();
      const { signal } = controller;

      headers = headers || {};
      if (typeof headers['Content-Type'] !== 'string') {
        headers['Content-Type'] = 'text/plain'; // Avoid pre-flight
      }
      if (CoreManager.get('IS_NODE')) {
        headers['User-Agent'] =
          'Parse/' + CoreManager.get('VERSION') + ' (NodeJS ' + process.versions.node + ')';
      }
      if (isIdempotent) {
        headers['X-Parse-Request-Id'] = requestId;
      }
      if (CoreManager.get('SERVER_AUTH_TYPE') && CoreManager.get('SERVER_AUTH_TOKEN')) {
        headers['Authorization'] =
          CoreManager.get('SERVER_AUTH_TYPE') + ' ' + CoreManager.get('SERVER_AUTH_TOKEN');
      }
      const customHeaders = CoreManager.get('REQUEST_HEADERS');
      for (const key in customHeaders) {
        headers[key] = customHeaders[key];
      }
      // @ts-ignore
      if (options && typeof options.requestTask === 'function') {
        // @ts-ignore
        options.requestTask(controller);
      }
      try {
        const fetchOptions: any = {
          method,
          headers,
          signal,
        };
        if (data) {
          fetchOptions.body = data;
        }
        const response = await fetch(url, fetchOptions);
        const { status } = response;
        if (status >= 200 && status < 300) {
          let result;
          const responseHeaders = {};
          const availableHeaders = response.headers.get('access-control-expose-headers') || '';
          availableHeaders.split(', ').forEach((header: string) => {
            if (response.headers.has(header)) {
              responseHeaders[header] = response.headers.get(header);
            }
          });
          if (options && typeof options.progress === 'function' && response.body) {
            const reader = response.body.getReader();
            const length = +response.headers.get('Content-Length') || 0;
            if (length === 0) {
              options.progress(null, null, null);
              result = await response.json();
            } else {
              let recieved = 0;
              const chunks = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  break;
                }
                chunks.push(value);
                recieved += value?.length || 0;
                options.progress(recieved / length, recieved, length);
              }
              const body = new Uint8Array(recieved);
              let offset = 0;
              for (const chunk of chunks) {
                body.set(chunk, offset);
                offset += chunk.length;
              }
              const jsonString = new TextDecoder().decode(body);
              result = JSON.parse(jsonString);
            }
          } else {
            result = await response.json();
          }
          promise.resolve({ status, response: result, headers: responseHeaders });
        } else if (status >= 400 && status < 500) {
          const error = await response.json();
          promise.reject(error);
        } else if (status >= 500 || status === 0) {
          // retry on 5XX or library error
          if (++attempts < CoreManager.get('REQUEST_ATTEMPT_LIMIT')) {
            // Exponentially-growing random delay
            const delay = Math.round(Math.random() * 125 * Math.pow(2, attempts));
            setTimeout(dispatch, delay);
          } else if (status === 0) {
            promise.reject('Unable to connect to the Parse API');
          } else {
            // After the retry limit is reached, fail
            promise.reject(response);
          }
        } else {
          promise.reject(response);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          promise.resolve({ response: { results: [] }, status: 0 });
        } else if (error.cause?.code === 'ECONNREFUSED') {
          promise.reject('Unable to connect to the Parse API');
        } else {
          promise.reject(error);
        }
      }
    };
    dispatch();

    return promise;
  },

  request(method: string, path: string, data: any, options?: RequestOptions) {
    options = options || {};
    let url = CoreManager.get('SERVER_URL');
    if (url[url.length - 1] !== '/') {
      url += '/';
    }
    url += path;

    const payload: Partial<PayloadType> = {};
    if (data && typeof data === 'object') {
      for (const k in data) {
        payload[k] = data[k];
      }
    }

    // Add context
    const context = options.context;
    if (context !== undefined) {
      payload._context = context;
    }

    if (method !== 'POST') {
      payload._method = method;
      method = 'POST';
    }

    payload._ApplicationId = CoreManager.get('APPLICATION_ID');
    const jsKey = CoreManager.get('JAVASCRIPT_KEY');
    if (jsKey) {
      payload._JavaScriptKey = jsKey;
    }
    payload._ClientVersion = CoreManager.get('VERSION');

    let useMasterKey = options.useMasterKey;
    if (typeof useMasterKey === 'undefined') {
      useMasterKey = CoreManager.get('USE_MASTER_KEY');
    }
    if (useMasterKey) {
      if (CoreManager.get('MASTER_KEY')) {
        delete payload._JavaScriptKey;
        payload._MasterKey = CoreManager.get('MASTER_KEY');
      } else {
        throw new Error('Cannot use the Master Key, it has not been provided.');
      }
    }
    if (options.useMaintenanceKey) {
      payload._MaintenanceKey = CoreManager.get('MAINTENANCE_KEY');
    }
    if (CoreManager.get('FORCE_REVOCABLE_SESSION')) {
      payload._RevocableSession = '1';
    }

    const installationId = options.installationId;
    let installationIdPromise: Promise<string>;
    if (installationId && typeof installationId === 'string') {
      installationIdPromise = Promise.resolve(installationId);
    } else {
      const installationController = CoreManager.getInstallationController();
      installationIdPromise = installationController.currentInstallationId();
    }

    return installationIdPromise
      .then(iid => {
        payload._InstallationId = iid;
        const userController = CoreManager.getUserController();
        if (options && typeof options.sessionToken === 'string') {
          return Promise.resolve(options.sessionToken);
        } else if (userController) {
          return userController.currentUserAsync().then(user => {
            if (user) {
              return Promise.resolve(user.getSessionToken());
            }
            return Promise.resolve(null);
          });
        }
        return Promise.resolve(null);
      })
      .then(token => {
        if (token) {
          payload._SessionToken = token;
        }

        const payloadString = JSON.stringify(payload);
        return RESTController.ajax(method, url, payloadString, {}, options).then(
          ({ response, status, headers }) => {
            if (options.returnStatus) {
              return { ...response, _status: status, _headers: headers };
            } else {
              return response;
            }
          }
        );
      })
      .catch(RESTController.handleError);
  },

  handleError(errorJSON: any) {
    // Transform the error into an instance of ParseError by trying to parse
    // the error string as JSON
    let error;
    if (errorJSON.code || errorJSON.error || errorJSON.message) {
      error = new ParseError(errorJSON.code, errorJSON.error || errorJSON.message);
    } else {
      error = new ParseError(
        ParseError.CONNECTION_FAILED,
        'XMLHttpRequest failed: ' + JSON.stringify(errorJSON)
      );
    }
    return Promise.reject(error);
  },
};

export default RESTController;
