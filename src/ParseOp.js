/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import arrayContainsObject from './arrayContainsObject';
import decode from './decode';
import encode from './encode';
import ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';
import unique from './unique';

export function opFromJSON(json: { [key: string]: any }): ?Op {
  if (!json || !json.__op) {
    return null;
  }
  switch (json.__op) {
    case 'Delete':
      return new UnsetOp();
    case 'Increment':
      return new IncrementOp(json.amount);
    case 'Add':
      return new AddOp(decode(json.objects));
    case 'AddUnique':
      return new AddUniqueOp(decode(json.objects));
    case 'Remove':
      return new RemoveOp(decode(json.objects));
    case 'AddRelation':
      var toAdd = decode(json.objects);
      if (!Array.isArray(toAdd)) {
        return new RelationOp([], []);
      }
      return new RelationOp(toAdd, []);
    case 'RemoveRelation':
      var toRemove = decode(json.objects);
      if (!Array.isArray(toRemove)) {
        return new RelationOp([], []);
      }
      return new RelationOp([], toRemove);
    case 'Batch':
      var toAdd = [];
      var toRemove = [];
      for (var i = 0; i < json.ops.length; i++) {
        if (json.ops[i].__op === 'AddRelation') {
          toAdd = toAdd.concat(decode(json.ops[i].objects));
        } else if (json.ops[i].__op === 'RemoveRelation') {
          toRemove = toRemove.concat(decode(json.ops[i].objects));
        }
      }
      return new RelationOp(toAdd, toRemove);
  }
  return null;
}

export class Op {
  // Empty parent class
  applyTo(value: mixed): mixed {}
  mergeWith(previous: Op): ?Op {}
  toJSON(): mixed {}
}

export class SetOp extends Op {
  _value: ?mixed;

  constructor(value: mixed) {
    super();
    this._value = value;
  }

  applyTo(value: mixed): mixed {
    return this._value;
  }

  mergeWith(previous: Op): SetOp {
    return new SetOp(this._value);
  }

  toJSON() {
    return encode(this._value, false, true);
  }
}

export class UnsetOp extends Op {
  applyTo(value: mixed) {
    return undefined;
  }

  mergeWith(previous: Op): UnsetOp {
    return new UnsetOp();
  }

  toJSON(): { __op: string } {
    return { __op: 'Delete' };
  }
}

export class IncrementOp extends Op {
  _amount: number;

  constructor(amount: number) {
    super();
    if (typeof amount !== 'number') {
      throw new TypeError(
        'Increment Op must be initialized with a numeric amount.'
      );
    }
    this._amount = amount;
  }

  applyTo(value: ?mixed): number {
    if (typeof value === 'undefined') {
      return this._amount;
    }
    if (typeof value !== 'number') {
      throw new TypeError('Cannot increment a non-numeric value.');
    }
    return this._amount + value;
  }

  mergeWith(previous: Op): Op {
    if (!previous) {
      return this;
    }
    if (previous instanceof SetOp) {
      return new SetOp(this.applyTo(previous._value));
    }
    if (previous instanceof UnsetOp) {
      return new SetOp(this._amount);
    }
    if (previous instanceof IncrementOp) {
      return new IncrementOp(this.applyTo(previous._amount));
    }
    throw new Error('Cannot merge Increment Op with the previous Op');
  }

  toJSON(): { __op: string; amount: number } {
    return { __op: 'Increment', amount: this._amount };
  }
}

export class AddOp extends Op {
  _value: Array<mixed>;

  constructor(value: mixed | Array<mixed>) {
    super();
    this._value = (Array.isArray(value) ? value : [value]);
  }

  applyTo(value: mixed): Array<mixed> {
    if (value == null) {
      return this._value;
    }
    if (Array.isArray(value)) {
      return value.concat(this._value);
    }
    throw new Error('Cannot add elements to a non-array value');
  }

  mergeWith(previous: Op): Op {
    if (!previous) {
      return this;
    }
    if (previous instanceof SetOp) {
      return new SetOp(this.applyTo(previous._value));
    }
    if (previous instanceof UnsetOp) {
      return new SetOp(this._value);
    }
    if (previous instanceof AddOp) {
      return new AddOp(this.applyTo(previous._value));
    }
    throw new Error('Cannot merge Add Op with the previous Op');
  }

