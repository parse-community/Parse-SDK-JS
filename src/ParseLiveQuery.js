import events from 'events';
import url from 'url';
import LiveQueryClient from './LiveQueryClient';
import CoreManager from './CoreManager';

function open() {
  var LiveQueryController = CoreManager.getLiveQueryController();
  LiveQueryController.open();
}

function close() {
  var LiveQueryController = CoreManager.getLiveQueryController();
  LiveQueryController.close();
}

/**
 *
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
 * 
 */
let LiveQuery = new events.EventEmitter();

/**
 * After open is called, the LiveQuery will try to send a connect request
 * to the LiveQuery server.
 * 
 * @method open
 */ 
LiveQuery.open = open;

/**
 * When you're done using LiveQuery, you can call Parse.LiveQuery.close().
 * This function will close the WebSocket connection to the LiveQuery server,
 * cancel the auto reconnect, and unsubscribe all subscriptions based on it.
 * If you call query.subscribe() after this, we'll create a new WebSocket
 * connection to the LiveQuery server.
 * 
 * @method close
 */

LiveQuery.close = close;
// Register a default onError callback to make sure we do not crash on error
LiveQuery.on('error', () => {
});

export default LiveQuery;

let getSessionToken = () => {
  let currentUser = CoreManager.getUserController().currentUser();
  let sessionToken;
  if (currentUser) {
    sessionToken = currentUser.getSessionToken();
  }
  return sessionToken;
};

let getLiveQueryClient = () => {
  return CoreManager.getLiveQueryController().getDefaultLiveQueryClient();
};

let defaultLiveQueryClient;
let DefaultLiveQueryController = {
  setDefaultLiveQueryClient(liveQueryClient: any) {
    defaultLiveQueryClient = liveQueryClient;
  },
  getDefaultLiveQueryClient(): any {
    if (defaultLiveQueryClient) {
      return defaultLiveQueryClient;
    }

    let liveQueryServerURL = CoreManager.get('LIVEQUERY_SERVER_URL');
    
    if (liveQueryServerURL && liveQueryServerURL.indexOf('ws') !== 0) {
      throw new Error('You need to set a proper Parse LiveQuery server url before using LiveQueryClient');
    }

    // If we can not find Parse.liveQueryServerURL, we try to extract it from Parse.serverURL
    if (!liveQueryServerURL) {
      let host = url.parse(CoreManager.get('SERVER_URL')).host;
      liveQueryServerURL = 'ws://' + host;
      CoreManager.set('LIVEQUERY_SERVER_URL', liveQueryServerURL);
    }

    let applicationId = CoreManager.get('APPLICATION_ID');
    let javascriptKey = CoreManager.get('JAVASCRIPT_KEY');
    let masterKey = CoreManager.get('MASTER_KEY');
    // Get currentUser sessionToken if possible
    defaultLiveQueryClient = new LiveQueryClient({
      applicationId,
      serverURL: liveQueryServerURL,
      javascriptKey,
      masterKey,
      sessionToken: getSessionToken(),
    });
    // Register a default onError callback to make sure we do not crash on error
    defaultLiveQueryClient.on('error', (error) => {
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
  open() {
    let liveQueryClient = getLiveQueryClient();
    liveQueryClient.open();
  },
  close() {
    let liveQueryClient = getLiveQueryClient();
    liveQueryClient.close();
  },
  subscribe(query: any): any {
    let liveQueryClient = getLiveQueryClient();
    if (liveQueryClient.shouldOpen()) {
      liveQueryClient.open();
    }
    return liveQueryClient.subscribe(query, getSessionToken());
  },
  unsubscribe(subscription: any) {
    let liveQueryClient = getLiveQueryClient();
    return liveQueryClient.unsubscribe(subscription);
  }
};

CoreManager.setLiveQueryController(DefaultLiveQueryController);
