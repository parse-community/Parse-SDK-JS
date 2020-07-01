/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../arrayContainsObject');
jest.dontMock('../canBeSerialized');
jest.dontMock('../CoreManager');
jest.dontMock('../promiseUtils');
jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../equals');
jest.dontMock('../escape');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../parseDate');
jest.dontMock('../ParseError');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseObject');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseRelation');
jest.dontMock('../RESTController');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../TaskQueue');
jest.dontMock('../unique');
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../unsavedChildren');
jest.dontMock('../ParseACL');
jest.dontMock('../LocalDatastore');

jest.mock('uuid/v4', () => {
  let value = 0;
  return () => value++;
});
jest.dontMock('./test_helpers/mockXHR');

jest.useFakeTimers();

const mockRelation = function(parent, key) {
  // The parent and key fields will be populated by the parent
  if (parent) {
    this.parentClass = parent.className;
    this.parentId = parent.id;
  }
  this.key = key;
};
mockRelation.prototype.add = function(obj) {
  this.targetClassName = obj.className;
};
mockRelation.prototype.toJSON = function() {
  return {
    __type: 'Relation',
    className: this.targetClassName
  };
};
mockRelation.prototype._ensureParentAndKey = function(parent, key) {
  this.key = this.key || key;
  if (this.key !== key) {
    throw new Error(
      'Internal Error. Relation retrieved from two different keys.'
    );
  }
  if (this.parent) {
    if (this.parent.className !== parent.className) {
      throw new Error(
        'Internal Error. Relation retrieved from two different Objects.'
      );
    }
    if (this.parent.id) {
      if (this.parent.id !== parent.id) {
        throw new Error(
          'Internal Error. Relation retrieved from two different Objects.'
        );
      }
    } else if (parent.id) {
      this.parent = parent;
    }
  } else {
    this.parent = parent;
  }
};
jest.setMock('../ParseRelation', mockRelation);

const mockQuery = function(className) {
  this.className = className;
};
mockQuery.prototype.containedIn = function(field, ids) {
  this.results = [];
  ids.forEach((id) => {
    this.results.push(ParseObject.fromJSON({
      className: this.className,
      objectId: id
    }));
  });
};

mockQuery.prototype.include = function(keys) {
  this._include = keys;
};

mockQuery.prototype.find = function() {
  return Promise.resolve(this.results);
};
mockQuery.prototype.get = function(id) {
  const object = ParseObject.fromJSON({
    className: this.className,
    objectId: id
  });
  return Promise.resolve(object);
};
jest.setMock('../ParseQuery', mockQuery);

import { DEFAULT_PIN, PIN_PREFIX } from '../LocalDatastoreUtils';

const mockLocalDatastore = {
  isEnabled: false,
  fromPinWithName: jest.fn(),
  pinWithName: jest.fn(),
  unPinWithName: jest.fn(),
  _handlePinAllWithName: jest.fn(),
  _handleUnPinAllWithName: jest.fn(),
  _getAllContent: jest.fn(),
  _serializeObjectsFromPinName: jest.fn(),
  _serializeObject: jest.fn(),
  _transverseSerializeObject: jest.fn(),
  _updateObjectIfPinned: jest.fn(),
  _destroyObjectIfPinned: jest.fn(),
  _updateLocalIdForObject: jest.fn(),
  updateFromServer: jest.fn(),
  _clear: jest.fn(),
  getKeyForObject: jest.fn(),
  checkIfEnabled: jest.fn(() => {
    if (!mockLocalDatastore.isEnabled) {
      console.error('Parse.enableLocalDatastore() must be called first');
    }
    return mockLocalDatastore.isEnabled;
  }),
};
jest.setMock('../LocalDatastore', mockLocalDatastore);

const CoreManager = require('../CoreManager');
const ParseACL = require('../ParseACL').default;
const ParseError = require('../ParseError').default;
const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseObject = require('../ParseObject').default;
const ParseOp = require('../ParseOp');
const RESTController = require('../RESTController');
const SingleInstanceStateController = require('../SingleInstanceStateController');
const unsavedChildren = require('../unsavedChildren').default;

const mockXHR = require('./test_helpers/mockXHR');

CoreManager.setLocalDatastore(mockLocalDatastore);
CoreManager.setRESTController(RESTController);
CoreManager.setInstallationController({
  currentInstallationId() {
    return Promise.resolve('iid');
  }
});
CoreManager.set('APPLICATION_ID', 'A');
CoreManager.set('JAVASCRIPT_KEY', 'B');
CoreManager.set('MASTER_KEY', 'C');
CoreManager.set('VERSION', 'V');

const {
  SetOp,
  UnsetOp,
  IncrementOp
} = require('../ParseOp');

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

