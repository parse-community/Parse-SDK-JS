import TaskQueue from '../TaskQueue';

var getAnObjectState = function(objectState, className, id) {
  var classData = objectState[className];
  if (classData) {
    return classData[id] || null;
  }
  return null;
};

var actions = {
	INITIALIZE_STATE: function(objectState, className, id, initial) {
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
	      tasks: new TaskQueue(),
	      existed: false
	    };
	  }
	  objectState[className][id] = initial;
	  return objectState;
	},
	REMOVE_STATE: function(objectState, className, id) {
	  objectState = {...objectState};
	  objectState[className] = {...objectState[className]};
	  delete objectState[className][id];
	  return objectState;
	},
	SET_SERVER_DATA: function(objectState, className, id, attributes) {
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
	SET_PENDING_OP: function(objectState, className, id, attr, op) {
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
	PUSH_PENDING_STATE: function(objectState, className, id) {
		objectState = {...objectState};
		objectState[className] = {...objectState[className]};
		objectState[className][id] = {...objectState[className][id]};
		var pending = objectState[className][id].pendingOps = [...objectState[className][id].pendingOps];

		pending.push({});

		return objectState;
	},
	POP_PENDING_STATE: function(objectState, className, id) {
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
	MERGE_FIRST_PENDING_STATE: function(objectState, className, id) {

	},
	COMMIT_SERVER_CHANGES: function(objectState, className, id, changes) {

	},
	ENQUEUE_TASK: function(objectState, className, id, task) {

	},
	CLEAR_ALL_STATE: function() {
		return {};
	}
}

export function parse(state = {}, action) {
	if (actions[action.type])
		return actions[action.type](state, ...action.payload);
	return state;
}