/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../CoreManager');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../isRevocableSession');
jest.dontMock('../ObjectState')
jest.dontMock('../parseDate');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParsePromise');
jest.dontMock('../ParseUser');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');
jest.dontMock('../TaskQueue');
jest.dontMock('../unique');

jest.dontMock('./test_helpers/asyncHelper');
jest.dontMock('./test_helpers/mockXHR');

jest.dontMock('redux');
jest.dontMock('../ReduxActionCreators');
jest.dontMock('../ReduxStore');
jest.dontMock('../ReduxReducers');

var CoreManager = require('../CoreManager');
var ParseObject = require('../ParseObject');
var ParsePromise = require('../ParsePromise');
var ParseUser = require('../ParseUser');
var Storage = require('../Storage');
var ParseError = require('../ParseError');

var asyncHelper = require('./test_helpers/asyncHelper');

CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
ParseObject.enableSingleInstance();

describe('ParseUser', () => {
  it('can be constructed with initial attributes', () => {
    var u = new ParseUser();
    expect(u.isCurrent()).toBe(false);
    expect(u.className).toBe('_User');
    expect(u instanceof ParseObject).toBe(true);

    u = new ParseUser({
      username: 'andrew',
      password: 'secret'
    });
    expect(u.get('username')).toBe('andrew');
    expect(u.get('password')).toBe('secret');

    expect(function() {
      var u = new ParseUser({
        $$$: 'invalid'
      });
    }).toThrow('Can\'t create an invalid Parse User');
  });

  it('exposes certain attributes through special setters and getters', () => {
    var u = ParseObject.fromJSON({
      className: '_User',
      username: 'user12',
      email: 'user12@parse.com',
      sessionToken: '123abc'
    });
    expect(u instanceof ParseUser).toBe(true);
    expect(u.getUsername()).toBe('user12');
    expect(u.getEmail()).toBe('user12@parse.com');
    expect(u.getSessionToken()).toBe('123abc');

    var u2 = new ParseUser();
    u2.setUsername('bono');
    u2.setEmail('bono@u2.com');
    expect(u2.getUsername()).toBe('bono');
    expect(u2.getEmail()).toBe('bono@u2.com');
  });

  it('makes session tokens readonly', () => {
    var u = new ParseUser();
    expect(u.set.bind(u, 'sessionToken', 'token')).toThrow(
      'Cannot modify readonly attribute: sessionToken'
    );
  });

  it('does not allow current user actions on node servers', () => {
    expect(ParseUser.become.bind(null, 'token')).toThrow(
      'It is not memory-safe to become a user in a server environment'
    );
    expect(ParseUser.logOut).toThrow(
      'There is no current user user on a node.js server environment.'
    );
  });

  it('can sign up a new user', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('POST');
        expect(path).toBe('users');
        expect(body.username).toBe('username');
        expect(body.password).toBe('password');

        return ParsePromise.as({
          objectId: 'uid',
        }, 201);
      },
      ajax() {}
    });
    ParseUser.signUp(null, 'password').then(() => {
      // Should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error.message).toBe('Cannot sign up user with an empty name.');
    });
    ParseUser.signUp('username').then(() => {
      // Should not be reached
      expect(true).toBe(false);
    }, (error) => {
      expect(error.message).toBe('Cannot sign up user with an empty password.');
    });
    ParseUser.signUp('username', 'password').then((u) => {
      expect(u.id).toBe('uid');
      expect(u.get('username')).toBe('username');
      expect(u.get('password')).toBe(undefined);
      expect(u.isCurrent()).toBe(true);

      expect(ParseUser.current()).toBe(u);
      ParseUser._clearCache();
      var current = ParseUser.current();
      expect(current instanceof ParseUser).toBe(true);
      expect(current.id).toBe('uid');
      expect(current.getUsername()).toBe('username');
      expect(current.get('password')).toBe(undefined);
      done();
    });
  }));

  it('can log in as a user', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('GET');
        expect(path).toBe('login');
        expect(body.username).toBe('username');
        expect(body.password).toBe('password');

        return ParsePromise.as({
          objectId: 'uid2',
          username: 'username',
          sessionToken: '123abc'
        }, 200);
      },
      ajax() {}
    });
    ParseUser.logIn('username', 'password').then((u) => {
      expect(u.id).toBe('uid2');
      expect(u.getSessionToken()).toBe('123abc');
      expect(u.isCurrent()).toBe(true);
      expect(u.authenticated()).toBe(true);
      expect(ParseUser.current()).toBe(u);
      ParseUser._clearCache();
      var current = ParseUser.current();
      expect(current instanceof ParseUser).toBe(true);
      expect(current.id).toBe('uid2');
      expect(current.authenticated()).toBe(true);
      done();
    });
  }));

  it('preserves changes when logging in', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('GET');
        expect(path).toBe('login');
        expect(body.username).toBe('username');
        expect(body.password).toBe('password');

        return ParsePromise.as({
          objectId: 'uid3',
          username: 'username',
          sessionToken: '123abc'
        }, 200);
      },
      ajax() {}
    });
    var u = new ParseUser({
      username: 'username',
      password: 'password'
    });
    u.set('count', 5);
    u.logIn().then(() => {
      expect(u.id).toBe('uid3');
      expect(u.dirtyKeys()).toEqual(['count']);
      expect(u.get('count')).toBe(5);
      done();
    });
  }));

  it('can become a user with a session token', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('GET');
        expect(path).toBe('users/me');
        expect(options.sessionToken).toBe('123abc');

        return ParsePromise.as({
          objectId: 'uid3',
          username: 'username',
          sessionToken: '123abc'
        }, 200);
      },
      ajax() {}
    });

    ParseUser.become('123abc').then((u) => {
      expect(u.id).toBe('uid3');
      expect(u.isCurrent()).toBe(true);
      expect(u.existed()).toBe(true);
      done();
    });
  }));

  it('can send a password reset request', () => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('POST');
        expect(path).toBe('requestPasswordReset');
        expect(body).toEqual({ email: 'me@parse.com' });

        return ParsePromise.as({}, 200);
      },
      ajax() {}
    });

    ParseUser.requestPasswordReset('me@parse.com');
  });

  it('can log out a user', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.as({
          objectId: 'uid5',
          username: 'username',
          sessionToken: '123abc'
        }, 200);
      },
      ajax() {}
    });
    ParseUser.logIn('username', 'password').then((u) => {
      expect(ParseUser.current()).toBe(u);
      CoreManager.setRESTController({
        request(method, path, body, options) {
          // Shouldn't be called
          expect(true).toBe(false);
          return ParsePromise.as({}, 200);
        },
        ajax() {}
      });
      return ParseUser.logOut();
    }).then(() => {
      expect(ParseUser.current()).toBe(null);
      done();
    });
  }));

  it('can revoke a session on logout', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.as({
          objectId: 'uid6',
          username: 'username',
          sessionToken: 'r:123abc'
        }, 200);
      },
      ajax() {}
    });
    ParseUser.logIn('username', 'password').then((u) => {
      expect(ParseUser.current()).toBe(u);
      CoreManager.setRESTController({
        request(method, path, body, options) {
          expect(method).toBe('POST');
          expect(path).toBe('logout');
          expect(options).toEqual({
            sessionToken: 'r:123abc'
          });
          return ParsePromise.as({}, 200);
        },
        ajax() {}
      });
      return ParseUser.logOut();
    }).then(() => {
      expect(ParseUser.current()).toBe(null);
      done();
    });
  }));

  it('can get the current user asynchronously', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    Storage._clear();
    CoreManager.setRESTController({
      request(method, path, body, options) {
        return ParsePromise.as({
          objectId: 'uid6',
          username: 'username',
          sessionToken: 'r:123abc'
        }, 200);
      },
      ajax() {}
    });

    ParseUser.currentAsync().then((u) => {
      expect(u).toBe(null);
      return ParseUser.logIn('username', 'password');
    }).then((u) => {
      expect(u instanceof ParseUser).toBe(true);
      return ParseUser.currentAsync();
    }).then((u) => {
      expect(u instanceof ParseUser).toBe(true);
      expect(u.getUsername()).toBe('username');
      expect(u.id).toBe('uid6');
      done();
    });
  }));

  it('can inflate users stored from previous SDK versions', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    Storage._clear();
    var path = Storage.generatePath('currentUser');
    Storage.setItem(path, JSON.stringify({
      _id: 'abc',
      _sessionToken: '12345',
      objectId: 'abc',
      username: 'bob',
      count: 12
    }));
    ParseUser.currentAsync().then((u) => {
      expect(u instanceof ParseUser).toBe(true);
      expect(u.getUsername()).toBe('bob');
      expect(u.id).toBe('abc');
      expect(u.getSessionToken()).toBe('12345');
      done();
    });
  }));

  it('updates the current user on disk when saved', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    Storage._clear();
    CoreManager.setRESTController({
      request() {
        return ParsePromise.as({
          objectId: 'uid5',
        }, 201);
      },
      ajax() {}
    });

    ParseUser.signUp('updater', 'password').then((u) => {
      expect(u.isCurrent()).toBe(true);
      ParseUser._clearCache();
      CoreManager.setRESTController({
        request() {
          return ParsePromise.as({}, 200);
        },
        ajax() {}
      });
      return u.save({ count: 12 });
    }).then((u) => {
      ParseUser._clearCache();
      ParseObject._clearAllState();
      expect(u.attributes).toEqual({});
      expect(u.get('count')).toBe(undefined);
      return ParseUser.currentAsync();
    }).then((current) => {
      expect(current.id).toBe('uid5');
      expect(current.get('count')).toBe(12);
      done();
    });
  }));

  it('updates the current user on disk when fetched', asyncHelper((done) => {
    ParseUser.enableUnsafeCurrentUser();
    ParseUser._clearCache();
    Storage._clear();
    CoreManager.setRESTController({
      request() {
        return ParsePromise.as({
          objectId: 'uid6'
        }, 200);
      },
      ajax() {}
    });

    ParseUser.signUp('spot', 'fetch').then((u) => {
      expect(u.isCurrent()).toBe(true);
      ParseUser._clearCache();
      CoreManager.setRESTController({
        request() {
          return ParsePromise.as({
            count: 15
          }, 200);
        },
        ajax() {}
      });
      return u.fetch();
    }).then((u) => {
      ParseUser._clearCache();
      ParseObject._clearAllState();
      expect(u.attributes).toEqual({});
      expect(u.get('count')).toBe(undefined);
      return ParseUser.currentAsync();
    }).then((current) => {
      expect(current.id).toBe('uid6');
      expect(current.get('count')).toBe(15);
      done();
    });
  }));

  it('can get error when recursive _linkWith call fails', asyncHelper((done) => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('POST');
        expect(path).toBe('users');
        expect(body.authData.test).toEqual({
          id : 'id',
          access_token : 'access_token'
        });
        var error = new ParseError(
          ParseError.ACCOUNT_ALREADY_LINKED,
          'Another user is already linked to this facebook id.'
        );
        return ParsePromise.error(error);
      },
      ajax() {}
    });
    var provider = {
      authenticate(options) {
        if (options.success) {
          options.success(this, {
            id: 'id',
            access_token: 'access_token'
          });
        }
      },

      restoreAuthentication(authData) {},

      getAuthType() {
        return 'test';
      },

      deauthenticate() {}
    };

    ParseUser.logInWith(provider, {}).then(null, (error) => {
      expect(error.code).toBe(ParseError.ACCOUNT_ALREADY_LINKED);
      expect(error.message).toBe('Another user is already linked to this facebook id.');
      done();
    });
  }));

  it('strip anonymity when we set username', () => {
    var user = new ParseUser();
    var authData = {
      anonymous : {
        id : 'anonymousId'
      }
    }
    user.set('authData', authData);
    expect(user.get('authData').anonymous.id).toBe('anonymousId');

    // Set username should strip anonymous authData
    user.setUsername('test');
    expect(user.getUsername()).toBe('test');
    expect(user.get('authData').anonymous).toBe(null);
  });
});
