/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../arrayContainsObject');
jest.dontMock('../encode');
jest.dontMock('../decode');
jest.dontMock('../ParseOp');
jest.dontMock('../unique');

let localCount = 0;
const mockObject = function(className, id) {
  this.className = className;
  this.id = id;
  if (!id) {
    this._localId = 'local' + localCount++;
  }
}
mockObject.prototype._getId = function() {
  return this.id || this._localId;
}
mockObject.fromJSON = function(json) {
  return new mockObject(json.className, json.objectId);
}
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

const mockRelation = function(parent, key) {
  this.parent = parent;
  this.key = key;
}
jest.setMock('../ParseRelation', mockRelation);

const ParseRelation = require('../ParseRelation');
const ParseObject = require('../ParseObject');
const ParseOp = require('../ParseOp');
const {
  Op,
  SetOp,
  UnsetOp,
  IncrementOp,
  AddOp,
  AddUniqueOp,
  RemoveOp,
  RelationOp,
  opFromJSON,
} = ParseOp;

describe('ParseOp', () => {
  it('base class', () => {
    const op = new Op();
    expect(op.applyTo instanceof Function).toBe(true);
    expect(op.mergeWith instanceof Function).toBe(true);
    expect(op.toJSON instanceof Function).toBe(true);
    expect(op.applyTo()).toBeUndefined();
    expect(op.mergeWith()).toBeUndefined();
    expect(op.toJSON()).toBeUndefined();
    expect(opFromJSON({})).toBe(null);
    expect(opFromJSON({ __op: 'Unknown' })).toBe(null);
    expect(opFromJSON(op.toJSON())).toBe(null);
  });

  it('is extended by all Ops', () => {
    expect(new SetOp(1) instanceof Op).toBe(true);
    expect(new UnsetOp() instanceof Op).toBe(true);
    expect(new IncrementOp(1) instanceof Op).toBe(true);
    expect(new AddOp(1) instanceof Op).toBe(true);
    expect(new AddUniqueOp(1) instanceof Op).toBe(true);
    expect(new RemoveOp(1) instanceof Op).toBe(true);
  });

  it('can create and apply Set Ops', () => {
    const set = new SetOp(14);

    expect(set.applyTo(null)).toBe(14);
    expect(set.applyTo(undefined)).toBe(14);
    expect(set.applyTo(41)).toBe(14);
    expect(set.applyTo('14')).toBe(14);

    // SetOp overrides all
    expect(set.mergeWith(new SetOp(12))._value).toBe(14);
    expect(set.mergeWith(new UnsetOp())._value).toBe(14);
    expect(set.mergeWith(new IncrementOp(1))._value).toBe(14);
    expect(set.mergeWith(new AddOp(1))._value).toBe(14);
    expect(set.mergeWith(new AddUniqueOp(1))._value).toBe(14);
    expect(set.mergeWith(new RemoveOp(1))._value).toBe(14);

    expect(set.toJSON()).toBe(14);
  });

  it('can create and apply Unset Ops', () => {
    const unset = new UnsetOp();

    expect(unset.applyTo(null)).toBe(undefined);
    expect(unset.applyTo(undefined)).toBe(undefined);
    expect(unset.applyTo(14)).toBe(undefined);
    expect(unset.applyTo('14')).toBe(undefined);

    // UnsetOp overrides all
    expect(unset.mergeWith(new SetOp(12)) instanceof UnsetOp).toBe(true);
    expect(unset.mergeWith(new UnsetOp()) instanceof UnsetOp).toBe(true);
    expect(unset.mergeWith(new IncrementOp(1)) instanceof UnsetOp).toBe(true);
    expect(unset.mergeWith(new AddOp(1)) instanceof UnsetOp).toBe(true);
    expect(unset.mergeWith(new AddUniqueOp(1)) instanceof UnsetOp).toBe(true);
    expect(unset.mergeWith(new RemoveOp(1)) instanceof UnsetOp).toBe(true);

    expect(unset.toJSON()).toEqual({ __op: 'Delete' });
    expect(opFromJSON(unset.toJSON())).toEqual(unset);
  });

  it('can create and apply Increment Ops', () => {
    expect(function() { new IncrementOp(); }).toThrow(
      'Increment Op must be initialized with a numeric amount.'
    );
    expect(function() { new IncrementOp('abc'); }).toThrow(
      'Increment Op must be initialized with a numeric amount.'
    );
    const inc = new IncrementOp(1);
    expect(inc.applyTo.bind(inc, null)).toThrow(
      'Cannot increment a non-numeric value.'
    );
    expect(inc.applyTo.bind(inc, 'abc')).toThrow(
      'Cannot increment a non-numeric value.'
    );
    expect(inc.applyTo(1)).toBe(2);
    expect(inc.applyTo(-40)).toBe(-39);

    const bigInc = new IncrementOp(99);
    expect(bigInc.applyTo(-98)).toBe(1);
    expect(bigInc.applyTo()).toBe(99);

    expect(inc.toJSON()).toEqual({ __op: 'Increment', amount: 1 });
    expect(bigInc.toJSON()).toEqual({ __op: 'Increment', amount: 99 });
    expect(opFromJSON(bigInc.toJSON())).toEqual(bigInc);

    let merge = inc.mergeWith();
    expect(merge instanceof IncrementOp).toBe(true);
    expect(merge._amount).toBe(1);

    merge = inc.mergeWith(new SetOp(11));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toBe(12);

    merge = inc.mergeWith(new UnsetOp());
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toBe(1);

    merge = inc.mergeWith(bigInc);
    expect(merge instanceof IncrementOp).toBe(true);
    expect(merge._amount).toBe(100);

    expect(inc.mergeWith.bind(inc, new AddOp(1))).toThrow(
      'Cannot merge Increment Op with the previous Op'
    );
    expect(inc.mergeWith.bind(inc, new AddUniqueOp(1))).toThrow(
      'Cannot merge Increment Op with the previous Op'
    );
    expect(inc.mergeWith.bind(inc, new RemoveOp(1))).toThrow(
      'Cannot merge Increment Op with the previous Op'
    );
  });

  it('can create and apply Add Ops', () => {
    const add = new AddOp('element');

    expect(add.applyTo(null)).toEqual(['element']);
    expect(add.applyTo(undefined)).toEqual(['element']);
    expect(function() { add.applyTo('abc'); }).toThrow(
      'Cannot add elements to a non-array value'
    );
    expect(add.applyTo([12])).toEqual([12, 'element']);

    expect(add.toJSON()).toEqual({ __op: 'Add', objects: ['element'] });
    expect(opFromJSON(add.toJSON())).toEqual(add);

    const addMany = new AddOp([1, 2, 2, 3, 4, 5]);

    expect(addMany.applyTo([-2, -1, 0])).toEqual([-2, -1, 0, 1, 2, 2, 3, 4, 5]);

    expect(addMany.toJSON()).toEqual({ __op: 'Add', objects: [1, 2, 2, 3, 4, 5] });

    let merge = add.mergeWith(null);
    expect(merge instanceof AddOp).toBe(true);
    expect(merge._value).toEqual(['element']);

    merge = add.mergeWith(new SetOp(['an']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an', 'element']);

    merge = add.mergeWith(new UnsetOp(['an']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['element']);

    merge = add.mergeWith(addMany);
    expect(merge instanceof AddOp).toBe(true);
    expect(merge._value).toEqual([1, 2, 2, 3, 4, 5, 'element']);

    expect(add.mergeWith.bind(add, new IncrementOp(1))).toThrow(
      'Cannot merge Add Op with the previous Op'
    );
    expect(add.mergeWith.bind(add, new AddUniqueOp(1))).toThrow(
      'Cannot merge Add Op with the previous Op'
    );
    expect(add.mergeWith.bind(add, new RemoveOp(1))).toThrow(
      'Cannot merge Add Op with the previous Op'
    );
  });

  it('can create and apply AddUnique Ops', () => {
    const add = new AddUniqueOp('element');

    expect(add.applyTo(null)).toEqual(['element']);
    expect(add.applyTo(undefined)).toEqual(['element']);
    expect(function() { add.applyTo('abc'); }).toThrow(
      'Cannot add elements to a non-array value'
    );
    expect(add.applyTo([12])).toEqual([12, 'element']);
    expect(add.applyTo([12, 'element'])).toEqual([12, 'element']);

    expect(add.toJSON()).toEqual({ __op: 'AddUnique', objects: ['element'] });
    expect(opFromJSON(add.toJSON())).toEqual(add);

    const addMany = new AddUniqueOp([1, 2, 2, 3, 4, 5]);

    expect(addMany.applyTo()).toEqual([1, 2, 3, 4, 5]);

    expect(addMany.applyTo([-2, 1, 4, 0])).toEqual([-2, 1, 4, 0, 2, 3, 5]);

    expect(addMany.toJSON()).toEqual({
      __op: 'AddUnique',
      objects: [1, 2, 3, 4, 5]
    });

    let merge = add.mergeWith(null);
    expect(merge instanceof AddUniqueOp).toBe(true);
    expect(merge._value).toEqual(['element']);

    merge = add.mergeWith(new SetOp(['an', 'element']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an', 'element']);

    merge = add.mergeWith(new UnsetOp(['an']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['element']);

    merge = new AddUniqueOp(['an', 'element'])
      .mergeWith(new AddUniqueOp([1, 2, 'element', 3]));
    expect(merge instanceof AddUniqueOp).toBe(true);
    expect(merge._value).toEqual([1, 2, 'element', 3, 'an']);

    expect(add.mergeWith.bind(add, new IncrementOp(1))).toThrow(
      'Cannot merge AddUnique Op with the previous Op'
    );
    expect(add.mergeWith.bind(add, new AddOp(1))).toThrow(
      'Cannot merge AddUnique Op with the previous Op'
    );
    expect(add.mergeWith.bind(add, new RemoveOp(1))).toThrow(
      'Cannot merge AddUnique Op with the previous Op'
    );

    let addObjects = new AddUniqueOp(new ParseObject('Item', 'i2'));
    expect(addObjects.applyTo([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
    ])).toEqual([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
    ]);

    addObjects = new AddUniqueOp(new ParseObject('Item', 'i2'));
    expect(addObjects.applyTo([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i3'),
    ])).toEqual([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i3'),
      new ParseObject('Item', 'i2'),
    ]);
  });

  it('can create and apply Remove Ops', () => {
    const rem = new RemoveOp('element');

    expect(rem.applyTo(null)).toEqual([]);
    expect(rem.applyTo(undefined)).toEqual([]);
    expect(function() { rem.applyTo('abc'); }).toThrow(
      'Cannot remove elements from a non-array value'
    );
    expect(rem.applyTo([12])).toEqual([12]);
    expect(rem.applyTo([12, 'element'])).toEqual([12]);
    expect(rem.applyTo(['element', 12, 'element', 'element'])).toEqual([12]);

    expect(rem.toJSON()).toEqual({ __op: 'Remove', objects: ['element'] });
    expect(opFromJSON(rem.toJSON())).toEqual(rem);

    const removeMany = new RemoveOp([1, 2, 2, 3, 4, 5]);

    expect(removeMany.applyTo([-2, 1, 4, 0])).toEqual([-2, 0]);

    expect(removeMany.toJSON()).toEqual({
      __op: 'Remove',
      objects: [1, 2, 3, 4, 5]
    });

    let merge = rem.mergeWith(null);
    expect(merge instanceof RemoveOp).toBe(true);
    expect(merge._value).toEqual(['element']);

    merge = rem.mergeWith(new SetOp(['an', 'element']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an']);

    merge = rem.mergeWith(new UnsetOp(['an']));
    expect(merge instanceof UnsetOp).toBe(true);
    expect(merge._value).toEqual(undefined);

    merge = new RemoveOp([1, 2, 3]).mergeWith(new RemoveOp([2, 4]));
    expect(merge instanceof RemoveOp).toBe(true);
    expect(merge._value).toEqual([2, 4, 1, 3]);

    expect(rem.mergeWith.bind(rem, new IncrementOp(1))).toThrow(
      'Cannot merge Remove Op with the previous Op'
    );

    const removeObjects = new RemoveOp(new ParseObject('Item', 'i2'));
    const previousOp = new RemoveOp(new ParseObject('Item', 'i5'));
    expect(removeObjects.applyTo([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
    ])).toEqual([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i3'),
    ]);
    expect(removeObjects.applyTo([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i2'),
    ])).toEqual([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i3'),
    ]);
    const merged = removeObjects.mergeWith(previousOp);
    expect(merged._value).toEqual([
      new ParseObject('Item', 'i5'),
      new ParseObject('Item', 'i2'),
    ]);
  });

  it('can create and apply Relation Ops', () => {
    let r = new RelationOp();
    expect(r.relationsToAdd).toBe(undefined);
    expect(r.relationsToRemove).toBe(undefined);

    r = new RelationOp([], []);
    expect(r.relationsToAdd).toEqual([]);
    expect(r.relationsToRemove).toEqual([]);

    expect(function() {
      new RelationOp([new ParseObject('Item')], []);
    }).toThrow(
      'You cannot add or remove an unsaved Parse Object from a relation'
    );

    expect(function() {
      const a = new ParseObject('Item');
      a.id = 'I1';
      const b = new ParseObject('Delivery');
      b.id = 'D1';
      new RelationOp([a, b]);
    }).toThrow(
      'Tried to create a Relation with 2 different object types: Item and Delivery.'
    );

    const o = new ParseObject('Item');
    o.id = 'I1';
    const o2 = new ParseObject('Item');
    o2.id = 'I2'
    r = new RelationOp([o, o, o2], []);
    expect(r.relationsToAdd).toEqual(['I1', 'I2']);
    expect(r.relationsToRemove).toEqual([]);
    expect(r._targetClassName).toBe('Item');
    expect(r.toJSON()).toEqual({
      __op: 'AddRelation',
      objects: [
        { __type: 'Pointer', objectId: 'I1', className: 'Item' },
        { __type: 'Pointer', objectId: 'I2', className: 'Item' }
      ]
    });
    expect(opFromJSON(r.toJSON())).toEqual(r);

    const o3 = new ParseObject('Item');
    o3.id = 'I3';
    const r2 = new RelationOp([], [o3, o, o]);
    expect(r2.relationsToAdd).toEqual([]);
    expect(r2.relationsToRemove).toEqual(['I3', 'I1']);
    expect(r2.toJSON()).toEqual({
      __op: 'RemoveRelation',
      objects: [
        { __type: 'Pointer', objectId: 'I3', className: 'Item' },
        { __type: 'Pointer', objectId: 'I1', className: 'Item' }
      ]
    });
    expect(opFromJSON(r2.toJSON())).toEqual(r2);

    const rel = r.applyTo(undefined, { className: 'Delivery', id: 'D3' }, 'shipments');
    expect(rel.targetClassName).toBe('Item');
    expect(r2.applyTo(rel, { className: 'Delivery', id: 'D3' })).toBe(rel);

    const relLocal = r.applyTo(undefined, { className: 'Delivery', id: 'localD4' }, 'shipments');
    expect(relLocal.parent._localId).toBe('localD4');

    expect(r.applyTo.bind(r, 'string')).toThrow(
      'Relation cannot be applied to a non-relation field'
    );
    expect(r.applyTo.bind(r)).toThrow(
      'Cannot apply a RelationOp without either a previous value, or an object and a key'
    );
    const p = new ParseObject('Person');
    p.id = 'P4';
    const r3 = new RelationOp([p]);
    expect(r3.applyTo.bind(r3, rel, { className: 'Delivery', id: 'D3' }, 'packages'))
      .toThrow('Related object must be a Item, but a Person was passed in.');

    const noRelation = new ParseRelation(null, null);
    r3.applyTo(noRelation, { className: 'Delivery', id: 'D3' }, 'packages');
    expect(noRelation.targetClassName).toEqual(r3._targetClassName);

    expect(r.mergeWith(null)).toBe(r);
    expect(r.mergeWith.bind(r, new UnsetOp())).toThrow(
      'You cannot modify a relation after deleting it.'
    );
    expect(r.mergeWith.bind(r, new SetOp(12))).toThrow(
      'Cannot merge Relation Op with the previous Op'
    );

    const merged = r2.mergeWith(r);
    expect(merged.toJSON()).toEqual({
      __op: 'Batch',
      ops: [
        {
          __op: 'AddRelation',
          objects: [ { __type: 'Pointer', objectId: 'I2', className: 'Item' } ]
        }, {
          __op: 'RemoveRelation',
          objects: [
            { __type: 'Pointer', objectId: 'I3', className: 'Item' },
            { __type: 'Pointer', objectId: 'I1', className: 'Item' }
          ]
        }
      ]
    });
    expect(opFromJSON(merged.toJSON())).toEqual(merged);
  });

  it('can merge Relation Op with the previous Op', () => {
    const r = new RelationOp();
    const relation = new ParseRelation(null, null);
    const set = new SetOp(relation);
    expect(r.mergeWith(set)).toEqual(r);

    const a = new ParseObject('Item');
    a.id = 'I1';
    const b = new ParseObject('Item');
    b.id = 'D1';
    const r1 = new RelationOp([a, b], []);
    const r2 = new RelationOp([], [b]);
    expect(() => {
      r.mergeWith(r1)
    }).toThrow('Related object must be of class Item, but null was passed in.');
    expect(r1.mergeWith(r2)).toEqual(r1);
    expect(r2.mergeWith(r1)).toEqual(new RelationOp([a], [b]));
  });

  it('opFromJSON Relation', () => {
    const r = new RelationOp([], []);
    expect(opFromJSON({ __op: 'AddRelation', objects: '' })).toEqual(r);
    expect(opFromJSON({ __op: 'RemoveRelation', objects: '' })).toEqual(r);
  });
});
