/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import CoreManager from './CoreManager';
import decode from './decode';
import encode from './encode';
import ParseError from './ParseError';
import ParsePromise from './ParsePromise';
import ParseQuery from './ParseQuery';

/**
 * Contains functions for calling and declaring
 * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
 * <p><strong><em>
 *   Some functions are only available from Cloud Code.
 * </em></strong></p>
 *
 * @class Parse.Cloud
 * @static
 * @hideconstructor
 */

 /**
  * Makes a call to a cloud function.
  * @method run
  * @name Parse.Cloud.run
  * @param {String} name The function name.
  * @param {Object} data The parameters to send to the cloud function.
  * @param {Object} options A Backbone-style options object
  * options.success, if set, should be a function to handle a successful
  * call to a cloud function.  options.error should be a function that
  * handles an error running the cloud function.  Both functions are
  * optional.  Both functions take a single argument.
  * @return {Parse.Promise} A promise that will be resolved with the result
  * of the function.
  */
export function run(
  name: string,
  data: mixed,
  options: { [key: string]: mixed }
): ParsePromise {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud function name must be a string.');
  }

  var requestOptions = {};
  if (options.useMasterKey) {
    requestOptions.useMasterKey = options.useMasterKey;
  }
  if (options.sessionToken) {
    requestOptions.sessionToken = options.sessionToken;
  }

  return CoreManager.getCloudController().run(name, data, requestOptions)._thenRunCallbacks(options);
}

 /**
  * Gets data for the current set of cloud jobs.
  * @method getJobsData
  * @name Parse.Cloud.getJobsData
  * @param {Object} options A Backbone-style options object
  * options.success, if set, should be a function to handle a successful
  * call to a cloud function.  options.error should be a function that
  * handles an error running the cloud function.  Both functions are
  * optional.  Both functions take a single argument.
  * @return {Parse.Promise} A promise that will be resolved with the result
  * of the function.
  */
export function getJobsData(options: { [key: string]: mixed }): ParsePromise {
  options = options || {};
  const requestOptions = {
    useMasterKey: true
  };
  return CoreManager.getCloudController().getJobsData(requestOptions)._thenRunCallbacks(options);
}

 /**
  * Starts a given cloud job, which will process asynchronously.
  * @method startJob
  * @name Parse.Cloud.startJob
  * @param {String} name The function name.
  * @param {Object} data The parameters to send to the cloud function.
  * @param {Object} options A Backbone-style options object
  * options.success, if set, should be a function to handle a successful
  * call to a cloud function.  options.error should be a function that
  * handles an error running the cloud function.  Both functions are
  * optional.  Both functions take a single argument.
  * @return {Parse.Promise} A promise that will be resolved with the result
  * of the function.
  */
export function startJob(
  name: string,
  data: mixed,
  options: { [key: string]: mixed }
): ParsePromise {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud job name must be a string.');
  }
  const requestOptions = {
    useMasterKey: true
  };
  return CoreManager.getCloudController().startJob(name, data, requestOptions)._thenRunCallbacks(options);
}

 /**
  * Gets job status by Id
  * @method getJobStatus
  * @name Parse.Cloud.getJobStatus
  * @param {String} jobStatusId The Id of Job Status.
  * @return {Parse.Object} Status of Job.
  */
export function getJobStatus(jobStatusId: string): ParsePromise {
  var query = new ParseQuery('_JobStatus');
  return query.get(jobStatusId, { useMasterKey: true });
}

var DefaultController = {
  run(name, data, options) {
    var RESTController = CoreManager.getRESTController();

    var payload = encode(data, true);

    var request = RESTController.request(
      'POST',
      'functions/' + name,
      payload,
      options
    );

    return request.then(function(res) {
      var decoded = decode(res);
      if (decoded && decoded.hasOwnProperty('result')) {
        return ParsePromise.as(decoded.result);
      }
      return ParsePromise.error(
        new ParseError(
          ParseError.INVALID_JSON,
          'The server returned an invalid response.'
        )
      );
    });
  },

  getJobsData(options) {
    var RESTController = CoreManager.getRESTController();

    var request = RESTController.request(
      'GET',
      'cloud_code/jobs/data',
      null,
      options
    );

    return request;
  },

  startJob(name, data, options) {
    var RESTController = CoreManager.getRESTController();

    var payload = encode(data, true);

    var request = RESTController.request(
      'POST',
      'jobs/' + name,
      payload,
      options,
    );

    return request;
  }
};

CoreManager.setCloudController(DefaultController);
