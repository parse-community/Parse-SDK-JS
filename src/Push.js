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
import ParseQuery from './ParseQuery';

import type { WhereClause } from './ParseQuery';
import type { FullOptions } from './RESTController';

export type PushData = {
  where?: WhereClause | ParseQuery,
  push_time?: Date | string,
  expiration_time?: Date | string,
  expiration_interval?: number,
};

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
 *     completes.
 */
export function send(data: PushData, options?: FullOptions = {}): Promise {
  if (data.where && data.where instanceof ParseQuery) {
    data.where = data.where.toJSON().where;
  }

  if (data.push_time && typeof data.push_time === 'object') {
    data.push_time = data.push_time.toJSON();
  }

  if (data.expiration_time && typeof data.expiration_time === 'object') {
    data.expiration_time = data.expiration_time.toJSON();
  }

  if (data.expiration_time && data.expiration_interval) {
    throw new Error('expiration_time and expiration_interval cannot both be set.');
  }

  const pushOptions = { useMasterKey: true };
  if (options.hasOwnProperty('useMasterKey')) {
    pushOptions.useMasterKey = options.useMasterKey;
  }

  return CoreManager.getPushController().send(data, pushOptions);
}

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
export function getPushStatus(pushStatusId: string, options?: FullOptions = {}): Promise<string> {
  const pushOptions = { useMasterKey: true };
  if (options.hasOwnProperty('useMasterKey')) {
    pushOptions.useMasterKey = options.useMasterKey;
  }
  const query = new ParseQuery('_PushStatus');
  return query.get(pushStatusId, pushOptions);
}

const DefaultController = {
  send(data: PushData, options?: FullOptions) {
    return CoreManager.getRESTController().request('POST', 'push', data, options);
  },
};

CoreManager.setPushController(DefaultController);
