jest.dontMock('../Analytics');
jest.dontMock('../CoreManager');

const Analytics = require('../Analytics');
const CoreManager = require('../CoreManager');

const defaultController = CoreManager.getAnalyticsController();

describe('Analytics', () => {
  beforeEach(() => {
    const track = jest.fn();
    track.mockReturnValue(Promise.resolve());
    CoreManager.setAnalyticsController({ track: track });
  });

  it('throws when no event name is provided', () => {
    expect(Analytics.track).toThrow('A name for the custom event must be provided');

    expect(Analytics.track.bind(null, '')).toThrow('A name for the custom event must be provided');
  });

  it('trims whitespace from event names', () => {
    Analytics.track('  before', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[0]).toEqual(['before', {}]);

    Analytics.track('after  ', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[1]).toEqual(['after', {}]);

    Analytics.track('  both  ', {});
    expect(CoreManager.getAnalyticsController().track.mock.calls[2]).toEqual(['both', {}]);
  });

  it('passes along event names and dimensions', () => {
    Analytics.track('myEvent', { value: 'a' });
    expect(CoreManager.getAnalyticsController().track.mock.calls[0]).toEqual([
      'myEvent',
      { value: 'a' },
    ]);
  });

  it('throws when invalid dimensions are provided', () => {
    expect(Analytics.track.bind(null, 'event', { number: 12 })).toThrow(
      'track() dimensions expects keys and values of type "string".'
    );

    expect(Analytics.track.bind(null, 'event', { null: null })).toThrow(
      'track() dimensions expects keys and values of type "string".'
    );
  });
});

describe('AnalyticsController', () => {
  beforeEach(() => {
    CoreManager.setAnalyticsController(defaultController);
    const request = jest.fn();
    request.mockReturnValue(
      Promise.resolve({
        success: true,
        result: {},
      })
    );
    const ajax = jest.fn();
    CoreManager.setRESTController({ request: request, ajax: ajax });
  });

  it('passes dimensions along to the appropriate endpoint', () => {
    Analytics.track('click', { x: '12', y: '40' });

    expect(CoreManager.getRESTController().request.mock.calls[0]).toEqual([
      'POST',
      'events/click',
      { dimensions: { x: '12', y: '40' } },
    ]);
  });
});
