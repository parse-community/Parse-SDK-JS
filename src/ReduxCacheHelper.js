import * as Store from './ReduxStore';

export default function(options) {
	var Actions = options.Actions;
	var namespace = options.namespace;
	var Executed = {};

	function refresh(cb, name, data, options) {
		Store.dispatch(Actions.setPending({name, data}));

		var done = cb(name, data, options).then(function(result) {
			Store.dispatch(Actions.saveResult({name, data, result}));
			
			return Parse.Promise.as(result);
		}).fail(function(err) {
			Store.dispatch(Actions.unsetPending({name, data}));

			return Parse.Promise.error(err);
		});

		Executed = setItemState(Executed, {name, data}, done);

		return done;
	}

	function cache(cb, name, data, options) {
		var State = Store.getState().Parse[namespace];
		var state = getItemState(State, {name, data});

		if (state.pending)
			return getItemState(ExecutedFunctions, {name, data});

		if (state.cache)
			return Parse.Promise.as(state.cache);

		return refresh(...arguments);
	}

	function operateOnArray(cb, params, operation) {
		var {name, data, grouping, options} = params;

		Store.dispatch(Actions.setPending({name, data, grouping}));

		return cb(name, data, options).then(function(result) {
			Store.dispatch(Actions[operation]({name, data, grouping, result}));

			return Parse.Promise.as(result);
		}).fail(function(err) {
			Store.dispatch(Actions.unsetPending({name, data, grouping}));

			return Parse.Promise.error(err);
		});
	}

	function append() {
		return operateOnArray(...arguments, 'appendResult');
	}

	function prepend() {
		return operateOnArray(...arguments, 'prependResult');
	}

	function isPending(name, data) {
		var State = Store.getState().Parse[namespace];
		var state = getItemState(State, {name, data});

		return state.pending;
	}

	return {
		refresh,
		cache,
		operateOnArray,
		append,
		prepend,
		isPending
	}
}

export function getItemState(object, options) {
	var next = object[options.name];
  if (!next)
  	return {};

  if (options.grouping)
  	next = next[options.grouping];
  else
  	next = next[JSON.stringify(options.data)];

  return next || {};
}

export function setItemState(object, options, value) {
	var object = {...object};
	var next = object[options.name];

	if (next)
		next = {...next};
  else
  	next = {};

  object[options.name] = next;

  var key;
  if (options.grouping)
  	key = options.grouping;
  else
  	key = JSON.stringify(options.data);
  	
	next[key] = value;

  return object;
}