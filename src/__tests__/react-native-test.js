/* global WebSocket */
jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../EventEmitter');
jest.dontMock('../LiveQueryClient');
jest.dontMock('../LocalDatastore');
jest.dontMock('../ParseObject');
jest.dontMock('../Storage');
jest.dontMock('../LocalDatastoreController');
jest.dontMock('../WebSocketController');
jest.dontMock('crypto');
jest.mock(
  'react-native/Libraries/vendor/emitter/EventEmitter',
  () => {
    return {
      default: {
        prototype: {
          addListener: new (require('events').EventEmitter)(),
        },
      },
    };
  },
  { virtual: true }
);

const mockEmitter = require('react-native/Libraries/vendor/emitter/EventEmitter').default;
const CoreManager = require('../CoreManager').default;
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const crypto = require('crypto');
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
    getRandomValues: crypto.getRandomValues,
  },
});

describe('React Native', () => {
  beforeEach(() => {
    process.env.PARSE_BUILD = 'react-native';
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('load EventEmitter', () => {
    const EventEmitter = require('../EventEmitter').default;
    expect(EventEmitter).toEqual(mockEmitter);
  });

  it('load CryptoController', async () => {
    jest.spyOn(global.crypto.subtle, 'encrypt');
    const CryptoController = require('../CryptoController').default;
    await CryptoController.encrypt({}, 'salt');
    expect(global.crypto.subtle.encrypt).toHaveBeenCalled();
  });

  it('load LocalDatastoreController', () => {
    const LocalDatastoreController = require('../LocalDatastoreController').default;
    require('../LocalDatastore');
    const LDC = CoreManager.getLocalDatastoreController();
    expect(LocalDatastoreController).toEqual(LDC);
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController').default;
    CoreManager.setStorageController(StorageController);

    jest.spyOn(StorageController, 'setItemAsync');
    const storage = require('../Storage').default;
    storage.setItemAsync('key', 'value');
    expect(StorageController.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it('load WebSocketController', () => {
    const WebSocketController = require('../WebSocketController').default;
    CoreManager.setWebSocketController(WebSocketController);

    jest.mock('../EventEmitter', () => {
      return require('events').EventEmitter;
    });
    const socket = WebSocket;
    require('../LiveQueryClient');
    const websocket = CoreManager.getWebSocketController();
    expect(websocket).toEqual(socket);
  });
});
