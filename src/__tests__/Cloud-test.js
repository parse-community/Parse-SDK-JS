/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../Cloud');
jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParsePromise');

var Cloud = require('../Cloud');
var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise').default;

var defaultController = CoreManager.getCloudController();

describe('Cloud', () => {
  beforeEach(() => {
    var run = jest.fn();
    var getJobsData = jest.fn();
    var startJob = jest.fn();
    run.mockReturnValue(ParsePromise.as({
      result: {}
    }));
    getJobsData.mockReturnValue(ParsePromise.as({
      result: {}
    }));
    startJob.mockReturnValue(ParsePromise.as({
      result: {}
    }));
    CoreManager.setCloudController({ run, getJobsData, startJob });
  });

  it('run throws with an invalid function name', () => {
    expect(Cloud.run)
      .toThrow('Cloud function name must be a string.');

    expect(Cloud.run.bind(null, ''))
      .toThrow('Cloud function name must be a string.');

    expect(Cloud.run.bind(null, {}))
      .toThrow('Cloud function name must be a string.');
  });

  it('run passes function name and data along', () => {
    Cloud.run('myfunction', {});

    expect(CoreManager.getCloudController().run.mock.calls[0])
      .toEqual(['myfunction', {}, {}]);
  });

  it('run passes options', () => {
    Cloud.run('myfunction', {}, { useMasterKey: false });

    expect(CoreManager.getCloudController().run.mock.calls[0])
      .toEqual(['myfunction', {}, {}]);

    Cloud.run('myfunction', {}, { useMasterKey: true });

    expect(CoreManager.getCloudController().run.mock.calls[1])
      .toEqual(['myfunction', {}, { useMasterKey: true }]);

    Cloud.run('myfunction', {}, { sessionToken: 'asdf1234' });

    expect(CoreManager.getCloudController().run.mock.calls[2])
      .toEqual(['myfunction', {}, { sessionToken: 'asdf1234' }]);

    Cloud.run('myfunction', {}, { useMasterKey: true, sessionToken: 'asdf1234' });

    expect(CoreManager.getCloudController().run.mock.calls[3])
      .toEqual(['myfunction', {}, { useMasterKey: true, sessionToken: 'asdf1234' }]);
  });

  it('startJob throws with an invalid job name', () => {
    expect(Cloud.startJob)
      .toThrow('Cloud job name must be a string.');

    expect(Cloud.startJob.bind(null, ''))
      .toThrow('Cloud job name must be a string.');

    expect(Cloud.startJob.bind(null, {}))
      .toThrow('Cloud job name must be a string.');
  });

  it('startJob passes function name and data along', () => {
    Cloud.startJob('myJob', {});

    expect(CoreManager.getCloudController().startJob.mock.calls[0])
      .toEqual(['myJob', {}, { useMasterKey: true }]);
  });

  it('startJob passes options', () => {
    Cloud.startJob('myJob', {}, { useMasterKey: true });

    expect(CoreManager.getCloudController().startJob.mock.calls[0])
      .toEqual(['myJob', {}, { useMasterKey: true }]);
  });

  it('getJobsData passes options', () => {
    Cloud.getJobsData();

    expect(CoreManager.getCloudController().getJobsData.mock.calls[0])
      .toEqual([{ useMasterKey: true }]);

    Cloud.getJobsData({ useMasterKey: true });

    expect(CoreManager.getCloudController().getJobsData.mock.calls[0])
      .toEqual([{ useMasterKey: true }]);
  });
});

describe('CloudController', () => {
  beforeEach(() => {
    CoreManager.setCloudController(defaultController);
    var request = jest.fn();
    request.mockReturnValue(ParsePromise.as({
      success: true,
      result: {}
    }));
    var ajax = jest.fn();
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('run passes encoded requests', () => {
    Cloud.run('myfunction', { value: 12, when: new Date(Date.UTC(2015,0,1)) });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['POST', 'functions/myfunction', {
        value: 12, when: { __type: 'Date', iso: '2015-01-01T00:00:00.000Z'}
      }, { }]);
  });

  it('run passes options', () => {
    Cloud.run('myfunction', { value: 12 }, { useMasterKey: true });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['POST', 'functions/myfunction', {
        value: 12
      }, { useMasterKey: true }]);

    Cloud.run('myfunction', { value: 12 }, { sessionToken: 'asdf1234' });

    expect(CoreManager.getRESTController().request.mock.calls[1])
      .toEqual(['POST', 'functions/myfunction', {
        value: 12
      }, { sessionToken: 'asdf1234' }]);
  });

  it('run invalid response', () => {
    var request = jest.fn();
    request.mockReturnValue(ParsePromise.as({
      success: false
    }));
    var ajax = jest.fn();
    CoreManager.setRESTController({ request: request, ajax: ajax });

    Cloud.run('myfunction').then(null).catch(() => {
      done();
    });
  });

  it('startJob passes encoded requests', () => {
    Cloud.startJob('myJob', { value: 12, when: new Date(Date.UTC(2015,0,1)) });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['POST', 'jobs/myJob', {
        value: 12, when: { __type: 'Date', iso: '2015-01-01T00:00:00.000Z'}
      }, { useMasterKey: true }]);
  });

  it('startJob passes options', () => {
    Cloud.startJob('myJob', { value: 12 }, { useMasterKey: true });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['POST', 'jobs/myJob', {
        value: 12
      }, { useMasterKey: true }]);
  });

  it('getJobsData passes no options', () => {
    Cloud.getJobsData();

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['GET', 'cloud_code/jobs/data', null, { useMasterKey: true }]);
  });

  it('getJobsData passes options', () => {
    Cloud.getJobsData({ useMasterKey: true });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['GET', 'cloud_code/jobs/data', null, { useMasterKey: true }]);
  });
});
