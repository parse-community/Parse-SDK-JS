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
import TaskQueue from './TaskQueue';
/*:: import type { Op } from './ParseOp';*/

/*:: import type ParseObject from './ParseObject';*/

/*:: import type { AttributeMap, ObjectCache, OpsMap, State } from './ObjectStateMutations';*/

let objectState = new WeakMap();
export function getState(obj
/*: ParseObject*/
)
/*: ?State*/
{
  const classData = objectState.get(obj);
  return classData || null;
}
export function initializeState(obj
/*: ParseObject*/
, initial
/*:: ?: State*/
)
/*: State*/
{
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
export function removeState(obj
/*: ParseObject*/
)
/*: ?State*/
{
  const state = getState(obj);

  if (state === null) {
    return null;
  }

  objectState.delete(obj);
  return state;
}
export function getServerData(obj
/*: ParseObject*/
)
/*: AttributeMap*/
{
  const state = getState(obj);

  if (state) {
    return state.serverData;
  }

  return {};
}
export function setServerData(obj
/*: ParseObject*/
, attributes
/*: AttributeMap*/
) {
  const serverData = initializeState(obj).serverData;
  ObjectStateMutations.setServerData(serverData, attributes);
}
export function getPendingOps(obj
/*: ParseObject*/
)
/*: Array<OpsMap>*/
{
  const state = getState(obj);

  if (state) {
    return state.pendingOps;
  }

  return [{}];
}
export function setPendingOp(obj
/*: ParseObject*/
, attr
/*: string*/
, op
/*: ?Op*/
) {
  const pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.setPendingOp(pendingOps, attr, op);
}
export function pushPendingState(obj
/*: ParseObject*/
) {
  const pendingOps = initializeState(obj).pendingOps;
  ObjectStateMutations.pushPendingState(pendingOps);
}
export function popPendingState(obj
/*: ParseObject*/
)
/*: OpsMap*/
{
  const pendingOps = initializeState(obj).pendingOps;
  return ObjectStateMutations.popPendingState(pendingOps);
}
export function mergeFirstPendingState(obj
/*: ParseObject*/
) {
  const pendingOps = getPendingOps(obj);
  ObjectStateMutations.mergeFirstPendingState(pendingOps);
}
export function getObjectCache(obj
/*: ParseObject*/
)
/*: ObjectCache*/
{
  const state = getState(obj);

  if (state) {
    return state.objectCache;
  }

  return {};
}
export function estimateAttribute(obj
/*: ParseObject*/
, attr
/*: string*/
)
/*: mixed*/
{
  const serverData = getServerData(obj);
  const pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttribute(serverData, pendingOps, obj.className, obj.id, attr);
}
export function estimateAttributes(obj
/*: ParseObject*/
)
/*: AttributeMap*/
{
  const serverData = getServerData(obj);
  const pendingOps = getPendingOps(obj);
  return ObjectStateMutations.estimateAttributes(serverData, pendingOps, obj.className, obj.id);
}
export function commitServerChanges(obj
/*: ParseObject*/
, changes
/*: AttributeMap*/
) {
  const state = initializeState(obj);
  ObjectStateMutations.commitServerChanges(state.serverData, state.objectCache, changes);
}
export function enqueueTask(obj
/*: ParseObject*/
, task
/*: () => Promise*/
)
/*: Promise*/
{
  const state = initializeState(obj);
  return state.tasks.enqueue(task);
}
export function duplicateState(source
/*: ParseObject*/
, dest
/*: ParseObject*/
)
/*: void*/
{
  const oldState = initializeState(source);
  const newState = initializeState(dest);

  for (const key in oldState.serverData) {
    newState.serverData[key] = oldState.serverData[key];
  }

  for (let index = 0; index < oldState.pendingOps.length; index++) {
    for (const key in oldState.pendingOps[index]) {
      newState.pendingOps[index][key] = oldState.pendingOps[index][key];
    }
  }

  for (const key in oldState.objectCache) {
    newState.objectCache[key] = oldState.objectCache[key];
  }

  newState.existed = oldState.existed;
}
export function clearAllState() {
  objectState = new WeakMap();
}