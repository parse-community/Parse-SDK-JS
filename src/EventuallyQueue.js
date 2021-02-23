/**
 * https://github.com/francimedia/parse-js-local-storage
 *
 * @flow
 */

import CoreManager from './CoreManager';
import ParseObject from './ParseObject';
import ParseQuery from './ParseQuery';
import Storage from './Storage';

import type { SaveOptions } from './ParseObject';
import type { RequestOptions } from './RESTController';

type QueueObject = {
  queueId: string,
  action: string,
  object: ParseObject,
  serverOptions: SaveOptions | RequestOptions,
  id: string,
  className: string,
  hash: string,
  createdAt: Date,
};

type Queue = Array<QueueObject>;

const QUEUE_KEY = 'Parse/Eventually/Queue';
let queueCache = [];
let dirtyCache = true;
let polling = undefined;

/**
 * Provides utility functions to queue objects that will be
 * saved to the server at a later date.
 *
 * @class Parse.EventuallyQueue
 * @static
 */
const EventuallyQueue = {
  /**
   * Add object to queue with save operation.
   *
   * @function save
   * @name Parse.EventuallyQueue.save
   * @param {ParseObject} object Parse.Object to be saved eventually
   * @param {object} [serverOptions] See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html#save Parse.Object.save} options.
   * @returns {Promise} A promise that is fulfilled if object is added to queue.
   * @static
   * @see Parse.Object#saveEventually
   */
  save(object: ParseObject, serverOptions: SaveOptions = {}): Promise {
    return this.enqueue('save', object, serverOptions);
  },

  /**
   * Add object to queue with save operation.
   *
   * @function destroy
   * @name Parse.EventuallyQueue.destroy
   * @param {ParseObject} object Parse.Object to be destroyed eventually
   * @param {object} [serverOptions] See {@link https://parseplatform.org/Parse-SDK-JS/api/master/Parse.Object.html#destroy Parse.Object.destroy} options
   * @returns {Promise} A promise that is fulfilled if object is added to queue.
   * @static
   * @see Parse.Object#destroyEventually
   */
  destroy(object: ParseObject, serverOptions: RequestOptions = {}): Promise {
    return this.enqueue('destroy', object, serverOptions);
  },

  /**
   * Generate unique identifier to avoid duplicates and maintain previous state.
   *
   * @param {string} action save / destroy
   * @param {object} object Parse.Object to be queued
   * @returns {string}
   * @static
   * @ignore
   */
  generateQueueId(action: string, object: ParseObject): string {
    object._getId();
    const { className, id, _localId } = object;
    const uniqueId = object.get('hash') || _localId;
    return [action, className, id, uniqueId].join('_');
  },

  /**
   * Build queue object and add to queue.
   *
   * @param {string} action save / destroy
   * @param {object} object Parse.Object to be queued
   * @param {object} [serverOptions]
   * @returns {Promise} A promise that is fulfilled if object is added to queue.
   * @static
   * @ignore
   */
  async enqueue(
    action: string,
    object: ParseObject,
    serverOptions: SaveOptions | RequestOptions
  ): Promise {
    const queueData = await this.getQueue();
    const queueId = this.generateQueueId(action, object);

    let index = this.queueItemExists(queueData, queueId);
    if (index > -1) {
      // Add cached values to new object if they don't exist
      for (const prop in queueData[index].object) {
        if (typeof object.get(prop) === 'undefined') {
          object.set(prop, queueData[index].object[prop]);
        }
      }
    } else {
      index = queueData.length;
    }
    queueData[index] = {
      queueId,
      action,
      object: object.toJSON(),
      serverOptions,
      id: object.id,
      className: object.className,
      hash: object.get('hash'),
      createdAt: new Date(),
    };
    return this.setQueue(queueData);
  },

  store(data) {
    return Storage.setItemAsync(QUEUE_KEY, JSON.stringify(data));
  },

  load() {
    return Storage.getItemAsync(QUEUE_KEY);
  },

  /**
   * Sets the in-memory queue from local storage and returns.
   *
   * @function getQueue
   * @name Parse.EventuallyQueue.getQueue
   * @returns {Promise<Array>}
   * @static
   */
  async getQueue(): Promise<Array> {
    if (dirtyCache) {
      queueCache = JSON.parse((await this.load()) || '[]');
      dirtyCache = false;
    }
    return queueCache;
  },

  /**
   * Saves the queue to local storage
   *
   * @param {Queue} queue Queue containing Parse.Object data.
   * @returns {Promise} A promise that is fulfilled when queue is stored.
   * @static
   * @ignore
   */
  setQueue(queue: Queue): Promise<void> {
    queueCache = queue;
    return this.store(queueCache);
  },

  /**
   * Removes Parse.Object data from queue.
   *
   * @param {string} queueId Unique identifier for Parse.Object data.
   * @returns {Promise} A promise that is fulfilled when queue is stored.
   * @static
   * @ignore
   */
  async remove(queueId: string): Promise<void> {
    const queueData = await this.getQueue();
    const index = this.queueItemExists(queueData, queueId);
    if (index > -1) {
      queueData.splice(index, 1);
      await this.setQueue(queueData);
    }
  },

  /**
   * Removes all objects from queue.
   *
   * @function clear
   * @name Parse.EventuallyQueue.clear
   * @returns {Promise} A promise that is fulfilled when queue is cleared.
   * @static
   */
  clear(): Promise {
    queueCache = [];
    return this.store([]);
  },

  /**
   * Return the index of a queueId in the queue. Returns -1 if not found.
   *
   * @param {Queue} queue Queue containing Parse.Object data.
   * @param {string} queueId Unique identifier for Parse.Object data.
   * @returns {number}
   * @static
   * @ignore
   */
  queueItemExists(queue: Queue, queueId: string): number {
    return queue.findIndex(data => data.queueId === queueId);
  },

  /**
   * Return the number of objects in the queue.
   *
   * @function length
   * @name Parse.EventuallyQueue.length
   * @returns {number}
   * @static
   */
  async length(): number {
    const queueData = await this.getQueue();
    return queueData.length;
  },

  /**
   * Sends the queue to the server.
   *
   * @function sendQueue
   * @name Parse.EventuallyQueue.sendQueue
   * @returns {Promise<boolean>} Returns true if queue was sent successfully.
   * @static
   */
  async sendQueue(): Promise<boolean> {
    const queue = await this.getQueue();
    const queueData = [...queue];

    if (queueData.length === 0) {
      return false;
    }
    for (let i = 0; i < queueData.length; i += 1) {
      const queueObject = queueData[i];
      const { id, hash, className } = queueObject;
      const ObjectType = ParseObject.extend(className);
      if (id) {
        await this.process.byId(ObjectType, queueObject);
      } else if (hash) {
        await this.process.byHash(ObjectType, queueObject);
      } else {
        await this.process.create(ObjectType, queueObject);
      }
    }
    return true;
  },

  /**
   * Build queue object and add to queue.
   *
   * @param {ParseObject} object Parse.Object to be processed
   * @param {QueueObject} queueObject Parse.Object data from the queue
   * @returns {Promise} A promise that is fulfilled when operation is performed.
   * @static
   * @ignore
   */
  async sendQueueCallback(object: ParseObject, queueObject: QueueObject): Promise<void> {
    if (!object) {
      return this.remove(queueObject.queueId);
    }
    switch (queueObject.action) {
    case 'save':
      // Queued update was overwritten by other request. Do not save
      if (
        typeof object.updatedAt !== 'undefined' &&
          object.updatedAt > new Date(queueObject.object.createdAt)
      ) {
        return this.remove(queueObject.queueId);
      }
      try {
        await object.save(queueObject.object, queueObject.serverOptions);
        await this.remove(queueObject.queueId);
      } catch (e) {
        if (e.message !== 'XMLHttpRequest failed: "Unable to connect to the Parse API"') {
          await this.remove(queueObject.queueId);
        }
      }
      break;
    case 'destroy':
      try {
        await object.destroy(queueObject.serverOptions);
        await this.remove(queueObject.queueId);
      } catch (e) {
        if (e.message !== 'XMLHttpRequest failed: "Unable to connect to the Parse API"') {
          await this.remove(queueObject.queueId);
        }
      }
      break;
    }
  },

  /**
   * Start polling server for network connection.
   * Will send queue if connection is established.
   *
   * @function poll
   * @name Parse.EventuallyQueue.poll
   * @param [ms] Milliseconds to ping the server. Default 2000ms
   * @static
   */
  poll(ms: number = 2000) {
    if (polling) {
      return;
    }
    polling = setInterval(() => {
      const RESTController = CoreManager.getRESTController();
      RESTController.request('GET', 'health')
        .then(({ status }) => {
          if (status === 'ok') {
            this.stopPoll();
            return this.sendQueue();
          }
        })
        .catch(e => e);
    }, ms);
  },

  /**
   * Turns off polling.
   *
   * @function stopPoll
   * @name Parse.EventuallyQueue.stopPoll
   * @static
   */
  stopPoll() {
    clearInterval(polling);
    polling = undefined;
  },

  /**
   * Return true if pinging the server.
   *
   * @function isPolling
   * @name Parse.EventuallyQueue.isPolling
   * @returns {boolean}
   * @static
   */
  isPolling(): boolean {
    return !!polling;
  },

  _setPolling(flag: boolean) {
    polling = flag;
  },

  process: {
    create(ObjectType, queueObject) {
      const object = new ObjectType();
      return EventuallyQueue.sendQueueCallback(object, queueObject);
    },
    async byId(ObjectType, queueObject) {
      const { sessionToken } = queueObject.serverOptions;
      const query = new ParseQuery(ObjectType);
      query.equalTo('objectId', queueObject.id);
      const results = await query.find({ sessionToken });
      return EventuallyQueue.sendQueueCallback(results[0], queueObject);
    },
    async byHash(ObjectType, queueObject) {
      const { sessionToken } = queueObject.serverOptions;
      const query = new ParseQuery(ObjectType);
      query.equalTo('hash', queueObject.hash);
      const results = await query.find({ sessionToken });
      if (results.length > 0) {
        return EventuallyQueue.sendQueueCallback(results[0], queueObject);
      }
      return EventuallyQueue.process.create(ObjectType, queueObject);
    },
  },
};

module.exports = EventuallyQueue;
