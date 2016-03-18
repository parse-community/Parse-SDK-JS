/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseOp');
jest.dontMock('../ParsePromise');
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../TaskQueue');

const mockObject = function(className) {
  this.className = className;
};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

const ParseFile = require('../ParseFile');
const ParseGeoPoint = require('../ParseGeoPoint');
const ParseObject = require('../ParseObject'); 
const ParseOps = require('../ParseOp');
const ParsePromise = require('../ParsePromise');
const UniqueInstanceStateController = require('../UniqueInstanceStateController');
const TaskQueue = require('../TaskQueue');

describe('UniqueInstanceStateController', () => {
  it('returns null state for an unknown object', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.getServerData(obj)).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.getPendingOps(obj)).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can clear all data', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.clearAllState();
    expect(UniqueInstanceStateController.getState(obj)).toEqual(null);
  });

  it('initializes server data when setting pending ops', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
    let op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can set server data on an existing state', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.setServerData(obj, { valid: true });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.setServerData(obj, { counter: 0 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 0, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can remove server data from a state', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.setServerData(obj, { counter: undefined });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can add multiple pending Ops', () => {
    let obj = new ParseObject();
    let op = new ParseOps.IncrementOp(1);
    let op2 = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op2);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    let op3 = new ParseOps.UnsetOp();
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op3);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op3 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can unset pending Ops', () => {
    let obj = new ParseObject();
    let op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.setPendingOp(obj, 'counter', null);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can push a new pending state frame', () => {
    let obj = new ParseObject();
    let op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.pushPendingState(obj);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    let op2 = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op2);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, { valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can pop a pending state frame', () => {
    let obj = new ParseObject();
    let op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    UniqueInstanceStateController.pushPendingState(obj);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(UniqueInstanceStateController.popPendingState(obj)).toEqual({
      counter: op
    });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('will never leave the pending Op queue empty', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.pushPendingState(obj);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{}, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    UniqueInstanceStateController.popPendingState(obj);
    UniqueInstanceStateController.popPendingState(obj);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can estimate a single attribute', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'unset'))
      .toBe(undefined);
    UniqueInstanceStateController.setServerData(obj, { counter: 11 });
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(11);
    let op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(12);
    UniqueInstanceStateController.pushPendingState(obj);
    let op2 = new ParseOps.IncrementOp(10);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op2);
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({});
    UniqueInstanceStateController.setServerData(obj, { counter: 11 });
    let op = new ParseOps.IncrementOp(1);
    let op2 = new ParseOps.SetOp(false);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op2);
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 12,
      valid: false
    });
    UniqueInstanceStateController.pushPendingState(obj);
    let op3 = new ParseOps.UnsetOp();
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op3);
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 11 });
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 11
    });
    UniqueInstanceStateController.commitServerChanges(obj, {
      counter: 12,
      valid: true
    });
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 12,
      valid: true
    });
  });

  it('can enqueue a chain of tasks', () => {
    let obj = new ParseObject();
    let p1 = new ParsePromise();
    let p2 = new ParsePromise();
    let called = [false, false, false];
    let t1 = UniqueInstanceStateController.enqueueTask(obj, () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    let t2 = UniqueInstanceStateController.enqueueTask(obj, () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    let t3 = UniqueInstanceStateController.enqueueTask(obj, () => {
      called[2] = true;
      return ParsePromise.as();
    });
    expect(called).toEqual([false, false, false]);
    p1.resolve();
    jest.runAllTicks();
    expect(t1._resolved).toBe(true);
    expect(t2._resolved).toBe(false);
    expect(called).toEqual([true, false, false]);
    p2.resolve();
    jest.runAllTicks();
    expect(t2._resolved).toBe(true);
    expect(t3._resolved).toBe(true);
    expect(called).toEqual([true, true, true]);
  });

  it('can merge the first entry into the next', () => {
    let obj = new ParseObject();
    let incCount = new ParseOps.IncrementOp(1);
    let setName = new ParseOps.SetOp('demo');
    UniqueInstanceStateController.setPendingOp(obj, 'counter', incCount);
    UniqueInstanceStateController.setPendingOp(obj, 'name', setName);
    UniqueInstanceStateController.pushPendingState(obj);
    let setCount = new ParseOps.SetOp(44);
    let setValid = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', setCount);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', setValid);
    UniqueInstanceStateController.mergeFirstPendingState(obj);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{
        counter: new ParseOps.SetOp(44),
        name: new ParseOps.SetOp('demo'),
        valid: new ParseOps.SetOp(true),
      }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('stores cached versions of object attributes', () => {
    let obj = new ParseObject();
    let cache = UniqueInstanceStateController.getObjectCache(obj);
    expect(cache).toEqual({});
    UniqueInstanceStateController.commitServerChanges(obj, {
      name: 'MyObject',
      obj: { a: 12, b: 21 },
      location: new ParseGeoPoint(20, 20),
      file: ParseFile.fromJSON({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      })
    });
    cache = UniqueInstanceStateController.getObjectCache(obj);
    expect(cache.name).toBe(undefined);
    expect(cache.file).toBe(undefined);
    expect(JSON.parse(cache.obj)).toEqual({ a: 12, b: 21 });
    expect(JSON.parse(cache.location)).toEqual({
      __type: 'GeoPoint',
      latitude: 20,
      longitude: 20
    });
  });

  it('can remove state for an object', () => {
    let obj = new ParseObject();
    expect(UniqueInstanceStateController.removeState(obj)).toBe(null);
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    let state = UniqueInstanceStateController.removeState(obj);
    expect(state).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
  });

  it('can allocate many objects without running out of memory', () => {
    let closure = function() {
      let obj = new ParseObject();
      UniqueInstanceStateController.setServerData(obj, { spacious: true });
    };
    for (var i = 0; i < 1e5; i++) {
      closure();
    }
  });

  it('can duplicate the state of an object', () => {
    let obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 12, name: 'original' });
    let setCount = new ParseOps.SetOp(44);
    let setValid = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', setCount);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', setValid);
    
    let duplicate = new ParseObject();
    UniqueInstanceStateController.duplicateState(obj, duplicate);
    expect(UniqueInstanceStateController.getState(duplicate)).toEqual({
      serverData: { counter: 12, name: 'original' },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });

    UniqueInstanceStateController.setServerData(duplicate, { name: 'duplicate' });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12, name: 'original' },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(UniqueInstanceStateController.getState(duplicate)).toEqual({
      serverData: { counter: 12, name: 'duplicate' },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });

    UniqueInstanceStateController.commitServerChanges(obj, { o: { a: 12 } });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12, name: 'original', o: { a: 12 } },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: { o: '{"a":12}' },
      tasks: new TaskQueue(),
      existed: false
    });
    expect(UniqueInstanceStateController.getState(duplicate)).toEqual({
      serverData: { counter: 12, name: 'duplicate' },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });

    let otherDup = new ParseObject();
    UniqueInstanceStateController.duplicateState(obj, otherDup);
    expect(UniqueInstanceStateController.getState(otherDup)).toEqual({
      serverData: { counter: 12, name: 'original', o: { a: 12 } },
      pendingOps: [{ counter: setCount, valid: setValid }],
      objectCache: { o: '{"a":12}' },
      tasks: new TaskQueue(),
      existed: false
    });
  });
});
