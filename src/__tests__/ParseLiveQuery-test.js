/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseLiveQuery');
jest.dontMock('../CoreManager');
jest.dontMock('../InstallationController');
jest.dontMock('../LiveQueryClient');
jest.dontMock('../LiveQuerySubscription');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseQuery');
jest.dontMock('../EventEmitter');
jest.dontMock('../promiseUtils');

// Forces the loading
const LiveQuery = require('../ParseLiveQuery').default;
const CoreManager = require('../CoreManager');
const ParseQuery = require('../ParseQuery').default;
const LiveQuerySubscription = require('../LiveQuerySubscription').default;
const mockLiveQueryClient = {
  open: jest.fn(),
  close: jest.fn(),
};

describe('ParseLiveQuery', () => {
  beforeEach(() => {
    const controller = CoreManager.getLiveQueryController();
    controller._clearCachedDefaultClient();
    CoreManager.set('InstallationController', {
      currentInstallationId() {
        return Promise.resolve('1234');
      }
    });
  });

  it('fails with an invalid livequery server url', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve(undefined);
      }
    });
    CoreManager.set('LIVEQUERY_SERVER_URL', 'notaurl');
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().catch((err) => {
      expect(err.message).toBe(
        'You need to set a proper Parse LiveQuery server url before using LiveQueryClient'
      );
      done();
    });
  });

  it('initializes the client', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve(undefined);
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', 'wss://live.example.com/parse');
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://live.example.com/parse');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe(undefined);
      expect(client.installationId).toBe('1234');
      expect(client.additionalProperties).toBe(true);
      done();
    });
  });

  it('automatically generates a ws websocket url', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve(undefined);
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('SERVER_URL', 'http://api.parse.com/1');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('ws://api.parse.com/1');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe(undefined);
      done();
    });
  });

  it('automatically generates a wss websocket url', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve(undefined);
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('SERVER_URL', 'https://api.parse.com/1');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://api.parse.com/1');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe(undefined);
      done();
    });
  });

  it('populates the session token', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'token';
          }
        });
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().then((client) => {
      expect(client.serverURL).toBe('wss://api.parse.com/1');
      expect(client.applicationId).toBe('appid');
      expect(client.javascriptKey).toBe('jskey');
      expect(client.sessionToken).toBe('token');
      done();
    });
  });

  it('handle LiveQueryClient events', async () => {
    const spy = jest.spyOn(LiveQuery, 'emit');

    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'token';
          }
        });
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);
    const controller = CoreManager.getLiveQueryController();
    const client = await controller.getDefaultLiveQueryClient();
    client.emit('error', 'error thrown');
    client.emit('open');
    client.emit('close');
    expect(spy.mock.calls[0]).toEqual(['error', 'error thrown']);
    expect(spy.mock.calls[1]).toEqual(['open']);
    expect(spy.mock.calls[2]).toEqual(['close']);
    spy.mockRestore();
  });

  it('subscribes to all subscription events', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'token';
          }
        });
      }
    });
    CoreManager.set('APPLICATION_ID', 'appid');
    CoreManager.set('JAVASCRIPT_KEY', 'jskey');
    CoreManager.set('LIVEQUERY_SERVER_URL', null);

    const controller = CoreManager.getLiveQueryController();

    controller.getDefaultLiveQueryClient().then(async (client) => {

      const query = new ParseQuery("ObjectType");
      query.equalTo("test", "value");
      const ourSubscription = await client.subscribe(query, "close");

      const isCalled = {};
      ["open",
        "close",
        "error",
        "create",
        "update",
        "enter",
        "leave",
        "delete"].forEach((key) =>{
        ourSubscription.on(key, () => {
          isCalled[key] = true;
        });
      });

      // client.subscribe() completes asynchronously,
      // so we need to give it a chance to complete before finishing
      setTimeout(() => {
        try {
          client.socket = {
            send() {}
          }
          client.connectPromise.resolve();
          const actualSubscription = client.subscriptions.get(1);

          expect(actualSubscription).toBeDefined();

          actualSubscription.emit("open");
          expect(isCalled["open"]).toBe(true);

          actualSubscription.emit("close");
          expect(isCalled["close"]).toBe(true);

          actualSubscription.emit("error");
          expect(isCalled["error"]).toBe(true);

          actualSubscription.emit("create");
          expect(isCalled["create"]).toBe(true);

          actualSubscription.emit("update");
          expect(isCalled["update"]).toBe(true);

          actualSubscription.emit("enter");
          expect(isCalled["enter"]).toBe(true);

          actualSubscription.emit("leave");
          expect(isCalled["leave"]).toBe(true);

          actualSubscription.emit("delete");
          expect(isCalled["delete"]).toBe(true);

          done();
        } catch(e){
          done.fail(e);
        }
      }, 1);
    });
  });

  it('should not throw on usubscribe', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return Promise.resolve({
          getSessionToken() {
            return 'token';
          }
        });
      }
    });
    const query = new ParseQuery("ObjectType");
    query.equalTo("test", "value");
    const subscription = new LiveQuerySubscription('0', query, 'token');
    subscription.unsubscribe().then(done).catch(done.fail);
  });

  it('can handle LiveQuery open event', async () => {
    jest.spyOn(mockLiveQueryClient, 'open');
    const controller = CoreManager.getLiveQueryController();
    controller.setDefaultLiveQueryClient(mockLiveQueryClient);

    await LiveQuery.open();
    expect(mockLiveQueryClient.open).toHaveBeenCalled();
  });

  it('can handle LiveQuery close event', async () => {
    jest.spyOn(mockLiveQueryClient, 'close');
    const controller = CoreManager.getLiveQueryController();
    controller.setDefaultLiveQueryClient(mockLiveQueryClient);

    await LiveQuery.close();
    expect(mockLiveQueryClient.close).toHaveBeenCalled();
  });

  it('can handle LiveQuery error event', async () => {
    try {
      LiveQuery.emit('error');
      expect(true).toBe(true);
    } catch (error) {
      // Should not throw error
      expect(false).toBe(true);
    }
  });
});
