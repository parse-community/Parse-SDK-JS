jest.dontMock('../CoreManager');
jest.dontMock('../CryptoController');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../EventEmitter');
jest.dontMock('../Parse');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('crypto-js/aes');

describe('WeChat', () => {
  beforeEach(() => {
    process.env.PARSE_BUILD = 'weapp';
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController.weapp');
    jest.spyOn(StorageController, 'setItem');
    const storage = require('../Storage');
    storage.setItem('key', 'value');
    expect(StorageController.setItem).toHaveBeenCalledTimes(1);
  });

  it('load RESTController', () => {
    const XHR = require('../Xhr.weapp');
    const RESTController = require('../RESTController');
    expect(RESTController._getXHR()).toEqual(XHR);
  });
});
