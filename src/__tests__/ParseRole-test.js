/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../decode');
jest.dontMock('../ObjectState');
jest.dontMock('../ParseError');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseRole');

jest.dontMock('redux');
jest.dontMock('../ReduxActionCreators');
jest.dontMock('../ReduxStore');
jest.dontMock('../ReduxReducers');

var ParseACL = require('../ParseACL');
var ParseError = require('../ParseError');
var ParseObject = require('../ParseObject');
var ParseRole = require('../ParseRole');

describe('ParseRole', () => {
  it('can create Roles', () => {
    var role = new ParseRole();
    expect(role.getName()).toBe(undefined);
    expect(role.getACL()).toBe(null);

    var acl = new ParseACL({ aUserId: { read: true, write: true } });
    role = new ParseRole('admin', acl);
    expect(role.getName()).toBe('admin');
    expect(role.getACL()).toBe(acl);
  });

  it('can validate attributes', () => {
    var acl = new ParseACL({ aUserId: { read: true, write: true } });
    var role = new ParseRole('admin', acl);
    role.id = '101';
    expect(role.validate({
      name: 'author'
    })).toEqual(new ParseError(
      ParseError.OTHER_CAUSE,
      'A role\'s name can only be set before it has been saved.'
    ));

    role.id = undefined;
    expect(role.validate({
      name: 12
    })).toEqual(new ParseError(
      ParseError.OTHER_CAUSE,
      'A role\'s name must be a String.'
    ));

    expect(role.validate({
      name: '$$$'
    })).toEqual(new ParseError(
      ParseError.OTHER_CAUSE,
      'A role\'s name can be only contain alphanumeric characters, _, ' +
      '-, and spaces.'
    ));

    expect(role.validate({
      name: 'admin'
    })).toBe(false);
  });

  it('can be constructed from JSON', () => {
    var role = ParseObject.fromJSON({
      className: '_Role',
      objectId: '102',
      name: 'admin'
    });
    expect(role instanceof ParseObject).toBe(true);
    expect(role instanceof ParseRole).toBe(true);
    expect(role.getName()).toBe('admin');
  });
});
