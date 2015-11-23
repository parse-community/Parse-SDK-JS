export const ObjectActions = {
	initializeState(payload) {
		return {
			type: 'INITIALIZE_STATE',
			payload
		};
	},
	removeState(payload) {
		return {
			type: 'REMOVE_STATE',
			payload
		};
	},
	setServerData(payload) {
		return {
			type: 'SET_SERVER_DATA',
			payload
		};
	},
	setPendingOp(payload) {
		return {
			type: 'SET_PENDING_OP',
			payload
		};
	},
	pushPendingState(payload) {
		return {
			type: 'PUSH_PENDING_STATE',
			payload
		};
	},
	popPendingState(payload) {
		return {
			type: 'POP_PENDING_STATE',
			payload
		};
	},
	mergeFirstPendingState(payload) {
		return {
			type: 'MERGE_FIRST_PENDING_STATE',
			payload
		};
	},
	commitServerChanges(payload) {
		return {
			type: 'COMMIT_SERVER_CHANGES',
			payload
		};
	},
	_clearAllState(payload) {
		return {
			type: 'CLEAR_ALL_STATE',
			payload
		}
	},
	_setExisted(payload) {
		return {
			type: 'SET_EXISTED',
			payload
		}
	}
}

export const QueryActions = {

}

export const FunctionActions = {
	setPending(payload) {
		return {
			type: 'SET_PENDING',
			payload
		}
	},
	unsetPending(payload) {
		return {
			type: 'UNSET_PENDING',
			payload
		}
	},
	saveResult(payload) {
		return {
			type: 'SAVE_RESULT',
			payload
		}
	},
	appendResult(payload) {
		payload.operation = 'push';

		return {
			type: 'OPERATE_ON_ARRAY',
			payload
		}
	},
	prependResult(payload) {
		payload.operation = 'unshift';

		return {
			type: 'OPERATE_ON_ARRAY',
			payload
		}
	}
}