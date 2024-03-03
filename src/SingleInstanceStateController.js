/**
 * @flow
 */

import * as ObjectStateMutations from './ObjectStateMutations';

import type { Op } from './ParseOp';
import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';
import ParseObject from './ParseObject';

type ObjectIdentifier = {
  className: string,
  id: string,
};

let objectState: {
  [className: string]: {
    [id: string]: State,
  },
} = {};

export function getState(obj: ObjectIdentifier): ?State {
  const classData = objectState[obj.className];
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
  const state = getState(obj);
  if (state === null) {
    return null;
  }
  delete objectState[obj.className][obj.id];
  return state;
}

export function getServerData(obj: ObjectIdentifier): AttributeMap {
  const state = getState(obj);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(obj: ObjectIdentifier, attributes: AttributeMap) {
  const serverData = initializeState(obj).serverData;
  ObjectStateMutations.setServerData(serverData, attributes);
}

export function getPendingOps(obj: ObjectIdentifier): Array<OpsMap> {
  const state = getState(obj);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(obj: ObjectIdentifier, attr: string, op: ?Op) {
  const pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.setPendingOp(pendingOps, attr, op);
}

export function pushPendingState(obj: ObjectIdentifier) {
  const pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.pushPendingState(pendingOps);
}

export function popPendingState(obj: ObjectIdentifier): OpsMap {
  const pendingOps = initializeState(obj).pendingOps;
  return ObjectStateMutations.popPendingState(pendingOps);
}

export function mergeFirstPendingState(obj: ObjectIdentifier) {
  const pendingOps = getPendingOps(obj);
  ObjectStateMutations.mergeFirstPendingState(pendingOps);
}

export function getObjectCache(obj: ObjectIdentifier): ObjectCache {
  const state = getState(obj);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(obj: ParseObject, attr: string): mixed {
  const serverData = getServerData(obj);
  const pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttribute(serverData, pendingOps, obj, attr);
}

export function estimateAttributes(obj: ParseObject): AttributeMap {
  const serverData = getServerData(obj);
  const pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttributes(serverData, pendingOps, obj);
}

export function commitServerChanges(obj: ObjectIdentifier, changes: AttributeMap) {
  const state = initializeState(obj);
  ObjectStateMutations.commitServerChanges(state.serverData, state.objectCache, changes);
}

export function enqueueTask(obj: ObjectIdentifier, task: () => Promise): Promise {
  const state = initializeState(obj);
  return state.tasks.enqueue(task);
}

export function clearAllState() {
  objectState = {};
}

export function duplicateState(source: { id: string }, dest: { id: string }) {
  dest.id = source.id;
}
