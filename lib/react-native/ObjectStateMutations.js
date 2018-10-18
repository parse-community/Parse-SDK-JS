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
import ParseRelation from './ParseRelation';
import TaskQueue from './TaskQueue';
import { RelationOp } from './ParseOp';
/*:: import type { Op } from './ParseOp';*/

/*:: export type AttributeMap = { [attr: string]: any };*/

/*:: export type OpsMap = { [attr: string]: Op };*/

/*:: export type ObjectCache = { [attr: string]: string };*/

/*:: export type State = {
  serverData: AttributeMap;
  pendingOps: Array<OpsMap>;
  objectCache: ObjectCache;
  tasks: TaskQueue;
  existed: boolean
};*/

export function defaultState()
/*: State*/
{
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new TaskQueue(),
    existed: false
  };
}
export function setServerData(serverData
/*: AttributeMap*/
, attributes
/*: AttributeMap*/
) {
  for (const attr in attributes) {
    if (typeof attributes[attr] !== 'undefined') {
      serverData[attr] = attributes[attr];
    } else {
      delete serverData[attr];
    }
  }
}
export function setPendingOp(pendingOps
/*: Array<OpsMap>*/
, attr
/*: string*/
, op
/*: ?Op*/
) {
  const last = pendingOps.length - 1;

  if (op) {
    pendingOps[last][attr] = op;
  } else {
    delete pendingOps[last][attr];
  }
}
export function pushPendingState(pendingOps
/*: Array<OpsMap>*/
) {
  pendingOps.push({});
}
export function popPendingState(pendingOps
/*: Array<OpsMap>*/
)
/*: OpsMap*/
{
  const first = pendingOps.shift();

  if (!pendingOps.length) {
    pendingOps[0] = {};
  }

  return first;
}
export function mergeFirstPendingState(pendingOps
/*: Array<OpsMap>*/
) {
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
export function estimateAttribute(serverData
/*: AttributeMap*/
, pendingOps
/*: Array<OpsMap>*/
, className
/*: string*/
, id
/*: ?string*/
, attr
/*: string*/
)
/*: mixed*/
{
  let value = serverData[attr];

  for (let i = 0; i < pendingOps.length; i++) {
    if (pendingOps[i][attr]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
        if (id) {
          value = pendingOps[i][attr].applyTo(value, {
            className: className,
            id: id
          }, attr);
        }
      } else {
        value = pendingOps[i][attr].applyTo(value);
      }
    }
  }

  return value;
}
export function estimateAttributes(serverData
/*: AttributeMap*/
, pendingOps
/*: Array<OpsMap>*/
, className
/*: string*/
, id
/*: ?string*/
)
/*: AttributeMap*/
{
  const data = {};

  for (var attr in serverData) {
    data[attr] = serverData[attr];
  }

  for (let i = 0; i < pendingOps.length; i++) {
    for (attr in pendingOps[i]) {
      if (pendingOps[i][attr] instanceof RelationOp) {
        if (id) {
          data[attr] = pendingOps[i][attr].applyTo(data[attr], {
            className: className,
            id: id
          }, attr);
        }
      } else {
        data[attr] = pendingOps[i][attr].applyTo(data[attr]);
      }
    }
  }

  return data;
}
export function commitServerChanges(serverData
/*: AttributeMap*/
, objectCache
/*: ObjectCache*/
, changes
/*: AttributeMap*/
) {
  for (const attr in changes) {
    const val = changes[attr];
    serverData[attr] = val;

    if (val && typeof val === 'object' && !(val instanceof ParseObject) && !(val instanceof ParseFile) && !(val instanceof ParseRelation)) {
      const json = encode(val, false, true);
      objectCache[attr] = JSON.stringify(json);
    }
  }
}