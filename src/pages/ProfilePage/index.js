import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { Spinner } from 'reactstrap';
import MaskedInput from 'react-text-mask';
import PropTypes from 'prop-types';

import isEmail from 'validator/lib/isEmail';
import { isLogin, updateUserLocal } from '../../stores/action/auth';
import config from '../../constants/firebaseConfig';

import './style.scss';

class ProfilePage extends PureComponent {
  constructor(props) {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    super(props);
    this.state = {
      fullName: '',
      email: '',
      phone: '1',
      password: '',
      newPassword: '',
      newPasswordConfirm: '',
      errMsg: '',

      fullNameError: '',
      phoneError: '',
      emailError: '',
      passwordError: '',
      newPasswordError: '',
      newPasswordConfirmError: '',

      pending: false,
      successfulMsg: '',
    };
    this.db = firebase.firestore();
    this.firestoreAuth = firebase.auth();
  }

  componentDidMount() {
    const { isLogin, currentUser } = this.props;
    if (!currentUser) {
      isLogin();
    } else {
      this.setState({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone || '',
      });
    }
  }

  componentDidUpdate({ currentUser: prevCurrentUser }) {
    const { currentUser } = this.props;
    if (prevCurrentUser !== currentUser && currentUser) {
      this.setState({
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone || '',
      });
    }
  }

  reauthenticate = (currentPassword) => {
    const user = firebase.auth().currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(
      user.email, currentPassword,
    );
    return user.reauthenticateWithCredential(cred);
  };

  changePassword = (currentPassword, newPassword) => this.reauthenticate(currentPassword).then(() => {
    const user = firebase.auth().currentUser;
    return user.updatePassword(newPassword);
  }).catch((error) => { throw error; })

  changeEmail = (currentPassword, newEmail) => this.reauthenticate(currentPassword).then(() => {
    const user = firebase.auth().currentUser;
    return user.updateEmail(newEmail);
  }).catch((error) => { throw error; })

  handleChange = ({ target }) => {
    this.setState({
      [`${target.name}Error`]: '',
      [target.name]: target.value,
    });
  }

  validForm = (e) => {
    e.preventDefault();
    let isValid = true;

    const {
      fullName,
      email,
      phone,
      password,
      newPassword,
      newPasswordConfirm,
    } = this.state;

    const { currentUser: { phone: prevPhone } } = this.props;

    let fullNameError = '';
    let emailError = '';
    let phoneError = '';
    let passwordError = '';
    let newPasswordError = '';
    let newPasswordConfirmError = '';

    const nameReg = /^[A-Z][a-z]+\s[A-Z][a-z]+$/;
    if (!fullName.trim()) {
      fullNameError = 'Enter name';
      isValid = false;
    } else if (!nameReg.test(fullName.trim())) {
      fullNameError = 'Enter name in format: Name Surname';
      isValid = false;
    }

    if (!email.trim()) {
      emailError = 'Enter email';
      isValid = false;
    } else if (!isEmail(email)) {
      emailError = 'Enter correct email';
      isValid = false;
    }

    if (phone.trim().length < 14 && phone !== prevPhone) {
      phoneError = 'Enter phone number';
      isValid = false;
    }

    if (!password.trim()) {
      passwordError = 'Enter password';
      isValid = false;
    } else if (password.trim().length < 6) {
      passwordError = 'Too short password';
      isValid = false;
    }

    if (newPassword.trim() || newPasswordConfirm.trim()) {
      if (newPassword.trim().length < 6) {
        newPasswordError = 'Too short password';
        isValid = false;
      }
      if (newPasswordConfirm !== newPassword) {
        newPasswordConfirmError = 'Passwords do not match';
        isValid = false;
      }
    }
    this.setState({
      fullNameError,
      emailError,
      phoneError,
      passwordError,
      newPasswordError,
      newPasswordConfirmError,
    });
    if (isValid) {
      this.setState({ pending: true });
      const { currentUser } = this.firestoreAuth;
      const promSetAuth = () => this.changePassword(password, newPassword).then(() => {
        this.changeEmail(newPassword, email);
      });
      const promSetFirestore = firebase.firestore()
        .collection('users')
        .doc(currentUser.uid)
        .update({
          email,
          fullName,
          phone,
        });

      Promise.all([promSetAuth(), promSetFirestore]).then(() => {
        const { currentUser, updateUserLocal } = this.props;
        updateUserLocal({
          ...currentUser, email, fullName, phone,
        });
        this.setState({
          password: '',
          newPassword: '',
          newPasswordConfirm: '',
          successfulMsg: 'Successful!',
          pending: false,
        });
      }).catch(() => {
        this.setState({
          errMsg: 'Fail!',
          pending: false,
        });
      }).then(() => {
        setTimeout(() => {
          this.setState({
            errMsg: '',
            successfulMsg: '',
          });
        }, 3000);
      });
    }
  }

