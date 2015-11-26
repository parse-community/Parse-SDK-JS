import { createStore, combineReducers } from 'redux';
import parseReducer from './ReduxReducers';

var Store = null;

export function set(_Store) {
	if (Store)
		throw new Error("Store already set! Make sure to initialize the store before it is retrieved.");
	
	if (!_Store)
	{
		var reducer = combineReducers({Parse: parseReducer});
		_Store = createStore(reducer);
	}

	Store = _Store;
}

export function getState() {
	if (!Store)
		set();
	return Store.getState(...arguments);
}

export function dispatch() {
	if (!Store)
		set();
	return Store.dispatch(...arguments);
}