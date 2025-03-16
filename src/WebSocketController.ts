/* global WebSocket */
import ws from 'ws';
import SocketWeapp from './Socket.weapp';

let WebSocketController;

try {
  if (process.env.PARSE_BUILD === 'browser') {
    WebSocketController =
      typeof WebSocket === 'function' || typeof WebSocket === 'object' ? WebSocket : null;
  } else if (process.env.PARSE_BUILD === 'node') {
    WebSocketController = ws;
  } else if (process.env.PARSE_BUILD === 'weapp') {
    WebSocketController = SocketWeapp;
  } else if (process.env.PARSE_BUILD === 'react-native') {
    WebSocketController = WebSocket;
  }
} catch (_) {
  // WebSocket unavailable
}

export default WebSocketController;
