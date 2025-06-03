'use strict';
const originalFetch = global.fetch;

const Parse = require('../../node');
const sleep = require('./sleep');
const Item = Parse.Object.extend('IdempotencyItem');

function DuplicateRequestId(requestId) {
  global.fetch = async (...args) => {
    const options = args[1];
    options.headers['X-Parse-Request-Id'] = requestId;
    return originalFetch(...args);
  };
}

describe('Idempotency', () => {
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('handle duplicate cloud code function request', async () => {
    DuplicateRequestId('1234');
    await Parse.Cloud.run('CloudFunctionIdempotency');
    await expectAsync(Parse.Cloud.run('CloudFunctionIdempotency')).toBeRejectedWithError(
      'Duplicate request'
    );
    await expectAsync(Parse.Cloud.run('CloudFunctionIdempotency')).toBeRejectedWithError(
      'Duplicate request'
    );
    const query = new Parse.Query(Item);
    const results = await query.find();
    expect(results.length).toBe(1);
  });

  it('handle duplicate job request', async () => {
    DuplicateRequestId('1234');
    const params = { startedBy: 'Monty Python' };
    const jobStatusId = await Parse.Cloud.startJob('CloudJobParamsInMessage', params);
    await expectAsync(Parse.Cloud.startJob('CloudJobParamsInMessage', params)).toBeRejectedWithError(
      'Duplicate request'
    );

    const checkJobStatus = async () => {
      const result = await Parse.Cloud.getJobStatus(jobStatusId);
      return result && result.get('status') === 'succeeded';
    };
    while (!(await checkJobStatus())) {
      await sleep(100);
    }
    const jobStatus = await Parse.Cloud.getJobStatus(jobStatusId);
    expect(jobStatus.get('status')).toBe('succeeded');
    expect(JSON.parse(jobStatus.get('message'))).toEqual(params);
  });

  it('handle duplicate POST / PUT request', async () => {
    DuplicateRequestId('1234');
    const testObject = new Parse.Object('IdempotentTest');
    await testObject.save();
    await expectAsync(testObject.save()).toBeRejectedWithError('Duplicate request');

    DuplicateRequestId('5678');
    testObject.set('foo', 'bar');
    await testObject.save();
    await expectAsync(testObject.save()).toBeRejectedWithError('Duplicate request');

    const query = new Parse.Query('IdempotentTest');
    const results = await query.find();
    expect(results.length).toBe(1);
    expect(results[0].get('foo')).toBe('bar');
  });
});
