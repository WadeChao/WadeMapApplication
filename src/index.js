import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import"babel-core/register";
import 'babel-polyfill';

const title = 'Wade React';

ReactDOM.render(
    <App />
  ,
  document.getElementById('app')
);

module.hot.accept();
