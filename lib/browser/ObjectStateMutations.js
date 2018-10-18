"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

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

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _encode = _interopRequireDefault(require("./encode"));

var _ParseFile = _interopRequireDefault(require("./ParseFile"));

var _ParseObject = _interopRequireDefault(require("./ParseObject"));

var _ParseRelation = _interopRequireDefault(require("./ParseRelation"));

var _TaskQueue = _interopRequireDefault(require("./TaskQueue"));

var _ParseOp = require("./ParseOp");
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
  for (var _attr in attributes) {
    if (typeof attributes[_attr] !== 'undefined') {
      serverData[_attr] = attributes[_attr];
    } else {
      delete serverData[_attr];
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
  var last = pendingOps.length - 1;

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
  var first = pendingOps.shift();

  if (!pendingOps.length) {
    pendingOps[0] = {};
  }

  return first;
}

function mergeFirstPendingState(pendingOps
/*: Array<OpsMap>*/
) {
  var first = popPendingState(pendingOps);
  var next = pendingOps[0];

  for (var _attr2 in first) {
    if (next[_attr2] && first[_attr2]) {
      var merged = next[_attr2].mergeWith(first[_attr2]);

      if (merged) {
        next[_attr2] = merged;
      }
    } else {
      next[_attr2] = first[_attr2];
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
  var value = serverData[attr];

  for (var i = 0; i < pendingOps.length; i++) {
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
  var data = {};

  for (var attr in serverData) {
    data[attr] = serverData[attr];
  }

  for (var i = 0; i < pendingOps.length; i++) {
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
  for (var _attr3 in changes) {
    var val = changes[_attr3];
    serverData[_attr3] = val;

    if (val && (0, _typeof2.default)(val) === 'object' && !(val instanceof _ParseObject.default) && !(val instanceof _ParseFile.default) && !(val instanceof _ParseRelation.default)) {
      var json = (0, _encode.default)(val, false, true);
      objectCache[_attr3] = JSON.stringify(json);
    }
  }
}