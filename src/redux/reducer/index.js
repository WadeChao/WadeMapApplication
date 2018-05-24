import { combineReducers } from 'redux';
import locationReducer from './locationReducers';

const rootReducer = combineReducers({
  locReducer: locationReducer
});

export default rootReducer;
