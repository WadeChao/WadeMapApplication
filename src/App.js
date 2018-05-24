import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { hot } from 'react-hot-loader';
import { Provider } from 'react-redux';
import reducers from './redux/reducer';
import Map from './components/Map';
import Filter from './components/Filter';
import './css/main.css'

const createStoreWithMiddleware = applyMiddleware()(createStore);
const store = createStoreWithMiddleware(reducers);

class App extends Component{

  render(){
    return (
      <Provider store={ store }>
        <div className='wade-map-body'>
          <Filter />
          <Map />
        </div>
      </Provider>
    );
  }
}

export default hot(module)(App);
