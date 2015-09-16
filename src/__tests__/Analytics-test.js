/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../Analytics');
jest.dontMock('../CoreManager');
jest.dontMock('../ParsePromise');

var Analytics = require('../Analytics');
var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise');

var defaultController = CoreManager.getAnalyticsController();

describe('Analytics', () => {
  beforeEach(() => {
    var track = jest.genMockFunction();
    track.mockReturnValue(ParsePromise.as());
    CoreManager.setAnalyticsController({ track: track });
  });

  it('throws when no event name is provided', () => {
    expect(Analytics.track)
      .toThrow('A name for the custom event must be provided');

    expect(Analytics.track.bind(null, ''))
      .toThrow('A name for the custom event must be provided');
  });

  it('trims whitespace from event names', () => {
    Analytics.track('  before', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[0])
      .toEqual(['before', {}]);

    Analytics.track('after  ', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[1])
      .toEqual(['after', {}]);

    Analytics.track('  both  ', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[2])
      .toEqual(['both', {}]);
  });

  it('passes along event names and dimensions', () => {
    Analytics.track('myEvent', { value: 'a' });
    expect(CoreManager.getAnalyticsController().track.mock.calls[0])
      .toEqual(['myEvent', { value: 'a' }]);
  });

  it('throws when invalid dimensions are provided', () => {
    expect(Analytics.track.bind(null, 'event', { number: 12 }))
      .toThrow('track() dimensions expects keys and values of type "string".');

    expect(Analytics.track.bind(null, 'event', { 'null': null }))
      .toThrow('track() dimensions expects keys and values of type "string".');
  });
});

describe('AnalyticsController', () => {
  beforeEach(() => {
    CoreManager.setAnalyticsController(defaultController);
    var request = jest.genMockFunction();
    request.mockReturnValue(ParsePromise.as({
      success: true,
      result: {}
    }));
    var ajax = jest.genMockFunction();
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('passes dimensions along to the appropriate endpoint', () => {
    Analytics.track('click', { x: '12', y: '40' });

    expect(CoreManager.getRESTController().request.mock.calls[0])
      .toEqual([
        'POST',
        'events/click',
        { dimensions: { x: '12', y: '40'} }
      ]);
  });
});
