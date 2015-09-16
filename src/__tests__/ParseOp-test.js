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
jest.dontMock('../ParseOp');
jest.dontMock('../unique');

var localCount = 0;
var mockObject = function(className, id) {
  this.className = className;
  this.id = id;
  if (!id) {
    this._localId = 'local' + localCount++;
  }
}
mockObject.prototype._getId = function() {
  return this.id || this._localId;
}
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

var ParseObject = require('../ParseObject');
var ParseOp = require('../ParseOp');
var {
  Op,
  SetOp,
  UnsetOp,
  IncrementOp,
  AddOp,
  AddUniqueOp,
  RemoveOp,
  RelationOp
} = ParseOp;

describe('ParseOp', () => {
  it('is extended by all Ops', () => {
    expect(new SetOp(1) instanceof Op).toBe(true);
    expect(new UnsetOp() instanceof Op).toBe(true);
    expect(new IncrementOp(1) instanceof Op).toBe(true);
    expect(new AddOp(1) instanceof Op).toBe(true);
    expect(new AddUniqueOp(1) instanceof Op).toBe(true);
    expect(new RemoveOp(1) instanceof Op).toBe(true);
  });

  it('can create and apply Set Ops', () => {
    var set = new SetOp(14);

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
    var unset = new UnsetOp();

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
  });

  it('can create and apply Increment Ops', () => {
    expect(function() { new IncrementOp(); }).toThrow(
      'Increment Op must be initialized with a numeric amount.'
    );
    expect(function() { new IncrementOp('abc'); }).toThrow(
      'Increment Op must be initialized with a numeric amount.'
    );
    var inc = new IncrementOp(1);
    expect(inc.applyTo.bind(inc, null)).toThrow(
      'Cannot increment a non-numeric value.'
    );
    expect(inc.applyTo.bind(inc, 'abc')).toThrow(
      'Cannot increment a non-numeric value.'
    );
    expect(inc.applyTo(1)).toBe(2);
    expect(inc.applyTo(-40)).toBe(-39);

    var bigInc = new IncrementOp(99);
    expect(bigInc.applyTo(-98)).toBe(1);

    expect(inc.toJSON()).toEqual({ __op: 'Increment', amount: 1 });
    expect(bigInc.toJSON()).toEqual({ __op: 'Increment', amount: 99 });

    var merge = inc.mergeWith(new SetOp(11));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toBe(12);
    merge = inc.mergeWith(new UnsetOp());
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toBe(1);

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
    var add = new AddOp('element');

    expect(add.applyTo(null)).toEqual(['element']);
    expect(add.applyTo(undefined)).toEqual(['element']);
    expect(function() { add.applyTo('abc'); }).toThrow(
      'Cannot add elements to a non-array value'
    );
    expect(add.applyTo([12])).toEqual([12, 'element']);

    expect(add.toJSON()).toEqual({ __op: 'Add', objects: ['element'] });

    var addMany = new AddOp([1, 2, 2, 3, 4, 5]);

    expect(addMany.applyTo([-2, -1, 0])).toEqual([-2, -1, 0, 1, 2, 2, 3, 4, 5]);

    expect(addMany.toJSON()).toEqual({ __op: 'Add', objects: [1, 2, 2, 3, 4, 5] });

    var merge = add.mergeWith(new SetOp(['an']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an', 'element']);

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
    var add = new AddUniqueOp('element');

    expect(add.applyTo(null)).toEqual(['element']);
    expect(add.applyTo(undefined)).toEqual(['element']);
    expect(function() { add.applyTo('abc'); }).toThrow(
      'Cannot add elements to a non-array value'
    );
    expect(add.applyTo([12])).toEqual([12, 'element']);
    expect(add.applyTo([12, 'element'])).toEqual([12, 'element']);

    expect(add.toJSON()).toEqual({ __op: 'AddUnique', objects: ['element'] });

    var addMany = new AddUniqueOp([1, 2, 2, 3, 4, 5]);

    expect(addMany.applyTo()).toEqual([1, 2, 3, 4, 5]);

    expect(addMany.applyTo([-2, 1, 4, 0])).toEqual([-2, 1, 4, 0, 2, 3, 5]);

    expect(addMany.toJSON()).toEqual({
      __op: 'AddUnique',
      objects: [1, 2, 3, 4, 5]
    });

    var merge = add.mergeWith(new SetOp(['an', 'element']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an', 'element']);

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

    var addObjects = new AddUniqueOp(new ParseObject('Item', 'i2'));
    expect(addObjects.applyTo([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
    ])).toEqual([
      new ParseObject('Item', 'i1'),
      new ParseObject('Item', 'i2'),
      new ParseObject('Item', 'i3'),
    ]);
  });

  it('can create and apply Remove Ops', () => {
    var rem = new RemoveOp('element');

    expect(rem.applyTo(null)).toEqual([]);
    expect(rem.applyTo(undefined)).toEqual([]);
    expect(function() { rem.applyTo('abc'); }).toThrow(
      'Cannot remove elements from a non-array value'
    );
    expect(rem.applyTo([12])).toEqual([12]);
    expect(rem.applyTo([12, 'element'])).toEqual([12]);
    expect(rem.applyTo(['element', 12, 'element', 'element'])).toEqual([12]);

    expect(rem.toJSON()).toEqual({ __op: 'Remove', objects: ['element'] });

    var removeMany = new RemoveOp([1, 2, 2, 3, 4, 5]);

    expect(removeMany.applyTo([-2, 1, 4, 0])).toEqual([-2, 0]);

    expect(removeMany.toJSON()).toEqual({
      __op: 'Remove',
      objects: [1, 2, 3, 4, 5]
    });

    var merge = rem.mergeWith(new SetOp(['an', 'element']));
    expect(merge instanceof SetOp).toBe(true);
    expect(merge._value).toEqual(['an']);

    merge = new RemoveOp([1, 2, 3]).mergeWith(new RemoveOp([2, 4]));
    expect(merge instanceof RemoveOp).toBe(true);
    expect(merge._value).toEqual([2, 4, 1, 3]);

    var removeObjects = new RemoveOp(new ParseObject('Item', 'i2'));
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
  });

  it('can create and apply Relation Ops', () => {
    var r = new RelationOp();
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
      var a = new ParseObject('Item');
      a.id = 'I1';
      var b = new ParseObject('Delivery');
      b.id = 'D1';
      new RelationOp([a, b]);
    }).toThrow(
      'Tried to create a Relation with 2 different object types: Item and Delivery.'
    );

    var o = new ParseObject('Item');
    o.id = 'I1';
    var o2 = new ParseObject('Item');
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

    var o3 = new ParseObject('Item');
    o3.id = 'I3';
    var r2 = new RelationOp([], [o3, o, o]);
    expect(r2.relationsToAdd).toEqual([]);
    expect(r2.relationsToRemove).toEqual(['I3', 'I1']);
    expect(r2.toJSON()).toEqual({
      __op: 'RemoveRelation',
      objects: [
        { __type: 'Pointer', objectId: 'I3', className: 'Item' },
        { __type: 'Pointer', objectId: 'I1', className: 'Item' }
      ]
    });

    var rel = r.applyTo(undefined, { className: 'Delivery', id: 'D3' }, 'shipments');
    expect(rel.targetClassName).toBe('Item');
    expect(r2.applyTo(rel, { className: 'Delivery', id: 'D3' })).toBe(rel);
    expect(r.applyTo.bind(r, 'string')).toThrow(
      'Relation cannot be applied to a non-relation field'
    );
    var p = new ParseObject('Person');
    p.id = 'P4';
    var r3 = new RelationOp([p]);
    expect(r3.applyTo.bind(r3, rel, { className: 'Delivery', id: 'D3' }, 'packages'))
      .toThrow('Related object must be a Item, but a Person was passed in.');

    expect(r.mergeWith(null)).toBe(r);
    expect(r.mergeWith.bind(r, new UnsetOp())).toThrow(
      'You cannot modify a relation after deleting it.'
    );
    expect(r.mergeWith.bind(r, new SetOp(12))).toThrow(
      'Cannot merge Relation Op with the previous Op'
    );

    var merged = r2.mergeWith(r);
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
  });
});
