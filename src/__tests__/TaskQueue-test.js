/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

var ParsePromise = require('../ParsePromise');
var TaskQueue = require('../TaskQueue');

describe('TaskQueue', () => {
  it('is initialized with an empty queue', () => {
    var q = new TaskQueue();
    expect(q.queue).toEqual([]);
  });

  it('runs a single task immediately', () => {
    var q = new TaskQueue();
    var p = new ParsePromise();
    var called = false;
    var completed = false;
    var t = q.enqueue(() => {
      called = true;
      return p.then(() => {
        completed = true;
      });
    });
    expect(called).toBe(true);
    expect(completed).toBe(false);
    p.resolve();
    expect(completed).toBe(true);
    expect(t._resolved).toBe(true);
  });

  it('rejects the enqueue promise when the task errors', () => {
    var q = new TaskQueue();
    var p = new ParsePromise();
    var called = false;
    var completed = false;
    var t = q.enqueue(() => {
      called = true;
      return p;
    });
    expect(called).toBe(true);
    p.reject('error');
    expect(t._rejected).toBe(true);
  })

  it('can execute a chain of tasks', () => {
    var q = new TaskQueue();
    var called = [false, false, false];
    var completed = [false, false, false];
    var promises = [new ParsePromise(), new ParsePromise(), new ParsePromise()];
    q.enqueue(() => {
      called[0] = true;
      return promises[0].then(() => {
        completed[0] = true;
      });
    });
    q.enqueue(() => {
      called[1] = true;
      return promises[1].then(() => {
        completed[1] = true;
      });
    });
    q.enqueue(() => {
      called[2] = true;
      return promises[2].then(() => {
        completed[2] = true;
      });
    });
    expect(called).toEqual([true, false, false]);
    expect(completed).toEqual([false, false, false]);
    promises[0].resolve();
    expect(called).toEqual([true, true, false]);
    expect(completed).toEqual([true, false, false]);
    expect(q.queue.length).toBe(2);
    promises[1].resolve();
    expect(called).toEqual([true, true, true]);
    expect(completed).toEqual([true, true, false]);
    expect(q.queue.length).toBe(1);
    promises[2].resolve();
    expect(completed).toEqual([true, true, true]);
    expect(q.queue.length).toBe(0);
  });

  it('continues the chain when a task errors', () => {
    var q = new TaskQueue();
    var called = [false, false, false];
    var promises = [new ParsePromise(), new ParsePromise(), new ParsePromise()];
    q.enqueue(() => {
      called[0] = true;
      return promises[0];
    });
    q.enqueue(() => {
      called[1] = true;
      return promises[1];
    });
    q.enqueue(() => {
      called[2] = true;
      return promises[2];
    });
    expect(called).toEqual([true, false, false]);
    promises[0].reject();
    expect(called).toEqual([true, true, false]);
    expect(q.queue.length).toBe(2);
    promises[1].resolve();
    expect(called).toEqual([true, true, true]);
    expect(q.queue.length).toBe(1);
    promises[2].resolve();
    expect(q.queue.length).toBe(0);
  });
});
