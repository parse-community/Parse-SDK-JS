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

let objectState: {
  [className: string]: {
    [id: string]: State
  }
} = {};

export function getState(className: string, id: string): ?State {
  let classData = objectState[className];
  if (classData) {
    return classData[id] || null;
  }
  return null;
}

export function initializeState(className: string, id: string, initial?: State): State {
  let state = getState(className, id);
  if (state) {
    return state;
  }
  if (!objectState[className]) {
    objectState[className] = {};
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
  state = objectState[className][id] = initial;
  return state;
}

export function removeState(className: string, id: string): ?State {
  let state = getState(className, id);
  if (state === null) {
    return null;
  }
  delete objectState[className][id];
  return state;
}

export function getServerData(className: string, id: string): AttributeMap {
  let state = getState(className, id);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(className: string, id: string, attributes: AttributeMap) {
  let serverData = initializeState(className, id).serverData;
  ObjectState.setServerData(serverData, attributes);
}

export function getPendingOps(className: string, id: string): Array<OpsMap> {
  let state = getState(className, id);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(className: string, id: string, attr: string, op: ?Op) {
  let pendingOps = initializeState(className, id).pendingOps;
  ObjectState.setPendingOp(pendingOps, attr, op);
}

export function pushPendingState(className: string, id: string) {
  let pendingOps = initializeState(className, id).pendingOps;
  ObjectState.pushPendingState(pendingOps);
}

export function popPendingState(className: string, id: string): OpsMap {
  let pendingOps = initializeState(className, id).pendingOps;
  return ObjectState.popPendingState(pendingOps);
}

export function mergeFirstPendingState(className: string, id: string) {
  let pendingOps = getPendingOps(className, id);
  ObjectState.mergeFirstPendingState(pendingOps);
}

export function getObjectCache(className: string, id: string): ObjectCache {
  let state = getState(className, id);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(className: string, id: string, attr: string): mixed {
  let serverData = getServerData(className, id);
  let pendingOps = getPendingOps(className, id);
  return ObjectState.estimateAttribute(serverData, pendingOps, className, id, attr);
}

export function estimateAttributes(className: string, id: string): AttributeMap {
  let serverData = getServerData(className, id);
  let pendingOps = getPendingOps(className, id);
  return ObjectState.estimateAttributes(serverData, pendingOps, className, id);
}

export function commitServerChanges(className: string, id: string, changes: AttributeMap) {
  let state = initializeState(className, id);
  ObjectState.commitServerChanges(state.serverData, state.objectCache, changes);
}

export function enqueueTask(className: string, id: string, task: () => ParsePromise) {
  let state = initializeState(className, id);
  return state.tasks.enqueue(task);
}

export function _clearAllState() {
  objectState = {};
}
