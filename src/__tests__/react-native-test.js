const events = require('events');

jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../EventEmitter');
jest.dontMock('../Storage');

jest.mock('../../../../react-native/Libraries/vendor/emitter/EventEmitter', () => {
  return {
    prototype: {
      addListener: new (require('events').EventEmitter)(),
    },
  };
}, { virtual: true });

const mockEmitter = require('../../../../react-native/Libraries/vendor/emitter/EventEmitter');

describe('React Native', () => {
  beforeEach(() => {
    process.env.PARSE_BUILD = 'react-native';
  });

  afterEach(() => {
    process.env.PARSE_BUILD = 'node';
  });

  it('load EventEmitter', () => {
    const eventEmitter = require('../EventEmitter');
    // console.log(eventEmitter);
  });

  it('load CryptoController', () => {
    const CryptoController = require('../CryptoController');
    // console.log(CryptoController);
  });

  it('load StorageController', () => {
    const StorageController = require('../StorageController.react-native');
    jest.spyOn(StorageController, 'setItemAsync');
    const storage = require('../Storage');
    storage.setItemAsync('key', 'value');
    expect(StorageController.setItemAsync).toHaveBeenCalledTimes(1);
  });
});