describe('ParseObject', () => {
  beforeEach(() => {
    ParseObject.enableSingleInstance();
  });

  it('is initially created with no Id', () => {
    const o = new ParseObject('Item');
    expect(o.id).toBe(undefined);
    expect(o._localId).toBe(undefined);
    expect(o.dirty()).toBe(true);
  });

  it('can be created with initial attributes', () => {
    const o = new ParseObject({
      className: 'Item',
      value: 12
    });
    expect(o.className).toBe('Item');
    expect(o.attributes).toEqual({ value: 12 });
  });

  it('can ignore validation if ignoreValidation option is provided', () => {
    class ValidatedObject extends ParseObject {
      validate(attrs) {
        if (attrs.hasOwnProperty('badAttr')) {
          return 'you have the bad attr';
        }
      }
    }

    const o = new ValidatedObject({
      className: 'Item',
      value: 12,
      badAttr: true
    }, { ignoreValidation: true });

    expect(o.attributes.value).toBe(12);
    expect(o.attributes.badAttr).toBe(true);
  });

  it('can be inflated from server JSON', () => {
    const json = {
      className: 'Item',
      createdAt: '2013-12-14T04:51:19Z',
      objectId: 'I1',
      size: 'medium'
    };
    const o = ParseObject.fromJSON(json);
    expect(o.className).toBe('Item');
    expect(o.id).toBe('I1');
    expect(o.attributes).toEqual({
      size: 'medium',
      createdAt: new Date(Date.UTC(2013, 11, 14, 4, 51, 19)),
      updatedAt: new Date(Date.UTC(2013, 11, 14, 4, 51, 19))
    });
    expect(o.dirty()).toBe(false);
  });

  it('can override old data when inflating from the server', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'I01',
      size: 'small'
    });
    expect(o.get('size')).toBe('small');
    const o2 = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'I01',
      disabled: true
    }, true);
    expect(o.get('disabled')).toBe(true);
    expect(o.get('size')).toBe(undefined);
    expect(o.has('size')).toBe(false);

    expect(o2.get('disabled')).toBe(true);
    expect(o2.get('size')).toBe(undefined);
    expect(o2.has('size')).toBe(false);
  });

  it('is given a local Id once dirtied', () => {
    const o = new ParseObject('Item');
    o.set('size', 'small');
    expect(o._localId).toBeTruthy();
  });

  it('has a read-only attributes property', () => {
    const o = new ParseObject('Item');
    o.set('size', 'small');
    expect(function() { o.attributes.size = 'large'; }).toThrow();
  });

  it('exposes read-only createdAt and updatedAt', () => {
    const o = new ParseObject('Item');
    expect(o.get('createdAt')).toBe(undefined);
    expect(o.get('updatedAt')).toBe(undefined);
    const created = new Date();
    const updated = new Date();
    o._finishFetch({
      objectId: 'O1',
      createdAt: { __type: 'Date', iso: created.toISOString() },
      updatedAt: { __type: 'Date', iso: updated.toISOString() }
    });
    expect(o.get('createdAt')).toEqual(created);
    expect(o.get('updatedAt')).toEqual(updated);
    expect(o.createdAt).toEqual(created);
    expect(o.updatedAt).toEqual(updated);
  });

  it('can be rendered to JSON', () => {
    let o = new ParseObject('Item');
    o.set({
      size: 'large',
      inStock: 18
    });
    expect(o.toJSON()).toEqual({
      size: 'large',
      inStock: 18
    });
    o = new ParseObject('Item');
    o._finishFetch({
      objectId: 'O2',
      size: 'medium',
      inStock: 12
    });
    expect(o.id).toBe('O2');
    expect(o.toJSON()).toEqual({
      objectId: 'O2',
      size: 'medium',
      inStock: 12
    });
  });

  it('encodes createdAt and updatedAt fields as strings', () => {
    const o = ParseObject.fromJSON({
      id: 'hasDates',
      className: 'Item',
      createdAt: { __type: 'Date', iso: new Date(Date.UTC(2015, 0, 1)).toJSON() },
      updatedAt: { __type: 'Date', iso: new Date(Date.UTC(2015, 0, 1)).toJSON() },
      foo: 'bar'
    });
    expect(o.toJSON()).toEqual({
      id: 'hasDates',
      createdAt: '2015-01-01T00:00:00.000Z',
      updatedAt: '2015-01-01T00:00:00.000Z',
      foo: 'bar'
    });
  });

  it('can convert to a pointer', () => {
    const o = new ParseObject('Item');
    expect(function() {o.toPointer();}).toThrow(
      'Cannot create a pointer to an unsaved ParseObject'
    );
    o.id = 'anObjectId';
    expect(o.toPointer()).toEqual({
      __type: 'Pointer',
      className: 'Item',
      objectId: 'anObjectId'
    });
  });

  it('can test equality against another ParseObject', () => {
    const a = new ParseObject('Item');
    expect(a.equals(a)).toBe(true);
    const b = new ParseObject('Item');
    expect(a.equals(b)).toBe(false);
    expect(b.equals(a)).toBe(false);
    a.id = 'anObjectId';
    b.id = 'anObjectId';
    expect(a.equals(b)).toBe(true);
    expect(b.equals(a)).toBe(true);
  });

  it('can set a field', () => {
    const o = new ParseObject('Person');
    expect(o.attributes).toEqual({});
    o.set('name', 'Will');
    expect(o.attributes).toEqual({ name: 'Will' });
    expect(o.op('name') instanceof SetOp).toBe(true);
    expect(o.dirtyKeys()).toEqual(['name']);
    expect(o.dirty()).toBe(true);
    expect(o.dirty('name')).toBe(true);
    expect(o._getSaveJSON()).toEqual({ name: 'Will' });

    // set multiple fields at once
    o.set({ name: 'William', behavior: 'formal' });
    expect(o.attributes).toEqual({ name: 'William', behavior: 'formal' });
  });

  it('can set id with the objectId attribute', () => {
    const o = new ParseObject('Person');
    expect(o.attributes).toEqual({});
    expect(o.id).toBe(undefined);
    o.set({ objectId: 'oid' });
    expect(o.attributes).toEqual({});
    expect(o.id).toBe('oid');
  });

  it('can get an escaped version of a field', () => {
    const o = new ParseObject('Person');
    o.set('age', 28);
    o.set('phoneProvider', 'AT&T');
    expect(o.escape('notSet')).toBe('');
    expect(o.escape('age')).toBe('28');
    expect(o.escape('phoneProvider')).toBe('AT&amp;T');
  });

  it('can tell if it has an attribute', () => {
    const o = new ParseObject('Person');
    o.set('age', 28);
    expect(o.has('name')).toBe(false);
    expect(o.has('age')).toBe(true);
  });

  it('can tell if a field is dirty', () => {
    const o = new ParseObject('Person');
    o._finishFetch({
      objectId: 'p99',
      age: 28,
      human: true
    });
    expect(o.dirty()).toBe(false);
    expect(o.dirty('age')).toBe(false);
    expect(o.dirty('human')).toBe(false);
    expect(o.dirty('unset')).toBe(false);
    o.set('human', false);
    expect(o.dirty()).toBe(true);
    expect(o.dirty('age')).toBe(false);
    expect(o.dirty('human')).toBe(true);
    expect(o.dirty('unset')).toBe(false);
  })

  it('can unset a field', () => {
    const o = new ParseObject('Person');
    o.id = 'anObjectId';
    o.set('name', 'Will');
    expect(o.attributes).toEqual({ name: 'Will' });
    o.unset('name');
    expect(o.attributes).toEqual({});
    // Even when you unset an unsaved set, it's still dirty
    expect(o.op('name') instanceof UnsetOp).toBe(true);
    expect(o.dirty()).toBe(true);
    expect(o.dirtyKeys()).toEqual(['name']);

    const o2 = new ParseObject('Person');
    o2._finishFetch({
      objectId: 'P1',
      name: 'Will'
    });
    expect(o2.attributes).toEqual({ name: 'Will' });
    o2.unset('name');
    expect(o2.attributes).toEqual({});
  });

  it('can clear all fields', () => {
    const o = new ParseObject('Person');
    o._finishFetch({
      objectId: 'P95',
      createdAt: { __type: 'Date', iso: new Date().toISOString() },
      updatedAt: { __type: 'Date', iso: new Date().toISOString() },
    });
    o.set({ a: 'a', b: 'b', c: 'c' });
    expect(o.dirty('a')).toBe(true);
    expect(o.dirty('b')).toBe(true);
    expect(o.dirty('c')).toBe(true);
    o.clear();
    expect(o.get('a')).toBe(undefined);
    expect(o.get('b')).toBe(undefined);
    expect(o.get('c')).toBe(undefined);
  });

  it('can increment a field', () => {
    const o = new ParseObject('Person');
    o.increment('age');
    expect(o.attributes).toEqual({ age: 1 });
    expect(o.op('age') instanceof IncrementOp).toBe(true);
    expect(o.dirtyKeys()).toEqual(['age']);
    expect(o._getSaveJSON()).toEqual({
      age: { __op: 'Increment', amount: 1 }
    });

    o.increment('age', 4);
    expect(o.attributes).toEqual({ age: 5 });
    expect(o._getSaveJSON()).toEqual({
      age: { __op: 'Increment', amount: 5 }
    });

    expect(o.increment.bind(o, 'age', 'four')).toThrow(
      'Cannot increment by a non-numeric amount.'
    );
    expect(o.increment.bind(o, 'age', null)).toThrow(
      'Cannot increment by a non-numeric amount.'
    );
    expect(o.increment.bind(o, 'age', { amount: 4 })).toThrow(
      'Cannot increment by a non-numeric amount.'
    );

    o.set('age', 30);
    o.increment('age');
    expect(o.attributes).toEqual({ age: 31 });
    expect(o._getSaveJSON()).toEqual({
      age: 31
    });

    const o2 = new ParseObject('Person');
    o2._finishFetch({
      objectId: 'P2',
      age: 40
    });
    expect(o2.attributes).toEqual({ age: 40 });
    o2.increment('age');
    expect(o2.attributes).toEqual({ age: 41 });
  });


  it('can decrement a field', () => {
    const o = new ParseObject('Person');
    o.decrement('age');
    expect(o.attributes).toEqual({ age: -1 });
    expect(o.op('age') instanceof IncrementOp).toBe(true);
    expect(o.dirtyKeys()).toEqual(['age']);
    expect(o._getSaveJSON()).toEqual({
      age: { __op: 'Increment', amount: -1 }
    });

    o.decrement('age', 4);
    expect(o.attributes).toEqual({ age: -5 });
    expect(o._getSaveJSON()).toEqual({
      age: { __op: 'Increment', amount: -5 }
    });

    expect(o.decrement.bind(o, 'age', 'four')).toThrow(
      'Cannot decrement by a non-numeric amount.'
    );
    expect(o.decrement.bind(o, 'age', null)).toThrow(
      'Cannot decrement by a non-numeric amount.'
    );
    expect(o.decrement.bind(o, 'age', { amount: 4 })).toThrow(
      'Cannot decrement by a non-numeric amount.'
    );

    o.set('age', 30);
    o.decrement('age');
    expect(o.attributes).toEqual({ age: 29 });
    expect(o._getSaveJSON()).toEqual({
      age: 29
    });

    const o2 = new ParseObject('Person');
    o2._finishFetch({
      objectId: 'ABC123',
      age: 40
    });
    expect(o2.attributes).toEqual({ age: 40 });
    o2.decrement('age');
    expect(o2.attributes).toEqual({ age: 39 });
  });

  it('can set nested field', () => {
    const o = new ParseObject('Person');
    o._finishFetch({
      objectId: 'setNested',
      objectField: {
        number: 5
      },
      otherField: {},
    });

    expect(o.attributes).toEqual({
      objectField: { number: 5 },
      otherField: {},
    });
    o.set('otherField', { hello: 'world' });
    o.set('objectField.number', 20);

    expect(o.attributes).toEqual({
      objectField: { number: 20 },
      otherField: { hello: 'world' },
    });
    expect(o.op('objectField.number') instanceof SetOp).toBe(true);
    expect(o.dirtyKeys()).toEqual(['otherField', 'objectField.number', 'objectField']);
    expect(o._getSaveJSON()).toEqual({
      'objectField.number': 20,
      otherField: { hello: 'world' },
    });
  });

  it('ignore set nested field on new object', () => {
    const o = new ParseObject('Person');
    o.set('objectField.number', 20);

    expect(o.attributes).toEqual({});
    expect(o.op('objectField.number') instanceof SetOp).toBe(false);
    expect(o.dirtyKeys()).toEqual([]);
    expect(o._getSaveJSON()).toEqual({});
  });

  it('can add elements to an array field', () => {
    const o = new ParseObject('Schedule');
    o.add('available', 'Monday');
    o.add('available', 'Wednesday');
    expect(o.get('available')).toEqual(['Monday', 'Wednesday']);

    o.set('colors', ['red', 'green']);
    o.add('colors', 'blue');
    expect(o.get('colors')).toEqual(['red', 'green', 'blue']);

    o._handleSaveResponse({
      objectId: 'S1',
      available: ['Monday', 'Wednesday'],
      colors: ['red', 'green', 'blue']
    });

    o.addUnique('available', 'Thursday');
    o.addUnique('available', 'Monday');
    expect(o.get('available')).toEqual(['Monday', 'Wednesday', 'Thursday']);
  });

  it('can add elements to an array field in batch mode', () => {
    const o = new ParseObject('Schedule');
    o.addAll('available', ['Monday', 'Wednesday']);
    expect(o.get('available')).toEqual(['Monday', 'Wednesday']);

    o.set('colors', ['red']);
    o.addAll('colors', ['green', 'blue']);
    expect(o.get('colors')).toEqual(['red', 'green', 'blue']);

    o._handleSaveResponse({
      objectId: 'S1',
      available: ['Monday', 'Wednesday'],
      colors: ['red', 'green', 'blue']
    });

    o.addAllUnique('available', ['Thursday', 'Monday']);
    expect(o.get('available').length).toEqual(3);
  });

  it('can remove elements from an array field', () => {
    const o = new ParseObject('Schedule');
    o.set('available', ['Monday', 'Tuesday']);
    o.remove('available', 'Tuesday');
    o.remove('available', 'Saturday');
    expect(o.get('available')).toEqual(['Monday']);

    o._handleSaveResponse({
      objectId: 'S2',
      available: ['Monday']
    });

    o.remove('available', 'Monday');
    o.remove('available', 'Tuesday');
    expect(o.get('available')).toEqual([]);
  });

  it('can remove elements from an array field in batch mode', () => {
    const o = new ParseObject('Schedule');
    o.set('available', ['Monday', 'Tuesday']);
    o.removeAll('available', ['Tuesday', 'Saturday']);
    expect(o.get('available')).toEqual(['Monday']);

    o._handleSaveResponse({
      objectId: 'S2',
      available: ['Monday']
    });

    o.removeAll('available', ['Monday', 'Tuesday']);
    expect(o.get('available')).toEqual([]);
  });

  it('can chain sets', () => {
    const o = new ParseObject('Person');
    o.set('developer', true).set('platform', 'web');
    expect(o.attributes).toEqual({
      developer: true,
      platform: 'web'
    });
  });

  it('can set and retrieve ACLs', () => {
    const acl = new ParseACL();
    const o = new ParseObject('Listing');
    o.setACL(acl);
    expect(o.get('ACL')).toBe(acl);
    expect(o.getACL()).toBe(acl);
  });

  it('can manipulate relations on fields', () => {
    const o = new ParseObject('Person');
    o.id = 'AA';
    o.set('age', 38);
    expect(o.relation.bind(o, 'age')).toThrow(
      'Called relation() on non-relation field age'
    );
    const rel = o.relation('friends');
    expect(rel.parentClass).toBe('Person');
    expect(rel.parentId).toBe('AA');
    expect(rel.key).toBe('friends');
    const friend = new ParseObject('Person');
    friend.id = 'BB';
    rel.add(friend);
    expect(rel.targetClassName).toBe('Person');
  });

  it('can be cloned with relation (#381)', () => {
    const relationJSON = {__type: 'Relation', className: 'Bar'};
    const o = ParseObject.fromJSON({
      objectId: '7777777777',
      className: 'Foo',
      aRelation: relationJSON,
    });
    const o2 = o.clone();
    expect(o2._getSaveJSON().aRelation).toEqual(relationJSON);
  });

  it('can detect dirty object children', () => {
    const o = new ParseObject('Person');
    o._finishFetch({
      objectId: 'dirtyObj',
      obj: { a: 12 },
      location: {
        __type: 'GeoPoint',
        latitude: 20,
        longitude: 20
      }
    });
    expect(o.dirty()).toBe(false);
    o.get('obj').b = 21;
    expect(o.get('obj')).toEqual({
      a: 12,
      b: 21
    });
    expect(o.dirty()).toBe(true);
    expect(o.dirtyKeys()).toEqual(['obj']);
    expect(o._getSaveJSON()).toEqual({
      obj: {
        a: 12,
        b: 21
      }
    });
    delete o.get('obj').b;
    expect(o.dirty()).toBe(false);
    expect(o.dirtyKeys()).toEqual([]);
    const loc = o.get('location');
    expect(loc instanceof ParseGeoPoint).toBe(true);
    expect(loc.latitude).toBe(20);
    expect(loc.longitude).toBe(20);
    loc.latitude = 30;
    expect(loc.latitude).toBe(30);
    expect(o.dirty()).toBe(true);
    expect(o.dirtyKeys()).toEqual(['location']);

    const p = new ParseObject('Parent');
    p.set('children', [o]);
    expect(p.dirtyKeys()).toEqual(['children']);
  });

  it('can validate attributes', () => {
    const o = new ParseObject('Listing');
    expect(o.validate({
      ACL: 'not an acl'
    })).toEqual(
      new ParseError(ParseError.OTHER_CAUSE, 'ACL must be a Parse ACL.')
    );

    expect(o.validate({
      'invalid!key': 12
    })).toEqual(
      new ParseError(ParseError.INVALID_KEY_NAME)
    );

    expect(o.validate({
      noProblem: 'here'
    })).toBe(false);

    expect(o.validate({
      'dot.field': 'here'
    })).toBe(false);
  });

  it('validates attributes on set()', () => {
    const o = new ParseObject('Listing');
    expect(o.set('ACL', 'not an acl')).toBe(false);
    expect(o.set('ACL', { '*': { read: true, write: false } })).toBe(o);
    expect(o.set('$$$', 'o_O')).toBe(false);

    o.set('$$$', 'o_O', { error: function(obj, err) {
      expect(obj).toBe(o);
      expect(err.code).toBe(105);
    }});
  });

  it('ignores validation if ignoreValidation option is passed to set()', () => {
    const o = new ParseObject('Listing');
    expect(o.set('$$$', 'o_O', { ignoreValidation: true })).toBe(o);
  });

  it('can test object validity', () => {
    // Note: an object should never become invalid through normal use, but
    // it's possible that someone could manipulate it to become invalid
    const o = new ParseObject('Item');
    expect(o.isValid()).toBe(true);
    o.set('someKey', 'someValue');
    expect(o.isValid()).toBe(true);
    o._finishFetch({
      objectId: 'O3',
      'invalid!key': 'oops'
    });
    expect(o.isValid()).toBe(false);
  });

  it('shares data among different instances of an object', () => {
    const o = new ParseObject('Person');
    o.id = 'P2';
    const o2 = new ParseObject('Person');
    o2.id = 'P2';
    o.set('age', 22);
    expect(o.get('age')).toBe(22);
    expect(o2.get('age')).toBe(22);
  });

  it('does not stack-overflow when encoding recursive pointers', () => {
    const o = ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'recurParent',
      child: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'recurChild'
      }
    });
    expect(o.toJSON()).toEqual({
      objectId: 'recurParent',
      child: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'recurChild'
      }
    });

    ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'recurChild',
      parent: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'recurParent'
      }
    });

    expect(o.toJSON()).toEqual({
      objectId: 'recurParent',
      child: {
        __type: 'Object',
        className: 'Item',
        objectId: 'recurChild',
        parent: {
          __type: 'Pointer',
          className: 'Item',
          objectId: 'recurParent'
        }
      }
    });
  });

  it('properly encodes createdAt/updatedAt dates on nested objects', () => {
    const o = ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'recurParent',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
      aDate: {
        __type: 'Date',
        iso: '1970-01-01T00:00:00.000Z'
      },
      child: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'recurChild'
      }
    });
    expect(o.createdAt.getTime()).toBe(new Date(0).getTime());
    expect(o.updatedAt.getTime()).toBe(new Date(0).getTime());
    expect(o.get('aDate').getTime()).toBe(new Date(0).getTime());

    ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'recurChild',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
      parent: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'recurParent'
      }
    });

    expect(o.toJSON()).toEqual({
      objectId: 'recurParent',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
      aDate: {
        __type: 'Date',
        iso: '1970-01-01T00:00:00.000Z'
      },
      child: {
        __type: 'Object',
        className: 'Item',
        objectId: 'recurChild',
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
        parent: {
          __type: 'Pointer',
          className: 'Item',
          objectId: 'recurParent'
        }
      }
    });
  });

  it('encodes multiple layers of nested objects', () => {
    const grandparent = ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'nestedGrand',
      child: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'nestedParent'
      }
    });

    const parent = ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'nestedParent',
      child: {
        __type: 'Pointer',
        className: 'Item',
        objectId: 'nestedChild'
      }
    });

    const child = ParseObject.fromJSON({
      __type: 'Object',
      className: 'Item',
      objectId: 'nestedChild',
      count: 12
    });

    expect(grandparent.get('child').id).toBe(parent.id);
    expect(grandparent.get('child').get('child').id).toBe(child.id);

    expect(grandparent.toJSON()).toEqual({
      objectId: 'nestedGrand',
      child: {
        __type: 'Object',
        className: 'Item',
        objectId: 'nestedParent',
        child: {
          __type: 'Object',
          className: 'Item',
          objectId: 'nestedChild',
          count: 12
        }
      }
    });
  });

  it('updates the existed flag when saved', () => {
    const o = new ParseObject('Item');
    expect(o.existed()).toBe(false);
    o._handleSaveResponse({
      objectId: 'I2'
    }, 201);
    expect(o.existed()).toBe(false);
    o._handleSaveResponse({}, 200);
    expect(o.existed()).toBe(true);
  });

  it('commits changes to server data when saved', () => {
    const p = new ParseObject('Person');
    p.id = 'P3';
    p.set('age', 24);
    expect(p._getServerData()).toEqual({});
    expect(p.op('age') instanceof SetOp).toBe(true);
    const updated = new Date();
    p._handleSaveResponse({
      updatedAt: { __type: 'Date', iso: updated.toISOString() }
    });
    expect(p._getServerData()).toEqual({
      updatedAt: updated,
      age: 24
    });
    expect(p.op('age')).toBe(undefined);
  });

  it('isDataAvailable', () => {
    const p = new ParseObject('Person');
    p.id = 'isdataavailable';
    p.set('age', 24);
    expect(p.isDataAvailable()).toBe(false);
    const updated = new Date();
    p._handleSaveResponse({
      updatedAt: { __type: 'Date', iso: updated.toISOString() }
    });
    expect(p.isDataAvailable()).toBe(true);
  });

  it('handles ACL when saved', () => {
    const p = new ParseObject('Person');

    p._handleSaveResponse({
      ACL: {}
    }, 201);

    const acl = p.getACL();
    expect(acl).not.toEqual(null);
    expect(acl instanceof ParseACL).toBe(true);
  });

  it('replaces a local id with a real one when saved', () => {
    const p = new ParseObject('Person');
    p.set('age', 34);
    expect(p._localId).toBeTruthy();
    expect(p.id).toBe(undefined);
    const oldState = SingleInstanceStateController.getState({ className: 'Person', id: p._localId });
    p._handleSaveResponse({
      objectId: 'P4'
    });
    expect(p._localId).toBe(undefined);
    expect(p.id).toBe('P4');
    const newState = SingleInstanceStateController.getState({ className: 'Person', id: 'P4' });
    expect(oldState.serverData).toBe(newState.serverData);
    expect(oldState.pendingOps).toBe(newState.pendingOps);
    expect(oldState.tasks).toBe(newState.tasks);
  });

  it('marks inflated objects as existed', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'iexist',
      count: 7
    });
    expect(o.existed()).toBe(true);
  });

  it('can revert unsaved ops', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'canrevert',
      count: 5
    });
    o.set({ cool: true });
    o.increment('count');
    expect(o.get('cool')).toBe(true);
    expect(o.get('count')).toBe(6);
    o.revert();
    expect(o.get('cool')).toBe(undefined);
    expect(o.op('cool')).toBe(undefined);
    expect(o.get('count')).toBe(5);
    expect(o.op('count')).toBe(undefined);
  });

  it('can revert a specific field in unsaved ops', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'canrevertspecific',
      count: 5
    });
    o.set({ cool: true });
    o.increment('count');
    expect(o.get('cool')).toBe(true);
    expect(o.get('count')).toBe(6);
    o.revert('cool');
    expect(o.get('cool')).toBe(undefined);
    expect(o.op('cool')).toBe(undefined);
    expect(o.get('count')).toBe(6);
    expect(o.op('count')).not.toBe(undefined);
  });

  it('can revert multiple fields in unsaved ops', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'canrevertmultiple',
      count: 5,
      age: 18,
      gender: 'female'
    });
    o.set({ cool: true, gender: 'male' });
    o.increment('count');
    o.increment('age');
    expect(o.get('cool')).toBe(true);
    expect(o.get('count')).toBe(6);
    expect(o.get('age')).toBe(19);
    expect(o.get('gender')).toBe('male');
    o.revert('age', 'count', 'gender');
    expect(o.get('cool')).toBe(true);
    expect(o.op('cool')).not.toBe(undefined);
    expect(o.get('count')).toBe(5);
    expect(o.op('count')).toBe(undefined);
    expect(o.get('age')).toBe(18);
    expect(o.op('age')).toBe(undefined);
    expect(o.get('gender')).toBe('female');
    expect(o.op('gender')).toBe(undefined);
  });

  it('throws if an array is provided', () => {
    const o = ParseObject.fromJSON({
      className: 'Item',
      objectId: 'throwforarray',
      count: 5,
      age: 18,
      gender: 'female'
    });
    o.set({ cool: true, gender: 'male' });

    const err = "Parse.Object#revert expects either no, or a list of string, arguments.";

    expect(function() {
      o.revert(['age'])
    }).toThrow(err);

    expect(function() {
      o.revert([])
    }).toThrow(err);

    expect(function() {
      o.revert('gender', ['age'])
    }).toThrow(err);
  });

  it('can fetchWithInclude', async () => {
    const objectController = CoreManager.getObjectController();
    const spy = jest.spyOn(
      objectController,
      'fetch'
    )
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {});

    const parent = new ParseObject('Person');
    await parent.fetchWithInclude('child', { useMasterKey: true, sessionToken: '123'});
    await parent.fetchWithInclude(['child']);
    await parent.fetchWithInclude([['child']]);
    expect(objectController.fetch).toHaveBeenCalledTimes(3);

    expect(objectController.fetch.mock.calls[0]).toEqual([
      parent, true, { useMasterKey: true, sessionToken: '123', include: ['child'] }
    ]);
    expect(objectController.fetch.mock.calls[1]).toEqual([
      parent, true, { include: ['child'] }
    ]);
    expect(objectController.fetch.mock.calls[2]).toEqual([
      parent, true, { include: ['child'] }
    ]);

    spy.mockRestore();
  });

  it('can fetchAllWithInclude', async () => {
    const objectController = CoreManager.getObjectController();
    const spy = jest.spyOn(
      objectController,
      'fetch'
    )
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {});

    const parent = new ParseObject('Person');
    await ParseObject.fetchAllWithInclude([parent], 'child', { useMasterKey: true, sessionToken: '123'});
    await ParseObject.fetchAllWithInclude([parent], ['child']);
    await ParseObject.fetchAllWithInclude([parent], [['child']]);
    expect(objectController.fetch).toHaveBeenCalledTimes(3);

    expect(objectController.fetch.mock.calls[0]).toEqual([
      [parent], true, { useMasterKey: true, sessionToken: '123', include: ['child'] }
    ]);
    expect(objectController.fetch.mock.calls[1]).toEqual([
      [parent], true, { include: ['child'] }
    ]);
    expect(objectController.fetch.mock.calls[2]).toEqual([
      [parent], true, { include: ['child'] }
    ]);

    spy.mockRestore();
  });

  it('can check if object exists', async () => {
    const parent = new ParseObject('Person');
    expect(await parent.exists()).toBe(false);
    parent.id = '1234'
    expect(await parent.exists()).toBe(true);
  });

  it('can save the object', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          objectId: 'P5',
          count: 1
        }
      }])
    );
    const p = new ParseObject('Person');
    p.set('age', 38);
    p.increment('count');
    p.save().then((obj) => {
      expect(obj).toBe(p);
      expect(obj.get('age')).toBe(38);
      expect(obj.get('count')).toBe(1);
      expect(obj.op('age')).toBe(undefined);
      expect(obj.dirty()).toBe(false);
      done();
    });
  });

  it('accepts attribute changes on save', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: { objectId: 'newattributes' }
      }])
    );
    let o = new ParseObject('Item');
    o.save({ key: 'value' }).then(() => {
      expect(o.get('key')).toBe('value');

      o = new ParseObject('Item');
      return o.save({ ACL: 'not an acl' });
    }).then(null, (error) => {
      expect(error.code).toBe(-1);
      done();
    });
  });

  it('accepts context on save', async () => {
    // Mock XHR
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: { objectId: 'newattributes' }
      }])
    );
    // Spy on REST controller
    const controller = CoreManager.getRESTController();
    jest.spyOn(controller, 'ajax');
    // Save object
    const context = {a: "a"};
    const obj = new ParseObject('Item');
    await obj.save(null, {context});
    // Validate
    const jsonBody = JSON.parse(controller.ajax.mock.calls[0][2]);
    expect(jsonBody._context).toEqual(context);
  });

  it('interpolates delete operations', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: { objectId: 'newattributes', deletedKey: {__op: 'Delete'} }
      }])
    );
    const o = new ParseObject('Item');
    o.save({ key: 'value', deletedKey: 'keyToDelete' }).then(() => {
      expect(o.get('key')).toBe('value');
      expect(o.get('deletedKey')).toBeUndefined();
      done();
    });
  });

  it('can make changes while in the process of a save', async () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const p = new ParseObject('Person');
    p.set('age', 38);
    const result = p.save().then(() => {
      expect(p._getServerData()).toEqual({ age: 38 });
      expect(p._getPendingOps().length).toBe(1);
      expect(p.get('age')).toBe(39);
    });
    jest.runAllTicks();
    await flushPromises();
    expect(p._getPendingOps().length).toBe(2);
    p.increment('age');
    expect(p.get('age')).toBe(39);

    xhr.status = 200;
    xhr.responseText = JSON.stringify({ objectId: 'P12' });
    xhr.readyState = 4;
    xhr.onreadystatechange();
    await result;
  });

  it('will queue save operations', async () => {
    const xhrs = [];
    RESTController._setXHR(function() {
      const xhr = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn()
      };
      xhrs.push(xhr);
      return xhr;
    });
    const p = new ParseObject('Person');
    expect(p._getPendingOps().length).toBe(1);
    expect(xhrs.length).toBe(0);
    p.increment('updates');
    p.save();
    jest.runAllTicks();
    await flushPromises();
    expect(p._getPendingOps().length).toBe(2);
    expect(xhrs.length).toBe(1);
    p.increment('updates');
    p.save();
    jest.runAllTicks();
    await flushPromises();
    expect(p._getPendingOps().length).toBe(3);
    expect(xhrs.length).toBe(1);

    xhrs[0].status = 200;
    xhrs[0].responseText = JSON.stringify({ objectId: 'P15', updates: 1 });
    xhrs[0].readyState = 4;
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    expect(p._getServerData()).toEqual({ updates: 1 });
    expect(p.get('updates')).toBe(2);
    expect(p._getPendingOps().length).toBe(2);
    expect(xhrs.length).toBe(2);
  });

  it('will leave the pending ops queue untouched when a lone save fails', async () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const p = new ParseObject('Per$on');
    expect(p._getPendingOps().length).toBe(1);
    p.increment('updates');
    const result = p.save().then(null, (err) => {
      expect(err.code).toBe(103);
      expect(err.message).toBe('Invalid class name');
      expect(p._getPendingOps().length).toBe(1);
      expect(p.dirtyKeys()).toEqual(['updates']);
      expect(p.get('updates')).toBe(1);
    });
    jest.runAllTicks();
    await flushPromises();

    xhr.status = 404;
    xhr.responseText = JSON.stringify({ code: 103, error: 'Invalid class name' });
    xhr.readyState = 4;
    xhr.onreadystatechange();
    await result;
  });

  it('will merge pending Ops when a save fails and others are pending', async () => {
    const xhrs = [];
    RESTController._setXHR(function() {
      const xhr = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn()
      };
      xhrs.push(xhr);
      return xhr;
    });
    const p = new ParseObject('Per$on');
    expect(p._getPendingOps().length).toBe(1);
    p.increment('updates');
    p.save().catch(() => {});
    jest.runAllTicks();
    await flushPromises();
    expect(p._getPendingOps().length).toBe(2);
    p.set('updates', 12);
    p.save().catch(() => {});
    jest.runAllTicks();
    await flushPromises();

    expect(p._getPendingOps().length).toBe(3);

    xhrs[0].status = 404;
    xhrs[0].responseText = JSON.stringify({ code: 103, error: 'Invalid class name' });
    xhrs[0].readyState = 4;
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();
    expect(p._getPendingOps().length).toBe(2);
    expect(p._getPendingOps()[0]).toEqual({
      updates: new ParseOp.SetOp(12)
    });
  });

  it('will deep-save the children of an object', async () => {
    const xhrs = [];
    RESTController._setXHR(function() {
      const xhr = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
      xhrs.push(xhr);
      return xhr;
    });
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    child.set('value', 5);
    parent.set('child', child);
    const result = parent.save().then(() => {
      expect(child.id).toBe('child');
      expect(child.dirty()).toBe(false);
      expect(parent.id).toBe('parent');
    });
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(1);
    expect(xhrs[0].open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/batch', true]
    );
    xhrs[0].responseText = JSON.stringify([ { success: { objectId: 'child' } } ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(2);
    xhrs[1].responseText = JSON.stringify({ objectId: 'parent' });
    xhrs[1].onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('will fail for a circular dependency of non-existing objects', () => {
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    parent.set('child', child);
    child.set('parent', parent);
    expect(parent.save.bind(parent)).toThrow(
      'Cannot create a pointer to an unsaved Object.'
    );
  });

  it('will fail for deeper unsaved objects', () => {
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    const grandchild = new ParseObject('Item');
    parent.set('child', child);
    child.set('child', grandchild);

    expect(parent.save.bind(parent)).toThrow(
      'Cannot create a pointer to an unsaved Object.'
    );
  });

  it('does not mark shallow objects as dirty', () => {
    const post = new ParseObject('Post');
    post.id = '141414';
    expect(post.dirty()).toBe(false);

    const comment = new ParseObject('Comment');
    comment.set('parent', post);
    expect(unsavedChildren(comment)).toEqual([]);
  });

  it('can fetch an object given an id', async () => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          count: 10
        }
      }])
    );
    const p = new ParseObject('Person');
    p.id = 'P55';
    await p.fetch().then((res) => {
      expect(p).toBe(res);
      expect(p.attributes).toEqual({ count: 10 });
    });
  });

  it('throw for fetch with empty string as ID', async () => {
    expect.assertions(1);
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          count: 10
        }
      }])
    );
    const p = new ParseObject('Person');
    p.id = '';
    await expect(p.fetch())
      .rejects
      .toThrowError(new ParseError(
        ParseError.MISSING_OBJECT_ID,
        'Object does not have an ID'
      ));
  });

  it('should fail on invalid date', (done) => {
    const obj = new ParseObject('Item');
    obj.set('when', new Date(Date.parse(null)));
    ParseObject.saveAll([obj]).then(() => {
      done.fail('Expected invalid date to fail');
    }).catch((error) => {
      expect(error[0].code).toEqual(ParseError.INCORRECT_TYPE);
      expect(error[0].message).toEqual('Tried to encode an invalid date.');
      done();
    });
    jest.runAllTicks();
  });

  it('can save a ring of objects, given one exists', async () => {
    const xhrs = [];
    RESTController._setXHR(function() {
      const xhr = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
      xhrs.push(xhr);
      return xhr;
    });
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    child.id = 'child';
    parent.set('child', child);
    child.set('parent', parent);

    const result = ParseObject.saveAll([parent, child]).then(() => {
      expect(child.dirty()).toBe(false);
      expect(parent.id).toBe('parent');
    });
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(1);
    expect(xhrs[0].open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/batch', true]
    );
    expect(JSON.parse(xhrs[0].send.mock.calls[0]).requests).toEqual(
      [{
        method: 'POST',
        path: '/1/classes/Item',
        body: {
          child: {
            __type: 'Pointer',
            className: 'Item',
            objectId: 'child'
          }
        }
      }]
    );
    xhrs[0].responseText = JSON.stringify([ { success: { objectId: 'parent' } } ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    expect(parent.id).toBe('parent');

    expect(xhrs.length).toBe(2);
    xhrs[1].responseText = JSON.stringify([ { success: {} } ]);
    xhrs[1].onreadystatechange();
    jest.runAllTicks();

    await result;
  });

  it('accepts context on saveAll', async () => {
    // Mock XHR
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: [{}]
      }])
    );
    // Spy on REST controller
    const controller = CoreManager.getRESTController();
    jest.spyOn(controller, 'ajax');
    // Save object
    const context = {a: "a"};
    const obj = new ParseObject('Item');
    obj.id = 'pid';
    obj.set('test', 'value');
    await ParseObject.saveAll([obj], {context})
    // Validate
    const jsonBody = JSON.parse(controller.ajax.mock.calls[0][2]);
    expect(jsonBody._context).toEqual(context);
  });

  it('accepts context on destroyAll', async () => {
    // Mock XHR
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: [{}]
      }])
    );
    // Spy on REST controller
    const controller = CoreManager.getRESTController();
    jest.spyOn(controller, 'ajax');
    // Save object
    const context = {a: "a"};
    const obj = new ParseObject('Item');
    obj.id = 'pid';
    await ParseObject.destroyAll([obj], { context: context })
    // Validate
    const jsonBody = JSON.parse(controller.ajax.mock.calls[0][2]);
    expect(jsonBody._context).toEqual(context);
  });

  it('can save a chain of unsaved objects', async () => {
    const xhrs = [];
    RESTController._setXHR(function() {
      const xhr = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
      xhrs.push(xhr);
      return xhr;
    });
    const parent = new ParseObject('Item');
    const child = new ParseObject('Item');
    const grandchild = new ParseObject('Item');
    parent.set('child', child);
    child.set('child', grandchild);

    const result = ParseObject.saveAll([parent]).then(() => {
      expect(child.dirty()).toBe(false);
      expect(grandchild.dirty()).toBe(false);
      expect(parent.id).toBe('parent');
      expect(child.id).toBe('child');
      expect(grandchild.id).toBe('grandchild');
    });
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(1);
    expect(xhrs[0].open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/batch', true]
    );
    expect(JSON.parse(xhrs[0].send.mock.calls[0]).requests).toEqual(
      [{
        method: 'POST',
        path: '/1/classes/Item',
        body: {}
      }]
    );
    xhrs[0].responseText = JSON.stringify([ { success: { objectId: 'grandchild' } } ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(2);
    expect(xhrs[1].open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/batch', true]
    );
    expect(JSON.parse(xhrs[1].send.mock.calls[0]).requests).toEqual(
      [{
        method: 'POST',
        path: '/1/classes/Item',
        body: {
          child: {
            __type: 'Pointer',
            className: 'Item',
            objectId: 'grandchild'
          }
        }
      }]
    );
    xhrs[1].responseText = JSON.stringify([ { success: { objectId: 'child' } } ]);
    xhrs[1].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    expect(xhrs.length).toBe(3);
    expect(xhrs[2].open.mock.calls[0]).toEqual(
      ['POST', 'https://api.parse.com/1/batch', true]
    );
    expect(JSON.parse(xhrs[2].send.mock.calls[0]).requests).toEqual(
      [{
        method: 'POST',
        path: '/1/classes/Item',
        body: {
          child: {
            __type: 'Pointer',
            className: 'Item',
            objectId: 'child'
          }
        }
      }]
    );
    xhrs[2].responseText = JSON.stringify([ { success: { objectId: 'parent' } } ]);
    xhrs[2].onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('can update fields via a fetch() call', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          count: 11
        }
      }, {
        status: 200,
        response: {
          count: 20
        }
      }])
    );
    const p = new ParseObject('Person');
    p.id = 'P55';
    p.increment('count');
    p.save().then(() => {
      expect(p.get('count')).toBe(11);
      return p.fetch();
    }).then(() => {
      expect(p.get('count')).toBe(20);
      expect(p.dirty()).toBe(false);
      done();
    });
  });

  it('replaces old data when fetch() is called', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          count: 10
        }
      }])
    );

    const p = ParseObject.fromJSON({
      className: 'Person',
      objectId: 'P200',
      name: 'Fred',
      count: 0
    });
    expect(p.get('name')).toBe('Fred');
    expect(p.get('count')).toBe(0);
    p.fetch().then(() => {
      expect(p.get('count')).toBe(10);
      expect(p.get('name')).toBe(undefined);
      expect(p.has('name')).toBe(false);
      done();
    });
  });

  it('can destroy an object', async () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const p = new ParseObject('Person');
    p.id = 'pid';
    const result = p.destroy().then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid', true]
      );
      expect(JSON.parse(xhr.send.mock.calls[0])._method).toBe('DELETE');
    });
    jest.runAllTicks();
    await flushPromises();
    xhr.status = 200;
    xhr.responseText = JSON.stringify({});
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('accepts context on destroy', async () => {
    // Mock XHR
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {}
      }])
    );
    // Spy on REST controller
    const controller = CoreManager.getRESTController();
    jest.spyOn(controller, 'ajax');
    // Save object
    const context = {a: "a"};
    const obj = new ParseObject('Item');
    obj.id = 'pid';
    await obj.destroy({context});
    // Validate
    const jsonBody = JSON.parse(controller.ajax.mock.calls[0][2]);
    expect(jsonBody._context).toEqual(context);
  });

  it('can save an array of objects', async (done) => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
    }
    ParseObject.saveAll(objects).then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(JSON.parse(xhr.send.mock.calls[0]).requests[0]).toEqual({
        method: 'POST',
        path: '/1/classes/Person',
        body: {}
      });
      done();
    });
    jest.runAllTicks();
    await flushPromises();
    xhr.status = 200;
    xhr.responseText = JSON.stringify([
      { success: { objectId: 'pid0' } },
      { success: { objectId: 'pid1' } },
      { success: { objectId: 'pid2' } },
      { success: { objectId: 'pid3' } },
      { success: { objectId: 'pid4' } },
    ]);
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
  });

  it('can saveAll with batchSize', async (done) => {
    const xhrs = [];
    for (let i = 0; i < 2; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    const objects = [];
    for (let i = 0; i < 22; i++) {
      objects[i] = new ParseObject('Person');
    }
    ParseObject.saveAll(objects, { batchSize: 20 }).then(() => {
      expect(xhrs[0].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(xhrs[1].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      done();
    });
    jest.runAllTicks();
    await flushPromises();

    xhrs[0].responseText = JSON.stringify([
      { success: { objectId: 'pid0' } },
      { success: { objectId: 'pid1' } },
      { success: { objectId: 'pid2' } },
      { success: { objectId: 'pid3' } },
      { success: { objectId: 'pid4' } },
      { success: { objectId: 'pid5' } },
      { success: { objectId: 'pid6' } },
      { success: { objectId: 'pid7' } },
      { success: { objectId: 'pid8' } },
      { success: { objectId: 'pid9' } },
      { success: { objectId: 'pid10' } },
      { success: { objectId: 'pid11' } },
      { success: { objectId: 'pid12' } },
      { success: { objectId: 'pid13' } },
      { success: { objectId: 'pid14' } },
      { success: { objectId: 'pid15' } },
      { success: { objectId: 'pid16' } },
      { success: { objectId: 'pid17' } },
      { success: { objectId: 'pid18' } },
      { success: { objectId: 'pid19' } },
    ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    xhrs[1].responseText = JSON.stringify([
      { success: { objectId: 'pid20' } },
      { success: { objectId: 'pid21' } },
    ]);
    xhrs[1].onreadystatechange();
    jest.runAllTicks();
  });

  it('can saveAll with global batchSize', async (done) => {
    const xhrs = [];
    for (let i = 0; i < 2; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    const objects = [];
    for (let i = 0; i < 22; i++) {
      objects[i] = new ParseObject('Person');
    }
    ParseObject.saveAll(objects).then(() => {
      expect(xhrs[0].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(xhrs[1].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      done();
    });
    jest.runAllTicks();
    await flushPromises();

    xhrs[0].responseText = JSON.stringify([
      { success: { objectId: 'pid0' } },
      { success: { objectId: 'pid1' } },
      { success: { objectId: 'pid2' } },
      { success: { objectId: 'pid3' } },
      { success: { objectId: 'pid4' } },
      { success: { objectId: 'pid5' } },
      { success: { objectId: 'pid6' } },
      { success: { objectId: 'pid7' } },
      { success: { objectId: 'pid8' } },
      { success: { objectId: 'pid9' } },
      { success: { objectId: 'pid10' } },
      { success: { objectId: 'pid11' } },
      { success: { objectId: 'pid12' } },
      { success: { objectId: 'pid13' } },
      { success: { objectId: 'pid14' } },
      { success: { objectId: 'pid15' } },
      { success: { objectId: 'pid16' } },
      { success: { objectId: 'pid17' } },
      { success: { objectId: 'pid18' } },
      { success: { objectId: 'pid19' } },
    ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await flushPromises();

    xhrs[1].responseText = JSON.stringify([
      { success: { objectId: 'pid20' } },
      { success: { objectId: 'pid21' } },
    ]);
    xhrs[1].onreadystatechange();
    jest.runAllTicks();
  });

  it('returns the first error when saving an array of objects', async (done) => {
    const xhrs = [];
    for (let i = 0; i < 2; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    const objects = [];
    for (let i = 0; i < 22; i++) {
      objects[i] = new ParseObject('Person');
    }
    ParseObject.saveAll(objects).then(null, (error) => {
      // The second batch never ran
      expect(xhrs[1].open.mock.calls.length).toBe(0);
      expect(objects[19].dirty()).toBe(false);
      expect(objects[20].dirty()).toBe(true);

      expect(error.message).toBe('first error');
      done();
    });
    await flushPromises();

    xhrs[0].responseText = JSON.stringify([
      { success: { objectId: 'pid0' } },
      { success: { objectId: 'pid1' } },
      { success: { objectId: 'pid2' } },
      { success: { objectId: 'pid3' } },
      { success: { objectId: 'pid4' } },
      { success: { objectId: 'pid5' } },
      { error: { code: -1, error: 'first error' } },
      { success: { objectId: 'pid7' } },
      { success: { objectId: 'pid8' } },
      { success: { objectId: 'pid9' } },
      { success: { objectId: 'pid10' } },
      { success: { objectId: 'pid11' } },
      { success: { objectId: 'pid12' } },
      { success: { objectId: 'pid13' } },
      { success: { objectId: 'pid14' } },
      { error: { code: -1, error: 'second error' } },
      { success: { objectId: 'pid16' } },
      { success: { objectId: 'pid17' } },
      { success: { objectId: 'pid18' } },
      { success: { objectId: 'pid19' } },
    ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
  });
});

describe('ObjectController', () => {
  it('can fetch a single object', async (done) => {
    const objectController = CoreManager.getObjectController();
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const o = new ParseObject('Person');
    o.id = 'pid';
    objectController.fetch(o).then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid', true]
      );
      const body = JSON.parse(xhr.send.mock.calls[0]);
      expect(body._method).toBe('GET');
      done();
    });
    await flushPromises();

    xhr.status = 200;
    xhr.responseText = JSON.stringify({});
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
  });

  it('accepts context on fetch', async () => {
    // Mock XHR
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {}
      }])
    );
    // Spy on REST controller
    const controller = CoreManager.getRESTController();
    jest.spyOn(controller, 'ajax');
    // Save object
    const context = {a: "a"};
    const obj = new ParseObject('Item');
    obj.id = 'pid';
    await obj.fetch({context});
    // Validate
    const jsonBody = JSON.parse(controller.ajax.mock.calls[0][2]);
    expect(jsonBody._context).toEqual(context);
  });

  it('can fetch an array of objects', (done) => {
    const objectController = CoreManager.getObjectController();
    const objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
      objects[i].id = 'pid' + i;
    }
    objectController.fetch(objects).then((results) => {
      expect(results.length).toBe(5);
      expect(results[0] instanceof ParseObject).toBe(true);
      expect(results[0].id).toBe('pid0');
      expect(results[0].className).toBe('Person');
      done();
    });
  });

  it('can fetch a single object with include', async (done) => {
    const objectController = CoreManager.getObjectController();
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const o = new ParseObject('Person');
    o.id = 'pid';
    objectController.fetch(o, false, { include: ['child'] }).then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid', true]
      );
      const body = JSON.parse(xhr.send.mock.calls[0]);
      expect(body._method).toBe('GET');
      done();
    });
    await flushPromises();

    xhr.status = 200;
    xhr.responseText = JSON.stringify({});
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
  });

  it('can fetch an array of objects with include', async () => {
    const objectController = CoreManager.getObjectController();
    const objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
      objects[i].id = 'pid' + i;
    }
    const results = await objectController.fetch(objects, false, { include: ['child'] });
    expect(results.length).toBe(5);
    expect(results[0] instanceof ParseObject).toBe(true);
    expect(results[0].id).toBe('pid0');
    expect(results[0].className).toBe('Person');
  });

  it('can destroy an object', async () => {
    const objectController = CoreManager.getObjectController();
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const p = new ParseObject('Person');
    p.id = 'pid';
    const result = objectController.destroy(p, {}).then(async () => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid', true]
      );
      expect(JSON.parse(xhr.send.mock.calls[0])._method).toBe('DELETE');
      const p2 = new ParseObject('Person');
      p2.id = 'pid2';
      const destroy = objectController.destroy(p2, {
        useMasterKey: true
      });
      jest.runAllTicks();
      await flushPromises();
      xhr.onreadystatechange();
      jest.runAllTicks();
      return destroy;
    }).then(() => {
      expect(xhr.open.mock.calls[1]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid2', true]
      );
      const body = JSON.parse(xhr.send.mock.calls[1]);
      expect(body._method).toBe('DELETE');
      expect(body._MasterKey).toBe('C');
    });
    jest.runAllTicks();
    await flushPromises();
    xhr.status = 200;
    xhr.responseText = JSON.stringify({});
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('can destroy an array of objects with batchSize', async () => {
    const objectController = CoreManager.getObjectController();
    const xhrs = [];
    for (let i = 0; i < 3; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn()
      };
      xhrs[i].status = 200;
      xhrs[i].responseText = JSON.stringify({});
      xhrs[i].readyState = 4;
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    let objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
      objects[i].id = 'pid' + i;
    }
    const result = objectController.destroy(objects, { batchSize: 20}).then(async () => {
      expect(xhrs[0].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(JSON.parse(xhrs[0].send.mock.calls[0]).requests).toEqual([
        {
          method: 'DELETE',
          path: '/1/classes/Person/pid0',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid1',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid2',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid3',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid4',
          body: {}
        }
      ]);

      objects = [];
      for (let i = 0; i < 22; i++) {
        objects[i] = new ParseObject('Person');
        objects[i].id = 'pid' + i;
      }
      const destroy = objectController.destroy(objects, { batchSize: 20 });
      jest.runAllTicks();
      await flushPromises();
      xhrs[1].onreadystatechange();
      jest.runAllTicks();
      await flushPromises();
      expect(xhrs[1].open.mock.calls.length).toBe(1);
      xhrs[2].onreadystatechange();
      jest.runAllTicks();
      return destroy;
    }).then(() => {
      expect(JSON.parse(xhrs[1].send.mock.calls[0]).requests.length).toBe(20);
      expect(JSON.parse(xhrs[2].send.mock.calls[0]).requests.length).toBe(2);
    });
    jest.runAllTicks();
    await flushPromises();

    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('can destroy an array of objects', async () => {
    const objectController = CoreManager.getObjectController();
    const xhrs = [];
    for (let i = 0; i < 3; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn()
      };
      xhrs[i].status = 200;
      xhrs[i].responseText = JSON.stringify({});
      xhrs[i].readyState = 4;
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    let objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
      objects[i].id = 'pid' + i;
    }
    const result = objectController.destroy(objects, {}).then(async () => {
      expect(xhrs[0].open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(JSON.parse(xhrs[0].send.mock.calls[0]).requests).toEqual([
        {
          method: 'DELETE',
          path: '/1/classes/Person/pid0',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid1',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid2',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid3',
          body: {}
        }, {
          method: 'DELETE',
          path: '/1/classes/Person/pid4',
          body: {}
        }
      ]);

      objects = [];
      for (let i = 0; i < 22; i++) {
        objects[i] = new ParseObject('Person');
        objects[i].id = 'pid' + i;
      }
      const destroy = objectController.destroy(objects, {});
      jest.runAllTicks();
      await flushPromises();
      xhrs[1].onreadystatechange();
      jest.runAllTicks();
      await flushPromises();
      expect(xhrs[1].open.mock.calls.length).toBe(1);
      xhrs[2].onreadystatechange();
      jest.runAllTicks();
      return destroy;
    }).then(() => {
      expect(JSON.parse(xhrs[1].send.mock.calls[0]).requests.length).toBe(20);
      expect(JSON.parse(xhrs[2].send.mock.calls[0]).requests.length).toBe(2);
    });
    jest.runAllTicks();
    await flushPromises();

    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('can save an object', async () => {
    const objectController = CoreManager.getObjectController();
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const p = new ParseObject('Person');
    p.id = 'pid';
    p.set('key', 'value');
    const result = objectController.save(p, {}).then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/classes/Person/pid', true]
      );
      const body = JSON.parse(xhr.send.mock.calls[0]);
      expect(body.key).toBe('value');
    });
    jest.runAllTicks();
    await flushPromises();
    xhr.status = 200;
    xhr.responseText = JSON.stringify({});
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('returns an empty promise from an empty save', (done) => {
    const objectController = CoreManager.getObjectController();
    objectController.save().then(() => {
      done();
    });
    jest.runAllTicks();
  });

  it('can save an array of files', async () => {
    const objectController = CoreManager.getObjectController();
    const xhrs = [];
    for (let i = 0; i < 4; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    const files = [
      new ParseFile('parse.txt', { base64: 'ParseA==' }),
      new ParseFile('parse2.txt', { base64: 'ParseA==' }),
      new ParseFile('parse3.txt', { base64: 'ParseA==' })
    ];
    const result = objectController.save(files, {}).then(() => {
      expect(files[0].url()).toBe(
        'http://files.parsetfss.com/a/parse.txt'
      );
      expect(files[1].url()).toBe(
        'http://files.parsetfss.com/a/parse2.txt'
      );
      expect(files[2].url()).toBe(
        'http://files.parsetfss.com/a/parse3.txt'
      );
    });
    jest.runAllTicks();
    await flushPromises();
    const names = ['parse.txt', 'parse2.txt', 'parse3.txt'];
    for (let i = 0; i < 3; i++) {
      xhrs[i].responseText = JSON.stringify({
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/' + names[i]
      });
      await flushPromises();
      xhrs[i].onreadystatechange();
      jest.runAllTicks();
    }
    await result;
  });

  it('can save an array of objects', async () => {
    const objectController = CoreManager.getObjectController();
    const xhrs = [];
    for (let i = 0; i < 3; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    const objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
    }
    const result = objectController.save(objects, {}).then(async (results) => {
      expect(results.length).toBe(5);
      expect(results[0].id).toBe('pid0');
      expect(results[0].get('index')).toBe(0);
      expect(results[0].dirty()).toBe(false);

      const response = [];
      for (let i = 0; i < 22; i++) {
        objects[i] = new ParseObject('Person');
        objects[i].set('index', i);
        response.push({
          success: { objectId: 'pid' + i }
        });
      }
      const save = objectController.save(objects, {});
      jest.runAllTicks();
      await flushPromises();

      xhrs[1].responseText = JSON.stringify(response.slice(0, 20));
      xhrs[2].responseText = JSON.stringify(response.slice(20));

      // Objects in the second batch will not be prepared for save yet
      // This means they can also be modified before the first batch returns
      expect(
        SingleInstanceStateController.getState({ className: 'Person', id: objects[20]._getId() }).pendingOps.length
      ).toBe(1);
      objects[20].set('index', 0);

      xhrs[1].onreadystatechange();
      jest.runAllTicks();
      await flushPromises();
      expect(objects[0].dirty()).toBe(false);
      expect(objects[0].id).toBe('pid0');
      expect(objects[20].dirty()).toBe(true);
      expect(objects[20].id).toBe(undefined);

      xhrs[2].onreadystatechange();
      jest.runAllTicks();
      await flushPromises();
      expect(objects[20].dirty()).toBe(false);
      expect(objects[20].get('index')).toBe(0);
      expect(objects[20].id).toBe('pid20');
      return save;
    }).then((results) => {
      expect(results.length).toBe(22);
    });
    jest.runAllTicks();
    await flushPromises();
    xhrs[0].responseText = JSON.stringify([
      { success: { objectId: 'pid0', index: 0 } },
      { success: { objectId: 'pid1', index: 1 } },
      { success: { objectId: 'pid2', index: 2 } },
      { success: { objectId: 'pid3', index: 3 } },
      { success: { objectId: 'pid4', index: 4 } },
    ]);
    xhrs[0].onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('does not fail when checking if arrays of pointers are dirty', async () => {
    const xhrs = [];
    for (let i = 0; i < 2; i++) {
      xhrs[i] = {
        setRequestHeader: jest.fn(),
        open: jest.fn(),
        send: jest.fn(),
        status: 200,
        readyState: 4
      };
    }
    let current = 0;
    RESTController._setXHR(function() { return xhrs[current++]; });
    xhrs[0].responseText = JSON.stringify([{ success: { objectId: 'i333' } }]);
    xhrs[1].responseText = JSON.stringify({});
    const brand = ParseObject.fromJSON({
      className: 'Brand',
      objectId: 'b123',
      items: [{ __type: 'Pointer', objectId: 'i222', className: 'Item' }]
    });
    expect(brand._getSaveJSON()).toEqual({});
    const items = brand.get('items');
    items.push(new ParseObject('Item'));
    brand.set('items', items);
    expect(function() { brand.save(); }).not.toThrow();
    jest.runAllTicks();
    await flushPromises();
    xhrs[0].onreadystatechange();
  });

  it('can create a new instance of an object', () => {
    const o = ParseObject.fromJSON({
      className: 'Clone',
      objectId: 'C12',
    });
    const o2 = o.newInstance();
    expect(o.id).toBe(o2.id);
    expect(o.className).toBe(o2.className);
    o.set({ valid: true });
    expect(o2.get('valid')).toBe(true);

    expect(o).not.toBe(o2);
  });
});

describe('ParseObject (unique instance mode)', () => {
  beforeEach(() => {
    ParseObject.disableSingleInstance();
  });

  it('can be created with initial attributes', () => {
    const o = new ParseObject({
      className: 'Item',
      value: 12
    });
    expect(o.className).toBe('Item');
    expect(o.attributes).toEqual({ value: 12 });
  });

  it('can be inflated from server JSON', () => {
    const json = {
      className: 'Item',
      createdAt: '2013-12-14T04:51:19Z',
      objectId: 'I1',
      size: 'medium'
    };
    const o = ParseObject.fromJSON(json);
    expect(o.className).toBe('Item');
    expect(o.id).toBe('I1');
    expect(o.attributes).toEqual({
      size: 'medium',
      createdAt: new Date(Date.UTC(2013, 11, 14, 4, 51, 19)),
      updatedAt: new Date(Date.UTC(2013, 11, 14, 4, 51, 19))
    });
    expect(o.dirty()).toBe(false);
  });

  it('can be rendered to JSON', () => {
    let o = new ParseObject('Item');
    o.set({
      size: 'large',
      inStock: 18
    });
    expect(o.toJSON()).toEqual({
      size: 'large',
      inStock: 18
    });
    o = new ParseObject('Item');
    o._finishFetch({
      objectId: 'O2',
      size: 'medium',
      inStock: 12
    });
    expect(o.id).toBe('O2');
    expect(o.toJSON()).toEqual({
      objectId: 'O2',
      size: 'medium',
      inStock: 12
    });
  });

  it('can add, update, and remove attributes', () => {
    const o = new ParseObject({
      className: 'Item',
      objectId: 'anObjectId',
      value: 12,
      valid: true
    });
    o.set({ value: 14 });
    expect(o.get('value')).toBe(14);
    o.unset('valid');
    expect(o.get('valid')).toBe(undefined);
    expect(o.dirtyKeys()).toEqual(['value', 'valid']);
    o.increment('value');
    expect(o.get('value')).toEqual(15);

    o.clear();
    expect(o.get('value')).toBe(undefined);

    const o2 = ParseObject.fromJSON({
      className: 'Item',
      tags: ['#tbt']
    });

    o2.add('tags', '#nofilter');
    expect(o2.get('tags')).toEqual(['#tbt', '#nofilter']);

    o2.revert();
    o2.addUnique('tags', '#tbt');
    expect(o2.get('tags')).toEqual(['#tbt']);

    o2.revert();
    o2.remove('tags', '#tbt');
    expect(o2.get('tags')).toEqual([]);
  });

  it('can save the object', (done) => {
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          objectId: 'P1',
          count: 1
        }
      }])
    );
    const p = new ParseObject('Person');
    p.set('age', 38);
    p.increment('count');
    p.save().then((obj) => {
      expect(obj).toBe(p);
      expect(obj.get('age')).toBe(38);
      expect(obj.get('count')).toBe(1);
      expect(obj.op('age')).toBe(undefined);
      expect(obj.dirty()).toBe(false);
      done();
    });
  });

  it('can save an array of objects', async () => {
    const xhr = {
      setRequestHeader: jest.fn(),
      open: jest.fn(),
      send: jest.fn()
    };
    RESTController._setXHR(function() { return xhr; });
    const objects = [];
    for (let i = 0; i < 5; i++) {
      objects[i] = new ParseObject('Person');
    }
    const result = ParseObject.saveAll(objects).then(() => {
      expect(xhr.open.mock.calls[0]).toEqual(
        ['POST', 'https://api.parse.com/1/batch', true]
      );
      expect(JSON.parse(xhr.send.mock.calls[0]).requests[0]).toEqual({
        method: 'POST',
        path: '/1/classes/Person',
        body: {}
      });
    });
    jest.runAllTicks();

    xhr.status = 200;
    xhr.responseText = JSON.stringify([
      { success: { objectId: 'pid0' } },
      { success: { objectId: 'pid1' } },
      { success: { objectId: 'pid2' } },
      { success: { objectId: 'pid3' } },
      { success: { objectId: 'pid4' } },
    ]);
    await flushPromises();
    xhr.readyState = 4;
    xhr.onreadystatechange();
    jest.runAllTicks();
    await result;
  });

  it('preserves changes when changing the id', () => {
    const o = new ParseObject({
      className: 'Item',
      objectId: 'anObjectId',
      value: 12
    });
    o.id = 'otherId';
    expect(o.get('value')).toBe(12);
  });

  it('can maintain differences between two instances of an object', () => {
    const o = new ParseObject({
      className: 'Item',
      objectId: 'anObjectId',
      value: 12
    });
    const o2 = new ParseObject({
      className: 'Item',
      objectId: 'anObjectId',
      value: 12
    });
    o.set({ value: 100 });
    expect(o.get('value')).toBe(100);
    expect(o2.get('value')).toBe(12);

    o2.set({ name: 'foo' });
    expect(o.has('name')).toBe(false);
    expect(o2.has('name')).toBe(true);
  });

  it('can create a new instance of an object', () => {
    const o = ParseObject.fromJSON({
      className: 'Clone',
      objectId: 'C14',
    });
    let o2 = o.newInstance();
    expect(o.id).toBe(o2.id);
    expect(o.className).toBe(o2.className);
    expect(o).not.toBe(o2);
    o.set({ valid: true });
    expect(o2.get('valid')).toBe(undefined);
    o2 = o.newInstance();
    expect(o2.get('valid')).toBe(true);
  });
});

