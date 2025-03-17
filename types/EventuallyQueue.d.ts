import ParseObject from './ParseObject';
import type { Queue, QueueObject } from './CoreManager';
import type { SaveOptions } from './ParseObject';
import type { RequestOptions } from './RESTController';
/**
 * Provides utility functions to queue objects that will be
 * saved to the server at a later date.
 *
 * @class Parse.EventuallyQueue
 * @static
 */
declare const EventuallyQueue: {
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
    save(object: ParseObject, serverOptions?: SaveOptions): Promise<void>;
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
    destroy(object: ParseObject, serverOptions?: RequestOptions): Promise<void>;
    /**
     * Generate unique identifier to avoid duplicates and maintain previous state.
     *
     * @param {string} action save / destroy
     * @param {object} object Parse.Object to be queued
     * @returns {string}
     * @static
     * @ignore
     */
    generateQueueId(action: string, object: ParseObject): string;
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
    enqueue(action: string, object: ParseObject, serverOptions?: SaveOptions | RequestOptions): Promise<void>;
    store(data: Queue): Promise<void>;
    load(): Promise<string | null>;
    /**
     * Sets the in-memory queue from local storage and returns.
     *
     * @function getQueue
     * @name Parse.EventuallyQueue.getQueue
     * @returns {Promise<Queue>}
     * @static
     */
    getQueue(): Promise<Queue>;
    /**
     * Saves the queue to local storage
     *
     * @param {Queue} queue Queue containing Parse.Object data.
     * @returns {Promise} A promise that is fulfilled when queue is stored.
     * @static
     * @ignore
     */
    setQueue(queue: Queue): Promise<void>;
    /**
     * Removes Parse.Object data from queue.
     *
     * @param {string} queueId Unique identifier for Parse.Object data.
     * @returns {Promise} A promise that is fulfilled when queue is stored.
     * @static
     * @ignore
     */
    remove(queueId: string): Promise<void>;
    /**
     * Removes all objects from queue.
     *
     * @function clear
     * @name Parse.EventuallyQueue.clear
     * @returns {Promise} A promise that is fulfilled when queue is cleared.
     * @static
     */
    clear(): Promise<void>;
    /**
     * Return the index of a queueId in the queue. Returns -1 if not found.
     *
     * @param {Queue} queue Queue containing Parse.Object data.
     * @param {string} queueId Unique identifier for Parse.Object data.
     * @returns {number}
     * @static
     * @ignore
     */
    queueItemExists(queue: Queue, queueId: string): number;
    /**
     * Return the number of objects in the queue.
     *
     * @function length
     * @name Parse.EventuallyQueue.length
     * @returns {Promise<number>}
     * @static
     */
    length(): Promise<number>;
    /**
     * Sends the queue to the server.
     *
     * @function sendQueue
     * @name Parse.EventuallyQueue.sendQueue
     * @returns {Promise<boolean>} Returns true if queue was sent successfully.
     * @static
     */
    sendQueue(): Promise<boolean>;
    /**
     * Build queue object and add to queue.
     *
     * @param {ParseObject} object Parse.Object to be processed
     * @param {QueueObject} queueObject Parse.Object data from the queue
     * @returns {Promise} A promise that is fulfilled when operation is performed.
     * @static
     * @ignore
     */
    sendQueueCallback(object: ParseObject, queueObject: QueueObject): Promise<void>;
    /**
     * Start polling server for network connection.
     * Will send queue if connection is established.
     *
     * @function poll
     * @name Parse.EventuallyQueue.poll
     * @param [ms] Milliseconds to ping the server. Default 2000ms
     * @static
     */
    poll(ms?: number): void;
    /**
     * Turns off polling.
     *
     * @function stopPoll
     * @name Parse.EventuallyQueue.stopPoll
     * @static
     */
    stopPoll(): void;
    /**
     * Return true if pinging the server.
     *
     * @function isPolling
     * @name Parse.EventuallyQueue.isPolling
     * @returns {boolean}
     * @static
     */
    isPolling(): boolean;
    _setPolling(flag: boolean): void;
    process: {
        create(ObjectType: any, queueObject: any): Promise<void>;
        byId(ObjectType: any, queueObject: any): Promise<void>;
        byHash(ObjectType: any, queueObject: any): Promise<void>;
    };
};
export default EventuallyQueue;
