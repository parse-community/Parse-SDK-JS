import { createStore, combineReducers } from 'redux';
import parseReducer from './ReduxReducers';

var Store = null;

export function set(_Store) {
	if (Store)
		throw new Error("Store already set! Make sure to initialize the store before it is retrieved.");
	
	if (!_Store)
	{
		var reducers = {};
		reducers.Parse = parseReducer;
		var reducer = combineReducers(reducers);
		
		_Store = createStore(reducer);
	}

	Store = _Store
}

export function get() {
	if (!Store)
		set();
	return Store;
}