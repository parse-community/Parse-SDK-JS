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

import encode from './encode';
import ParseFile from './ParseFile';
import ParseObject from './ParseObject';
import ParsePromise from './ParsePromise';
import ParseRelation from './ParseRelation';
import TaskQueue from './TaskQueue';
import { RelationOp } from './ParseOp';

import type { Op } from './ParseOp';

export type AttributeMap = { [attr: string]: any };
export type OpsMap = { [attr: string]: Op };
export type ObjectCache = { [attr: string]: string };

type State = {
  serverData: AttributeMap;
  pendingOps: Array<OpsMap>;
  objectCache: ObjectCache;
  tasks: TaskQueue;
  existed: boolean
};

var objectState: {
  [className: string]: {
    [id: string]: State
  }
} = {};

export function getState(className: string, id: string): ?State {
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
  var state = getState(className, id);
  if (state === null) {
    return null;
  }
  delete objectState[className][id];
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
  var data = initializeState(className, id).serverData;
  for (var attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      data[attr] = attributes[attr];
    } else {
      delete data[attr];
    }
  }
}

export function getPendingOps(className: string, id: string): Array<OpsMap> {
  var state = getState(className, id);
  if (state) {
    return state.pendingOps;
  }
  return [{}];
}

export function setPendingOp(className: string, id: string, attr: string, op: ?Op) {
  var pending = initializeState(className, id).pendingOps;
  var last = pending.length - 1;
  if (op) {
    pending[last][attr] = op;
  } else {
    delete pending[last][attr];
  }
}

export function pushPendingState(className: string, id: string) {
  var pending = initializeState(className, id).pendingOps;
  pending.push({});
}

export function popPendingState(className: string, id: string): OpsMap {
  var pending = initializeState(className, id).pendingOps;
  var first = pending.shift();
  if (!pending.length) {
    pending[0] = {};
  }
  return first;
}

export function mergeFirstPendingState(className: string, id: string) {
  var first = popPendingState(className, id);
  var pending = getPendingOps(className, id);
  var next = pending[0];
  for (var attr in first) {
    if (next[attr] && first[attr]) {
      var merged = next[attr].mergeWith(first[attr]);
      if (merged) {
        next[attr] = merged;
      }
    } else {
      next[attr] = first[attr];
    }
  }
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
  var state = initializeState(className, id);
  for (var attr in changes) {
    var val = changes[attr];
    state.serverData[attr] = val;
    if (val &&
      typeof val === 'object' &&
      !(val instanceof ParseObject) &&
      !(val instanceof ParseFile) &&
      !(val instanceof ParseRelation)
    ) {
      var json = encode(val, false, true);
      state.objectCache[attr] = JSON.stringify(json);
    }
  }
}

export function enqueueTask(className: string, id: string, task: () => ParsePromise) {
  var state = initializeState(className, id);
  return state.tasks.enqueue(task);
}

export function _clearAllState() {
  objectState = {};
}
