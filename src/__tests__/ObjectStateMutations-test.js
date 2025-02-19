jest.dontMock('../decode');
jest.dontMock('../encode');
jest.dontMock('../CoreManager');
jest.dontMock('../ObjectStateMutations');
jest.dontMock('../ParseFile');
jest.dontMock('../ParseGeoPoint');
jest.dontMock('../ParseOp');
jest.dontMock('../ParseRelation');
jest.dontMock('../TaskQueue');

const mockObject = function (className) {
  this.className = className;
};
mockObject.registerSubclass = function () {};
jest.setMock('../ParseObject', mockObject);
const CoreManager = require('../CoreManager').default;
CoreManager.setParseObject(mockObject);

const ObjectStateMutations = require('../ObjectStateMutations');
const ParseOps = require('../ParseOp');
const TaskQueue = require('../TaskQueue').default;

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
    expect(pendingOps).toEqual([
      { counter: new ParseOps.SetOp(1), name: new ParseOps.SetOp('foo') },
    ]);

    pendingOps = [{ counter: new ParseOps.SetOp(1) }, { counter: new ParseOps.IncrementOp(1) }];
    ObjectStateMutations.mergeFirstPendingState(pendingOps);
    expect(pendingOps).toEqual([{ counter: new ParseOps.SetOp(2) }]);
  });

  it('can estimate an attribute value', () => {
    const serverData = { counter: 12 };
    const pendingOps = [{ counter: new ParseOps.IncrementOp(2), name: new ParseOps.SetOp('foo') }];
    expect(
      ObjectStateMutations.estimateAttribute(
        serverData,
        pendingOps,
        { className: 'someClass', id: 'someId' },
        'counter'
      )
    ).toBe(14);
    expect(
      ObjectStateMutations.estimateAttribute(
        serverData,
        pendingOps,
        { className: 'someClass', id: 'someId' },
        'name'
      )
    ).toBe('foo');

    pendingOps.push({
      counter: new ParseOps.IncrementOp(1),
      name: new ParseOps.SetOp('override'),
    });
    expect(
      ObjectStateMutations.estimateAttribute(
        serverData,
        pendingOps,
        { className: 'someClass', id: 'someId' },
        'counter'
      )
    ).toBe(15);
    expect(
      ObjectStateMutations.estimateAttribute(
        serverData,
        pendingOps,
        { className: 'someClass', id: 'someId' },
        'name'
      )
    ).toBe('override');

    pendingOps.push({ likes: new ParseOps.RelationOp([], []) });
    const relation = ObjectStateMutations.estimateAttribute(
      serverData,
      pendingOps,
      { className: 'someClass', id: 'someId' },
      'likes'
    );
    expect(relation.parent.id).toBe('someId');
    expect(relation.parent.className).toBe('someClass');
    expect(relation.key).toBe('likes');
  });

  it('can estimate all attributes', () => {
    const serverData = { counter: 12 };
    const pendingOps = [{ counter: new ParseOps.IncrementOp(2), name: new ParseOps.SetOp('foo') }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      counter: 14,
      name: 'foo',
    });

    pendingOps.push({
      counter: new ParseOps.IncrementOp(1),
      name: new ParseOps.SetOp('override'),
    });
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      counter: 15,
      name: 'override',
    });

    pendingOps.push({ likes: new ParseOps.RelationOp([], []) });
    const attributes = ObjectStateMutations.estimateAttributes(serverData, pendingOps, {
      className: 'someClass',
      id: 'someId',
    });
    expect(attributes.likes.parent.id).toBe('someId');
    expect(attributes.likes.parent.className).toBe('someClass');
    expect(attributes.likes.key).toBe('likes');
  });

  it('can estimate attributes for nested documents', () => {
    let serverData = { objectField: { counter: 10, letter: 'a' } };
    let pendingOps = [{ 'objectField.counter': new ParseOps.IncrementOp(2) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      objectField: {
        counter: 12,
        letter: 'a',
      },
    });
    pendingOps = [{ 'objectField.counter': new ParseOps.SetOp(20) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      objectField: {
        counter: 20,
        letter: 'a',
      },
    });
    serverData = {};
    pendingOps = [{ 'objectField.subField.subField.counter': new ParseOps.IncrementOp(20) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      objectField: {
        subField: {
          subField: {
            counter: 20,
          },
        },
      },
    });
  });

  it('can estimate attributes for nested array documents', () => {
    // Test without initial value
    let serverData = { _id: 'someId', className: 'bug' };
    let pendingOps = [{ 'items.0.count': new ParseOps.IncrementOp(1) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      _id: 'someId',
      items: [{ count: 1 }],
      className: 'bug',
    });

    // Test one level nested
    serverData = {
      _id: 'someId',
      items: [
        { value: 'a', count: 5 },
        { value: 'b', count: 1 },
      ],
      className: 'bug',
      number: 2,
    };
    pendingOps = [{ 'items.0.count': new ParseOps.IncrementOp(1) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      _id: 'someId',
      items: [
        { value: 'a', count: 6 },
        { value: 'b', count: 1 },
      ],
      className: 'bug',
      number: 2,
    });

    // Test multiple level nested fields
    serverData = {
      _id: 'someId',
      items: [
        { value: { count: 54 }, count: 5 },
        { value: 'b', count: 1 },
      ],
      className: 'bug',
      number: 2,
    };
    pendingOps = [{ 'items.0.value.count': new ParseOps.IncrementOp(6) }];
    expect(
      ObjectStateMutations.estimateAttributes(serverData, pendingOps, 'someClass', 'someId')
    ).toEqual({
      _id: 'someId',
      items: [
        { value: { count: 60 }, count: 5 },
        { value: 'b', count: 1 },
      ],
      className: 'bug',
      number: 2,
    });
  });

  it('can commit changes from the server', () => {
    const serverData = {};
    const objectCache = {};
    ObjectStateMutations.commitServerChanges(serverData, objectCache, {
      name: 'foo',
      data: { count: 5 },
    });
    expect(serverData).toEqual({ name: 'foo', data: { count: 5 } });
    expect(objectCache).toEqual({ data: '{"count":5}' });
  });

  it('can commit nested changes from the server', () => {
    const serverData = {};
    const objectCache = {};
    ObjectStateMutations.commitServerChanges(serverData, objectCache, {
      'name.foo': 'bar',
      data: { count: 5 },
    });
    expect(serverData).toEqual({ name: { foo: 'bar' }, data: { count: 5 } });
    expect(objectCache).toEqual({ data: '{"count":5}' });
  });

  it('can commit dot notation array changes from the server', () => {
    const serverData = {
      items: [
        { value: 'a', count: 5 },
        { value: 'b', count: 1 },
      ],
    };
    ObjectStateMutations.commitServerChanges(
      serverData,
      {},
      {
        'items.0.count': 15,
        'items.1.count': 4,
      }
    );
    expect(serverData).toEqual({
      items: [
        { value: 'a', count: 15 },
        { value: 'b', count: 4 },
      ],
    });
  });

  it('can commit dot notation array changes from the server to empty serverData', () => {
    const serverData = {};
    ObjectStateMutations.commitServerChanges(
      serverData,
      {},
      {
        'items.0.count': 15,
        'items.1.count': 4,
      }
    );
    expect(serverData).toEqual({ items: [{ count: 15 }, { count: 4 }] });
  });

  it('can commit nested json array changes from the server to empty serverData', () => {
    const serverData = {};
    const objectCache = {};
    ObjectStateMutations.commitServerChanges(serverData, objectCache, {
      items: { '0': { count: 20 }, '1': { count: 5 } },
    });
    // Should not transform
    expect(serverData).toEqual({ items: { '0': { count: 20 }, '1': { count: 5 } } });
    expect(objectCache).toEqual({ items: '{"0":{"count":20},"1":{"count":5}}' });
  });

  it('can commit json array with PushStatus offset fields', () => {
    const serverData = {};
    const objectCache = {};
    ObjectStateMutations.commitServerChanges(serverData, objectCache, {
      sentPerUTCOffset: { '1': { count: 20 } },
      failedPerUTCOffset: { '5': { count: 25 } },
    });
    // Should not transform to an array
    expect(serverData).toEqual({
      sentPerUTCOffset: { '1': { count: 20 } },
      failedPerUTCOffset: { '5': { count: 25 } },
    });
    expect(objectCache).toEqual({
      sentPerUTCOffset: '{"1":{"count":20}}',
      failedPerUTCOffset: '{"5":{"count":25}}',
    });
  });

  it('can generate a default state for implementations', () => {
    expect(ObjectStateMutations.defaultState()).toEqual({
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false,
    });
  });
});
