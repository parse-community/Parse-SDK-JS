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

jest.dontMock('../ReduxCacheHelper');

var Cloud = require('../Cloud');
var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise');

var defaultController = CoreManager.getCloudController();

describe('Cloud', () => {
  beforeEach(() => {
    var run = jest.genMockFunction();
    run.mockReturnValue(ParsePromise.as({
      result: {}
    }));
    CoreManager.setCloudController({ run: run });
  });

  it('throws with an invalid function name', () => {
    expect(Cloud.run)
      .toThrow('Cloud function name must be a string.');

    expect(Cloud.run.bind(null, ''))
      .toThrow('Cloud function name must be a string.');

    expect(Cloud.run.bind(null, {}))
      .toThrow('Cloud function name must be a string.');
  });

  it('passes function name and data along', () => {
    Cloud.run('myfunction', {});

    expect(CoreManager.getCloudController().run.mock.calls[0])
      .toEqual(['myfunction', {}, {}]);
  });

  it('passes options', () => {
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
  })
});

describe('CloudController', () => {
  beforeEach(() => {
    CoreManager.setCloudController(defaultController);
    var request = jest.genMockFunction();
    request.mockReturnValue(ParsePromise.as({
      success: true,
      result: {}
    }));
    var ajax = jest.genMockFunction();
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('passes encoded requests', () => {
    Cloud.run('myfunction', { value: 12, when: new Date(Date.UTC(2015,0,1)) });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual(['POST', 'functions/myfunction', {
        value: 12, when: { __type: 'Date', iso: '2015-01-01T00:00:00.000Z'}
      }, { }]);
  });

  it('passes options', () => {
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
});
