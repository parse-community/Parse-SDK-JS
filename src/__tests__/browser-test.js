jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParseError');
jest.dontMock('../EventEmitter');
jest.dontMock('../Parse');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('../uuid');
jest.dontMock('crypto-js/aes');
jest.setMock('../EventuallyQueue', { poll: jest.fn() });

const CoreManager = require('../CoreManager').default;
const ParseError = require('../ParseError').default;
const EventuallyQueue = require('../EventuallyQueue');

class XMLHttpRequest {}
class XDomainRequest {
  open() {}
  send() {}
}
global.XMLHttpRequest = XMLHttpRequest;
global.XDomainRequest = XDomainRequest;

describe('Browser', () => {
  beforeEach(() => {
    process.env.PARSE_BUILD = 'browser';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('warning initializing parse/node in browser', () => {
    const Parse = require('../Parse').default;
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    jest.spyOn(Parse, '_initialize').mockImplementationOnce(() => {});
    Parse.initialize('A', 'B');
    expect(console.log).toHaveBeenCalledWith(
      "It looks like you're using the browser version of the SDK in a node.js environment. You should require('parse/node') instead."
    );
    expect(Parse._initialize).toHaveBeenCalledTimes(1);
  });

  it('initializing parse/node in browser with server rendering', () => {
    process.env.SERVER_RENDERING = true;
    const Parse = require('../Parse').default;
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    jest.spyOn(Parse, '_initialize').mockImplementationOnce(() => {});
    Parse.initialize('A', 'B');
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(Parse._initialize).toHaveBeenCalledTimes(1);
  });

  it('should start eventually queue poll on initialize', () => {
    const Parse = require('../Parse').default;
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    jest.spyOn(EventuallyQueue, 'poll').mockImplementationOnce(() => {});
    Parse.initialize('A', 'B');
    expect(EventuallyQueue.poll).toHaveBeenCalledTimes(0);
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController').default;
    CoreManager.setStorageController(StorageController);

    jest.spyOn(StorageController, 'setItem');
    const storage = require('../Storage').default;
    storage.setItem('key', 'value');
    expect(StorageController.setItem).toHaveBeenCalledTimes(1);
  });

  it('load RESTController with IE9', async () => {
    let called = false;
    class XDomainRequest {
      open() {
        called = true;
      }
      send() {
        this.responseText = JSON.stringify({ status: 200 });
        this.onprogress();
        this.onload();
      }
    }
    global.XDomainRequest = XDomainRequest;
    const RESTController = require('../RESTController').default;
    const options = {
      progress: () => {},
      requestTask: () => {},
    };
    const { response } = await RESTController.ajax(
      'POST',
      'classes/TestObject',
      null,
      null,
      options
    );
    expect(response.status).toBe(200);
    expect(called).toBe(true);
  });

  it('RESTController IE9 Ajax timeout error', async () => {
    let called = false;
    class XDomainRequest {
      open() {
        called = true;
      }
      send() {
        this.responseText = '';
        this.ontimeout();
      }
    }
    class XMLHttpRequest {}
    global.XDomainRequest = XDomainRequest;
    global.XMLHttpRequest = XMLHttpRequest;
    const RESTController = require('../RESTController').default;
    try {
      await RESTController.ajax('POST', 'classes/TestObject');
      expect(true).toBe(false);
    } catch (e) {
      const errorResponse = JSON.stringify({
        code: ParseError.X_DOMAIN_REQUEST,
        error: "IE's XDomainRequest does not supply error info.",
      });
      expect(e.responseText).toEqual(errorResponse);
    }
    expect(called).toBe(true);
  });

  it('RESTController IE9 Ajax response error', async () => {
    let called = false;
    class XDomainRequest {
      open() {
        called = true;
      }
      send() {
        this.responseText = '';
        this.onload();
      }
    }
    class XMLHttpRequest {}
    global.XDomainRequest = XDomainRequest;
    global.XMLHttpRequest = XMLHttpRequest;
    const RESTController = require('../RESTController').default;
    try {
      await RESTController.ajax('POST', 'classes/TestObject');
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Unexpected end of JSON input');
    }
    expect(called).toBe(true);
  });

  it('load uuid module', () => {
    const uuidv4 = require('../uuid').default;
    const uuid1 = uuidv4();
    const uuid2 = uuidv4();
    expect(uuid1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuid2).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(uuid1).not.toEqual(uuid2);
  });

  it('throw error if randomUUID is not available', () => {
    jest.resetModules();
    const tmp = global.crypto;
    delete global.crypto;
    const uuidv4 = require('../uuid').default;
    expect(() => uuidv4()).toThrow(
      'crypto.randomUUID is not available in this environment. Use a UUID polyfill or environment-specific implementation (for example, in React Native you can import "react-native-random-uuid").'
    );
    global.crypto = tmp;
  });
});