  toJSON(): { __op: string; objects: mixed } {
    return { __op: 'Add', objects: encode(this._value, false, true) };
  }
}

export class AddUniqueOp extends Op {
  _value: Array<mixed>;

  constructor(value: mixed | Array<mixed>) {
    super();
    this._value = unique(Array.isArray(value) ? value : [value]);
  }

  applyTo(value: mixed | Array<mixed>): Array<mixed> {
    if (value == null) {
      return this._value || [];
    }
    if (Array.isArray(value)) {
      // copying value lets Flow guarantee the pointer isn't modified elsewhere
      var valueCopy = value;
      var toAdd = [];
      this._value.forEach((v) => {
        if (v instanceof ParseObject) {
          if (!arrayContainsObject(valueCopy, v)) {
            toAdd.push(v);
          }
        } else {
          if (valueCopy.indexOf(v) < 0) {
            toAdd.push(v);
          }
        }
      })
      return value.concat(toAdd);
    }
    throw new Error('Cannot add elements to a non-array value');
  }

  mergeWith(previous: Op): Op {
    if (!previous) {
      return this;
    }
    if (previous instanceof SetOp) {
      return new SetOp(this.applyTo(previous._value));
    }
    if (previous instanceof UnsetOp) {
      return new SetOp(this._value);
    }
    if (previous instanceof AddUniqueOp) {
      return new AddUniqueOp(this.applyTo(previous._value));
    }
    throw new Error('Cannot merge AddUnique Op with the previous Op');
  }

  toJSON(): { __op: string; objects: mixed } {
    return { __op: 'AddUnique', objects: encode(this._value, false, true) };
  }
}

export class RemoveOp extends Op {
  _value: Array<mixed>;

  constructor(value: mixed | Array<mixed>) {
    super();
    this._value = unique(Array.isArray(value) ? value : [value]);
  }

  applyTo(value: mixed | Array<mixed>): Array<mixed> {
    if (value == null) {
      return [];
    }
    if (Array.isArray(value)) {
      var i = value.indexOf(this._value);
      var removed = value.concat([]);
      for (var i = 0; i < this._value.length; i++) {
        var index = removed.indexOf(this._value[i]);
        while (index > -1) {
          removed.splice(index, 1);
          index = removed.indexOf(this._value[i]);
        }
        if (this._value[i] instanceof ParseObject && this._value[i].id) {
          for (var j = 0; j < removed.length; j++) {
            if (removed[j] instanceof ParseObject &&
              this._value[i].id === removed[j].id
            ) {
              removed.splice(j, 1);
              j--;
            }
          }
        }
      }
      return removed;
    }
    throw new Error('Cannot remove elements from a non-array value');
  }

  mergeWith(previous: Op): Op {
    if (!previous) {
      return this;
    }
    if (previous instanceof SetOp) {
      return new SetOp(this.applyTo(previous._value));
    }
    if (previous instanceof UnsetOp) {
      return new UnsetOp();
    }
    if (previous instanceof RemoveOp) {
      var uniques = previous._value.concat([]);
      for (var i = 0; i < this._value.length; i++) {
        if (this._value[i] instanceof ParseObject) {
          if (!arrayContainsObject(uniques, this._value[i])) {
            uniques.push(this._value[i]);
          }
        } else {
          if (uniques.indexOf(this._value[i]) < 0) {
            uniques.push(this._value[i]);
          }
        }
      }
      return new RemoveOp(uniques);
    }
    throw new Error('Cannot merge Remove Op with the previous Op');
  }

  toJSON(): { __op: string; objects: mixed } {
    return { __op: 'Remove', objects: encode(this._value, false, true) };
  }
}

export class RelationOp extends Op {
  _targetClassName: ?string;
  relationsToAdd: Array<string>;
  relationsToRemove: Array<string>;

