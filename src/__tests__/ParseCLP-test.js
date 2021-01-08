/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../ParseCLP');

const mockRole = function (name) {
  this.name = name;
};

mockRole.prototype.getName = function () {
  return this.name;
};

jest.setMock('../ParseRole', mockRole);

const ParseCLP = require('../ParseCLP').default;
const ParseUser = require('../ParseUser').default;
const ParseRole = require('../ParseRole');

function generateReadCLP(key) {
  return {
    get: { [key]: true },
    find: { [key]: true },
    count: { [key]: true },
    create: {},
    update: {},
    delete: {},
    addField: {},
    protectedFields: {},
  };
}

function generateWriteCLP(key) {
  return {
    get: {},
    find: {},
    count: {},
    create: { [key]: true },
    update: { [key]: true },
    delete: { [key]: true },
    addField: { [key]: true },
    protectedFields: {},
  };
}

const DEFAULT_CLP = {
  get: {},
  find: {},
  count: {},
  create: {},
  update: {},
  delete: {},
  addField: {},
  protectedFields: {},
};

const READ_CLP = generateReadCLP('uid');
const WRITE_CLP = generateWriteCLP('uid');
const PUBLIC_READ_CLP = generateReadCLP('*');
const PUBLIC_WRITE_CLP = generateWriteCLP('*');
const ROLE_READ_CLP = generateReadCLP('role:admin');
const ROLE_WRITE_CLP = generateWriteCLP('role:admin');

