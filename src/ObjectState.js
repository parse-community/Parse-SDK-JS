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

import ParsePromise from './ParsePromise';
import TaskQueue from './TaskQueue';
import { RelationOp } from './ParseOp';

import * as Store from './ReduxStore';
import actionCreators from './ReduxActionCreators';

import type { Op } from './ParseOp';

export type AttributeMap = { [attr: string]: any };
export type OpsMap = { [attr: string]: Op };
export type ObjectCache = { [attr: string]: string };

type State = {
  serverData: AttributeMap;
  pendingOps: Array<OpsMap>;
  objectCache: ObjectCache;
  // tasks: TaskQueue;
  existed: boolean
};

export function getState(className: string, id: string): ?State {
	var myStore = Store.get();
	var name = Store.getName();
	var objectState = myStore.getState()[name];
  var classData = objectState[className];
  if (classData) {
    return classData[id] || null;
  }
  return null;
}

export function initializeState(className: string, id: string, initial?: State): State {
	var state = getState(className, id);
  if (state) {
    return state;
  }

	Store.get().dispatch(actionCreators.initializeState({className, id, initial}));
	return getState(...arguments);
}

export function removeState(className: string, id: string): ?State {
	var state = getState(className, id);
  if (state === null) {
    return null;
  }

	Store.get().dispatch(actionCreators.removeState({className, id}));
	return state;
}

export function getServerData(className: string, id: string): AttributeMap {
  var state = getState(className, id);
  if (state) {
    return state.serverData;
  }
  return {};
}

export function setServerData(className: string, id: string, attributes: AttributeMap) {
  initializeState(className, id).serverData;
  Store.get().dispatch(actionCreators.setServerData({className, id, attributes}));
	return getState(...arguments);
}

export function getPendingOps(className: string, id: string): Array<OpsMap> {
  var state = getState(className, id);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(className: string, id: string, attr: string, op: ?Op) {
  initializeState(className, id);
  Store.get().dispatch(actionCreators.setPendingOp({className, id, attr, op}));
}

export function pushPendingState(className: string, id: string) {
	initializeState(className, id);
  Store.get().dispatch(actionCreators.pushPendingState({className, id}));
}

export function popPendingState(className: string, id: string): OpsMap {
  var first = initializeState(className, id).pendingOps[0];
  Store.get().dispatch(actionCreators.popPendingState({className, id}));
  return first;
}

export function mergeFirstPendingState(className: string, id: string) {
	Store.get().dispatch(actionCreators.mergeFirstPendingState({className, id}));
}

export function getObjectCache(className: string, id: string): ObjectCache {
  var state = getState(className, id);
  if (state) {
    return state.objectCache;
  }
  return {};
}

export function estimateAttribute(className: string, id: string, attr: string): mixed {
  var serverData = getServerData(className, id);
  var value = serverData[attr];
  var pending = getPendingOps(className, id);
  for (var i = 0; i < pending.length; i++) {
    if (pending[i][attr]) {
      if (pending[i][attr] instanceof RelationOp) {
        value = pending[i][attr].applyTo(
          value,
          { className: className, id: id },
          attr
        );
      } else {
        value = pending[i][attr].applyTo(value);
      }
    }
  }
  return value;
}

export function estimateAttributes(className: string, id: string): AttributeMap {
  var data = {};
  var attr;
  var serverData = getServerData(className, id);
  for (attr in serverData) {
    data[attr] = serverData[attr];
  }
  var pending = getPendingOps(className, id);
  for (var i = 0; i < pending.length; i++) {
    for (attr in pending[i]) {
      if (pending[i][attr] instanceof RelationOp) {
        data[attr] = pending[i][attr].applyTo(
          data[attr],
          { className: className, id: id },
          attr
        );
      } else {
        data[attr] = pending[i][attr].applyTo(data[attr]);
      }
    }
  }
  return data;
}

export function commitServerChanges(className: string, id: string, changes: AttributeMap) {
	initializeState(className, id);
  Store.get().dispatch(actionCreators.commitServerChanges({className, id, changes}));
}

var QueueMap = {};
export function enqueueTask(className: string, id: string, task: () => ParsePromise) {
  initializeState(className, id);
  if (!QueueMap[className])
		QueueMap[className] = {};
	if (!QueueMap[className][id])
		QueueMap[className][id] = new TaskQueue();

  return QueueMap[className][id].enqueue(task);
}

export function _clearAllState() {
	Store.get().dispatch(actionCreators._clearAllState());
}

export function _setExisted(className: string, id: string, existed: boolean) {
	Store.get().dispatch(actionCreators._setExisted({className, id, existed}));
}
