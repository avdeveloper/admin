import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';

import Router from './pages';
import store from './stores';

import './index.css';

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root'),
);