describe('ParseCLP', () => {
  it('can be constructed with no arguments', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
  });

  it('can be constructed with a ParseUser', () => {
    const u = new ParseUser();
    u.id = 'uid';
    const a = new ParseCLP(u);
    expect(a.permissionsMap).toEqual({
      get: { uid: true },
      find: { uid: true },
      count: { uid: true },
      create: { uid: true },
      update: { uid: true },
      delete: { uid: true },
      addField: { uid: true },
      protectedFields: {},
    });
  });

  it('can be constructed with a map of user IDs', () => {
    const userCLP = {
      get: { uid: true },
      find: { uid: true },
      count: { uid: true },
      create: { uid: true },
      update: { uid: true },
      delete: { uid: true },
      addField: { uid: true },
      protectedFields: {},
    };
    const a = new ParseCLP(userCLP);
    expect(a.permissionsMap).toEqual(userCLP);
  });

  it('throws when constructed with an invalid permissions map', () => {
    let err = function () {
      new ParseCLP({ foobar: { foo: true, bar: false } });
    };
    expect(err).toThrow('Tried to create an CLP with an invalid permission type.');
    err = function () {
      new ParseCLP({ get: { uid: 12 } });
    };
    expect(err).toThrow('Tried to create an CLP with an invalid permission value.');
  });

  it('throws a helpful error when constructed with a function', () => {
    expect(function () {
      new ParseCLP(function () {});
    }).toThrow('ParseCLP constructed with a function. Did you forget ()?');
  });

  it('throws when setting an invalid input', () => {
    const a = new ParseCLP();
    expect(a.setReadAccess.bind(a, 12, true)).toThrow('userId must be a string.');
  });

  it('throws when getting an invalid user id', () => {
    const u = new ParseUser();
    const a = new ParseCLP();
    expect(a.getReadAccess.bind(a, u)).toThrow('Cannot get access for a Parse.User without an id.');
  });

  it('throws when setting an invalid access', () => {
    const a = new ParseCLP();
    expect(a.setReadAccess.bind(a, 'uid', 12)).toThrow('allowed must be either true or false.');
  });

  it('throws when setting an invalid role', () => {
    const a = new ParseCLP();
    expect(a.setRoleReadAccess.bind(a, 12, true)).toThrow('role must be a Parse.Role or a String');
    expect(a.setRoleWriteAccess.bind(a, 12, true)).toThrow('role must be a Parse.Role or a String');
  });

  it('throws when setting an invalid protectedFields', () => {
    const a = new ParseCLP();
    const u = new ParseUser();
    const r = new ParseRole();
    expect(a.setProtectedFields.bind(a, 12)).toThrow('userId must be a string.');
    expect(a.setProtectedFields.bind(a, u)).toThrow(
      'Cannot get access for a Parse.User without an id.'
    );
    expect(a.setProtectedFields.bind(a, r)).toThrow('role must be a Parse.Role or a String');
    expect(a.setProtectedFields.bind(a, new ParseRole('admin'), 'not_field_array')).toThrow(
      'fields must be an array of strings or undefined.'
    );
  });

  it('throws when setting an invalid group pointer permissions', () => {
    const a = new ParseCLP();
    expect(a.setReadUserFields.bind(a, 12)).toThrow(
      'readUserFields.pointerFields must be an array of strings or undefined.'
    );
    expect(a.setWriteUserFields.bind(a, 12)).toThrow(
      'writeUserFields.pointerFields must be an array of strings or undefined.'
    );

    const clp = {
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: {},
      readUserFields: [1234],
      writeUserFields: ['owner'],
    };
    expect(function () {
      new ParseCLP(clp);
    }).toThrow('Tried to create an CLP with an invalid permission value.');
  });

  it('can be rendered to JSON format', () => {
    const permissionsMap = {
      get: { uid: true },
      find: { uid: true },
      count: { uid: true },
      create: { admin: true },
      update: { admin: true },
      delete: { admin: true },
      addField: { admin: true },
      protectedFields: { admin: ['objectId', 'field1'] },
    };
    const a = new ParseCLP(permissionsMap);
    expect(a.toJSON()).toEqual(permissionsMap);
  });

  it('can set protectedFields', () => {
    const a = new ParseCLP();
    const r = new ParseRole('admin');

    expect(a.permissionsMap).toEqual(DEFAULT_CLP);

    a.setProtectedFields('uid', ['admin']);
    a.setPublicProtectedFields(['foo']);
    a.setRoleProtectedFields(r, ['bar']);

    expect(a.toJSON()).toEqual({
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: {
        uid: ['admin'],
        '*': ['foo'],
        'role:admin': ['bar'],
      },
    });
    expect(a.getProtectedFields('uid')).toEqual(['admin']);
    expect(a.getPublicProtectedFields()).toEqual(['foo']);
    expect(a.getRoleProtectedFields(r)).toEqual(['bar']);

    a.setProtectedFields('uid', undefined);
    a.setPublicProtectedFields(undefined);
    a.setRoleProtectedFields(r, undefined);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
  });

  it('can get and set requiresAuthentication', () => {
    const a = new ParseCLP();
    a.setGetRequiresAuthentication(true);
    expect(a.toJSON()).toEqual({
      get: { requiresAuthentication: true },
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: {},
    });
    expect(a.getGetRequiresAuthentication()).toBe(true);
    a.setGetRequiresAuthentication(false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
  });

  it('can get and set pointerFields', () => {
    const testCLP = {
      get: { pointerFields: ['owner'] },
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: {},
    };
    const pointerCLP = new ParseCLP(testCLP);
    expect(pointerCLP.toJSON()).toEqual(testCLP);

    const a = new ParseCLP();
    a.setGetPointerFields(['owner']);
    expect(a.toJSON()).toEqual(testCLP);
    expect(a.getGetPointerFields()).toEqual(['owner']);

    a.setGetPointerFields(undefined);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
    expect(a.getGetPointerFields()).toEqual(undefined);
  });

  it('can get and set group pointer permissions', () => {
    const testCLP = {
      get: {},
      find: {},
      count: {},
      create: {},
      update: {},
      delete: {},
      addField: {},
      protectedFields: {},
      readUserFields: ['parent'],
      writeUserFields: ['owner'],
    };
    const groupCLP = new ParseCLP(testCLP);
    expect(groupCLP.toJSON()).toEqual(testCLP);

    const a = new ParseCLP();
    a.setWriteUserFields(['owner']);
    a.setReadUserFields(['parent']);
    expect(a.toJSON()).toEqual(testCLP);
    expect(a.getWriteUserFields()).toEqual(['owner']);
    expect(a.getReadUserFields()).toEqual(['parent']);

    a.setWriteUserFields(undefined);
    a.setReadUserFields(undefined);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
  });

  it('can set read access', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);

    a.setReadAccess('uid', false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getReadAccess('uid')).toBe(false);

    a.setReadAccess('uid', true);
    expect(a.permissionsMap).toEqual(READ_CLP);
    expect(a.getReadAccess('uid')).toBe(true);

    a.setReadAccess('uid', false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getReadAccess('uid')).toBe(false);

    const u = new ParseUser();
    u.id = 'uid';

    a.setReadAccess(u, false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getReadAccess(u)).toBe(false);

    a.setReadAccess(u, true);
    expect(a.permissionsMap).toEqual(READ_CLP);
    expect(a.getReadAccess(u)).toBe(true);

    a.setReadAccess(u, false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getReadAccess(u)).toBe(false);
  });

  it('can get read access', () => {
    const a = new ParseCLP();
    a.setGetAccess('uid', true);
    a.setFindAccess('uid', true);
    a.setCountAccess('uid', true);
    expect(a.toJSON()).toEqual(READ_CLP);
    expect(a.getReadAccess('uid')).toBe(true);
    expect(a.getGetAccess('uid')).toBe(true);
    expect(a.getFindAccess('uid')).toBe(true);
    expect(a.getCountAccess('uid')).toBe(true);
    a.setGetAccess('uid', false);
    a.setFindAccess('uid', false);
    a.setCountAccess('uid', false);
    expect(a.getReadAccess('uid')).toBe(false);
    expect(a.getGetAccess('uid')).toBe(false);
    expect(a.getFindAccess('uid')).toBe(false);
    expect(a.getCountAccess('uid')).toBe(false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
  });

  it('can set write access', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);

    a.setWriteAccess('uid', false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getWriteAccess('uid')).toBe(false);

    a.setWriteAccess('uid', true);
    expect(a.permissionsMap).toEqual(WRITE_CLP);
    expect(a.getWriteAccess('uid')).toBe(true);

    a.setWriteAccess('uid', false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getWriteAccess('uid')).toBe(false);

    const u = new ParseUser();
    u.id = 'uid';

    a.setWriteAccess(u, false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getWriteAccess(u)).toBe(false);

    a.setWriteAccess(u, true);
    expect(a.permissionsMap).toEqual(WRITE_CLP);
    expect(a.getWriteAccess(u)).toBe(true);

    a.setWriteAccess(u, false);
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getWriteAccess(u)).toBe(false);
  });

  it('can get write access', () => {
    const a = new ParseCLP();
    a.setCreateAccess('uid', true);
    a.setDeleteAccess('uid', true);
    a.setUpdateAccess('uid', true);
    a.setAddFieldAccess('uid', true);
    expect(a.toJSON()).toEqual(WRITE_CLP);
    expect(a.getWriteAccess('uid')).toBe(true);
    expect(a.getCreateAccess('uid')).toBe(true);
    expect(a.getDeleteAccess('uid')).toBe(true);
    expect(a.getUpdateAccess('uid')).toBe(true);
    expect(a.getAddFieldAccess('uid')).toBe(true);
    a.setCreateAccess('uid', false);
    a.setDeleteAccess('uid', false);
    a.setUpdateAccess('uid', false);
    a.setAddFieldAccess('uid', false);
    expect(a.getWriteAccess('uid')).toBe(false);
    expect(a.getCreateAccess('uid')).toBe(false);
    expect(a.getDeleteAccess('uid')).toBe(false);
    expect(a.getUpdateAccess('uid')).toBe(false);
    expect(a.getAddFieldAccess('uid')).toBe(false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
  });

  it('can handle public access', () => {
    const a = new ParseCLP();
    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getPublicReadAccess()).toBe(false);
    expect(a.getPublicWriteAccess()).toBe(false);

    a.setPublicGetAccess(true);
    a.setPublicFindAccess(true);
    a.setPublicCountAccess(true);
    expect(a.toJSON()).toEqual(PUBLIC_READ_CLP);
    expect(a.getPublicReadAccess()).toBe(true);
    expect(a.getPublicGetAccess()).toBe(true);
    expect(a.getPublicFindAccess()).toBe(true);
    expect(a.getPublicCountAccess()).toBe(true);

    a.setPublicReadAccess(false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
    expect(a.getPublicReadAccess()).toBe(false);
    expect(a.getPublicGetAccess()).toBe(false);
    expect(a.getPublicFindAccess()).toBe(false);
    expect(a.getPublicCountAccess()).toBe(false);

    a.setPublicCreateAccess(true);
    a.setPublicDeleteAccess(true);
    a.setPublicUpdateAccess(true);
    a.setPublicAddFieldAccess(true);
    expect(a.toJSON()).toEqual(PUBLIC_WRITE_CLP);
    expect(a.getPublicWriteAccess()).toBe(true);
    expect(a.getPublicCreateAccess()).toBe(true);
    expect(a.getPublicDeleteAccess()).toBe(true);
    expect(a.getPublicUpdateAccess()).toBe(true);
    expect(a.getPublicAddFieldAccess()).toBe(true);

    a.setPublicWriteAccess(false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
    expect(a.getPublicWriteAccess()).toBe(false);
    expect(a.getPublicCreateAccess()).toBe(false);
    expect(a.getPublicDeleteAccess()).toBe(false);
    expect(a.getPublicUpdateAccess()).toBe(false);
    expect(a.getPublicAddFieldAccess()).toBe(false);

    const w = new ParseCLP();
    w.setPublicWriteAccess(true);
    expect(w.toJSON()).toEqual(PUBLIC_WRITE_CLP);

    const r = new ParseCLP();
    r.setPublicReadAccess(true);
    expect(r.toJSON()).toEqual(PUBLIC_READ_CLP);
  });

  it('can get clp with role', () => {
    const role = new ParseRole('admin');
    const a = new ParseCLP(role);

    expect(a.toJSON()).toEqual({
      get: { 'role:admin': true },
      find: { 'role:admin': true },
      count: { 'role:admin': true },
      create: { 'role:admin': true },
      update: { 'role:admin': true },
      delete: { 'role:admin': true },
      addField: { 'role:admin': true },
      protectedFields: {},
    });
    expect(a.getRoleReadAccess('admin')).toBe(true);
    expect(a.getRoleReadAccess(role)).toBe(true);
    expect(a.getReadAccess(role)).toBe(true);
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
      protectedFields: { 'role:admin': [] },
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
      protectedFields: { 'role:admin': [] },
    });

    expect(a.getRoleWriteAccess('admin')).toBe(true);
    expect(a.getRoleWriteAccess(new ParseRole('admin'))).toBe(true);
    expect(a.getWriteAccess(new ParseRole('admin'))).toBe(true);
  });

  it('can set role read access', () => {
    const a = new ParseCLP();
    const adminRole = new ParseRole('admin');

    expect(a.getRoleReadAccess('admin')).toBe(false);
    expect(a.getRoleReadAccess(adminRole)).toBe(false);

    a.setRoleReadAccess('admin', true);
    expect(a.getRoleReadAccess('admin')).toBe(true);
    expect(a.getRoleWriteAccess('admin')).toBe(false);

    a.setRoleReadAccess(adminRole, false);
    expect(a.getRoleReadAccess(adminRole)).toBe(false);

    a.setReadAccess(adminRole, true);
    expect(a.getReadAccess(adminRole)).toBe(true);
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

  it('can handle role access', () => {
    const a = new ParseCLP();
    const r = new ParseRole('admin');

    expect(a.permissionsMap).toEqual(DEFAULT_CLP);
    expect(a.getRoleReadAccess(r)).toBe(false);
    expect(a.getRoleWriteAccess(r)).toBe(false);

    a.setRoleGetAccess(r, true);
    a.setRoleFindAccess(r, true);
    a.setRoleCountAccess(r, true);
    expect(a.toJSON()).toEqual(ROLE_READ_CLP);
    expect(a.getRoleReadAccess(r)).toBe(true);
    expect(a.getRoleGetAccess(r)).toBe(true);
    expect(a.getRoleFindAccess(r)).toBe(true);
    expect(a.getRoleCountAccess(r)).toBe(true);

    a.setRoleReadAccess(r, false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
    expect(a.getRoleReadAccess(r)).toBe(false);
    expect(a.getRoleGetAccess(r)).toBe(false);
    expect(a.getRoleFindAccess(r)).toBe(false);
    expect(a.getRoleCountAccess(r)).toBe(false);

    a.setRoleCreateAccess(r, true);
    a.setRoleDeleteAccess(r, true);
    a.setRoleUpdateAccess(r, true);
    a.setRoleAddFieldAccess(r, true);
    expect(a.toJSON()).toEqual(ROLE_WRITE_CLP);
    expect(a.getRoleWriteAccess(r)).toBe(true);
    expect(a.getRoleCreateAccess(r)).toBe(true);
    expect(a.getRoleDeleteAccess(r)).toBe(true);
    expect(a.getRoleUpdateAccess(r)).toBe(true);
    expect(a.getRoleAddFieldAccess(r)).toBe(true);

    a.setRoleWriteAccess(r, false);
    expect(a.toJSON()).toEqual(DEFAULT_CLP);
    expect(a.getRoleWriteAccess(r)).toBe(false);
    expect(a.getRoleCreateAccess(r)).toBe(false);
    expect(a.getRoleDeleteAccess(r)).toBe(false);
    expect(a.getRoleUpdateAccess(r)).toBe(false);
    expect(a.getRoleAddFieldAccess(r)).toBe(false);

    const b = new ParseCLP();
    b.setRoleWriteAccess(r, true);
    expect(b.toJSON()).toEqual(ROLE_WRITE_CLP);

    const c = new ParseCLP();
    c.setRoleReadAccess(r, true);
    expect(c.toJSON()).toEqual(ROLE_READ_CLP);
  });

  it('can test equality against another CLP', () => {
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

    b.setReadAccess('uid2', true);
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    b.setReadAccess('uid2', false);
    b.setPublicReadAccess(true);
    b.permissionsMap.get['*'] = 'HACKED';
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);

    const r = new ParseRole('admin');
    expect(a.equals(r)).toBe(false);

    const hacked = new ParseCLP();
    delete hacked.permissionsMap.get;
    expect(a.equals(hacked)).toBe(false);
    expect(hacked.equals(a)).toBe(false);

    hacked.permissionsMap.newPermission = {};
    expect(a.equals(hacked)).toBe(false);
    expect(hacked.equals(a)).toBe(false);
  });
});
