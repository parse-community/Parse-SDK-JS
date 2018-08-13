/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../encode');
jest.dontMock('../ParseRelation');
jest.dontMock('../ParseOp');
jest.dontMock('../unique');

const mockStore = {};
const mockObject = function(className) {
  this.className = className;
  this.ops = {};
};
mockObject.registerSubclass = function() {};
mockObject.prototype = {
  _getId() {
    return this.id;
  },
  set(key, value) {
    if (!mockStore[this.id]) {
      mockStore[this.id] = {};
    }
    if (!mockStore[this.id][key]) {
      mockStore[this.id][key] = [];
    }
    mockStore[this.id][key].push(value);
  },
  relation(key) {
    if (mockStore[this.id][key]) {
      return this.get(key);
    }
    return new ParseRelation(this, key);
  },
  get(key) {
    return this.op(key).applyTo(
      null,
      { className: this.className, id: this.id },
      key
    );
  },
  op(key) {
    let finalOp = undefined;
    for (let i = 0; i < mockStore[this.id][key].length; i++) {
      finalOp = mockStore[this.id][key][i].mergeWith(finalOp);
    }
    return finalOp;
  }
};
jest.setMock('../ParseObject', mockObject);

const mockQuery = function(className) {
  this.className = className;
  this.where = {};
  this._extraOptions = {};
};
mockQuery.prototype = {
  _addCondition(key, comparison, value) {
    this.where[key] = this.where[key] || {};
    this.where[key][comparison] = value;
  }
};
jest.setMock('../ParseQuery', mockQuery);

const ParseObject = require('../ParseObject');
const ParseRelation = require('../ParseRelation').default;

describe('ParseRelation', () => {
  it('can be constructed with a reference parent and key', () => {
    const parent = new ParseObject('Item');
    parent.id = 'I1';
    const r = new ParseRelation(parent, 'shipments');
    expect(r.parent).toBe(parent);
    expect(r.key).toBe('shipments');
    expect(r.targetClassName).toBe(null);
  });

  it('can add objects to a relation', () => {
    const parent = new ParseObject('Item');
    parent.id = 'I1';
    const r = new ParseRelation(parent, 'shipments');
    const o = new ParseObject('Delivery');
    o.id = 'D1';
    const p = r.add(o);
    expect(p).toBeTruthy();
    expect(r.toJSON()).toEqual({
      __type: 'Relation',
      className: 'Delivery'
    });
    expect(parent.op('shipments').toJSON()).toEqual({
      __op: 'AddRelation',
      objects: [
        { __type: 'Pointer', objectId: 'D1', className: 'Delivery' }
      ]
    });

    const o2 = new ParseObject('Delivery');
    o2.id = 'D2';
    const o3 = new ParseObject('Delivery');
    o3.id = 'D3';
    r.add([o2, o3]);
    expect(r.toJSON()).toEqual({
      __type: 'Relation',
      className: 'Delivery'
    });
    expect(parent.op('shipments').toJSON()).toEqual({
      __op: 'AddRelation',
      objects: [
        { __type: 'Pointer', objectId: 'D1', className: 'Delivery' },
        { __type: 'Pointer', objectId: 'D2', className: 'Delivery' },
        { __type: 'Pointer', objectId: 'D3', className: 'Delivery' },
      ]
    });
  });

  it('can remove objects from a relation', () => {
    const parent = new ParseObject('Item');
    parent.id = 'I2';
    const r = new ParseRelation(parent, 'shipments');
    const o = new ParseObject('Delivery');
    o.id = 'D1';
    r.remove(o);
    expect(r.toJSON()).toEqual({
      __type: 'Relation',
      className: 'Delivery'
    });
    expect(parent.op('shipments').toJSON()).toEqual({
      __op: 'RemoveRelation',
      objects: [
        { __type: 'Pointer', objectId: 'D1', className: 'Delivery' }
      ]
    });

    const o2 = new ParseObject('Delivery');
    o2.id = 'D2';
    const o3 = new ParseObject('Delivery');
    o3.id = 'D3';
    r.remove([o2, o3]);
    expect(r.toJSON()).toEqual({
      __type: 'Relation',
      className: 'Delivery'
    });
    expect(parent.op('shipments').toJSON()).toEqual({
      __op: 'RemoveRelation',
      objects: [
        { __type: 'Pointer', objectId: 'D1', className: 'Delivery' },
        { __type: 'Pointer', objectId: 'D2', className: 'Delivery' },
        { __type: 'Pointer', objectId: 'D3', className: 'Delivery' },
      ]
    });
  });

  it('can generate a query for relation objects', () => {
    const parent = new ParseObject('Item');
    parent.id = 'I1';
    let r = new ParseRelation(parent, 'shipments');
    let q = r.query();
    expect(q.className).toBe('Item');
    expect(q._extraOptions).toEqual({
      redirectClassNameForKey: 'shipments'
    });
    expect(q.where).toEqual({
      $relatedTo: {
        object: {
          __type: 'Pointer',
          objectId: 'I1',
          className: 'Item'
        },
        key: 'shipments'
      }
    });

    r = new ParseRelation(parent, 'shipments');
    const o = new ParseObject('Delivery');
    o.id = 'D1';
    r.add(o);
    q = r.query();
    expect(q.className).toBe('Delivery');
    expect(q.where).toEqual({
      $relatedTo: {
        object: {
          __type: 'Pointer',
          className: 'Item',
          objectId: 'I1'
        },
        key: 'shipments'
      }
    });
  });

  it('can ensure it relates to the correct parent and key', () => {
    const parent = new ParseObject('Item');
    parent.id = 'I3';
    const r = new ParseRelation(parent, 'shipments');
    expect(r._ensureParentAndKey.bind(r, new ParseObject('Item'), 'shipments'))
      .toThrow('Internal Error. Relation retrieved from two different Objects.');
    expect(r._ensureParentAndKey.bind(r, parent, 'partners'))
      .toThrow('Internal Error. Relation retrieved from two different keys.');
    expect(r._ensureParentAndKey.bind(r, parent, 'shipments')).not.toThrow();
  });
});
