import React, { Component } from 'react';
import className from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Spinner } from 'reactstrap';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { signIn, isLogin } from '../../stores/action/auth';
import './loginPage.scss';
import config from '../../constants/firebaseConfig';


class LoginPage extends Component {
  static propsTypes = {
    history: PropTypes.object.isRequired,
    auth: PropTypes.object.isRequired,
    signIn: PropTypes.func.isRequired,
  }

  constructor(props) {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    super(props);
    this.state = {
      login: '',
      password: '',
      errMsg: '',
      loginRequestPending: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.firebaseLogin = this.firebaseLogin.bind(this);
    this.db = firebase;
  }

  componentDidMount() {
    const {
      auth,
      history,
      isLogin,
    } = this.props;
    isLogin();

    if (auth.isAuthenticated) {
      history.push('/home');
    }
  }

  handleChange({ target }) {
    this.setState({
      errMsg: '',
      [target.name]: target.value,
    });
  }

  firebaseLogin(event) {
    event.preventDefault();
    const {
      login,
      password,
    } = this.state;
    const {
      history,
      signIn,
    } = this.props;

    if (!login.trim() || !password.trim()) {
      this.setState({
        errMsg: 'Please fill in all fields.',
        login: login.trim(),
        password: password.trim(),
      });
      return false;
    }
    this.setState({
      loginRequestPending: true,
    });
    this.db
      .auth()
      .signInWithEmailAndPassword(login, password)
      .then(async (res) => {
        if (res.user) {
          const user = await this.db.firestore().collection('users').doc(res.user.uid);
          user.get()
            .then((doc) => {
              if (!doc.exists) {
                this.setState({
                  loginRequestPending: false,
                  errMsg: 'Such user does not exist',
                });
              } else {
                const user = doc.data();

                if (Number(user.role) === 0) {
                  this.setState({
                    loginRequestPending: false,
                    errMsg: 'You are not allowed to use this page',
                  });
                  return;
                }
                signIn(user);
                history.push('/home');
              }
            })
            .catch(() => {
              this.setState({
                loginRequestPending: false,
                errMsg: 'Network error, try again',
              });
            });
        }
      },
      (res) => {
        this.setState({
          errMsg: res.message,
          loginRequestPending: false,
        });
      });
    return false;
  }

  render() {
    const {
      login,
      password,
      errMsg,
      loginRequestPending,
    } = this.state;
    return (
      <div className="login-page">
        { loginRequestPending ? <Spinner type="grow" color="secondary" />
          : (
            <form>
              <div className="login-page__input-block">
                Email:
                <input
                  type="email"
                  className={
                    className(
                      'login-page__input',
                      {
                        'login-page__input--error': !!errMsg && !login.trim(),
                      },
                    )}
                  onChange={this.handleChange}
                  value={login}
                  name="login"
                />
              </div>

              <div className="login-page__input-block">
                Password:
                <input
                  type="password"
                  className={
                  className(
                    'login-page__input',
                    {
                      'login-page__input--error': !!errMsg && !password.trim(),
                    },
                  )}
                  onChange={this.handleChange}
                  value={password}
                  name="password"
                />
              </div>

              <button
                className="login-page__save-button"
                type="submit"
                onClick={this.firebaseLogin}
              >
                  Login
              </button>

              <div className="login-page__err-message">
                {errMsg}
              </div>
            </form>
          )
          }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  signIn: data => dispatch(signIn(data)),
  isLogin: () => dispatch(isLogin()),
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginPage));
