import encode from './encode';
import ParseFile from './ParseFile';
import ParseObject from './ParseObject';
import ParseRelation from './ParseRelation';
import { combineReducers } from 'redux';
import { get, set } from './Cloud';

const ObjectActions = {
	INITIALIZE_STATE(objectState, payload) {
		var {className, id, initial} = payload;
		var initial = payload.initial;

	  objectState = {...objectState};
	  if (!objectState[className]) {
	    objectState[className] = {};
	  } else {
	  	objectState[className] = {...objectState[className]};
	  }

	  if (!initial) {
	    initial = {
	      serverData: {},
	      pendingOps: [{}],
	      objectCache: {},
	      // tasks: new TaskQueue(),
	      existed: false
	    };
	  }
	  objectState[className][id] = initial;
	  return objectState;
	},
	REMOVE_STATE(objectState, payload) {
		var {className, id} = payload;

	  objectState = {...objectState};
	  objectState[className] = {...objectState[className]};
	  delete objectState[className][id];
	  return objectState;
	},
	SET_SERVER_DATA(objectState, payload) {
		var {className, id, attributes} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var data = objectState[className][id].serverData = {...objectState[className][id].serverData};

	  for (var attr in attributes) {
	    if (typeof attributes[attr] !== 'undefined') {
	      data[attr] = attributes[attr];
	    } else {
	      delete data[attr];
	    }
	  }

	  return objectState;
	},
	SET_PENDING_OP(objectState, payload) {
		var {className, id, attr, op} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

	  var last = pending.length - 1;
	  if (op) {
	    pending[last][attr] = op;
	  } else {
	    delete pending[last][attr];
	  }

	  return objectState;
	},
	PUSH_PENDING_STATE(objectState, payload) {
		var {className, id} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

		pending.push({});

		return objectState;
	},
	POP_PENDING_STATE(objectState, payload) {
		var {className, id} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

	  pending.shift();
	  if (!pending.length) {
	    pending[0] = {};
	  }

	  return objectState;
	},
	MERGE_FIRST_PENDING_STATE(objectState, payload) {
		var {className, id} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

		var first = pending.shift();
	  var pending;
	  var next = pending[0] = {...pending[0]};
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

		return objectState;
	},
	COMMIT_SERVER_CHANGES(objectState, payload) {
		var {className, id, changes} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var serverData = objectState[className][id].serverData = {...objectState[className][id].serverData};
		var objectCache = objectState[className][id].objectCache = {...objectState[className][id].objectCache};

	  for (var attr in changes) {
	    var val = changes[attr];
	    serverData[attr] = val;
	    if (val &&
	      typeof val === 'object' &&
	      !(val instanceof ParseObject) &&
	      !(val instanceof ParseFile) &&
	      !(val instanceof ParseRelation)
	    ) {
	      var json = encode(val, false, true);
	      objectCache[attr] = JSON.stringify(json);
	    }
	  }

		return objectState;
	},
	CLEAR_ALL_STATE() {
		return {};
	},
	SET_EXISTED(objectState, payload) {
		var {className, id, existed} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		var myObject = objectState[className][id] = {...objectState[className][id]};

		myObject.existed = existed;

		return objectState;
	}
}

function Objects(state = {}, action) {
	if (ObjectActions[action.type])
		return ObjectActions[action.type](state, action.payload);
	return state;
}

const QueryActions = {

}

function Queries(state = {}, action) {
	if (QueryActions[action.type])
		return QueryActions[action.type](state, action.payload);
	return state;
}

const FunctionActions = {
	SET_PENDING(state, payload) {
		var value = get(state, payload);
		if (value.pending === true)
			console.error('Cloud Code function ' + payload.name + ' is pending.');

		value = {...value};
		value.pending = true;

		return set(state, payload, value);
	},
	UNSET_PENDING(state, payload) {
		var value = get(state, payload);
		if (value.pending === false)
			console.error('Pending already set to false on ' + payload.name + '.');

		value = {...value};
		value.pending = false;

		return set(state, payload, value);
	},
	SAVE_RESULT(state, payload) {
		var value = {
			cache: payload.result,
			pending: false
		};

		return set(state, payload, value);
	},
	APPEND_RESULT(state, payload) {
		var value = get(state, payload);
		if (value.pending === false)
			console.error('Pending already set to false on ' + payload.name + '.');

		var result = payload.result;
		if (!Array.isArray(result))
			console.warn('Attempted to append a non-array value.');

		var cache = value.cache ? [...value.cache] : [];
		cache.push(...result);

		value = {
			cache,
			pending: false
		};

		return set(state, payload, value);
	}
}

function Functions(state = {}, action) {
	if (FunctionActions[action.type])
		return FunctionActions[action.type](state, action.payload);
	return state;
}

export default combineReducers({
	Objects,
	Queries,
	Functions
});