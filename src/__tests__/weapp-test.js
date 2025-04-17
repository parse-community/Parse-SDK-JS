jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../EventEmitter');
jest.dontMock('../LiveQueryClient');
jest.dontMock('../Parse');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseObject');
jest.dontMock('../RESTController');
jest.dontMock('../Socket.weapp');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.weapp');
jest.dontMock('../uuid');
jest.dontMock('crypto-js/aes');
jest.dontMock('./test_helpers/mockWeChat');

const CoreManager = require('../CoreManager').default;
const mockWeChat = require('./test_helpers/mockWeChat');

global.wx = mockWeChat;

jest.mock('uuid', () => {
  return () => 0;
});

describe('WeChat', () => {
  beforeEach(() => {
    process.env.PARSE_BUILD = 'weapp';
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController').default;
    CoreManager.setStorageController(StorageController);
    jest.spyOn(StorageController, 'setItem');
    const storage = require('../Storage').default;
    storage.setItem('key', 'value');
    expect(StorageController.setItem).toHaveBeenCalledTimes(1);
  });

  it('load RESTController', () => {
    const XHR = require('../Xhr.weapp').default;
    const RESTController = require('../RESTController').default;
    expect(RESTController._getXHR()).toEqual(XHR);
  });

  it('load ParseFile', () => {
    const XHR = require('../Xhr.weapp').default;
    require('../ParseFile');
    const fileController = CoreManager.getFileController();
    expect(fileController._getXHR()).toEqual(XHR);
  });

  it('load WebSocketController', () => {
    const socket = require('../WebSocketController');
    CoreManager.setWebSocketController(socket);

    require('../LiveQueryClient');
    const websocket = CoreManager.getWebSocketController();
    expect(websocket).toEqual(socket);
  });

  it('load uuid module', () => {
    const uuidv4 = require('../uuid').default;
    expect(uuidv4()).not.toEqual(0);
    expect(uuidv4()).not.toEqual(uuidv4());
  });

  describe('Socket', () => {
    it('send', () => {
      const Websocket = require('../Socket.weapp').default;
      jest.spyOn(mockWeChat, 'connectSocket');
      const socket = new Websocket('wss://examples.com');
      socket.onopen();
      socket.onmessage();
      socket.onclose();
      socket.onerror();
      socket.onopen = jest.fn();
      socket.onmessage = jest.fn();
      socket.onclose = jest.fn();
      socket.onerror = jest.fn();

      expect(mockWeChat.connectSocket).toHaveBeenCalled();

      socket.send('{}');
      expect(socket.onopen).toHaveBeenCalled();
      expect(socket.onmessage).toHaveBeenCalled();

      socket.close();
      expect(socket.onclose).toHaveBeenCalled();
      expect(socket.onerror).toHaveBeenCalled();
    });
  });
});