  constructor(
    adds: Array<ParseObject | string>,
    removes: Array<ParseObject | string>
  ) {
    super();
    this._targetClassName = null;

    if (Array.isArray(adds)) {
      this.relationsToAdd = unique(adds.map(this._extractId, this));
    }

    if (Array.isArray(removes)) {
      this.relationsToRemove = unique(removes.map(this._extractId, this));
    }
  }

  _extractId(obj: string | ParseObject): string {
    if (typeof obj === 'string') {
      return obj;
    }
    if (!obj.id) {
      throw new Error(
        'You cannot add or remove an unsaved Parse Object from a relation'
      );
    }
    if (!this._targetClassName) {
      this._targetClassName = obj.className;
    }
    if (this._targetClassName !== obj.className) {
      throw new Error(
        'Tried to create a Relation with 2 different object types: ' +
        this._targetClassName + ' and ' + obj.className + '.'
      );
    }
    return obj.id;
  }

  applyTo(value: mixed, object?: { className: string, id: ?string }, key?: string): ?ParseRelation {
    if (!value) {
      if (!object || !key) {
        throw new Error('Cannot apply a RelationOp without either a previous value, or an object and a key');
      }
      var parent = new ParseObject(object.className);
      if (object.id && object.id.indexOf('local') === 0) {
        parent._localId = object.id;
      } else if (object.id) {
        parent.id = object.id;
      }
      var relation = new ParseRelation(parent, key);
      relation.targetClassName = this._targetClassName;
      return relation;
    }
    if (value instanceof ParseRelation) {
      if (this._targetClassName) {
        if (value.targetClassName) {
          if (this._targetClassName !== value.targetClassName) {
            throw new Error(
              'Related object must be a ' + value.targetClassName +
              ', but a ' + this._targetClassName + ' was passed in.'
            );
          }
        } else {
          value.targetClassName = this._targetClassName;
        }
      }
      return value;
    } else {
      throw new Error(
        'Relation cannot be applied to a non-relation field'
      );
    }
  }

  mergeWith(previous: Op): Op {
    if (!previous) {
      return this;
    } else if (previous instanceof UnsetOp) {
      throw new Error('You cannot modify a relation after deleting it.');
    } else if (previous instanceof RelationOp) {
      if (previous._targetClassName &&
        previous._targetClassName !== this._targetClassName) {
        throw new Error(
          'Related object must be of class ' + previous._targetClassName + ', but ' +
          (this._targetClassName || 'null') + ' was passed in.'
        );
      }
      var newAdd = previous.relationsToAdd.concat([]);
      this.relationsToRemove.forEach((r) => {
        var index = newAdd.indexOf(r);
        if (index > -1) {
          newAdd.splice(index, 1);
        }
      });
      this.relationsToAdd.forEach((r) => {
        var index = newAdd.indexOf(r);
        if (index < 0) {
          newAdd.push(r);
        }
      });

      var newRemove = previous.relationsToRemove.concat([]);
      this.relationsToAdd.forEach((r) => {
        var index = newRemove.indexOf(r);
        if (index > -1) {
          newRemove.splice(index, 1);
        }
      });
      this.relationsToRemove.forEach((r) => {
        var index = newRemove.indexOf(r);
        if (index < 0) {
          newRemove.push(r);
        }
      });

      var newRelation = new RelationOp(newAdd, newRemove);
      newRelation._targetClassName = this._targetClassName;
      return newRelation;
    }
    throw new Error('Cannot merge Relation Op with the previous Op');
  }

  toJSON(): { __op?: string; objects?: mixed; ops?: mixed } {
    var idToPointer = (id) => {
      return {
        __type: 'Pointer',
        className: this._targetClassName,
        objectId: id
      };
    };

    var adds = null;
    var removes = null;
    var pointers = null;

    if (this.relationsToAdd.length > 0) {
      pointers = this.relationsToAdd.map(idToPointer);
      adds = { __op: 'AddRelation', objects: pointers };
    }
    if (this.relationsToRemove.length > 0) {
      pointers = this.relationsToRemove.map(idToPointer);
      removes = { __op: 'RemoveRelation', objects: pointers };
    }

    if (adds && removes) {
      return { __op: 'Batch', ops: [adds, removes] };
    }

    return adds || removes || {};
  }
}
