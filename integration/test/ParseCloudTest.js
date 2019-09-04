'use strict';

const assert = require('assert');
const clear = require('./clear');
const Parse = require('../../node');
const sleep = require('./sleep');

describe('Parse Cloud', () => {
  beforeAll((done) => {
    Parse.initialize('integration', null, 'notsosecret');
    Parse.CoreManager.set('SERVER_URL', 'http://localhost:1337/parse');
    Parse.Storage._clear();
    clear().then(() => { done() }, () => { done() });
  });

  it('run function', (done) => {
    const params = { key1: 'value2', key2: 'value1' };
    Parse.Cloud.run('bar', params).then((result) => {
      assert.equal('Foo', result);
      done();
    }).catch(done.fail);
  });

  it('run function with user', (done) => {
    const params = { key1: 'value2', key2: 'value1' };
    const user = new Parse.User();
    user.setUsername('someuser');
    user.setPassword('somepassword');
    user.signUp().then(() => {
      return Parse.Cloud.run('bar', params);
    }).then((resp) => {
      assert.equal('Foo', resp);
      return user.destroy({ useMasterKey: true });
    }).then(() => {
      done();
    }).catch(done.fail);
  });

  it('run function failed', (done) => {
    const params = { key1: 'value1', key2: 'value2' };
    Parse.Cloud.run('bar', params).then(done.fail).catch((error) => {
      assert.equal(error.code, Parse.Error.SCRIPT_FAILED);
      done();
    });
  });

  it('run function name fail', (done) => {
    const params = { key1: 'value1' };
    Parse.Cloud.run('unknown_function', params).then(done.fail).catch((error) => {
      assert.equal(error.message, 'Invalid function: "unknown_function"');
      done();
    });
  });

  it('run function with geopoint params does not fail', (done) => {
    const params = { key1: new Parse.GeoPoint(50, 50) };
    Parse.Cloud.run('unknown_function', params).then(null).catch((error) => {
      assert.equal(error.message, 'Invalid function: "unknown_function"');
      done();
    });
  });

  it('run function with object params fail', (done) => {
    const object = new Parse.Object('TestClass');
    const params = { key1: object };
    try {
      Parse.Cloud.run('bar', params);
    } catch (e) {
      assert.equal(e, 'Error: Parse Objects not allowed here');
      done();
    }
  });

  it('run function with undefined', (done) => {
    Parse.Cloud.run('CloudFunctionUndefined', {}).then((result) => {
      assert.strictEqual(result, undefined);
      done();
    });
  });

  it('run job', (done) => {
    const params = { startedBy: 'Monty Python' };
    Parse.Cloud.startJob('CloudJob1', params).then((jobStatusId) => {
      return Parse.Cloud.getJobStatus(jobStatusId);
    }).then((jobStatus) => {
      assert.equal(jobStatus.get('status'), 'succeeded');
      assert.equal(jobStatus.get('params').startedBy, 'Monty Python');
      done();
    });
  });

  it('run long job', async () => {
    const jobStatusId = await Parse.Cloud.startJob('CloudJob2');

    let jobStatus = await Parse.Cloud.getJobStatus(jobStatusId);
    assert.equal(jobStatus.get('status'), 'running');

    await sleep(2000);

    jobStatus = await Parse.Cloud.getJobStatus(jobStatusId);
    assert.equal(jobStatus.get('status'), 'succeeded');
  });

  it('run bad job', (done) => {
    Parse.Cloud.startJob('bad_job').then(null).catch((error) => {
      assert.equal(error.code, Parse.Error.SCRIPT_FAILED);
      assert.equal(error.message, 'Invalid job.');
      done();
    });
  });

  it('run failing job', (done) => {
    Parse.Cloud.startJob('CloudJobFailing').then((jobStatusId) => {
      return Parse.Cloud.getJobStatus(jobStatusId);
    }).then((jobStatus) => {
      assert.equal(jobStatus.get('status'), 'failed');
      assert.equal(jobStatus.get('message'), 'cloud job failed');
      done();
    });
  });

  it('get jobs data', (done) => {
    Parse.Cloud.getJobsData().then((result) => {
      assert.equal(result.in_use.length, 0);
      assert.equal(result.jobs.length, 3);
      done();
    });
  });

  it('invalid job status id', (done) => {
    Parse.Cloud.getJobStatus('not-a-real-id').then(null).catch((error) => {
      assert.equal(error.message, 'Object not found.');
      done();
    });
  });
});
