/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseACL');

var mockRole = function(name) {
  this.name = name;
};
mockRole.prototype.getName = function() {
  return this.name;
}
jest.setMock('../ParseRole', mockRole);

var ParseACL = require('../ParseACL');
var ParseUser = require('../ParseUser');
var ParseRole = require('../ParseRole');

describe('ParseACL', () => {
  it('can be constructed with no arguments', () => {
    var a = new ParseACL();
    expect(a.permissionsById).toEqual({});
  });

  it('can be constructed with a ParseUser', () => {
    var u = new ParseUser();
    u.id = 'uid';
    var a = new ParseACL(u);
    expect(a.permissionsById).toEqual({ uid: { read: true, write: true } });
  });

  it('can be constructed with a map of user IDs', () => {
    var a = new ParseACL({ aUserId: { read: true, write: false } });
    expect(a.permissionsById).toEqual({
      aUserId: {
        read: true,
        write: false
      }
    });
  });

  it('throws when constructed with an invalid permissions map', () => {
    var err = function() {
      new ParseACL({ aUserId: { foo: true, bar: false } });
    };
    expect(err).toThrow(
      'Tried to create an ACL with an invalid permission type.'
    );
    err = function() {
      new ParseACL({ aUserId: { read: 12 } });
    };
    expect(err).toThrow(
      'Tried to create an ACL with an invalid permission value.'
    );
  });

  it('throws a helpful error when constructed with a function', () => {
    expect(function() {
      new ParseACL(function() { });
    }).toThrow('ParseACL constructed with a function. Did you forget ()?');
  });

  it('throws when setting an invalid user id', () => {
    var a = new ParseACL();
    expect(a.setReadAccess.bind(a, 12, true)).toThrow(
      'userId must be a string.'
    );
  });

  it('throws when setting an invalid access', () => {
    var a = new ParseACL();
    expect(a.setReadAccess.bind(a, 'aUserId', 12)).toThrow(
      'allowed must be either true or false.'
    );
  });

  it('throws when setting an invalid role', () => {
    var a = new ParseACL();
    expect(a.setRoleReadAccess.bind(a, 12, true)).toThrow(
      'role must be a ParseRole or a String'
    );

    expect(a.setRoleWriteAccess.bind(a, 12, true)).toThrow(
      'role must be a ParseRole or a String'
    );
  });

  it('can be rendered to JSON format', () => {
    var a = new ParseACL({ aUserId: { read: true, write: false } });
    expect(a.toJSON()).toEqual({
      aUserId: {
        read: true,
        write: false
      }
    });
  });

  it('can set read access for a user', () => {
    var a = new ParseACL();
    expect(a.permissionsById).toEqual({});

    // removing a permission that doesn't exist does nothing
    a.setReadAccess('aUserId', false);
    expect(a.permissionsById).toEqual({});

    a.setReadAccess('aUserId', true);
    expect(a.permissionsById).toEqual({
      aUserId: {
        read: true
      }
    });

    a.setReadAccess('aUserId', false);
    expect(a.permissionsById).toEqual({});
  });

  it('can get read access for a user', () => {
    var a = new ParseACL({
      aUserId: {
        read: true,
        write: false
      }
    });

    expect(a.getReadAccess('aUserId')).toBe(true);
  });

  it('can set write access for a user', () => {
    var a = new ParseACL();
    var u = new ParseUser();
    u.id = 'aUserId';

    expect(a.permissionsById).toEqual({});

    // removing a permission that doesn't exist does nothing
    a.setWriteAccess('aUserId', false);
    expect(a.permissionsById).toEqual({});

    a.setWriteAccess(u, false);
    expect(a.permissionsById).toEqual({});

    a.setWriteAccess('aUserId', true);
    expect(a.permissionsById).toEqual({
      aUserId: {
        write: true
      }
    });

    a.setWriteAccess('aUserId', false);
    expect(a.permissionsById).toEqual({});

    a.setWriteAccess(u, true);
    expect(a.permissionsById).toEqual({
      aUserId: {
        write: true
      }
    });

    a.setWriteAccess(u, false);
    expect(a.permissionsById).toEqual({});
  });

  it('can get write access for a user', () => {
    var a = new ParseACL({
      aUserId: {
        read: true,
        write: false
      }
    });

    var u = new ParseUser();
    u.id = 'aUserId';

    expect(a.getWriteAccess('aUserId')).toBe(false);
    expect(a.getWriteAccess(u)).toBe(false);
  });

  it('can set public read access', () => {
    var a = new ParseACL();
    expect(a.permissionsById).toEqual({});
    expect(a.getPublicReadAccess()).toBe(false);

    a.setPublicReadAccess(true);
    expect(a.permissionsById).toEqual({
      '*': {
        read: true
      }
    });
    expect(a.getPublicReadAccess()).toBe(true);

    a.setPublicReadAccess(false);
    expect(a.permissionsById).toEqual({});
  });

  it('can set public write access', () => {
    var a = new ParseACL();
    expect(a.permissionsById).toEqual({});
    expect(a.getPublicWriteAccess()).toBe(false);

    a.setPublicWriteAccess(true);
    expect(a.permissionsById).toEqual({
      '*': {
        write: true
      }
    });
    expect(a.getPublicWriteAccess()).toBe(true);

    a.setPublicWriteAccess(false);
    expect(a.permissionsById).toEqual({});
  });

  it('can get role read access', () => {
    var a = new ParseACL({
      'role:admin': {
        read: true,
        write: true
      }
    });

    expect(a.getRoleReadAccess('admin')).toBe(true);
    expect(a.getRoleReadAccess(new ParseRole('admin'))).toBe(true);
    expect(a.getReadAccess(new ParseRole('admin'))).toBe(true);
  });

  it('can get role write access', () => {
    var a = new ParseACL({
      'role:admin': {
        read: true,
        write: true
      }
    });

    expect(a.getRoleWriteAccess('admin')).toBe(true);
    expect(a.getRoleWriteAccess(new ParseRole('admin'))).toBe(true);
    expect(a.getWriteAccess(new ParseRole('admin'))).toBe(true);
  });

  it('throws when fetching an invalid role', () => {
    var a = new ParseACL();
    expect(a.getRoleReadAccess.bind(null, 5)).toThrow(
      'role must be a ParseRole or a String'
    );
    expect(a.getRoleWriteAccess.bind(null, 5)).toThrow(
      'role must be a ParseRole or a String'
    );
  });

  it('can set role read access', () => {
    var a = new ParseACL();

    expect(a.getRoleReadAccess('admin')).toBe(false);
    expect(a.getRoleReadAccess(new ParseRole('admin'))).toBe(false);

    a.setRoleReadAccess('admin', true);
    expect(a.getRoleReadAccess('admin')).toBe(true);
    expect(a.getRoleWriteAccess('admin')).toBe(false);

    a.setRoleReadAccess(new ParseRole('admin'), false);
    expect(a.getRoleReadAccess(new ParseRole('admin'))).toBe(false);

    a.setReadAccess(new ParseRole('admin'), true);
    expect(a.getReadAccess(new ParseRole('admin'))).toBe(true);
  });

  it('can set role write access', () => {
    var a = new ParseACL();

    expect(a.getRoleWriteAccess('admin')).toBe(false);
    expect(a.getRoleWriteAccess(new ParseRole('admin'))).toBe(false);

    a.setRoleWriteAccess('admin', true);
    expect(a.getRoleWriteAccess('admin')).toBe(true);
    expect(a.getRoleReadAccess('admin')).toBe(false);

    a.setRoleWriteAccess(new ParseRole('admin'), false);
    expect(a.getRoleWriteAccess(new ParseRole('admin'))).toBe(false);

    a.setWriteAccess(new ParseRole('admin'), true);
    expect(a.getWriteAccess(new ParseRole('admin'))).toBe(true);
  });

  it('can test equality against another ACL', () => {
    var a = new ParseACL();
    var b = new ParseACL();

    expect(a.equals(a)).toBe(true);

    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setPublicReadAccess(true);
    expect(a.equals(a)).toBe(true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    b.setPublicWriteAccess(true);
    expect(b.equals(b)).toBe(true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    a.setPublicWriteAccess(true);
    b.setPublicReadAccess(true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setPublicReadAccess(false);
    a.setPublicWriteAccess(false);
    b.setPublicReadAccess(false);
    b.setPublicWriteAccess(false);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
    expect(a.equals(new ParseACL())).toBe(true);

    a.setReadAccess('aUserId', true);
    b.setReadAccess('aUserId', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setWriteAccess('aUserId', true);
    b.setWriteAccess('aUserId', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setWriteAccess('anotherUserId', true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    b.setWriteAccess('anotherUserId', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setPublicReadAccess(true);
    a.setReadAccess('aUserId', true);
    b.setReadAccess('aUserId', true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
  });
});