class MyObject extends ParseObject {
  constructor() {
    super('MyObject');
  }

  doSomething() {
    return 5;
  }

  static readOnlyAttributes() {
    return ['readonly', 'static', 'frozen'];
  }
}

ParseObject.registerSubclass('MyObject', MyObject);

describe('ParseObject Subclasses', () => {
  beforeEach(() => {
    ParseObject.enableSingleInstance();
  });

  it('can be extended with ES6 classes', () => {
    const o = new MyObject();
    expect(o.className).toBe('MyObject');
    expect(MyObject.className).toBe('MyObject');
    o.id = 'anObjectId';
    expect(o.toPointer()).toEqual({
      __type: 'Pointer',
      className: 'MyObject',
      objectId: 'anObjectId'
    });

    expect(o.doSomething()).toBe(5);

    const o2 = MyObject.createWithoutData('otherId');
    expect(o2 instanceof ParseObject).toBe(true);
    expect(o2 instanceof MyObject).toBe(true);
    expect(o2.toPointer()).toEqual({
      __type: 'Pointer',
      className: 'MyObject',
      objectId: 'otherId'
    });
    expect(o2.doSomething()).toBe(5);
  });

  it('respects readonly attributes of subclasses', () => {
    const o = new MyObject();
    o.set('readwrite', true);
    expect(o.set.bind(o, 'readonly')).toThrow(
      'Cannot modify readonly attribute: readonly'
    );
    expect(o.set.bind(o, 'static')).toThrow(
      'Cannot modify readonly attribute: static'
    );
    expect(o.set.bind(o, 'frozen')).toThrow(
      'Cannot modify readonly attribute: frozen'
    );
  });

  it('can inflate subclasses from server JSON', () => {
    const json = {
      className: 'MyObject',
      objectId: 'anotherId'
    };
    const o = ParseObject.fromJSON(json);
    expect(o instanceof ParseObject).toBe(true);
    expect(o.className).toBe('MyObject');
    expect(o.id).toBe('anotherId');
    expect(o.doSomething()).toBe(5);
  });

  it('can be cloned', () => {
    const o = new MyObject();
    o.set({
      size: 'large',
      count: 7
    });
    const o2 = o.clone();
    expect(o2 instanceof MyObject).toBe(true);
    expect(o2.className).toBe('MyObject');
    expect(o2.attributes).toEqual({
      size: 'large',
      count: 7
    });
    expect(o2.id).toBe(undefined);
    expect(o.equals(o2)).toBe(false);
  });
});

