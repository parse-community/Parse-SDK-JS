import ParseQuery from './ParseQuery';
import type ParseObject from './ParseObject';
import type { WhereClause } from './ParseQuery';
import type { FullOptions } from './RESTController';
export interface PushData {
    where?: WhereClause | ParseQuery;
    push_time?: Date | string;
    expiration_time?: Date | string;
    expiration_interval?: number;
    data?: any;
    channels?: string[];
}
/**
 * Contains functions to deal with Push in Parse.
 *
 * @class Parse.Push
 * @static
 * @hideconstructor
 */
/**
 * Sends a push notification.
 * **Available in Cloud Code only.**
 *
 * See {@link https://docs.parseplatform.org/js/guide/#push-notifications Push Notification Guide}
 *
 * @function send
 * @name Parse.Push.send
 * @param {object} data -  The data of the push notification. Valid fields
 * are:
 *   <ol>
 *     <li>channels - An Array of channels to push to.</li>
 *     <li>push_time - A Date object for when to send the push.</li>
 *     <li>expiration_time -  A Date object for when to expire
 *         the push.</li>
 *     <li>expiration_interval - The seconds from now to expire the push.</li>
 *     <li>where - A Parse.Query over Parse.Installation that is used to match
 *         a set of installations to push to.</li>
 *     <li>data - The data to send as part of the push.</li>
 *   <ol>
 * @param {object} options Valid options
 * are:<ul>
 *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
 *     be used for this request.
 * </ul>
 * @returns {Promise} A promise that is fulfilled when the push request
 *     completes and returns `pushStatusId`.
 */
export declare function send(data: PushData, options?: FullOptions): Promise<string>;
/**
 * Gets push status by Id
 *
 * @function getPushStatus
 * @name Parse.Push.getPushStatus
 * @param {string} pushStatusId The Id of Push Status.
 * @param {object} options Valid options
 * are:<ul>
 *   <li>useMasterKey: In Cloud Code and Node only, causes the Master Key to
 *     be used for this request.
 * </ul>
 * @returns {Parse.Object} Status of Push.
 */
export declare function getPushStatus(pushStatusId: string, options?: FullOptions): Promise<ParseObject>;
