import { createStore, combineReducers } from 'redux'
import parseReducer from './ReduxReducers'

var Store = null;
var name = null;

export function getName() {
	return name;
}

export function set(_Store, _name = 'Parse') {
	if (Store)
		throw new Error("Store already set! Make sure to initialize the store before it is retrieved.");
	
	if (!_Store)
	{
		var reducers = {};
		reducers[_name] = parseReducer;
		var reducer = combineReducers(reducers);
		
		_Store = createStore(reducer);
	}

	Store = _Store
	name = _name;
}

export function get() {
	if (!Store)
		set();
	return Store;
}