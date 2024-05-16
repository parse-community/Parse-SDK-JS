import encode from './encode';
import CoreManager from './CoreManager';
import ParseFile from './ParseFile';
import ParseRelation from './ParseRelation';
import TaskQueue from './TaskQueue';
import { RelationOp } from './ParseOp';
import type { Op } from './ParseOp';
import type ParseObject from './ParseObject';

export type AttributeMap = { [attr: string]: any };
export type OpsMap = { [attr: string]: Op };
export type ObjectCache = { [attr: string]: string };

export type State = {
  serverData: AttributeMap,
  pendingOps: Array<OpsMap>,
  objectCache: ObjectCache,
  tasks: TaskQueue,
  existed: boolean,
};

export function defaultState(): State {
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new TaskQueue(),
    existed: false,
  };
}

export function setServerData(serverData: AttributeMap, attributes: AttributeMap) {
  for (const attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      serverData[attr] = attributes[attr];
    } else {
      delete serverData[attr];
    }
  }
}

export function setPendingOp(pendingOps: Array<OpsMap>, attr: string, op?: Op) {
  const last = pendingOps.length - 1;
  if (op) {
    pendingOps[last][attr] = op;
  } else {
    delete pendingOps[last][attr];
  }
}

export function pushPendingState(pendingOps: Array<OpsMap>) {
  pendingOps.push({});
}

export function popPendingState(pendingOps: Array<OpsMap>): OpsMap {
  const first = pendingOps.shift();
  if (!pendingOps.length) {
    pendingOps[0] = {};
  }
  return first;
}

export function mergeFirstPendingState(pendingOps: Array<OpsMap>) {
  const first = popPendingState(pendingOps);
  const next = pendingOps[0];
  for (const attr in first) {
    if (next[attr] && first[attr]) {
      const merged = next[attr].mergeWith(first[attr]);
      if (merged) {
        next[attr] = merged;
      }
    } else {
      next[attr] = first[attr];
    }
  }
}

export function estimateAttribute(
  serverData: AttributeMap,
  pendingOps: Array<OpsMap>,
  object: ParseObject,
  attr: string
): any {
  let value = serverData[attr];
  for (let i = 0; i < pendingOps.length; i++) {
    if (pendingOps[i][attr]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
        if (object.id) {
          value = pendingOps[i][attr].applyTo(value, object, attr);
        }
      } else {
        value = pendingOps[i][attr].applyTo(value);
      }
    }
  }
  return value;
}

export function estimateAttributes(
  serverData: AttributeMap,
  pendingOps: Array<OpsMap>,
  object: ParseObject
): AttributeMap {
  const data = {};
  let attr;
  for (attr in serverData) {
    data[attr] = serverData[attr];
  }
  for (let i = 0; i < pendingOps.length; i++) {
    for (attr in pendingOps[i]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
        if (object.id) {
          data[attr] = pendingOps[i][attr].applyTo(data[attr], object, attr);
        }
      } else {
        if (attr.includes('.')) {
          // convert a.b.c into { a: { b: { c: value } } }
          const fields = attr.split('.');
          const last = fields[fields.length - 1];
          let object = data;
          for (let i = 0; i < fields.length - 1; i++) {
            const key = fields[i];
            if (!(key in object)) {
              object[key] = {};
            } else {
              object[key] = { ...object[key] };
            }
            object = object[key];
          }
          object[last] = pendingOps[i][attr].applyTo(object[last]);
        } else {
          data[attr] = pendingOps[i][attr].applyTo(data[attr]);
        }
      }
    }
  }
  return data;
}

function nestedSet(obj, key, value) {
  const path = key.split('.');
  for (let i = 0; i < path.length - 1; i++) {
    if (!(path[i] in obj)) {
      obj[path[i]] = {};
    }
    obj = obj[path[i]];
  }
  if (typeof value === 'undefined') {
    delete obj[path[path.length - 1]];
  } else {
    obj[path[path.length - 1]] = value;
  }
}

export function commitServerChanges(
  serverData: AttributeMap,
  objectCache: ObjectCache,
  changes: AttributeMap
) {
  const ParseObject = CoreManager.getParseObject();
  for (const attr in changes) {
    const val = changes[attr];
    nestedSet(serverData, attr, val);
    if (
      val &&
      typeof val === 'object' &&
      !(val instanceof ParseObject) &&
      !(val instanceof ParseFile) &&
      !(val instanceof ParseRelation)
    ) {
      const json = encode(val, false, true);
      objectCache[attr] = JSON.stringify(json);
    }
  }
}
