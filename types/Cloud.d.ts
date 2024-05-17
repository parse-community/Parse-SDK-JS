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
export declare function run(name: string, data: any, options: RequestOptions): Promise<any>;
/**
 * Gets data for the current set of cloud jobs.
 *
 * @function getJobsData
 * @name Parse.Cloud.getJobsData
 * @returns {Promise} A promise that will be resolved with the result
 * of the function.
 */
export declare function getJobsData(): Promise<any>;
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
export declare function startJob(name: string, data: any): Promise<string>;
/**
 * Gets job status by Id
 *
 * @function getJobStatus
 * @name Parse.Cloud.getJobStatus
 * @param {string} jobStatusId The Id of Job Status.
 * @returns {Parse.Object} Status of Job.
 */
export declare function getJobStatus(jobStatusId: string): Promise<ParseObject>;
