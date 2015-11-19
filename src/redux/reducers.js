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
		var classState = {...objectState[className]};
		var obj = {...objectState[className][id]};
		var data = {...obj.serverData};
	  for (var attr in attributes) {
	    if (typeof attributes[attr] !== 'undefined') {
	      data[attr] = attributes[attr];
	    } else {
	      delete data[attr];
	    }
	  }
	  obj.serverData = data;
	  classState[id] = obj;
	  objectState[className] = classState;
	  return objectState;
	},
	SET_PENDING_OP: function(objectState, className, id, op) {

	},
	PUSH_PENDING_STATE: function(objectState, className, id) {

	},
	POP_PENDING_STATE: function(objectState, className, id) {

	},
	MERGE_FIRST_PENDING_STATE: function(objectState, className, id) {

	},
	ESTIMATE_ATTRIBUTE: function(objectState, className, id, attr) {

	},
	ESTIMATE_ATTRIBUTES: function(objectState, className, id) {

	},
	COMMIT_SERVER_CHANGES: function(objectState, className, id, changes) {

	},
	ENQUEUE_TASK: function(objectState, className, id, task) {

	}
}

export function parse(state = {}, action) {
	if (actions[action.type])
		return actions[action.type](state, ...action.payload);
	return state;
}