describe('ParseObject extensions', () => {
  beforeEach(() => {
    ParseObject.enableSingleInstance();
  });

  it('can generate ParseObjects with a default className', () => {
    const YourObject = ParseObject.extend('YourObject');
    const yo = new YourObject();
    expect(yo instanceof ParseObject).toBe(true);
    expect(yo instanceof YourObject).toBe(true);
    expect(yo.className).toBe('YourObject');
    yo.set('greeting', 'yo');
    expect(yo.get('greeting')).toBe('yo');
    expect(yo.attributes).toEqual({
      greeting: 'yo'
    });

    const yo2 = YourObject.createWithoutData('otherId');
    expect(yo2 instanceof ParseObject).toBe(true);
    expect(yo2 instanceof YourObject).toBe(true);
    expect(yo2.toPointer()).toEqual({
      __type: 'Pointer',
      className: 'YourObject',
      objectId: 'otherId'
    });
  });

  it('can extend the prototype and statics of ParseObject', () => {
    const ExtendedObject = ParseObject.extend('ExtendedObject', {
      getFoo() { return 12; }
    }, {
      isFoo(value) { return value === 'foo'; }
    });
    const e = new ExtendedObject();
    expect(e instanceof ParseObject).toBe(true);
    expect(e instanceof ExtendedObject).toBe(true);
    expect(e.getFoo()).toBe(12);
    expect(ExtendedObject.isFoo(12)).toBe(false);
    expect(ExtendedObject.isFoo('foo')).toBe(true);
  });

  it('can extend a previous extension', () => {
    let FeatureObject = ParseObject.extend('FeatureObject', {
      foo() { return 'F'; }
    });
    let f = new FeatureObject();
    expect(f.foo()).toBe('F');
    FeatureObject = ParseObject.extend('FeatureObject', {
      bar() { return 'B'; }
    });
    f = new FeatureObject();
    expect(f.foo() + f.bar()).toBe('FB');
  });

  it('can specify a custom initializer', () => {
    const InitObject = ParseObject.extend('InitObject', {
      initialize: function() {
        this.set('field', 12);
      }
    });

    const i = new InitObject()
    expect(i.get('field')).toBe(12);
  });
});

