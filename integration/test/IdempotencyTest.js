'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');

const Item = Parse.Object.extend('IdempotencyItem');

describe('Idempotency', () => {
  beforeEach((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear(true).then(() => {
      done();
    });
  });

  it('duplicate cloud code function request', async () => {
    const restController = Parse.CoreManager.getRESTController();
    const XHR = restController._getXHR();
    function DuplicateXHR() {
      const xhr = new XHR();
      const send = xhr.send;
      xhr.send = function () {
        this.setRequestHeader('X-Parse-Request-Id', '1234');
        send.apply(this, arguments);
      }
      return xhr;
    }
    restController._setXHR(DuplicateXHR);
    await Parse.Cloud.run('CloudFunctionIdempotency');
    try {
      await Parse.Cloud.run('CloudFunctionIdempotency');
    } catch (e) {
      assert.equal(e.code, Parse.Error.DUPLICATE_REQUEST);
    }
    try {
      await Parse.Cloud.run('CloudFunctionIdempotency');
    } catch (e) {
      assert.equal(e.code, Parse.Error.DUPLICATE_REQUEST);
    }
    const query = new Parse.Query(Item);
    const results = await query.find();
    assert.equal(results.length, 1);

    restController._setXHR(XHR);
  });
});
