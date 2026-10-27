jest.autoMockOff();
jest.mock('../uuid', () => () => 'network-retry-request-id');

const CoreManager = require('../CoreManager').default;
const RESTController = require('../RESTController').default;

function response(status = 200) {
  return {
    status,
    headers: { get: () => null, has: () => false },
    json: async () => ({ results: [] }),
  };
}

describe('RESTController rejected fetch retries', () => {
  let originalFetch;
  let originalLimit;
  let originalIdempotency;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalLimit = CoreManager.get('REQUEST_ATTEMPT_LIMIT');
    originalIdempotency = CoreManager.get('IDEMPOTENCY');
    CoreManager.set('REQUEST_ATTEMPT_LIMIT', 3);
    CoreManager.set('IDEMPOTENCY', false);
    jest.spyOn(global, 'setTimeout').mockImplementation(callback => callback());
  });

  afterEach(() => {
    global.fetch = originalFetch;
    CoreManager.set('REQUEST_ATTEMPT_LIMIT', originalLimit);
    CoreManager.set('IDEMPOTENCY', originalIdempotency);
    jest.restoreAllMocks();
  });

  it.each(['GET', 'HEAD'])('retries a rejected %s fetch before succeeding', async method => {
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValue(response());

    await expect(RESTController.ajax(method, 'https://example.com/parse', null))
      .resolves.toMatchObject({ status: 200, response: { results: [] } });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('retries a GET tunneled through POST', async () => {
    const body = JSON.stringify({ _method: 'GET', _ApplicationId: 'test' });
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValue(response());

    await RESTController.ajax('POST', 'https://example.com/parse/classes/Test', body);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(call => call[1].body)).toEqual([body, body]);
  });

  it('shares the attempt limit between rejected fetches and HTTP failures', async () => {
    const failure = new TypeError('fetch failed');
    global.fetch = jest.fn()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(response(503))
      .mockRejectedValueOnce(failure)
      .mockResolvedValue(response());

    await expect(RESTController.ajax('GET', 'https://example.com/parse', null))
      .rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it('preserves the existing connection-refused error after exhausting retries', async () => {
    global.fetch = jest.fn().mockRejectedValue({ cause: { code: 'ECONNREFUSED' } });
    await expect(RESTController.ajax('GET', 'https://example.com/parse', null))
      .rejects.toBe('Unable to connect to the Parse API');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it.each(['POST', 'PUT', 'DELETE'])('does not replay an unprotected %s write', async method => {
    const failure = new TypeError('fetch failed');
    global.fetch = jest.fn().mockRejectedValue(failure);
    await expect(RESTController.ajax(method, 'https://example.com/parse', '{}'))
      .rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not treat a tunneled write as a read', async () => {
    const failure = new TypeError('fetch failed');
    global.fetch = jest.fn().mockRejectedValue(failure);
    await expect(RESTController.ajax('POST', 'https://example.com/parse', '{"_method":"PUT"}'))
      .rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not retry malformed request JSON', async () => {
    const failure = new TypeError('fetch failed');
    global.fetch = jest.fn().mockRejectedValue(failure);
    await expect(RESTController.ajax('POST', 'https://example.com/parse', '{'))
      .rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('reuses the same idempotency key when retrying a protected write', async () => {
    CoreManager.set('IDEMPOTENCY', true);
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValue(response());
    await RESTController.ajax('POST', 'https://example.com/parse', '{}');
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls.map(call => call[1].headers['X-Parse-Request-Id']))
      .toEqual(['network-retry-request-id', 'network-retry-request-id']);
  });

  it('does not retry a rejected stream body even with idempotency enabled', async () => {
    const { ReadableStream } = require('stream/web');
    const originalStream = global.ReadableStream;
    global.ReadableStream = ReadableStream;
    CoreManager.set('IDEMPOTENCY', true);
    const failure = new TypeError('fetch failed');
    global.fetch = jest.fn().mockRejectedValue(failure);
    try {
      await expect(RESTController.ajax('POST', 'https://example.com/parse', new ReadableStream()))
        .rejects.toBe(failure);
      expect(fetch).toHaveBeenCalledTimes(1);
    } finally {
      global.ReadableStream = originalStream;
    }
  });

  it('does not retry an intentional abort', async () => {
    global.fetch = jest.fn().mockRejectedValue({ name: 'AbortError' });
    await expect(RESTController.ajax('GET', 'https://example.com/parse', null))
      .resolves.toEqual({ response: { results: [] }, status: 0 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not replay a successful response whose JSON cannot be decoded', async () => {
    const failure = new SyntaxError('Invalid JSON');
    global.fetch = jest.fn().mockResolvedValue({
      ...response(),
      json: async () => { throw failure; },
    });
    await expect(RESTController.ajax('GET', 'https://example.com/parse', null))
      .rejects.toBe(failure);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
