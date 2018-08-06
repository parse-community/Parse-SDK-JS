/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

jest.autoMockOff();

var TaskQueue = require('../TaskQueue');
const { resolvingPromise } = require('../promiseUtils');

describe('TaskQueue', () => {
  it('is initialized with an empty queue', () => {
    var q = new TaskQueue();
    expect(q.queue).toEqual([]);
  });

  it('runs a single task immediately', async () => {
    var q = new TaskQueue();
    var resolve;
    var p = new Promise((res) => resolve = res);
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
    resolve();
    await new Promise((resolve) => setImmediate(resolve));
    expect(completed).toBe(true);
  });

  it('rejects the enqueue promise when the task errors', async (done) => {
    var q = new TaskQueue();
    var reject;
    var p = new Promise((res, rej) => reject = rej);
    var called = false;
    var completed = false;
    var t = q.enqueue(() => {
      called = true;
      return p;
    });
    expect(called).toBe(true);
    reject('error');
    try {
      await t
      done.fail('should throw');
    } catch(e) {
      done();
    }
  })

  it('can execute a chain of tasks', async () => {
    var q = new TaskQueue();
    var called = [false, false, false];
    var completed = [false, false, false];
    var promises = [resolvingPromise(), resolvingPromise(), resolvingPromise()];
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
    await new Promise(r => setImmediate(r));
    expect(called).toEqual([true, true, false]);
    expect(completed).toEqual([true, false, false]);
    expect(q.queue.length).toBe(2);
    promises[1].resolve();
    await new Promise(r => setImmediate(r));
    expect(called).toEqual([true, true, true]);
    expect(completed).toEqual([true, true, false]);
    expect(q.queue.length).toBe(1);
    promises[2].resolve();
    await new Promise(r => setImmediate(r));
    expect(completed).toEqual([true, true, true]);
    expect(q.queue.length).toBe(0);
  });

  it('continues the chain when a task errors', async () => {
    var q = new TaskQueue();
    var called = [false, false, false];
    var promises = [resolvingPromise(), resolvingPromise(), resolvingPromise()];
    q.enqueue(() => {
      called[0] = true;
      return promises[0];
    }).catch(() => {}); // need to catch here as we're using async/await and it fails the test
    q.enqueue(() => {
      called[1] = true;
      return promises[1];
    });
    q.enqueue(() => {
      called[2] = true;
      return promises[2];
    });
    expect(called).toEqual([true, false, false]);
    promises[0].catch(() => {});
    promises[0].reject('oops');
    await new Promise(r => setImmediate(r));
    expect(called).toEqual([true, true, false]);
    expect(q.queue.length).toBe(2);
    promises[1].resolve();
    await new Promise(r => setImmediate(r));
    expect(called).toEqual([true, true, true]);
    expect(q.queue.length).toBe(1);
    promises[2].resolve();
    await new Promise(r => setImmediate(r));
    expect(q.queue.length).toBe(0);
  });
});
