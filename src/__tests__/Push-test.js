/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../ParsePromise');
jest.dontMock('../Push');
jest.dontMock('./test_helpers/asyncHelper');

var mockQuery = function() {
  this.where = {};
};
mockQuery.prototype = {
  toJSON() {
    return {
      where: this.where
    };
  }
};
jest.setMock('../ParseQuery', mockQuery);

var CoreManager = require('../CoreManager');
var ParsePromise = require('../ParsePromise');
var ParseQuery = require('../ParseQuery');
var Push = require('../Push');

var asyncHelper = require('./test_helpers/asyncHelper');

var defaultController = CoreManager.getPushController();

describe('Push', () => {
  beforeEach(() => {
    CoreManager.setPushController({
      send(data, options) {
        // Pipe data through so we can test it
        return ParsePromise.as(data);
      }
    });
  });

  it('can be sent with a where clause', asyncHelper((done) => {
    var q = new ParseQuery();
    q.where = {
      installationId: '123'
    };

    Push.send({
      where: q
    }).then((data) => {
      expect(data.where).toEqual({
        installationId: '123'
      });
      done();
    });
  }));

  it('can specify a push time with a Date', asyncHelper((done) => {
    Push.send({
      push_time: new Date(Date.UTC(2015, 1, 1))
    }).then((data) => {
      expect(data.push_time).toBe('2015-02-01T00:00:00.000Z');
      done();
    });
  }));

  it('can specify a push time with a string', asyncHelper((done) => {
    Push.send({
      // Local timezone push
      push_time: '2015-02-01T00:00:00.000'
    }).then((data) => {
      expect(data.push_time).toBe('2015-02-01T00:00:00.000');
      done();
    });
  }));

  it('can specify an expiration time', asyncHelper((done) => {
    Push.send({
      expiration_time: new Date(Date.UTC(2015, 1, 1))
    }).then((data) => {
      expect(data.expiration_time).toBe('2015-02-01T00:00:00.000Z');
      done();
    });
  }));

  it('cannot specify both an expiration time and an expiration interval', () => {
    expect(Push.send.bind(null, {
      expiration_time: new Date(),
      expiration_interval: 518400
    })).toThrow('expiration_time and expiration_interval cannot both be set.');
  });
});

describe('PushController', () => {
  it('forwards data along', () => {
    CoreManager.setPushController(defaultController);
    var request = jest.genMockFunction().mockReturnValue({
      _thenRunCallbacks() {
        return {
          _thenRunCallbacks() {}
        };
      }
    });
    CoreManager.setRESTController({
      request: request,
      ajax: function() {}
    });

    Push.send({
      push_time: new Date(Date.UTC(2015, 1, 1))
    }, {
      useMasterKey: true
    });
    expect(CoreManager.getRESTController().request.mock.calls[0]).toEqual([
      'POST',
      'push',
      { push_time: '2015-02-01T00:00:00.000Z' },
      { useMasterKey: true}
    ]);
  });
});
