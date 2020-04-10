/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseCLP');

const mockRole = function(name) {
  this.name = name;
};

mockRole.prototype.getName = function() {
  return this.name;
};

jest.setMock('../ParseRole', mockRole);

const ParseCLP = require('../ParseCLP').default;
const ParseUser = require('../ParseUser').default;
const ParseRole = require('../ParseRole');

describe('ParseCLP', () => {
  it('can be constructed with no arguments', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual(
      {
        get: {},
        find: {},
        count: {},
        create: {},
        update: {},
        delete: {},
        addField: {},
        protectedFields: []
      });
  });

  it('can be constructed with a ParseUser', () => {
    const u = new ParseUser();
    u.id = 'uid';
    const a = new ParseCLP(u);
    expect(a.permissionsMap).toEqual(
      {
        get: { uid: true},
        find: { uid: true },
        count: { uid: true },
        create: { uid: true },
        update: { uid: true },
        delete: { uid: true },
        addField: { uid: true },
        protectedFields: []
      });
  });

  it('can be constructed with a map of user IDs', () => {
    const permissionsMap = {
      get: { uid: true},
      find: { uid: true },
      count: { uid: true, admin: true },
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    };
    const a = new ParseCLP(permissionsMap);
    expect(a.permissionsMap).toEqual(permissionsMap);
  });

  it('throws when constructed with an invalid permissions map', () => {
    let err = function() {
      new ParseCLP({ foobar: { foo: true, bar: false } });
    };
    expect(err).toThrow('Tried to create an CLP with an invalid permission type.');
    err = function() {
      new ParseCLP({ get: { uid: 12 } });
    };
    expect(err).toThrow('Tried to create an CLP with an invalid permission value.');
  });

  it('throws a helpful error when constructed with a function', () => {
    expect(function() {
      new ParseCLP(function() { });
    }).toThrow('ParseCLP constructed with a function. Did you forget ()?');
  });

  it('throws when setting an invalid user id', () => {
    const a = new ParseCLP();
    expect(a.setReadAccess.bind(a, 12, true)).toThrow('userId must be a string.');
  });

  it('throws when setting an invalid access', () => {
    const a = new ParseCLP();
    expect(a.setReadAccess.bind(a, 'uid', 12)).toThrow('allowed must be either true or false.');
  });

  it('throws when setting an invalid role', () => {
    const a = new ParseCLP();
    expect(a.setRoleReadAccess.bind(a, 12, true)).toThrow('role must be a ParseRole or a String');

    expect(a.setRoleWriteAccess.bind(a, 12, true)).toThrow('role must be a ParseRole or a String');
  });

  it('can be rendered to JSON format', () => {
    const permissionsMap = {
      get: { uid: true},
      find: { uid: true },
      count: { uid: true },
      create: { admin: true },
      update: { admin: true },
      delete: { admin: true },
      addField: { admin: true },
      protectedFields: [ { admin: [ "objectId", "field1" ] } ]
    };
    const a = new ParseCLP(permissionsMap);
    expect(a.toJSON()).toEqual(permissionsMap);
  });

  it('can set read access for a user', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    // removing a permission that doesn't exist does nothing
    a.setReadAccess('uid', false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    a.setReadAccess('uid', true);
    expect(a.permissionsMap).toEqual({
      get: { uid: true },
      find: { uid: true },
      count: { uid: true },
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    a.setReadAccess('uid', false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
  });

  it('can get read access for a user', () => {
    const a = new ParseCLP({
      get: { uid: true },
      find: { uid: true },
      count: { uid: true },
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    expect(a.getReadAccess('uid')).toBe(true);
  });

  it('can set write access for a user', () => {
    const a = new ParseCLP();
    const u = new ParseUser();
    u.id = 'uid';

    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    // removing a permission that doesn't exist does nothing
    a.setWriteAccess('uid', false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    a.setWriteAccess(u, false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    a.setWriteAccess('uid', true);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: { uid: true },
      update: { uid: true },
      delete: { uid: true },
      addField: { uid: true },
      protectedFields: []
    });

    a.setWriteAccess('uid', false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });

    a.setWriteAccess(u, true);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: { uid: true },
      update: { uid: true },
      delete: { uid: true },
      addField: { uid: true },
      protectedFields: []
    });

    a.setWriteAccess(u, false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
  });

  it('can get write access for a user', () => {
    const a = new ParseCLP({
      get: {},
      find: {},
      count: {},
      create: { uid: true },
      update: { uid: true },
      delete: { uid:true },
      addField: { uid: true },
      protectedFields: []
    });

    const u = new ParseUser();
    u.id = 'aUserId';

    expect(a.getWriteAccess('aUserId')).toBe(false);
    expect(a.getWriteAccess(u)).toBe(false);
  });

  it('can set public read access', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
    expect(a.getPublicReadAccess()).toBe(false);

    a.setPublicReadAccess(true);
    expect(a.permissionsMap).toEqual({
      get: { '*': true },
      find: { '*': true },
      count: { '*': true },
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
    expect(a.getPublicReadAccess()).toBe(true);

    a.setPublicReadAccess(false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
  });

  it('can set public write access', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
    expect(a.getPublicWriteAccess()).toBe(false);

    a.setPublicWriteAccess(true);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: { '*': true},
      update: { '*': true},
      delete: { '*': true},
      addField: { '*': true },
      protectedFields: []
    });
    expect(a.getPublicWriteAccess()).toBe(true);

    a.setPublicWriteAccess(false);
    expect(a.permissionsMap).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: []
    });
  });

  it('can get role read access', () => {
    const a = new ParseCLP({
      get: { 'role:admin': true },
      find: { 'role:admin': true },
      count: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true },
      addField: { 'role:admin': true },
      protectedFields: { 'role:admin': [] }
    });

    expect(a.getRoleReadAccess('admin')).toBe(true);
    expect(a.getRoleReadAccess(new ParseRole('admin'))).toBe(true);
    expect(a.getReadAccess(new ParseRole('admin'))).toBe(true);
  });

  it('can get role write access', () => {
    const a = new ParseCLP({
      get: { 'role:admin': true },
      find: { 'role:admin': true },
      count: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true },
      addField: { 'role:admin': true },
      protectedFields: { 'role:admin': [] }
    });

    expect(a.getRoleWriteAccess('admin')).toBe(true);
    expect(a.getRoleWriteAccess(new ParseRole('admin'))).toBe(true);
    expect(a.getWriteAccess(new ParseRole('admin'))).toBe(true);
  });

  it('throws when fetching an invalid role', () => {
    const a = new ParseCLP();
    expect(a.getRoleReadAccess.bind(null, 5)).toThrow('role must be a ParseRole or a String');
    expect(a.getRoleWriteAccess.bind(null, 5)).toThrow('role must be a ParseRole or a String');
  });

  it('can set role read access', () => {
    const a = new ParseCLP();

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
    const a = new ParseCLP();

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
    const a = new ParseCLP();
    const b = new ParseCLP();

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
    expect(a.equals(new ParseCLP())).toBe(true);

    a.setReadAccess('uid', true);
    b.setReadAccess('uid', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setWriteAccess('uid', true);
    b.setWriteAccess('uid', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setWriteAccess('uid2', true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    b.setWriteAccess('uid2', true);
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);

    a.setPublicReadAccess(true);
    a.setReadAccess('uid', true);
    b.setReadAccess('uid', true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
  });
});
