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
jest.dontMock('../promiseUtils');
jest.dontMock('../SingleInstanceStateController');
jest.dontMock('../TaskQueue');

const mockObject = function() {};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);
jest.useFakeTimers();

const ParseFile = require('../ParseFile').default;
const ParseGeoPoint = require('../ParseGeoPoint').default;
const ParseOps = require('../ParseOp');
const SingleInstanceStateController = require('../SingleInstanceStateController');
const TaskQueue = require('../TaskQueue');

describe('SingleInstanceStateController', () => {
  it('returns null state for an unknown object', () => {
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'someId' })).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    expect(SingleInstanceStateController.getServerData({ className: 'someClass', id: 'someId' })).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    expect(SingleInstanceStateController.getPendingOps({ className: 'someClass', id: 'someId' })).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'A' })).toBe(null);
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'A' }, { counter: 12 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'A' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can clear all data', () => {
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'A' }, { counter: 12 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'A' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.clearAllState();
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'A' })).toEqual(null);
  });

  it('initializes server data when setting pending ops', () => {
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'B' })).toBe(null);
    const op = new ParseOps.IncrementOp(1);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'B' }, 'counter', op);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'B' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can set server data on an existing state', () => {
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'C' }, { counter: 12 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'C' }, { valid: true });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 12, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'C' }, { counter: 0 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 0, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can remove server data from a state', () => {
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'D' }, { counter: 12 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'D' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'D' }, { counter: undefined });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'D' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can add multiple pending Ops', () => {
    const op = new ParseOps.IncrementOp(1);
    const op2 = new ParseOps.SetOp(true);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'E' }, 'counter', op);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'E' }, 'valid', op2);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'E' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    const op3 = new ParseOps.UnsetOp();
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'E' }, 'valid', op3);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'E' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op3 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can unset pending Ops', () => {
    const op = new ParseOps.IncrementOp(1);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'F' }, 'counter', op);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'F' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'F' }, 'counter', null);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'F' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can push a new pending state frame', () => {
    const op = new ParseOps.IncrementOp(1);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'G' }, 'counter', op);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'G' });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    const op2 = new ParseOps.SetOp(true);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'G' }, 'valid', op2);
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, { valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can pop a pending state frame', () => {
    const op = new ParseOps.IncrementOp(1);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'H' }, 'counter', op);
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'H' });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'H' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceStateController.popPendingState({ className: 'someClass', id: 'H' })).toEqual({
      counter: op
    });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'H' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('will never leave the pending Op queue empty', () => {
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'I' });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'I' })).toEqual({
      serverData: {},
      pendingOps: [{}, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceStateController.popPendingState({ className: 'someClass', id: 'I' });
    SingleInstanceStateController.popPendingState({ className: 'someClass', id: 'I' });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'I' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can estimate a single attribute', () => {
    expect(SingleInstanceStateController.estimateAttribute({ className: 'someClass', id: 'J' }, 'unset'))
      .toBe(undefined);
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'J' }, { counter: 11 });
    expect(SingleInstanceStateController.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(11);
    const op = new ParseOps.IncrementOp(1);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'J' }, 'counter', op);
    expect(SingleInstanceStateController.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(12);
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'J' });
    const op2 = new ParseOps.IncrementOp(10);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'J' }, 'counter', op2);
    expect(SingleInstanceStateController.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    expect(SingleInstanceStateController.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({});
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'K' }, { counter: 11 });
    const op = new ParseOps.IncrementOp(1);
    const op2 = new ParseOps.SetOp(false);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'K' }, 'counter', op);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'K' }, 'valid', op2);
    expect(SingleInstanceStateController.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({
      counter: 12,
      valid: false
    });
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'K' });
    const op3 = new ParseOps.UnsetOp();
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'K' }, 'valid', op3);
    expect(SingleInstanceStateController.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'L' }, { counter: 11 });
    expect(SingleInstanceStateController.estimateAttributes({ className: 'someClass', id: 'L' })).toEqual({
      counter: 11
    });
    SingleInstanceStateController.commitServerChanges({ className: 'someClass', id: 'L' }, {
      counter: 12,
      valid: true
    });
    expect(SingleInstanceStateController.estimateAttributes({ className: 'someClass', id: 'L' })).toEqual({
      counter: 12,
      valid: true
    });
  });

  it('can enqueue a chain of tasks', async () => {
    let p1Resolve, p2Resolve;
    const p1 = new Promise((resolve) => { p1Resolve = resolve });
    const p2 = new Promise((resolve) => { p2Resolve = resolve });
    const called = [false, false, false];
    SingleInstanceStateController.enqueueTask({ className: 'someClass', id: 'M' }, () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    SingleInstanceStateController.enqueueTask({ className: 'someClass', id: 'M' }, () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    SingleInstanceStateController.enqueueTask({ className: 'someClass', id: 'M' }, () => {
      called[2] = true;
      return Promise.resolve();
    });
    expect(called).toEqual([false, false, false]);
    p1Resolve();
    await p1;
    expect(called).toEqual([true, false, false]);
    p2Resolve();
    await p2;
    await new Promise(resolve => setImmediate(resolve));
    expect(called).toEqual([true, true, true]);
  });

  it('can merge the first entry into the next', () => {
    const incCount = new ParseOps.IncrementOp(1);
    const setName = new ParseOps.SetOp('demo');
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'N' }, 'counter', incCount);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'N' }, 'name', setName);
    SingleInstanceStateController.pushPendingState({ className: 'someClass', id: 'N' });
    const setCount = new ParseOps.SetOp(44);
    const setValid = new ParseOps.SetOp(true);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'N' }, 'counter', setCount);
    SingleInstanceStateController.setPendingOp({ className: 'someClass', id: 'N' }, 'valid', setValid);
    SingleInstanceStateController.mergeFirstPendingState({ className: 'someClass', id: 'N' });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'N' })).toEqual({
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
    let cache = SingleInstanceStateController.getObjectCache({ className: 'someClass', id: 'O' });
    expect(cache).toEqual({});
    SingleInstanceStateController.commitServerChanges({ className: 'someClass', id: 'O' }, {
      name: 'MyObject',
      obj: { a: 12, b: 21 },
      location: new ParseGeoPoint(20, 20),
      file: ParseFile.fromJSON({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      })
    });
    cache = SingleInstanceStateController.getObjectCache({ className: 'someClass', id: 'O' });
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
    expect(SingleInstanceStateController.removeState({ className: 'someClass', id: 'P' })).toBe(null);
    SingleInstanceStateController.setServerData({ className: 'someClass', id: 'P' }, { counter: 12 });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'P' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    const state = SingleInstanceStateController.removeState({ className: 'someClass', id: 'P' });
    expect(state).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceStateController.getState({ className: 'someClass', id: 'P' })).toBe(null);
  });
});
