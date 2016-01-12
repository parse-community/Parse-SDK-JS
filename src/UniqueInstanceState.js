/**
 * Copyright (c) 2015-present, Parse, LLC.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

import * as ObjectState from './ObjectState';
import TaskQueue from './TaskQueue';

import type ParseObject from './ParseObject';

let objectState = new WeakMap();

export function getState(obj: ParseObject): ?State {
  let classData = objectState.get(obj);
  return classData || null;
}

export function initializeState(obj: ParseObject, initial?: State): State {
  let state = getState(obj);
  if (state) {
    return state;
  }
  if (!initial) {
    initial = {
      serverData: {},
      pendingOps: [{}],
      objectCache: {},
      tasks: new TaskQueue(),
      existed: false
    };
  }
  state = initial;
  objectState.set(obj, state);
  return state;
}

export function removeState(obj: ParseObject): ?State {
  let state = getState(obj);
  if (state === null) {
    return null;
  }
  objectState.delete(obj);
  return state;
}

export function getServerData(obj: ParseObject): AttributeMap {
  let state = getState(obj);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(obj: ParseObject, attributes: AttributeMap) {
  let serverData = initializeState(obj).serverData;
  ObjectState.setServerData(serverData, attributes);
}

export function getPendingOps(obj: ParseObject): Array<OpsMap> {
  let state = getState(obj);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(obj: ParseObject, attr: string, op: ?Op) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectState.setPendingOp(pendingOps, attr, op);
}

export function pushPendingState(obj: ParseObject) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectState.pushPendingState(pendingOps);
}

export function popPendingState(obj: ParseObject): OpsMap {
  let pendingOps = initializeState(obj).pendingOps;
  return ObjectState.popPendingState(pendingOps);
}

export function mergeFirstPendingState(obj: ParseObject) {
  let pendingOps = getPendingOps(obj);
  ObjectState.mergeFirstPendingState(pendingOps);
}

export function getObjectCache(obj: ParseObject): ObjectCache {
  let state = getState(obj);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(obj: ParseObject, attr: string): mixed {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectState.estimateAttribute(serverData, pendingOps, obj.className, obj.id, attr);
}

export function estimateAttributes(obj: ParseObject): AttributeMap {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectState.estimateAttributes(serverData, pendingOps, obj.className, obj.id);
}

export function commitServerChanges(obj: ParseObject, changes: AttributeMap) {
  let state = initializeState(obj);
  ObjectState.commitServerChanges(state.serverData, state.objectCache, changes);
}

export function enqueueTask(obj: ParseObject, task: () => ParsePromise) {
  let state = initializeState(obj);
  return state.tasks.enqueue(task);
}

export function clearAllState() {
  objectState = new WeakMap();
}
