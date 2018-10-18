"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultState = defaultState;
exports.setServerData = setServerData;
exports.setPendingOp = setPendingOp;
exports.pushPendingState = pushPendingState;
exports.popPendingState = popPendingState;
exports.mergeFirstPendingState = mergeFirstPendingState;
exports.estimateAttribute = estimateAttribute;
exports.estimateAttributes = estimateAttributes;
exports.commitServerChanges = commitServerChanges;

var _encode = _interopRequireDefault(require("./encode"));

var _ParseFile = _interopRequireDefault(require("./ParseFile"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _ParseRelation = _interopRequireDefault(require("./ParseRelation"));

var _TaskQueue = _interopRequireDefault(require("./TaskQueue"));

var _ParseOp = require("./ParseOp");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
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


function defaultState()
/*: State*/
{
  return {
    serverData: {},
    pendingOps: [{}],
    objectCache: {},
    tasks: new _TaskQueue.default(),
    existed: false
  };
}

function setServerData(serverData
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

function setPendingOp(pendingOps
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

function pushPendingState(pendingOps
/*: Array<OpsMap>*/
) {
  pendingOps.push({});
}

function popPendingState(pendingOps
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

function mergeFirstPendingState(pendingOps
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

function estimateAttribute(serverData
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
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
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

function estimateAttributes(serverData
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
      if (pendingOps[i][attr] instanceof _ParseOp.RelationOp) {
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

function commitServerChanges(serverData
/*: AttributeMap*/
, objectCache
/*: ObjectCache*/
, changes
/*: AttributeMap*/
) {
  for (const attr in changes) {
    const val = changes[attr];
    serverData[attr] = val;

    if (val && typeof val === 'object' && !(val instanceof _ParseObject.default) && !(val instanceof _ParseFile.default) && !(val instanceof _ParseRelation.default)) {
      const json = (0, _encode.default)(val, false, true);
      objectCache[attr] = JSON.stringify(json);
    }
  }
}