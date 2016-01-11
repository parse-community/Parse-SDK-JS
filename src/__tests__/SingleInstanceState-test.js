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
    expect(SingleInstanceState.getState('someClass', 'someId')).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    expect(SingleInstanceState.getServerData('someClass', 'someId')).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    expect(SingleInstanceState.getPendingOps('someClass', 'someId')).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    expect(SingleInstanceState.getState('someClass', 'A')).toBe(null);
    SingleInstanceState.setServerData('someClass', 'A', { counter: 12 });
    expect(SingleInstanceState.getState('someClass', 'A')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can clear all data', () => {
    SingleInstanceState.setServerData('someClass', 'A', { counter: 12 });
    expect(SingleInstanceState.getState('someClass', 'A')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState._clearAllState();
    expect(SingleInstanceState.getState('someClass', 'A')).toEqual(null);
  });

  it('initializes server data when setting pending ops', () => {
    expect(SingleInstanceState.getState('someClass', 'B')).toBe(null);
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp('someClass', 'B', 'counter', op);
    expect(SingleInstanceState.getState('someClass', 'B')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can set server data on an existing state', () => {
    SingleInstanceState.setServerData('someClass', 'C', { counter: 12 });
    expect(SingleInstanceState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData('someClass', 'C', { valid: true });
    expect(SingleInstanceState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 12, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData('someClass', 'C', { counter: 0 });
    expect(SingleInstanceState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 0, valid: true },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can remove server data from a state', () => {
    SingleInstanceState.setServerData('someClass', 'D', { counter: 12 });
    expect(SingleInstanceState.getState('someClass', 'D')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setServerData('someClass', 'D', { counter: undefined });
    expect(SingleInstanceState.getState('someClass', 'D')).toEqual({
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
    SingleInstanceState.setPendingOp('someClass', 'E', 'counter', op);
    SingleInstanceState.setPendingOp('someClass', 'E', 'valid', op2);
    expect(SingleInstanceState.getState('someClass', 'E')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    var op3 = new ParseOps.UnsetOp();
    SingleInstanceState.setPendingOp('someClass', 'E', 'valid', op3);
    expect(SingleInstanceState.getState('someClass', 'E')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op3 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can unset pending Ops', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp('someClass', 'F', 'counter', op);
    expect(SingleInstanceState.getState('someClass', 'F')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.setPendingOp('someClass', 'F', 'counter', null);
    expect(SingleInstanceState.getState('someClass', 'F')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can push a new pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp('someClass', 'G', 'counter', op);
    expect(SingleInstanceState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.pushPendingState('someClass', 'G');
    expect(SingleInstanceState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    var op2 = new ParseOps.SetOp(true);
    SingleInstanceState.setPendingOp('someClass', 'G', 'valid', op2);
    expect(SingleInstanceState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, { valid: op2 }],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can pop a pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp('someClass', 'H', 'counter', op);
    SingleInstanceState.pushPendingState('someClass', 'H');
    expect(SingleInstanceState.getState('someClass', 'H')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceState.popPendingState('someClass', 'H')).toEqual({
      counter: op
    });
    expect(SingleInstanceState.getState('someClass', 'H')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('will never leave the pending Op queue empty', () => {
    SingleInstanceState.pushPendingState('someClass', 'I');
    expect(SingleInstanceState.getState('someClass', 'I')).toEqual({
      serverData: {},
      pendingOps: [{}, {}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    SingleInstanceState.popPendingState('someClass', 'I');
    SingleInstanceState.popPendingState('someClass', 'I');
    expect(SingleInstanceState.getState('someClass', 'I')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can estimate a single attribute', () => {
    expect(SingleInstanceState.estimateAttribute('someClass', 'J', 'unset'))
      .toBe(undefined);
    SingleInstanceState.setServerData('someClass', 'J', { counter: 11 });
    expect(SingleInstanceState.estimateAttribute('someClass', 'J', 'counter')).toBe(11);
    var op = new ParseOps.IncrementOp(1);
    SingleInstanceState.setPendingOp('someClass', 'J', 'counter', op);
    expect(SingleInstanceState.estimateAttribute('someClass', 'J', 'counter')).toBe(12);
    SingleInstanceState.pushPendingState('someClass', 'J');
    var op2 = new ParseOps.IncrementOp(10);
    SingleInstanceState.setPendingOp('someClass', 'J', 'counter', op2);
    expect(SingleInstanceState.estimateAttribute('someClass', 'J', 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    expect(SingleInstanceState.estimateAttributes('someClass', 'K')).toEqual({});
    SingleInstanceState.setServerData('someClass', 'K', { counter: 11 });
    var op = new ParseOps.IncrementOp(1);
    var op2 = new ParseOps.SetOp(false);
    SingleInstanceState.setPendingOp('someClass', 'K', 'counter', op);
    SingleInstanceState.setPendingOp('someClass', 'K', 'valid', op2);
    expect(SingleInstanceState.estimateAttributes('someClass', 'K')).toEqual({
      counter: 12,
      valid: false
    });
    SingleInstanceState.pushPendingState('someClass', 'K');
    var op3 = new ParseOps.UnsetOp();
    SingleInstanceState.setPendingOp('someClass', 'K', 'valid', op3);
    expect(SingleInstanceState.estimateAttributes('someClass', 'K')).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    SingleInstanceState.setServerData('someClass', 'L', { counter: 11 });
    expect(SingleInstanceState.estimateAttributes('someClass', 'L')).toEqual({
      counter: 11
    });
    SingleInstanceState.commitServerChanges('someClass', 'L', {
      counter: 12,
      valid: true
    });
    expect(SingleInstanceState.estimateAttributes('someClass', 'L')).toEqual({
      counter: 12,
      valid: true
    });
  });

  it('can enqueue a chain of tasks', () => {
    var p1 = new ParsePromise();
    var p2 = new ParsePromise();
    var called = [false, false, false];
    var t1 = SingleInstanceState.enqueueTask('someClass', 'M', () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    var t2 = SingleInstanceState.enqueueTask('someClass', 'M', () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    var t3 = SingleInstanceState.enqueueTask('someClass', 'M', () => {
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
    SingleInstanceState.setPendingOp('someClass', 'N', 'counter', incCount);
    SingleInstanceState.setPendingOp('someClass', 'N', 'name', setName);
    SingleInstanceState.pushPendingState('someClass', 'N');
    var setCount = new ParseOps.SetOp(44);
    var setValid = new ParseOps.SetOp(true);
    SingleInstanceState.setPendingOp('someClass', 'N', 'counter', setCount);
    SingleInstanceState.setPendingOp('someClass', 'N', 'valid', setValid);
    SingleInstanceState.mergeFirstPendingState('someClass', 'N');
    expect(SingleInstanceState.getState('someClass', 'N')).toEqual({
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
    var cache = SingleInstanceState.getObjectCache('someClass', 'O');
    expect(cache).toEqual({});
    SingleInstanceState.commitServerChanges('someClass', 'O', {
      name: 'MyObject',
      obj: { a: 12, b: 21 },
      location: new ParseGeoPoint(20, 20),
      file: ParseFile.fromJSON({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      })
    });
    cache = SingleInstanceState.getObjectCache('someClass', 'O');
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
    expect(SingleInstanceState.removeState('someClass', 'P')).toBe(null);
    SingleInstanceState.setServerData('someClass', 'P', { counter: 12 });
    expect(SingleInstanceState.getState('someClass', 'P')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    let state = SingleInstanceState.removeState('someClass', 'P');
    expect(state).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
    expect(SingleInstanceState.getState('someClass', 'P')).toBe(null);
  });
});
