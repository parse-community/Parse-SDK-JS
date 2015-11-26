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
jest.dontMock('../TaskQueue');

jest.dontMock('redux');
jest.dontMock('../ReduxActionCreators');
jest.dontMock('../ReduxStore');
jest.dontMock('../ReduxReducers');
jest.dontMock('../ReduxCacheHelper');

var mockObject = function() {};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

var ObjectState = require('../ObjectState');
var ParseFile = require('../ParseFile');
var ParseGeoPoint = require('../ParseGeoPoint');
var ParseOps = require('../ParseOp');
var ParsePromise = require('../ParsePromise');
var TaskQueue = require('../TaskQueue');

describe('ObjectState', () => {
  it('returns null state for an unknown object', () => {
    expect(ObjectState.getState('someClass', 'someId')).toBe(null);
  });

  it('returns empty data for an unknown object', () => {
    expect(ObjectState.getServerData('someClass', 'someId')).toEqual({});
  });

  it('returns an empty op queue for an unknown object', () => {
    expect(ObjectState.getPendingOps('someClass', 'someId')).toEqual([{}]);
  });

  it('initializes server data when setting state', () => {
    expect(ObjectState.getState('someClass', 'A')).toBe(null);
    ObjectState.setServerData('someClass', 'A', { counter: 12 });
    expect(ObjectState.getState('someClass', 'A')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('initializes server data when setting pending ops', () => {
    expect(ObjectState.getState('someClass', 'B')).toBe(null);
    var op = new ParseOps.IncrementOp(1);
    ObjectState.setPendingOp('someClass', 'B', 'counter', op);
    expect(ObjectState.getState('someClass', 'B')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can set server data on an existing state', () => {
    ObjectState.setServerData('someClass', 'C', { counter: 12 });
    expect(ObjectState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.setServerData('someClass', 'C', { valid: true });
    expect(ObjectState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 12, valid: true },
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.setServerData('someClass', 'C', { counter: 0 });
    expect(ObjectState.getState('someClass', 'C')).toEqual({
      serverData: { counter: 0, valid: true },
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can remove server data from a state', () => {
    ObjectState.setServerData('someClass', 'D', { counter: 12 });
    expect(ObjectState.getState('someClass', 'D')).toEqual({
      serverData: { counter: 12 },
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.setServerData('someClass', 'D', { counter: undefined });
    expect(ObjectState.getState('someClass', 'D')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can add multiple pending Ops', () => {
    var op = new ParseOps.IncrementOp(1);
    var op2 = new ParseOps.SetOp(true);
    ObjectState.setPendingOp('someClass', 'E', 'counter', op);
    ObjectState.setPendingOp('someClass', 'E', 'valid', op2);
    expect(ObjectState.getState('someClass', 'E')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op2 }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    var op3 = new ParseOps.UnsetOp();
    ObjectState.setPendingOp('someClass', 'E', 'valid', op3);
    expect(ObjectState.getState('someClass', 'E')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op, valid: op3 }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can unset pending Ops', () => {
    var op = new ParseOps.IncrementOp(1);
    ObjectState.setPendingOp('someClass', 'F', 'counter', op);
    expect(ObjectState.getState('someClass', 'F')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.setPendingOp('someClass', 'F', 'counter', null);
    expect(ObjectState.getState('someClass', 'F')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can push a new pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    ObjectState.setPendingOp('someClass', 'G', 'counter', op);
    expect(ObjectState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.pushPendingState('someClass', 'G');
    expect(ObjectState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    var op2 = new ParseOps.SetOp(true);
    ObjectState.setPendingOp('someClass', 'G', 'valid', op2);
    expect(ObjectState.getState('someClass', 'G')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, { valid: op2 }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can pop a pending state frame', () => {
    var op = new ParseOps.IncrementOp(1);
    ObjectState.setPendingOp('someClass', 'H', 'counter', op);
    ObjectState.pushPendingState('someClass', 'H');
    expect(ObjectState.getState('someClass', 'H')).toEqual({
      serverData: {},
      pendingOps: [{ counter: op }, {}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    expect(ObjectState.popPendingState('someClass', 'H')).toEqual({
      counter: op
    });
    expect(ObjectState.getState('someClass', 'H')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('will never leave the pending Op queue empty', () => {
    ObjectState.pushPendingState('someClass', 'I');
    expect(ObjectState.getState('someClass', 'I')).toEqual({
      serverData: {},
      pendingOps: [{}, {}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
    ObjectState.popPendingState('someClass', 'I');
    ObjectState.popPendingState('someClass', 'I');
    expect(ObjectState.getState('someClass', 'I')).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('can estimate a single attribute', () => {
    expect(ObjectState.estimateAttribute('someClass', 'J', 'unset'))
      .toBe(undefined);
    ObjectState.setServerData('someClass', 'J', { counter: 11 });
    expect(ObjectState.estimateAttribute('someClass', 'J', 'counter')).toBe(11);
    var op = new ParseOps.IncrementOp(1);
    ObjectState.setPendingOp('someClass', 'J', 'counter', op);
    expect(ObjectState.estimateAttribute('someClass', 'J', 'counter')).toBe(12);
    ObjectState.pushPendingState('someClass', 'J');
    var op2 = new ParseOps.IncrementOp(10);
    ObjectState.setPendingOp('someClass', 'J', 'counter', op2);
    expect(ObjectState.estimateAttribute('someClass', 'J', 'counter')).toBe(22);
  });

  it('can estimate all attributes', () => {
    expect(ObjectState.estimateAttributes('someClass', 'K')).toEqual({});
    ObjectState.setServerData('someClass', 'K', { counter: 11 });
    var op = new ParseOps.IncrementOp(1);
    var op2 = new ParseOps.SetOp(false);
    ObjectState.setPendingOp('someClass', 'K', 'counter', op);
    ObjectState.setPendingOp('someClass', 'K', 'valid', op2);
    expect(ObjectState.estimateAttributes('someClass', 'K')).toEqual({
      counter: 12,
      valid: false
    });
    ObjectState.pushPendingState('someClass', 'K');
    var op3 = new ParseOps.UnsetOp();
    ObjectState.setPendingOp('someClass', 'K', 'valid', op3);
    expect(ObjectState.estimateAttributes('someClass', 'K')).toEqual({
      counter: 12
    });
  });

  it('can update server data with changes', () => {
    ObjectState.setServerData('someClass', 'L', { counter: 11 });
    expect(ObjectState.estimateAttributes('someClass', 'L')).toEqual({
      counter: 11
    });
    ObjectState.commitServerChanges('someClass', 'L', {
      counter: 12,
      valid: true
    });
    expect(ObjectState.estimateAttributes('someClass', 'L')).toEqual({
      counter: 12,
      valid: true
    });
  });

  it('can enqueue a chain of tasks', () => {
    var p1 = new ParsePromise();
    var p2 = new ParsePromise();
    var called = [false, false, false];
    var t1 = ObjectState.enqueueTask('someClass', 'M', () => {
      return p1.then(() => {
        called[0] = true;
      });
    });
    var t2 = ObjectState.enqueueTask('someClass', 'M', () => {
      return p2.then(() => {
        called[1] = true;
      });
    });
    var t3 = ObjectState.enqueueTask('someClass', 'M', () => {
      called[2] = true;
      return ParsePromise.as();
    });
    expect(called).toEqual([false, false, false]);
    p1.resolve();
    expect(t1._resolved).toBe(true);
    expect(t2._resolved).toBe(false);
    expect(called).toEqual([true, false, false]);
    p2.resolve();
    expect(t2._resolved).toBe(true);
    expect(t3._resolved).toBe(true);
    expect(called).toEqual([true, true, true]);
  });

  it('can merge the first entry into the next', () => {
    var incCount = new ParseOps.IncrementOp(1);
    var setName = new ParseOps.SetOp('demo');
    ObjectState.setPendingOp('someClass', 'N', 'counter', incCount);
    ObjectState.setPendingOp('someClass', 'N', 'name', setName);
    ObjectState.pushPendingState('someClass', 'N');
    var setCount = new ParseOps.SetOp(44);
    var setValid = new ParseOps.SetOp(true);
    ObjectState.setPendingOp('someClass', 'N', 'counter', setCount);
    ObjectState.setPendingOp('someClass', 'N', 'valid', setValid);
    ObjectState.mergeFirstPendingState('someClass', 'N');
    expect(ObjectState.getState('someClass', 'N')).toEqual({
      serverData: {},
      pendingOps: [{
        counter: new ParseOps.SetOp(44),
        name: new ParseOps.SetOp('demo'),
        valid: new ParseOps.SetOp(true),
      }],
      objectCache: {},
      // tasks: new TaskQueue(),
      existed: false
    });
  });

  it('stores cached versions of object attributes', () => {
    ObjectState.commitServerChanges('someClass', 'O', {
      name: 'MyObject',
      obj: { a: 12, b: 21 },
      location: new ParseGeoPoint(20, 20),
      file: ParseFile.fromJSON({
        __type: 'File',
        name: 'parse.txt',
        url: 'http://files.parsetfss.com/a/parse.txt'
      })
    });
    var cache = ObjectState.getObjectCache('someClass', 'O');
    expect(cache.name).toBe(undefined);
    expect(cache.file).toBe(undefined);
    expect(JSON.parse(cache.obj)).toEqual({ a: 12, b: 21 });
    expect(JSON.parse(cache.location)).toEqual({
      __type: 'GeoPoint',
      latitude: 20,
      longitude: 20
    });
  });
});
