const { TextEncoder } = require('util');
/**
 * Mock fetch by pre-defining the statuses and results that it
 * return.
 * `results` is an array of objects of the form:
 *   { status: ..., response: ... }
 * where status is a HTTP status number and result is a JSON object to pass
 * alongside it.
 * `upload`.
 * @ignore
 */
function mockFetch(results, headers = {}, error) {
  let attempts = -1;
  let didRead = false;
  global.fetch = jest.fn(async () => {
    attempts++;
    if (error) {
      return Promise.reject(error);
    }
    return Promise.resolve({
      status: results[attempts].status,
      json: () => {
        const { response } = results[attempts];
        return Promise.resolve(response);
      },
      headers: {
        get: header => headers[header],
        has: header => headers[header] !== undefined,
      },
      body: {
        getReader: () => ({
          read: () => {
            if (didRead) {
              return Promise.resolve({ done: true });
            }
            let { response } = results[attempts];
            if (typeof response !== 'string') {
              response = JSON.stringify(response);
            }
            didRead = true;
            return Promise.resolve({
              done: false,
              value: new TextEncoder().encode(response),
            });
          },
        }),
      },
    });
  });
}

module.exports = mockFetch;
