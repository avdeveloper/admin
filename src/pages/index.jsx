import React from 'react';
import {
  Route, Switch, Redirect, withRouter,
} from 'react-router-dom';
import { connect } from 'react-redux';

import Header from '../components/Header';
import HomePage from './homePage/HomePage';
import SideBar from '../components/SideBar';
import FormsPage from './formsPage/FormsPage';
import GroupsPage from './groupsPage/GroupsPage';
import UsersPage from './usersPage/UsersPage';
import LoginPage from './loginPage/LoginPage';
import ProfilePage from './ProfilePage';
import { isLogin } from '../stores/action/auth';

import './index.scss';

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => (JSON.parse(localStorage.getItem('isAuth'))
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/', state: { from: props.location } }} />)}
    />
  );
}

function RedirectRouter({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => (!JSON.parse(localStorage.getItem('isAuth'))
        ? <Component {...props} />
        : <Redirect to={{ pathname: '/home', state: { from: props.location } }} />)}
    />
  );
}

function Router({ auth }) {
  return (
    <div>
      <Header
        userData={auth.currentUser}
      />
      <div className="rout">
        <SideBar />
        <Switch>
          <RedirectRouter
            exact
            path="/"
            component={LoginPage}
          />
          <PrivateRoute
            path="/home"
            component={HomePage}
          />
          <PrivateRoute
            path="/forms"
            component={FormsPage}
          />
          <PrivateRoute
            path="/groups"
            component={GroupsPage}
          />
          <PrivateRoute
            path="/users"
            component={UsersPage}
          />
          <PrivateRoute
            path="/profile"
            component={ProfilePage}
          />
          <Redirect from="*" to="/home" />
        </Switch>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  isLogin: () => dispatch(isLogin()),
});


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Router));
