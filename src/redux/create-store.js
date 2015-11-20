import { createStore, applyMiddleware, combineReducers } from 'redux'
import parse from './reducers'
import thunk from 'redux-thunk';

export default function(data) {
  return createStore(parse, data);
}