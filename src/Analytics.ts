/**
 * @flow
 */

import CoreManager from './CoreManager';

/**
 * Parse.Analytics provides an interface to Parse's logging and analytics
 * backend.
 *
 * @class Parse.Analytics
 * @static
 * @hideconstructor
 */

/**
 * Tracks the occurrence of a custom event with additional dimensions.
 * Parse will store a data point at the time of invocation with the given
 * event name.
 *
 * Dimensions will allow segmentation of the occurrences of this custom
 * event. Keys and values should be {@code String}s, and will throw
 * otherwise.
 *
 * To track a user signup along with additional metadata, consider the
 * following:
 * <pre>
 * var dimensions = {
 *  gender: 'm',
 *  source: 'web',
 *  dayType: 'weekend'
 * };
 * Parse.Analytics.track('signup', dimensions);
 * </pre>
 *
 * There is a default limit of 8 dimensions per event tracked.
 *
 * @function track
 * @name Parse.Analytics.track
 * @param {string} name The name of the custom event to report to Parse as
 * having happened.
 * @param {object} dimensions The dictionary of information by which to
 * segment this event.
 * @returns {Promise} A promise that is resolved when the round-trip
 * to the server completes.
 */
export function track(name: string, dimensions: { [key: string]: string }): Promise<void> {
  name = name || '';
  name = name.replace(/^\s*/, '');
  name = name.replace(/\s*$/, '');
  if (name.length === 0) {
    throw new TypeError('A name for the custom event must be provided');
  }

  for (const key in dimensions) {
    if (typeof key !== 'string' || typeof dimensions[key] !== 'string') {
      throw new TypeError('track() dimensions expects keys and values of type "string".');
    }
  }

  return CoreManager.getAnalyticsController().track(name, dimensions);
}

const DefaultController = {
  track(name: string, dimensions: { [key: string]: string }) {
    const path = 'events/' + name;
    const RESTController = CoreManager.getRESTController();
    return RESTController.request('POST', path, { dimensions: dimensions });
  },
};

CoreManager.setAnalyticsController(DefaultController);
