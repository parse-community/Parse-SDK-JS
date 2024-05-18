/* global WebSocket */

let WebSocketController;

try {
  if (process.env.PARSE_BUILD === 'browser') {
    WebSocketController =
      typeof WebSocket === 'function' || typeof WebSocket === 'object' ? WebSocket : null;
  } else if (process.env.PARSE_BUILD === 'node') {
    WebSocketController = require('ws');
  } else if (process.env.PARSE_BUILD === 'weapp') {
    WebSocketController = require('./Socket.weapp');
  } else if (process.env.PARSE_BUILD === 'react-native') {
    WebSocketController = WebSocket;
  }
} catch (_) {
  // WebSocket unavailable
}
module.exports = WebSocketController;
