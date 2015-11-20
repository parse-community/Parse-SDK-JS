import encode from '../encode';
import ParseFile from '../ParseFile';
import ParseObject from '../ParseObject';
import ParseRelation from '../ParseRelation';

var actions = {
	INITIALIZE_STATE: function(objectState, payload) {
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
	REMOVE_STATE: function(objectState, payload) {
		var {className, id} = payload;

	  objectState = {...objectState};
	  objectState[className] = {...objectState[className]};
	  delete objectState[className][id];
	  return objectState;
	},
	SET_SERVER_DATA: function(objectState, payload) {
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
	SET_PENDING_OP: function(objectState, payload) {
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
	PUSH_PENDING_STATE: function(objectState, payload) {
		var {className, id} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

		pending.push({});

		return objectState;
	},
	POP_PENDING_STATE: function(objectState, payload) {
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
	MERGE_FIRST_PENDING_STATE: function(objectState, payload) {
		var {className, id} = payload;

		// TODO

		return objectState;
	},
	COMMIT_SERVER_CHANGES: function(objectState, payload) {
		var {className, id, changes} = payload;

		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var serverData = objectState[className][id].serverData = {...objectState[className][id].serverData};
		var objectCache = objectState[className][id].objectCache = {...objectState[className][id].serverData};

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
	CLEAR_ALL_STATE: function() {
		return {};
	}
}

export default function parse(state = {}, action) {
	if (actions[action.type])
		return actions[action.type](state, action.payload);
	return state;
}