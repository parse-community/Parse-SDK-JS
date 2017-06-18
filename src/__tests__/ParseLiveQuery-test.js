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
jest.dontMock('../ParsePromise');
jest.dontMock('../LiveQueryClient');
jest.dontMock('../LiveQuerySubscription');
jest.dontMock('../ParseObject');
jest.dontMock('../ParsePromise');
jest.dontMock('../ParseQuery');
jest.dontMock('../EventEmitter');

const ParseLiveQuery = require('../ParseLiveQuery');
const CoreManager = require('../CoreManager');
const ParsePromise = require('../ParsePromise').default;
const ParseQuery = require('../ParseQuery').default;

describe('ParseLiveQuery', () => {
  beforeEach(() => {
    const controller = CoreManager.getLiveQueryController();
    controller._clearCachedDefaultClient();
  });

  it('fails with an invalid livequery server url', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
      }
    });
    CoreManager.set('LIVEQUERY_SERVER_URL', 'notaurl');
    const controller = CoreManager.getLiveQueryController();
    controller.getDefaultLiveQueryClient().fail((err) => {
      expect(err.message).toBe(
        'You need to set a proper Parse LiveQuery server url before using LiveQueryClient'
      );
      done();
    });
  });

  it('initializes the client', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
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
      done();
    });
  });

  it('automatically generates a websocket url', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as(undefined);
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
      expect(client.sessionToken).toBe(undefined);
      done();
    });
  });

  it('populates the session token', (done) => {
    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as({
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

  it('subscribes to all subscription events', (done) => {

    CoreManager.set('UserController', {
      currentUserAsync() {
        return ParsePromise.as({
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

      const query = new ParseQuery("ObjectType");
      query.equalTo("test", "value");
      const ourSubscription = controller.subscribe(query, "close");

      var isCalled = {};
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
      
      // controller.subscribe() completes asynchronously, 
      // so we need to give it a chance to complete before finishing
      setTimeout(() => { 
        try {
          client.connectPromise.resolve();
          var actualSubscription = client.subscriptions.get(1);

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
});
