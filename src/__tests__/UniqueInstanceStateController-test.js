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
jest.dontMock('../UniqueInstanceStateController');
jest.dontMock('../TaskQueue');
jest.dontMock('../promiseUtils');
jest.useFakeTimers();

const mockObject = function(className) {
  this.className = className;
};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseObject = require('../ParseObject');
const ParseOps = require('../ParseOp');
const UniqueInstanceStateController = require('../UniqueInstanceStateController');
const TaskQueue = require('../TaskQueue');
const { resolvingPromise } = require('../promiseUtils');

describe('UniqueInstanceStateController', () => {
  it('returns null state for an unknown object', () => {
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.getServerData(obj)).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.getPendingOps(obj)).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    const obj = new ParseObject();
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
    const obj = new ParseObject();
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
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.getState(obj)).toBe(null);
    const op = new ParseOps.IncrementOp(1);
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
    const obj = new ParseObject();
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
    const obj = new ParseObject();
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
    const obj = new ParseObject();
    const op = new ParseOps.IncrementOp(1);
    const op2 = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op2);
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    const op3 = new ParseOps.UnsetOp();
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
    const obj = new ParseObject();
    const op = new ParseOps.IncrementOp(1);
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
    const obj = new ParseObject();
    const op = new ParseOps.IncrementOp(1);
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
    const op2 = new ParseOps.SetOp(true);
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
    const obj = new ParseObject();
    const op = new ParseOps.IncrementOp(1);
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
    const obj = new ParseObject();
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
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'unset'))
      .toBe(undefined);
    UniqueInstanceStateController.setServerData(obj, { counter: 11 });
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(11);
    const op = new ParseOps.IncrementOp(1);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(12);
    UniqueInstanceStateController.pushPendingState(obj);
    const op2 = new ParseOps.IncrementOp(10);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op2);
    expect(UniqueInstanceStateController.estimateAttribute(obj, 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({});
    UniqueInstanceStateController.setServerData(obj, { counter: 11 });
    const op = new ParseOps.IncrementOp(1);
    const op2 = new ParseOps.SetOp(false);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', op);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op2);
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 12,
      valid: false
    });
    UniqueInstanceStateController.pushPendingState(obj);
    const op3 = new ParseOps.UnsetOp();
    UniqueInstanceStateController.setPendingOp(obj, 'valid', op3);
    expect(UniqueInstanceStateController.estimateAttributes(obj)).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    const obj = new ParseObject();
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

  it('can enqueue a chain of tasks', async () => {
    const obj = new ParseObject();
    const p1 = resolvingPromise();
    const p2 = resolvingPromise();
    const called = [false, false, false];
    const t1 = UniqueInstanceStateController.enqueueTask(obj, () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    const t2 = UniqueInstanceStateController.enqueueTask(obj, () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    const t3 = UniqueInstanceStateController.enqueueTask(obj, () => {
      called[2] = true;
      return Promise.resolve();
    });
    expect(called).toEqual([false, false, false]);
    p1.resolve();
    jest.runAllTicks();
    await t1;
    expect(called).toEqual([true, false, false]);
    p2.resolve();
    jest.runAllTicks();
    await t2;
    await t3;
    expect(called).toEqual([true, true, true]);
  });

  it('can merge the first entry into the next', () => {
    const obj = new ParseObject();
    const incCount = new ParseOps.IncrementOp(1);
    const setName = new ParseOps.SetOp('demo');
    UniqueInstanceStateController.setPendingOp(obj, 'counter', incCount);
    UniqueInstanceStateController.setPendingOp(obj, 'name', setName);
    UniqueInstanceStateController.pushPendingState(obj);
    const setCount = new ParseOps.SetOp(44);
    const setValid = new ParseOps.SetOp(true);
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
    const obj = new ParseObject();
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
    const obj = new ParseObject();
    expect(UniqueInstanceStateController.removeState(obj)).toBe(null);
    UniqueInstanceStateController.setServerData(obj, { counter: 12 });
    expect(UniqueInstanceStateController.getState(obj)).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    const state = UniqueInstanceStateController.removeState(obj);
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
    const closure = function() {
      const obj = new ParseObject();
      UniqueInstanceStateController.setServerData(obj, { spacious: true });
    };
    for (let i = 0; i < 1e5; i++) {
      closure();
    }
  });

  it('can duplicate the state of an object', () => {
    const obj = new ParseObject();
    UniqueInstanceStateController.setServerData(obj, { counter: 12, name: 'original' });
    const setCount = new ParseOps.SetOp(44);
    const setValid = new ParseOps.SetOp(true);
    UniqueInstanceStateController.setPendingOp(obj, 'counter', setCount);
    UniqueInstanceStateController.setPendingOp(obj, 'valid', setValid);

    const duplicate = new ParseObject();
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

    const otherDup = new ParseObject();
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
