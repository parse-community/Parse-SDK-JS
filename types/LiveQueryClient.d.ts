import { WebSocketController } from './CoreManager';
import LiveQuerySubscription from './LiveQuerySubscription';
import type ParseQuery from './ParseQuery';
/**
 * Creates a new LiveQueryClient.
 * <a href="https://nodejs.org/api/events.html#events_class_eventemitter">cloud functions</a>.
 *
 * A wrapper of a standard WebSocket client. We add several useful methods to
 * help you connect/disconnect to LiveQueryServer, subscribe/unsubscribe a ParseQuery easily.
 *
 * javascriptKey and masterKey are used for verifying the LiveQueryClient when it tries
 * to connect to the LiveQuery server
 *
 * We expose three events to help you monitor the status of the LiveQueryClient.
 *
 * <pre>
 * const LiveQueryClient = Parse.LiveQueryClient;
 * const client = new LiveQueryClient({
 *   applicationId: '',
 *   serverURL: '',
 *   javascriptKey: '',
 *   masterKey: ''
 *  });
 * </pre>
 *
 * Open - When we establish the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('open', () => {
 *
 * });</pre>
 *
 * Close - When we lose the WebSocket connection to the LiveQuery server, you'll get this event.
 * <pre>
 * client.on('close', () => {
 *
 * });</pre>
 *
 * Error - When some network error or LiveQuery server error happens, you'll get this event.
 * <pre>
 * client.on('error', (error) => {
 *
 * });</pre>
 *
 * @alias Parse.LiveQueryClient
 */
declare class LiveQueryClient {
    attempts: number;
    id: number;
    requestId: number;
    applicationId: string;
    serverURL: string;
    javascriptKey?: string;
    masterKey?: string;
    sessionToken?: string;
    installationId?: string;
    additionalProperties: boolean;
    connectPromise: any;
    subscriptions: Map<number, LiveQuerySubscription>;
    socket: WebSocketController & {
        closingPromise?: any;
    };
    state: string;
    reconnectHandle: any;
    emitter: any;
    on: any;
    emit: any;
    /**
     * Creates a new LiveQueryClient instance.
     *
     * @param options - Configuration options for the LiveQuery client
     * @param options.applicationId - The applicationId of your Parse app
     * @param options.serverURL - The URL of your LiveQuery server (must start with 'ws' or 'wss')
     * @param options.javascriptKey - (Optional) The JavaScript key for your Parse app
     * @param options.masterKey - (Optional) Your Parse Master Key (Node.js only!)
     * @param options.sessionToken - (Optional) Session token for authenticated requests
     * @param options.installationId - (Optional) Installation ID for the client
     */
    constructor({ applicationId, serverURL, javascriptKey, masterKey, sessionToken, installationId, }: {
        applicationId: string;
        serverURL: string;
        javascriptKey?: string;
        masterKey?: string;
        sessionToken?: string;
        installationId?: string;
    });
    shouldOpen(): any;
    /**
     * Subscribes to a ParseQuery
     *
     * If you provide the sessionToken, when the LiveQuery server gets ParseObject's
     * updates from parse server, it'll try to check whether the sessionToken fulfills
     * the ParseObject's ACL. The LiveQuery server will only send updates to clients whose
     * sessionToken is fit for the ParseObject's ACL. You can check the LiveQuery protocol
     * <a href="https://github.com/parse-community/parse-server/wiki/Parse-LiveQuery-Protocol-Specification">here</a> for more details. The subscription you get is the same subscription you get
     * from our Standard API.
     *
     * @param {ParseQuery} query - the ParseQuery you want to subscribe to
     * @param {string} sessionToken (optional)
     * @returns {LiveQuerySubscription | undefined}
     */
    subscribe(query: ParseQuery, sessionToken?: string): LiveQuerySubscription | undefined;
    /**
     * After calling unsubscribe you'll stop receiving events from the subscription object.
     *
     * @param {object} subscription - subscription you would like to unsubscribe from.
     * @returns {Promise | undefined}
     */
    unsubscribe(subscription: LiveQuerySubscription): Promise<void>;
    /**
     * After open is called, the LiveQueryClient will try to send a connect request
     * to the LiveQuery server.
     *
     */
    open(): void;
    resubscribe(): void;
    /**
     * This method will close the WebSocket connection to this LiveQueryClient,
     * cancel the auto reconnect and unsubscribe all subscriptions based on it.
     *
     * @returns {Promise | undefined} CloseEvent {@link https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/close_event}
     */
    close(): Promise<void>;
    _handleReset(): void;
    _handleWebSocketOpen(): void;
    _handleWebSocketMessage(event: any): void;
    _handleWebSocketClose(): void;
    _handleWebSocketError(error: any): void;
    _handleReconnect(): void;
}
export default LiveQueryClient;