describe('ParseObject pin', () => {
  beforeEach(() => {
    ParseObject.enableSingleInstance();
    jest.clearAllMocks();
    mockLocalDatastore.isEnabled = true;
  });

  it('can pin to default', async () => {
    const object = new ParseObject('Item');
    await object.pin();
    expect(mockLocalDatastore._handlePinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handlePinAllWithName).toHaveBeenCalledWith(DEFAULT_PIN, [object]);
  });

  it('can unPin to default', async () => {
    const object = new ParseObject('Item');
    await object.unPin();
    expect(mockLocalDatastore._handleUnPinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handleUnPinAllWithName).toHaveBeenCalledWith(DEFAULT_PIN, [object]);
  });

  it('can pin to specific pin', async () => {
    const object = new ParseObject('Item');
    await object.pinWithName('test_pin');
    expect(mockLocalDatastore._handlePinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handlePinAllWithName).toHaveBeenCalledWith('test_pin', [object]);
  });

  it('can unPin to specific', async () => {
    const object = new ParseObject('Item');
    await object.unPinWithName('test_pin');
    expect(mockLocalDatastore._handleUnPinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handleUnPinAllWithName).toHaveBeenCalledWith('test_pin', [object]);
  });

  it('can check if pinned', async () => {
    const object = new ParseObject('Item');
    object.id = '1234';
    mockLocalDatastore
      .fromPinWithName
      .mockImplementationOnce(() => {
        return [object._toFullJSON()];
      })
      .mockImplementationOnce(() => []);

    let isPinned = await object.isPinned();
    expect(isPinned).toEqual(true);
    isPinned = await object.isPinned();
    expect(isPinned).toEqual(false);
  });

  it('can fetchFromLocalDatastore', async () => {
    const object = new ParseObject('Item');
    object.id = '123';
    mockLocalDatastore
      .getKeyForObject
      .mockImplementationOnce(() => 'Item_123');

    mockLocalDatastore
      ._serializeObject
      .mockImplementationOnce(() => object._toFullJSON());

    await object.fetchFromLocalDatastore();
    expect(mockLocalDatastore._serializeObject).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._serializeObject).toHaveBeenCalledWith('Item_123');
  });

  it('cannot fetchFromLocalDatastore if unsaved', async () => {
    try {
      const object = new ParseObject('Item');
      await object.fetchFromLocalDatastore();
    } catch (e) {
      expect(e.message).toBe('Cannot fetch an unsaved ParseObject');
    }
  });

  it('can pinAll', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    await ParseObject.pinAll([obj1, obj2]);
    expect(mockLocalDatastore._handlePinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handlePinAllWithName.mock.calls[0]).toEqual([DEFAULT_PIN, [obj1, obj2]]);
  });

  it('can unPinAll', async () => {
    const obj1 = new ParseObject('Item');
    const obj2 = new ParseObject('Item');
    await ParseObject.unPinAll([obj1, obj2]);
    expect(mockLocalDatastore._handleUnPinAllWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore._handleUnPinAllWithName.mock.calls[0]).toEqual([DEFAULT_PIN, [obj1, obj2]]);
  });

  it('can unPinAllObjects', async () => {
    await ParseObject.unPinAllObjects();
    expect(mockLocalDatastore.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore.unPinWithName.mock.calls[0]).toEqual([DEFAULT_PIN]);
  });

  it('can unPinAllObjectsWithName', async () => {
    await ParseObject.unPinAllObjectsWithName('123');
    expect(mockLocalDatastore.unPinWithName).toHaveBeenCalledTimes(1);
    expect(mockLocalDatastore.unPinWithName.mock.calls[0]).toEqual([PIN_PREFIX + '123']);
  });

  it('cannot pin when localDatastore disabled', async () => {
    mockLocalDatastore.isEnabled = false;
    const name = 'test_pin';
    const obj = new ParseObject('Item');
    try {
      await obj.pin();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await obj.unPin();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await obj.isPinned();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await obj.pinWithName();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await obj.unPinWithName();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await obj.fetchFromLocalDatastore();
    } catch (error) {
      expect(error.message).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.pinAll([obj]);
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.unPinAll([obj]);
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.pinAllWithName(name, [obj]);
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.unPinAllWithName(name, [obj]);
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.unPinAllObjects();
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
    try {
      await ParseObject.unPinAllObjectsWithName(name);
    } catch (error) {
      expect(error).toBe('Parse.enableLocalDatastore() must be called first');
    }
  });
  it('gets id for new object when cascadeSave = false and singleInstance = false', (done) => {
    ParseObject.disableSingleInstance();
    CoreManager.getRESTController()._setXHR(
      mockXHR([{
        status: 200,
        response: {
          objectId: 'P5',
        }
      }])
    );
    const p = new ParseObject('Person');
    p.save(null, {cascadeSave: false}).then((obj) => {
      expect(obj).toBe(p);
      expect(obj.id).toBe('P5');
      done();
    });
  })
});
