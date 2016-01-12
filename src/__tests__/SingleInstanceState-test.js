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
jest.dontMock('../ObjectState');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseOp');
jest.dontMock('../ParsePromise');
jest.dontMock('../SingleInstanceState');
jest.dontMock('../TaskQueue');

var mockObject = function() {};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

var ParseFile = require('../ParseFile');
var ParseGeoPoint = require('../ParseGeoPoint');
var ParseOps = require('../ParseOp');
var ParsePromise = require('../ParsePromise');
var SingleInstanceState = require('../SingleInstanceState');
var TaskQueue = require('../TaskQueue');

describe('SingleInstanceState', () => {
  it('returns null state for an unknown object', () => {
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'someId' })).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    expect(SingleInstanceState.getServerData({ className: 'someClass', id: 'someId' })).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    expect(SingleInstanceState.getPendingOps({ className: 'someClass', id: 'someId' })).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'A' })).toBe(null);
    SingleInstanceState.setServerData({ className: 'someClass', id: 'A' }, { counter: 12 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'A' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can clear all data', () => {
    SingleInstanceState.setServerData({ className: 'someClass', id: 'A' }, { counter: 12 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'A' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.clearAllState();
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'A' })).toEqual(null);
  });

  it('initializes server data when setting pending ops', () => {
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'B' })).toBe(null);
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'B' }, 'counter', op);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'B' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can set server data on an existing state', () => {
    SingleInstanceState.setServerData({ className: 'someClass', id: 'C' }, { counter: 12 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData({ className: 'someClass', id: 'C' }, { valid: true });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 12, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData({ className: 'someClass', id: 'C' }, { counter: 0 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'C' })).toEqual({
      serverData: { counter: 0, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can remove server data from a state', () => {
    SingleInstanceState.setServerData({ className: 'someClass', id: 'D' }, { counter: 12 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'D' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData({ className: 'someClass', id: 'D' }, { counter: undefined });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'D' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can add multiple pending Ops', () => {
    var op = new ParseOps.IncrementOp(1);
    var op2 = new ParseOps.SetOp(true);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'E' }, 'counter', op);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'E' }, 'valid', op2);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'E' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    var op3 = new ParseOps.UnsetOp();
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'E' }, 'valid', op3);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'E' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op3 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can unset pending Ops', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'F' }, 'counter', op);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'F' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'F' }, 'counter', null);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'F' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can push a new pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'G' }, 'counter', op);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'G' });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    var op2 = new ParseOps.SetOp(true);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'G' }, 'valid', op2);
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'G' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, { valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can pop a pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'H' }, 'counter', op);
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'H' });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'H' })).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceState.popPendingState({ className: 'someClass', id: 'H' })).toEqual({
      counter: op
    });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'H' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('will never leave the pending Op queue empty', () => {
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'I' });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'I' })).toEqual({
      serverData: {},
      pendingOps: [{}, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.popPendingState({ className: 'someClass', id: 'I' });
    SingleInstanceState.popPendingState({ className: 'someClass', id: 'I' });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'I' })).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can estimate a single attribute', () => {
    expect(SingleInstanceState.estimateAttribute({ className: 'someClass', id: 'J' }, 'unset'))
      .toBe(undefined);
    SingleInstanceState.setServerData({ className: 'someClass', id: 'J' }, { counter: 11 });
    expect(SingleInstanceState.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(11);
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'J' }, 'counter', op);
    expect(SingleInstanceState.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(12);
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'J' });
    var op2 = new ParseOps.IncrementOp(10);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'J' }, 'counter', op2);
    expect(SingleInstanceState.estimateAttribute({ className: 'someClass', id: 'J' }, 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    expect(SingleInstanceState.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({});
    SingleInstanceState.setServerData({ className: 'someClass', id: 'K' }, { counter: 11 });
    var op = new ParseOps.IncrementOp(1);
    var op2 = new ParseOps.SetOp(false);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'K' }, 'counter', op);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'K' }, 'valid', op2);
    expect(SingleInstanceState.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({
      counter: 12,
      valid: false
    });
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'K' });
    var op3 = new ParseOps.UnsetOp();
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'K' }, 'valid', op3);
    expect(SingleInstanceState.estimateAttributes({ className: 'someClass', id: 'K' })).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    SingleInstanceState.setServerData({ className: 'someClass', id: 'L' }, { counter: 11 });
    expect(SingleInstanceState.estimateAttributes({ className: 'someClass', id: 'L' })).toEqual({
      counter: 11
    });
    SingleInstanceState.commitServerChanges({ className: 'someClass', id: 'L' }, {
      counter: 12,
      valid: true
    });
    expect(SingleInstanceState.estimateAttributes({ className: 'someClass', id: 'L' })).toEqual({
      counter: 12,
      valid: true
    });
  });

  it('can enqueue a chain of tasks', () => {
    var p1 = new ParsePromise();
    var p2 = new ParsePromise();
    var called = [false, false, false];
    var t1 = SingleInstanceState.enqueueTask({ className: 'someClass', id: 'M' }, () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    var t2 = SingleInstanceState.enqueueTask({ className: 'someClass', id: 'M' }, () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    var t3 = SingleInstanceState.enqueueTask({ className: 'someClass', id: 'M' }, () => {
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
    var incCount = new ParseOps.IncrementOp(1);
    var setName = new ParseOps.SetOp('demo');
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'N' }, 'counter', incCount);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'N' }, 'name', setName);
    SingleInstanceState.pushPendingState({ className: 'someClass', id: 'N' });
    var setCount = new ParseOps.SetOp(44);
    var setValid = new ParseOps.SetOp(true);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'N' }, 'counter', setCount);
    SingleInstanceState.setPendingOp({ className: 'someClass', id: 'N' }, 'valid', setValid);
    SingleInstanceState.mergeFirstPendingState({ className: 'someClass', id: 'N' });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'N' })).toEqual({
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
    var cache = SingleInstanceState.getObjectCache({ className: 'someClass', id: 'O' });
    expect(cache).toEqual({});
    SingleInstanceState.commitServerChanges({ className: 'someClass', id: 'O' }, {
      name: 'MyObject',
      obj: { a: 12, b: 21 },
      location: new ParseGeoPoint(20, 20),
      file: ParseFile.fromJSON({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      })
    });
    cache = SingleInstanceState.getObjectCache({ className: 'someClass', id: 'O' });
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
    expect(SingleInstanceState.removeState({ className: 'someClass', id: 'P' })).toBe(null);
    SingleInstanceState.setServerData({ className: 'someClass', id: 'P' }, { counter: 12 });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'P' })).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    let state = SingleInstanceState.removeState({ className: 'someClass', id: 'P' });
    expect(state).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceState.getState({ className: 'someClass', id: 'P' })).toBe(null);
  });
});
