import type { EventEmitter } from 'events';
/**
 * We expose three events to help you monitor the status of the WebSocket connection:
 *
 * <p>Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('open', () => {
 *
 * });</pre></p>
 *
 * <p>Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('close', () => {
 *
 * });</pre></p>
 *
 * <p>Error - When some network error or LiveQuery server error happens, you'll get this event.
 *
 * <pre>
 * Parse.LiveQuery.on('error', (error) => {
 *
 * });</pre></p>
 *
 * @class Parse.LiveQuery
 * @static
 */
declare class LiveQuery {
    emitter: EventEmitter;
    on: EventEmitter['on'];
    emit: EventEmitter['emit'];
    constructor();
    /**
     * After open is called, the LiveQuery will try to send a connect request
     * to the LiveQuery server.
     */
    open(): Promise<void>;
    /**
     * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
     * This function will close the WebSocket connection to the LiveQuery server,
     * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
     * If you call query.subscribe() after this, we'll create a new WebSocket
     * connection to the LiveQuery server.
     */
    close(): Promise<void>;
}
export default LiveQuery;
