import CoreManager from './CoreManager';
import decode from './decode';
import encode from './encode';
import ParseError from './ParseError';
import ParseQuery from './ParseQuery';
import ParseObject from './ParseObject';
import type { RequestOptions } from './RESTController';

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
 *
 * @function run
 * @name Parse.Cloud.run
 * @param {string} name The function name.
 * @param {object} data The parameters to send to the cloud function.
 * @param {object} options
 * @returns {Promise} A promise that will be resolved with the result
 * of the function.
 */
export function run(name: string, data: any, options: RequestOptions): Promise<any> {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud function name must be a string.');
  }

  const requestOptions: RequestOptions = {};
  if (options.hasOwnProperty('useMasterKey')) {
    requestOptions.useMasterKey = !!options.useMasterKey;
  }
  if (options.sessionToken) {
    requestOptions.sessionToken = options.sessionToken;
  }
  if (options.installationId) {
    requestOptions.installationId = options.installationId;
  }
  if (options.context && typeof options.context === 'object') {
    requestOptions.context = options.context;
  }

  return CoreManager.getCloudController().run(name, data, requestOptions);
}

/**
 * Gets data for the current set of cloud jobs.
 *
 * @function getJobsData
 * @name Parse.Cloud.getJobsData
 * @returns {Promise} A promise that will be resolved with the result
 * of the function.
 */
export function getJobsData(): Promise<any> {
  const requestOptions = {
    useMasterKey: true,
  };
  return CoreManager.getCloudController().getJobsData(requestOptions);
}

/**
 * Starts a given cloud job, which will process asynchronously.
 *
 * @function startJob
 * @name Parse.Cloud.startJob
 * @param {string} name The function name.
 * @param {object} data The parameters to send to the cloud function.
 * @returns {Promise} A promise that will be resolved with the jobStatusId
 * of the job.
 */
export function startJob(name: string, data: any): Promise<string> {
  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud job name must be a string.');
  }
  const requestOptions = {
    useMasterKey: true,
  };
  return CoreManager.getCloudController().startJob(name, data, requestOptions);
}

/**
 * Gets job status by Id
 *
 * @function getJobStatus
 * @name Parse.Cloud.getJobStatus
 * @param {string} jobStatusId The Id of Job Status.
 * @returns {Parse.Object} Status of Job.
 */
export function getJobStatus(jobStatusId: string): Promise<ParseObject> {
  const query = new ParseQuery('_JobStatus');
  return query.get(jobStatusId, { useMasterKey: true });
}

const DefaultController = {
  run(name: string, data: any, options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();

    const payload = encode(data, true);

    const request = RESTController.request('POST', 'functions/' + name, payload, options);

    return request.then(res => {
      if (typeof res === 'object' && Object.keys(res).length > 0 && !res.hasOwnProperty('result')) {
        throw new ParseError(ParseError.INVALID_JSON, 'The server returned an invalid response.');
      }
      const decoded = decode(res);
      if (decoded && decoded.hasOwnProperty('result')) {
        return Promise.resolve(decoded.result);
      }
      return Promise.resolve(undefined);
    });
  },

  getJobsData(options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();

    return RESTController.request('GET', 'cloud_code/jobs/data', null, options);
  },

  async startJob(name: string, data: any, options: RequestOptions) {
    const RESTController = CoreManager.getRESTController();

    const payload = encode(data, true);
    options.returnStatus = true;

    const response = await RESTController.request('POST', 'jobs/' + name, payload, options);
    return response._headers?.['X-Parse-Job-Status-Id'];
  },
};

CoreManager.setCloudController(DefaultController);
