var lib = {
	toUnderscore(){
		return this.replace(/([A-Z])/g, function($1){return "_"+$1}).toUpperCase();
	}
}

function generateActions(actions) {
	var out = {};

	for (let i in actions) {
		let action = actions[i];

		if (typeof action == 'string') {
			out[action] = function(payload) {
				return {
					type: lib.toUnderscore.call(action),
					payload
				}
			}
		}	else
		 out[action.name] = action.action;
	}

	return out;
}

export const ObjectActions = generateActions([
	'initializeState',
	'removeState',
	'setServerData',
	'setPendingOp',
	'pushPendingState',
	'popPendingState',
	'mergeFirstPendingState',
	'commitServerChanges',
	'_clearAllState',
	'_setExisted',
]);

export const QueryActions = {

}

export const FunctionActions = generateActions([
	'setPending',
	'unsetPending',
	'saveResult',
	{name: 'appendResult', action: function(payload) {
		var type = 'OPERATE_ON_ARRAY';
		payload.operation = 'push';

		return {type, payload};
	}},
	{name: 'prependResult', action: function(payload) {
		var type = 'OPERATE_ON_ARRAY';
		payload.operation = 'unshift';

		return {type, payload};
	}}
]);