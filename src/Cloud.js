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

import CoreManager from './CoreManager';
import decode from './decode';
import encode from './encode';
import ParseError from './ParseError';
import ParsePromise from './ParsePromise';

import * as Store from './ReduxStore';
import { FunctionActions as Actions } from './ReduxActionCreators';

/**
 * Contains functions for calling and declaring
 * <a href="/docs/cloud_code_guide#functions">cloud functions</a>.
 * <p><strong><em>
 *   Some functions are only available from Cloud Code.
 * </em></strong></p>
 *
 * @class Parse.Cloud
 * @static
 */

 /**
  * Makes a call to a cloud function.
  * @method run
  * @param {String} name The function name.
  * @param {Object} data The parameters to send to the cloud function.
  * @param {Object} options A Backbone-style options object
  * options.success, if set, should be a function to handle a successful
  * call to a cloud function.  options.error should be a function that
  * handles an error running the cloud function.  Both functions are
  * optional.  Both functions take a single argument.
  * @return {Parse.Promise} A promise that will be resolved with the result
  * of the function.
  */
export var run = function(
  name: string,
  data: mixed,
  options: { [key: string]: mixed }
) {
  options = options || {};

  if (typeof name !== 'string' || name.length === 0) {
    throw new TypeError('Cloud function name must be a string.');
  }

  var requestOptions = {};
  if (options.useMasterKey) {
    requestOptions.useMasterKey = options.useMasterKey;
  }
  if (options.sessionToken) {
    requestOptions.sessionToken = options.sessionToken;
  }

  return (
    CoreManager.getCloudController().run(name, data, requestOptions)._thenRunCallbacks(options)
  );
}

var ExecutedFunctions = {};

export function get(object, options) {
	var next = object[options.name];
  if (!next)
  	return {};

  if (options.grouping)
  	next = next[options.grouping];
  else
  	next = next[JSON.stringify(options.data)];

  return next || {};
}

export function set(object, options, value) {
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

run.cache = function(
  name: string,
  data = {}: mixed,
  options: { [key: string]: mixed }
) {
	var functionState = Store.getState().Parse.Functions;
	var state = get(functionState, {name, data});

	if (state.pending)
		return get(ExecutedFunctions, {name, data});

	if (state.cache)
		return Parse.Promise.as(state.cache);

	return run.refresh(...arguments);
}

run.refresh = function(
  name: string,
  data = {}: mixed,
  options: { [key: string]: mixed }
) {
	Store.dispatch(Actions.setPending({name, data}));

	var done = run(...arguments).then(function(result) {
		Store.dispatch(Actions.saveResult({name, data, result}));
		
		return Parse.Promise.as(result);
	}).fail(function(err) {
		Store.dispatch(Actions.unsetPending({name, data}));

		return Parse.Promise.error(err);
	});

	ExecutedFunctions = set(ExecutedFunctions, {name, data}, done);

	return done;
}

run.append = function(
  name: string,
  data = {}: mixed,
  grouping: string,
  options: { [key: string]: mixed }
) {
	var functionState = Store.getState().Parse.Functions;
	var state = get(functionState, {name, data});
	if (state.pending)
		throw new Error('Cannot refresh query while it is pending.');
	// set 'pending' for name[grouping]

	return run(...arguments).then(function(res) {
		// append result to name[grouping]
		// unset 'pending' to name[grouping]
		return Parse.Promise.as(res);
	}).fail(function(err) {
		// unset 'pending' for for name[JSON.stringify(options)]
		return Parse.Promise.error(err);
	});
}

run.isPending = function(
  name: string,
  data = {}: mixed
) {
	var functionState = Store.getState().Parse.Functions;
	var state = get(functionState, {name, data});

	return state.pending;
}

var DefaultController = {
  run(name, data, options) {
    var RESTController = CoreManager.getRESTController();

    var payload = encode(data, true);

    var requestOptions = {};
    if (options.hasOwnProperty('useMasterKey')) {
      requestOptions.useMasterKey = options.useMasterKey;
    }
    if (options.hasOwnProperty('sessionToken')) {
      requestOptions.sessionToken = options.sessionToken;
    }

    var request = RESTController.request(
      'POST',
      'functions/' + name,
      payload,
      requestOptions
    );

    return request.then(function(res) {
      var decoded = decode(res);
      if (decoded && decoded.hasOwnProperty('result')) {
        return ParsePromise.as(decoded.result);
      }
      return ParsePromise.error(
        new ParseError(
          ParseError.INVALID_JSON,
          'The server returned an invalid response.'
        )
      );
    })._thenRunCallbacks(options);
  }
};

CoreManager.setCloudController(DefaultController);
