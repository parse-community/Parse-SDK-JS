export default {
	initializeState: function(payload) {
		return {
			type: 'INITIALIZE_STATE',
			payload
		};
	},
	removeState: function(payload) {
		return {
			type: 'REMOVE_STATE',
			payload
		};
	},
	setServerData: function(payload) {
		return {
			type: 'SET_SERVER_DATA',
			payload
		};
	},
	setPendingOp: function(payload) {
		return {
			type: 'SET_PENDING_OP',
			payload
		};
	},
	pushPendingState: function(payload) {
		return {
			type: 'PUSH_PENDING_STATE',
			payload
		};
	},
	popPendingState: function(payload) {
		return {
			type: 'POP_PENDING_STATE',
			payload
		};
	},
	mergeFirstPendingState: function(payload) {
		return {
			type: 'MERGE_FIRST_PENDING_STATE',
			payload
		};
	},
	commitServerChanges: function(payload) {
		return {
			type: 'COMMIT_SERVER_CHANGES',
			payload
		};
	},
	_clearAllState: function(payload) {
		return {
			type: 'CLEAR_ALL_STATE',
			payload
		}
	}
}