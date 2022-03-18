jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ParseError');
jest.dontMock('../EventEmitter');
jest.dontMock('../Parse');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('crypto-js/aes');
jest.setMock('../EventuallyQueue', { poll: jest.fn() });

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
    const Parse = require('../Parse');
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
    const Parse = require('../Parse');
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    jest.spyOn(Parse, '_initialize').mockImplementationOnce(() => {});
    Parse.initialize('A', 'B');
    expect(console.log).toHaveBeenCalledTimes(0);
    expect(Parse._initialize).toHaveBeenCalledTimes(1);
  });

  it('should start eventually queue poll on initialize', () => {
    const Parse = require('../Parse');
    jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    jest.spyOn(EventuallyQueue, 'poll').mockImplementationOnce(() => {});
    Parse.initialize('A', 'B');
    expect(EventuallyQueue.poll).toHaveBeenCalledTimes(0);
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController.browser');
    jest.spyOn(StorageController, 'setItem');
    const storage = require('../Storage');
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
    console.log('hererer');
    const RESTController = require('../RESTController');
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
    const RESTController = require('../RESTController');
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
    const RESTController = require('../RESTController');
    try {
      await RESTController.ajax('POST', 'classes/TestObject');
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Unexpected end of JSON input');
    }
    expect(called).toBe(true);
  });
});
