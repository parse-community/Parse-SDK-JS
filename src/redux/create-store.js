import { createStore, applyMiddleware, combineReducers } from 'redux'
import * as reducers from './reducers'

export default function(data) {
  var reducer = combineReducers(reducers);
  return createStore(reducer, data);
}