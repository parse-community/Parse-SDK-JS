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
jest.dontMock('../ObjectStateMutations')
jest.dontMock('../parseDate');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseSession');
jest.dontMock('../RESTController');
jest.dontMock('../Storage');
jest.dontMock('../StorageController.default');
jest.dontMock('../TaskQueue');
jest.dontMock('../unique');
jest.dontMock('../UniqueInstanceStateController');

jest.dontMock('./test_helpers/mockXHR');

const mockUser = function(token) {
  this.token = token;
};
mockUser.prototype.getSessionToken = function() {
  return this.token;
};
mockUser.current = function() {
  return null;
};
jest.setMock('../ParseUser', mockUser);

const CoreManager = require('../CoreManager');
const ParseObject = require('../ParseObject').default;
const ParseSession = require('../ParseSession').default;

CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');

describe('ParseSession', () => {
  it('can be initialized', () => {
    let session = new ParseSession();
    session.set('someField', 'someValue');
    expect(session.get('someField')).toBe('someValue');

    session = new ParseSession({
      someField: 'someValue'
    });
    expect(session.get('someField')).toBe('someValue');
  });

  it('cannot write to readonly fields', () => {
    const session = new ParseSession();
    expect(session.set.bind(session, 'createdWith', 'facebook')).toThrow(
      'Cannot modify readonly attribute: createdWith'
    );
    expect(session.set.bind(session, 'expiresAt', new Date())).toThrow(
      'Cannot modify readonly attribute: expiresAt'
    );
    expect(session.set.bind(session, 'installationId', 'iid')).toThrow(
      'Cannot modify readonly attribute: installationId'
    );
    expect(session.set.bind(session, 'restricted', true)).toThrow(
      'Cannot modify readonly attribute: restricted'
    );
    expect(session.set.bind(session, 'sessionToken', 'st')).toThrow(
      'Cannot modify readonly attribute: sessionToken'
    );
    expect(session.set.bind(session, 'user', null)).toThrow(
      'Cannot modify readonly attribute: user'
    );
  });

  it('exposes the token through a getter', () => {
    const session = new ParseSession();
    session._finishFetch({
      id: 'session1',
      sessionToken: 'abc123'
    });
    expect(session.getSessionToken()).toBe('abc123');
  });

  it('checks the current user for a revocable token', () => {
    expect(ParseSession.isCurrentSessionRevocable()).toBe(false);
    mockUser.current = function() { return new mockUser('r:abc123'); };
    expect(ParseSession.isCurrentSessionRevocable()).toBe(true);
    mockUser.current = function() { return new mockUser('abc123'); };
    expect(ParseSession.isCurrentSessionRevocable()).toBe(false);
  });

  it('can fetch the full session for the current token', (done) => {
    CoreManager.setRESTController({
      request(method, path, body, options) {
        expect(method).toBe('GET');
        expect(path).toBe('sessions/me');
        expect(options).toEqual({
          sessionToken: 'abc123'
        });
        return Promise.resolve({
          objectId: 'session1',
          sessionToken: 'abc123'
        });
      },
      ajax() {}
    });

    mockUser.currentAsync = function() {
      return Promise.resolve(new mockUser('abc123'));
    };
    ParseSession.current().then((session) => {
      expect(session instanceof ParseSession).toBe(true);
      expect(session.id).toBe('session1');
      expect(session.getSessionToken()).toBe('abc123');
      done();
    });
  });

  it('can be cloned', () => {
    const s = ParseObject.fromJSON({
      className: '_Session',
      sessionToken: '123abc',
      foo: 12
    });

    const clone = s.clone();
    expect(clone.className).toBe('_Session');
    expect(clone.get('foo')).toBe(12);
    expect(clone.get('sessionToken')).toBe(undefined);
  });
});
