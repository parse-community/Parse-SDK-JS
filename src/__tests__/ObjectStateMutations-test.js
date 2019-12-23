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
jest.dontMock('../ParseRelation');
jest.dontMock('../TaskQueue');

const mockObject = function(className) {
  this.className = className;
};
mockObject.registerSubclass = function() {};
jest.setMock('../ParseObject', mockObject);

const ObjectStateMutations = require('../ObjectStateMutations');
const ParseOps = require('../ParseOp');
const TaskQueue = require('../TaskQueue');

describe('ObjectStateMutations', () => {
  it('can apply server data', () => {
    const serverData = {};
    ObjectStateMutations.setServerData(serverData, { counter: 12 });
    expect(serverData).toEqual({ counter: 12 });
    ObjectStateMutations.setServerData(serverData, { counter: undefined });
    expect(serverData).toEqual({});
  });

  it('can set a pending op', () => {
    let pendingOps = [{}];
    const op = new ParseOps.IncrementOp(1);
    ObjectStateMutations.setPendingOp(pendingOps, 'counter', op);
    expect(pendingOps).toEqual([{ counter: op }]);

    pendingOps = [{}, {}];
    ObjectStateMutations.setPendingOp(pendingOps, 'counter', op);
    expect(pendingOps).toEqual([{}, { counter: op }]);

    ObjectStateMutations.setPendingOp(pendingOps, 'counter', null);
    expect(pendingOps).toEqual([{}, {}]);
  });

  it('can push a new pending state', () => {
    const pendingOps = [{}];
    ObjectStateMutations.pushPendingState(pendingOps);
    expect(pendingOps).toEqual([{}, {}]);

    ObjectStateMutations.pushPendingState(pendingOps);
    expect(pendingOps).toEqual([{}, {}, {}]);
  });

  it('can pop a pending state', () => {
    let pendingOps = [{}];
    let first = pendingOps[0];
    expect(ObjectStateMutations.popPendingState(pendingOps)).toBe(first);
    expect(pendingOps).toEqual([{}]);

    const op = new ParseOps.IncrementOp(1);
    pendingOps = [{ counter: op }, {}, {}];
    first = pendingOps[0];
    expect(ObjectStateMutations.popPendingState(pendingOps)).toBe(first);
    expect(pendingOps).toEqual([{}, {}]);
  });

  it('can merge the first op set into the next', () => {
    let pendingOps = [{ counter: new ParseOps.SetOp(1), name: new ParseOps.SetOp('foo') }, {}];
    ObjectStateMutations.mergeFirstPendingState(pendingOps);
    expect(pendingOps).toEqual([{ counter: new ParseOps.SetOp(1), name: new ParseOps.SetOp('foo') }]);

    pendingOps = [{ counter: new ParseOps.SetOp(1) }, { counter: new ParseOps.IncrementOp(1)}];
    ObjectStateMutations.mergeFirstPendingState(pendingOps);
    expect(pendingOps).toEqual([{ counter: new ParseOps.SetOp(2) }]);
  });

  it('can estimate an attribute value', () => {
    const serverData = { counter: 12 };
    const pendingOps = [{ counter: new ParseOps.IncrementOp(2), name: new ParseOps.SetOp('foo') }];
    expect(ObjectStateMutations.estimateAttribute(serverData, pendingOps, 'someClass', 'someId', 'counter')).toBe(14);
    expect(ObjectStateMutations.estimateAttribute(serverData, pendingOps, 'someClass', 'someId', 'name')).toBe('foo');

    pendingOps.push({ counter: new ParseOps.IncrementOp(1), name: new ParseOps.SetOp('override') });
    expect(ObjectStateMutations.estimateAttribute(serverData, pendingOps, 'someClass', 'someId', 'counter')).toBe(15);
    expect(ObjectStateMutations.estimateAttribute(serverData, pendingOps, 'someClass', 'someId', 'name')).toBe('override');

    pendingOps.push({ likes: new ParseOps.RelationOp([], []) });
    const relation = ObjectStateMutations.estimateAttribute(serverData, pendingOps, 'someClass', 'someId', 'likes');
    expect(relation.parent.id).toBe('someId');
    expect(relation.parent.className).toBe('someClass');
    expect(relation.key).toBe('likes');
  });

  it('can estimate all attributes', () => {
    const serverData = { counter: 12 };
    const pendingOps = [{ counter: new ParseOps.IncrementOp(2), name: new ParseOps.SetOp('foo') }];
    expect(ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')).toEqual({
      counter: 14,
      name: 'foo'
    });

    pendingOps.push({ counter: new ParseOps.IncrementOp(1), name: new ParseOps.SetOp('override') });
    expect(ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')).toEqual({
      counter: 15,
      name: 'override'
    });

    pendingOps.push({ likes: new ParseOps.RelationOp([], []) });
    const attributes = ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId');
    expect(attributes.likes.parent.id).toBe('someId');
    expect(attributes.likes.parent.className).toBe('someClass');
    expect(attributes.likes.key).toBe('likes');
  });

  it('can estimate attributes for nested documents', () => {
    const serverData = { objectField: { counter: 10 } };
    let pendingOps = [{ 'objectField.counter': new ParseOps.IncrementOp(2) }];
    expect(ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')).toEqual({
      objectField: {
        counter: 12
      },
    });
    pendingOps = [{ 'objectField.counter': new ParseOps.SetOp(20) }];
    expect(ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')).toEqual({
      objectField: {
        counter: 20
      },
    });
  });

  it('can commit changes from the server', () => {
    const serverData = {};
    const objectCache = {};
    ObjectStateMutations.commitServerChanges(serverData, objectCache, { name: 'foo', data: { count: 5 } });
    expect(serverData).toEqual({ name: 'foo', data: { count: 5 } });
    expect(objectCache).toEqual({ data: '{"count":5}' });
  });

  it('can generate a default state for implementations', () => {
    expect(ObjectStateMutations.defaultState()).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    });
  });
});
