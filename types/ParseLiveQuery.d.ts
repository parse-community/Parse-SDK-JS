export default LiveQuery;
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
declare const LiveQuery: any;
