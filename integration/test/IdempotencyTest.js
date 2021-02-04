'use strict';

const Parse = require('../../node');

const Item = Parse.Object.extend('IdempotencyItem');
const RESTController = Parse.CoreManager.getRESTController();

const XHR = RESTController._getXHR();
function DuplicateXHR(requestId) {
  function XHRWrapper() {
    const xhr = new XHR();
    const send = xhr.send;
    xhr.send = function () {
      this.setRequestHeader('X-Parse-Request-Id', requestId);
      send.apply(this, arguments);
    };
    return xhr;
  }
  return XHRWrapper;
}

describe('Idempotency', () => {
  beforeEach(() => {
    RESTController._setXHR(XHR);
  });

  it('handle duplicate cloud code function request', async () => {
    RESTController._setXHR(DuplicateXHR('1234'));
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
    RESTController._setXHR(DuplicateXHR('1234'));
    const params = { startedBy: 'Monty Python' };
    const jobStatusId = await Parse.Cloud.startJob('CloudJob1', params);
    await expectAsync(Parse.Cloud.startJob('CloudJob1', params)).toBeRejectedWithError(
      'Duplicate request'
    );

    const jobStatus = await Parse.Cloud.getJobStatus(jobStatusId);
    expect(jobStatus.get('status')).toBe('succeeded');
    expect(jobStatus.get('params').startedBy).toBe('Monty Python');
  });

  it('handle duplicate POST / PUT request', async () => {
    RESTController._setXHR(DuplicateXHR('1234'));
    const testObject = new Parse.Object('IdempotentTest');
    await testObject.save();
    await expectAsync(testObject.save()).toBeRejectedWithError('Duplicate request');

    RESTController._setXHR(DuplicateXHR('5678'));
    testObject.set('foo', 'bar');
    await testObject.save();
    await expectAsync(testObject.save()).toBeRejectedWithError('Duplicate request');

    const query = new Parse.Query('IdempotentTest');
    const results = await query.find();
    expect(results.length).toBe(1);
    expect(results[0].get('foo')).toBe('bar');
  });
});
