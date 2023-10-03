jest.dontMock('../CoreManager');
jest.dontMock('../Push');
jest.dontMock('./test_helpers/asyncHelper');

const mockQuery = function () {
  this.where = {};
};
mockQuery.prototype = {
  toJSON() {
    return {
      where: this.where,
    };
  },
};
jest.setMock('../ParseQuery', mockQuery);

const CoreManager = require('../CoreManager');
const ParseQuery = require('../ParseQuery');
const Push = require('../Push');

const defaultController = CoreManager.getPushController();

describe('Push', () => {
  beforeEach(() => {
    CoreManager.setPushController({
      send(data) {
        // Pipe data through so we can test it
        return Promise.resolve(data);
      },
    });
  });

  it('can be sent with a where clause', done => {
    const q = new ParseQuery();
    q.where = {
      installationId: '123',
    };

    Push.send({
      where: q,
    }).then(data => {
      expect(data.where).toEqual({
        installationId: '123',
      });
      done();
    });
  });

  it('can specify a push time with a Date', done => {
    Push.send({
      push_time: new Date(Date.UTC(2015, 1, 1)),
    }).then(data => {
      expect(data.push_time).toBe('2015-02-01T00:00:00.000Z');
      done();
    });
  });

  it('can specify a push time with a string', done => {
    Push.send({
      // Local timezone push
      push_time: '2015-02-01T00:00:00.000',
    }).then(data => {
      expect(data.push_time).toBe('2015-02-01T00:00:00.000');
      done();
    });
  });

  it('can specify an expiration time', done => {
    Push.send({
      expiration_time: new Date(Date.UTC(2015, 1, 1)),
    }).then(data => {
      expect(data.expiration_time).toBe('2015-02-01T00:00:00.000Z');
      done();
    });
  });

  it('cannot specify both an expiration time and an expiration interval', () => {
    expect(
      Push.send.bind(null, {
        expiration_time: new Date(),
        expiration_interval: 518400,
      })
    ).toThrow('expiration_time and expiration_interval cannot both be set.');
  });
});

describe('PushController', () => {
  it('forwards data along', () => {
    CoreManager.setPushController(defaultController);
    const request = jest.fn().mockReturnValue({ _headers: {} });
    CoreManager.setRESTController({
      request: request,
      ajax: function () {},
    });

    Push.send(
      {
        push_time: new Date(Date.UTC(2015, 1, 1)),
      },
      {
        useMasterKey: true,
      }
    );
    expect(CoreManager.getRESTController().request.mock.calls[0]).toEqual([
      'POST',
      'push',
      { push_time: '2015-02-01T00:00:00.000Z' },
      { returnStatus: true, useMasterKey: true },
    ]);
  });
});
