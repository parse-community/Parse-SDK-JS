export default EventuallyQueue;
declare namespace EventuallyQueue {
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
    function save(object: ParseObject, serverOptions?: SaveOptions): Promise<any>;
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
    function destroy(object: ParseObject, serverOptions?: RequestOptions): Promise<any>;
    /**
     * Generate unique identifier to avoid duplicates and maintain previous state.
     *
     * @param {string} action save / destroy
     * @param {object} object Parse.Object to be queued
     * @returns {string}
     * @static
     * @ignore
     */
    function generateQueueId(action: string, object: ParseObject): string;
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
    function enqueue(action: string, object: ParseObject, serverOptions?: RequestOptions | SaveOptions): Promise<any>;
    function store(data: any): Promise<void>;
    function load(): Promise<string>;
    /**
     * Sets the in-memory queue from local storage and returns.
     *
     * @function getQueue
     * @name Parse.EventuallyQueue.getQueue
     * @returns {Promise<Array>}
     * @static
     */
    function getQueue(): Promise<any[]>;
    /**
     * Saves the queue to local storage
     *
     * @param {Queue} queue Queue containing Parse.Object data.
     * @returns {Promise} A promise that is fulfilled when queue is stored.
     * @static
     * @ignore
     */
    function setQueue(queue: Queue): Promise<void>;
    /**
     * Removes Parse.Object data from queue.
     *
     * @param {string} queueId Unique identifier for Parse.Object data.
     * @returns {Promise} A promise that is fulfilled when queue is stored.
     * @static
     * @ignore
     */
    function remove(queueId: string): Promise<void>;
    /**
     * Removes all objects from queue.
     *
     * @function clear
     * @name Parse.EventuallyQueue.clear
     * @returns {Promise} A promise that is fulfilled when queue is cleared.
     * @static
     */
    function clear(): Promise<any>;
    /**
     * Return the index of a queueId in the queue. Returns -1 if not found.
     *
     * @param {Queue} queue Queue containing Parse.Object data.
     * @param {string} queueId Unique identifier for Parse.Object data.
     * @returns {number}
     * @static
     * @ignore
     */
    function queueItemExists(queue: Queue, queueId: string): number;
    /**
     * Return the number of objects in the queue.
     *
     * @function length
     * @name Parse.EventuallyQueue.length
     * @returns {number}
     * @static
     */
    function length(): number;
    /**
     * Sends the queue to the server.
     *
     * @function sendQueue
     * @name Parse.EventuallyQueue.sendQueue
     * @returns {Promise<boolean>} Returns true if queue was sent successfully.
     * @static
     */
    function sendQueue(): Promise<boolean>;
    /**
     * Build queue object and add to queue.
     *
     * @param {ParseObject} object Parse.Object to be processed
     * @param {QueueObject} queueObject Parse.Object data from the queue
     * @returns {Promise} A promise that is fulfilled when operation is performed.
     * @static
     * @ignore
     */
    function sendQueueCallback(object: ParseObject, queueObject: QueueObject): Promise<void>;
    /**
     * Start polling server for network connection.
     * Will send queue if connection is established.
     *
     * @function poll
     * @name Parse.EventuallyQueue.poll
     * @param [ms] Milliseconds to ping the server. Default 2000ms
     * @static
     */
    function poll(ms?: number): void;
    /**
     * Turns off polling.
     *
     * @function stopPoll
     * @name Parse.EventuallyQueue.stopPoll
     * @static
     */
    function stopPoll(): void;
    /**
     * Return true if pinging the server.
     *
     * @function isPolling
     * @name Parse.EventuallyQueue.isPolling
     * @returns {boolean}
     * @static
     */
    function isPolling(): boolean;
    function _setPolling(flag: boolean): void;
    namespace process {
        function create(ObjectType: any, queueObject: any): Promise<void>;
        function byId(ObjectType: any, queueObject: any): Promise<void>;
        function byHash(ObjectType: any, queueObject: any): Promise<void>;
    }
}
import ParseObject from './ParseObject';
import { SaveOptions } from './ParseObject';
import { RequestOptions } from './RESTController';
type Queue = QueueObject[];
type QueueObject = {
    queueId: string;
    action: string;
    object: ParseObject;
    serverOptions: RequestOptions | SaveOptions;
    id: string;
    className: string;
    hash: string;
    createdAt: Date;
};