  resetForm = () => {
    const { currentUser } = this.props;
    this.setState({
      fullName: currentUser.fullName,
      email: currentUser.email,
      phone: currentUser.phone,
      password: '',
      fullNameError: '',
      phoneError: '',
      emailError: '',
      passwordError: '',
      newPassword: '',
      newPasswordConfirm: '',
      newPasswordError: '',
      newPasswordConfirmError: '',
    });
  }

  render() {
    const {
      fullName,
      email,
      phone,
      password,
      newPassword,
      newPasswordConfirm,

      fullNameError,
      phoneError,
      emailError,
      passwordError,
      newPasswordError,
      newPasswordConfirmError,

      successfulMsg,
      errMsg,
      pending,
    } = this.state;


    const { currentUser } = this.props;
    if (!currentUser) return null;
    return (
      <form className="profile" autoComplete="off">
        <div className="profile__input-block">
          Full Name*:
          <input
            className={
              classnames(
                'profile__input',
                {
                  'profile__input--error': !!fullNameError,
                },
              )}
            value={fullName}
            onChange={this.handleChange}
            name="fullName"
          />
        </div>
        <div className="add-form__error">
          {fullNameError}
        </div>
        <div className="profile__input-block">
          Email*:
          <input
            className={
              classnames(
                'profile__input',
                {
                  'profile__input--error': !!emailError,
                },
              )}
            value={email}
            onChange={this.handleChange}
            name="email"
          />
        </div>
        <div className="add-form__error">
          {emailError}
        </div>
        <div className="profile__input-block">
          Phone*:
          <MaskedInput
            mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            guide={false}
            className={
              classnames(
                'add-user__input',
                {
                  'add-user__input--error': !!phoneError,
                },
              )}
            onChange={this.handleChange}
            value={phone}
            name="phone"
          />
        </div>
        <div className="add-form__error">
          {phoneError}
        </div>
        <div className="profile__input-block">
          Old Password*:
          <input
            className={
              classnames(
                'profile__input',
                {
                  'profile__input--error': !!passwordError,
                },
              )}
            type="password"
            value={password}
            onChange={this.handleChange}
            name="password"
          />
        </div>
        <div className="add-form__error">
          {passwordError}
        </div>
        <div className="profile__input-block">
          New Password:
          <input
            className={
              classnames(
                'profile__input',
                {
                  'profile__input--error': !!newPasswordError,
                },
              )}
            type="password"
            value={newPassword}
            onChange={this.handleChange}
            name="newPassword"
          />
        </div>
        <div className="add-form__error">
          {newPasswordError}
        </div>


        <div className="profile__input-block">
          Confirm Password:
          <input
            className={
              classnames(
                'profile__input',
                {
                  'profile__input--error': !!newPasswordConfirmError,
                },
              )}
            type="password"
            value={newPasswordConfirm}
            onChange={this.handleChange}
            name="newPasswordConfirm"
          />
        </div>
        <div className="add-form__error">
          {newPasswordConfirmError}
        </div>
        <button
          type="submit"
          className="profile__button"
          onClick={this.validForm}
        >
          Save
        </button>
        <button
          type="button"
          className="profile__button"
          onClick={this.resetForm}
        >
          Reset
        </button>
        <span className={classnames({
          'add-user__success': !!successfulMsg,
          'add-user__fail': !!errMsg,
        })}
        >
          {successfulMsg}
          {errMsg}
        </span>
        {pending && <Spinner />}

      </form>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.auth.currentUser,
});

const mapDispatchToProps = dispatch => ({
  isLogin: () => dispatch(isLogin()),
  updateUserLocal: data => dispatch(updateUserLocal(data)),
});

ProfilePage.propsTypes = {
  isLogin: PropTypes.func.isRequired,
  currentUser: PropTypes.shape({}),
  updateUserLocal: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfilePage);
