/**
 * @flow
 */
import LiveQueryClient from './LiveQueryClient';
import CoreManager from './CoreManager';

function getLiveQueryClient(): Promise<LiveQueryClient> {
  return CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
}

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
class LiveQuery {
  constructor() {
    const EventEmitter = CoreManager.getEventEmitter();
    this.emitter = new EventEmitter();
    this.on = this.emitter.on;
    this.emit = this.emitter.emit;

    // adding listener so process does not crash
    // best practice is for developer to register their own listener
    this.on('error', () => {});
  }

  /**
   * After open is called, the LiveQuery will try to send a connect request
   * to the LiveQuery server.
   */
  async open(): void {
    const liveQueryClient = await getLiveQueryClient();
    liveQueryClient.open();
  }

  /**
   * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
   * This function will close the WebSocket connection to the LiveQuery server,
   * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
   * If you call query.subscribe() after this, we'll create a new WebSocket
   * connection to the LiveQuery server.
   */
  async close(): void {
    const liveQueryClient = await getLiveQueryClient();
    liveQueryClient.close();
  }
}

export default LiveQuery;

let defaultLiveQueryClient;

const DefaultLiveQueryController = {
  setDefaultLiveQueryClient(liveQueryClient: LiveQueryClient) {
    defaultLiveQueryClient = liveQueryClient;
  },

  async getDefaultLiveQueryClient(): Promise<LiveQueryClient> {
    if (defaultLiveQueryClient) {
      return defaultLiveQueryClient;
    }
    const [currentUser, installationId] = await Promise.all([
      CoreManager.getUserController().currentUserAsync(),
      CoreManager.getInstallationController().currentInstallationId(),
    ]);
    const sessionToken = currentUser ? currentUser.getSessionToken() : undefined;

    let liveQueryServerURL = CoreManager.get('LIVEQUERY_SERVER_URL');
    if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
      throw new Error(
        'You need to set a proper Parse LiveQuery server url before using LiveQueryClient'
      );
    }

    // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL
    if (!liveQueryServerURL) {
      const serverURL = CoreManager.get('SERVER_URL');
      const protocol = serverURL.indexOf('https') === 0 ? 'wss://' : 'ws://';
      const host = serverURL.replace(/^https?:\/\//, '');
      liveQueryServerURL = protocol + host;
      CoreManager.set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
    }

    const applicationId = CoreManager.get('APPLICATION_ID');
    const javascriptKey = CoreManager.get('JAVASCRIPT_KEY');
    const masterKey = CoreManager.get('MASTER_KEY');

    defaultLiveQueryClient = new LiveQueryClient({
      applicationId,
      serverURL: liveQueryServerURL,
      javascriptKey,
      masterKey,
      sessionToken,
      installationId,
    });
    const LiveQuery = CoreManager.getLiveQuery();

    defaultLiveQueryClient.on('error', error => {
      LiveQuery.emit('error', error);
    });
    defaultLiveQueryClient.on('open', () => {
      LiveQuery.emit('open');
    });
    defaultLiveQueryClient.on('close', () => {
      LiveQuery.emit('close');
    });
    return defaultLiveQueryClient;
  },
  _clearCachedDefaultClient() {
    defaultLiveQueryClient = null;
  },
};

CoreManager.setLiveQueryController(DefaultLiveQueryController);
