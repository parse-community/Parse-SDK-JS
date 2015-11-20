import { createStore, applyMiddleware, combineReducers } from 'redux'
import parse from './ReduxReducers'

var Store = null;

export function init(reducers = {}, middleware = [], data) {
	if (Store)
		throw new Error("Store already set! Make sure to initialize the store before it is retrieved.");

	reducers.parse = parse;

	var reducer = combineReducers(reducers);
	var finalCreateStore = applyMiddleware(...middleware)(createStore);
  Store = finalCreateStore(reducer, data);

  return Store;
}

export function get() {
	if (!Store)
		init();
	return Store;
}