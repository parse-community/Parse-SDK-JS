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

import * as ObjectStateMutations from './ObjectStateMutations';

import type { Op } from './ParseOp';
import type ParsePromise from './ParsePromise';
import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';

type ObjectIdentifier = {
  className: string;
  id: string
};

let objectState: {
  [className: string]: {
    [id: string]: State
  }
} = {};

export function getState(obj: ObjectIdentifier): ?State {
  let classData = objectState[obj.className];
  if (classData) {
    return classData[obj.id] || null;
  }
  return null;
}

export function initializeState(obj: ObjectIdentifier, initial?: State): State {
  let state = getState(obj);
  if (state) {
    return state;
  }
  if (!objectState[obj.className]) {
    objectState[obj.className] = {};
  }
  if (!initial) {
    initial = ObjectStateMutations.defaultState();
  }
  state = objectState[obj.className][obj.id] = initial;
  return state;
}

export function removeState(obj: ObjectIdentifier): ?State {
  let state = getState(obj);
  if (state === null) {
    return null;
  }
  delete objectState[obj.className][obj.id];
  return state;
}

export function getServerData(obj: ObjectIdentifier): AttributeMap {
  let state = getState(obj);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(obj: ObjectIdentifier, attributes: AttributeMap) {
  let serverData = initializeState(obj).serverData;
  ObjectStateMutations.setServerData(serverData, attributes);
}

export function getPendingOps(obj: ObjectIdentifier): Array<OpsMap> {
  let state = getState(obj);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(obj: ObjectIdentifier, attr: string, op: ?Op) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.setPendingOp(pendingOps, attr, op);
}

export function pushPendingState(obj: ObjectIdentifier) {
  let pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.pushPendingState(pendingOps);
}

export function popPendingState(obj: ObjectIdentifier): OpsMap {
  let pendingOps = initializeState(obj).pendingOps;
  return ObjectStateMutations.popPendingState(pendingOps);
}

export function mergeFirstPendingState(obj: ObjectIdentifier) {
  let pendingOps = getPendingOps(obj);
  ObjectStateMutations.mergeFirstPendingState(pendingOps);
}

export function getObjectCache(obj: ObjectIdentifier): ObjectCache {
  let state = getState(obj);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(obj: ObjectIdentifier, attr: string): mixed {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttribute(serverData, pendingOps, obj.className, obj.id, attr);
}

export function estimateAttributes(obj: ObjectIdentifier): AttributeMap {
  let serverData = getServerData(obj);
  let pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttributes(serverData, pendingOps, obj.className, obj.id);
}

export function commitServerChanges(obj: ObjectIdentifier, changes: AttributeMap) {
  let state = initializeState(obj);
  ObjectStateMutations.commitServerChanges(state.serverData, state.objectCache, changes);
}

export function enqueueTask(obj: ObjectIdentifier, task: () => ParsePromise): ParsePromise {
  let state = initializeState(obj);
  return state.tasks.enqueue(task);
}

export function clearAllState() {
  objectState = {};
}
