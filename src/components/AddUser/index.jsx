import React, { Component } from 'react';
import classnames from 'classnames';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import isEmail from 'validator/lib/isEmail';
import {
  InputGroup,
  InputGroupAddon,
  Spinner,
} from 'reactstrap';
import validator from 'validator';

import './style.scss';


class AddUser extends Component {
  static propsTypes = {
    editData: PropTypes.any,
    cancenEdit: PropTypes.func.isRequired,
    usersList: PropTypes.array.isRequired,
    formsList: PropTypes.array.isRequired,
    currentGroupId: PropTypes.string.isRequired,
    getNewUsers: PropTypes.func.isRequired,
    isSuperAdmin: PropTypes.bool.isRequired,
  }

  // status: 1-Active 0-Suspended
  // role: 0-User 1-Admin 2-SuperAdmin

  constructor(props) {
    super(props);
    this.state = {
      fullName: '',
      email: '',
      phone: '',
      status: 1,
      role: 0,
      password: '',
      errMsg: '',

      fullNameError: '',
      phoneError: '',
      emailError: '',
      passwordError: '',
      currentEditId: '',

      pending: false,
      successfulMsg: '',

      hiddenPassword: true,
      isUpdate: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.validForm = this.validForm.bind(this);
    this.cancenEdit = this.cancenEdit.bind(this);
    this.handleSelectStatus = this.handleSelectStatus.bind(this);
    this.handleSelectRole = this.handleSelectRole.bind(this);
    this.hidePass = this.hidePass.bind(this);
    this.handleFullName = this.handleFullName.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.currentEditId !== nextProps.idForEdit) {
      return {
        fullName: get(nextProps, 'editData.fullName', ''),
        status: get(nextProps, 'editData.status', ''),
        phone: get(nextProps, 'editData.phone', ''),
        email: get(nextProps, 'editData.email', ''),
        role: get(nextProps, 'editData.role', ''),

        fullNameError: '',
        phoneError: '',
        emailError: '',
        currentEditId: get(nextProps, 'idForEdit'),
      };
    }
    return null;
  }

  cancenEdit() {
    const {
      cancenEdit,
    } = this.props;
    cancenEdit();
    this.setState({
      fullName: '',
      email: '',
      phone: '',
      status: 1,
      role: 0,
      currentEditId: '',

      fullNameError: '',
      phoneError: '',
      emailError: '',

      errMsg: '',

      isUpdate: false,
    });
  }

  handleChange({ target }) {
    this.setState({
      [`${target.name}Error`]: '',
      [target.name]: target.value,
      errMsg: '',
    });
  }

  handleFullName({ target }) {
    const value = target.value;

    if (validator.isAlpha(validator.blacklist(value, ' ')) || value === '') {
      this.setState({
        fullNameError: '',
        fullName: target.value,
        errMsg: '',
      });
    }
  }

  handleSelectRole(role) {
    this.setState({
      role,
    });
  }

  hidePass() {
    const {
      hiddenPassword,
    } = this.state;
    this.setState({
      hiddenPassword: !hiddenPassword,
    });
  }

  handleSelectStatus(status) {
    this.setState({
      status,
    });
  }

  async validForm() {
    let isValid = true;

    const {
      fullName,
      email,
      phone,
      password,
    } = this.state;

    const {
      editData,
      idForEdit,
    } = this.props;

    let fullNameError = '';
    let emailError = '';
    let phoneError = '';
    let passwordError = '';

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

    if (phone.trim().length !== 14) {
      phoneError = 'Enter phone number';
      isValid = false;
    }

    if (!password.trim() && !editData) {
      passwordError = 'Enter password';
      isValid = false;
    } else if (password.trim().length < 6 && !editData) {
      passwordError = 'Too short password';
      isValid = false;
    }

    this.setState({
      fullNameError,
      emailError,
      phoneError,
      passwordError,
    });

    if (isValid) {
      this.setState({
        pending: true,
      });
      if (!editData) {
        this.createUser();
      } else {
        this.updateUser(idForEdit);
      }
    }
  }

  createUser() {
    const {
      fullName,
      email,
      phone,
      status,
      role,
      password,
    } = this.state;

    const {
      firestoreDb,
      getNewUsers,
      createUser,
    } = this.props;

    const data = {
      fullName,
      email,
      phone,
      status,
      role,
    };

    new Promise((res, rej) => createUser({
      email,
      password,
      resolve: res,
      reject: rej,
      disabled: Number(status) === 0,
    }))
      .then((res) => {
        firestoreDb.collection('users').doc(res).set(data)
          .then(() => {
            this.setState({
              pending: false,
              fullName: '',
              email: '',
              successfulMsg: 'User has been added',
              phone: '',
              status: 1,
              role: 0,
              password: '',
            });
            getNewUsers();
            setTimeout(() => this.setState({
              successfulMsg: '',
            }), 1000);
          });
      })
      .catch((err) => {
        this.setState({
          pending: false,
          errMsg: 'This email is already in use',
        });
      });
  }


  updateUser(idForEdit) {
    const {
      fullName,
      email,
      phone,
      status,
      role,
      password,
    } = this.state;

    const {
      firestoreDb,
      getNewUsers,
      updateUser,
    } = this.props;

    const data = {
      fullName,
      email,
      phone,
      status,
      role,
      password,
    };

    new Promise((res, rej) => updateUser({
      uid: idForEdit,
      email,
      resolve: res,
      reject: rej,
      disabled: Number(status) === 0,
    }))
      .then(async (res) => {
        if (res === idForEdit) {
          await firestoreDb.collection('users').doc(idForEdit).set(data);
          this.setState({
            pending: false,
          });
          this.cancenEdit();
          getNewUsers();
        }
      })
      .catch((err) => {
        this.setState({
          pending: false,
          errMsg: 'This email is already in use',
        });
      });
  }

  render() {
    const {
      fullName,
      email,
      phone,
      status,
      role,
      password,

      fullNameError,
      phoneError,
      emailError,
      passwordError,

      hiddenPassword,
      successfulMsg,
      errMsg,
      pending,
    } = this.state;

    const {
      editData,
      isSuperAdmin,
    } = this.props;

    return (
      <form className="add-user">
        <div className="add-user__input-block">
        Full Name:
          <input
            className={
              classnames(
                'add-user__input',
                {
                  'add-user__input--error': !!fullNameError,
                },
              )}
            onChange={this.handleFullName}
            value={fullName}
            name="fullName"
          />
        </div>

        <div className="add-user__error">
          {fullNameError}
        </div>

        <div className="add-user__input-block">
        Phone:
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

        <div className="add-user__error">
          {phoneError}
        </div>

        <div className="add-user__input-block">
        Email:
          <input
            className={
              classnames(
                'add-user__input',
                {
                  'add-user__input--error': !!emailError,
                },
              )}
            onChange={this.handleChange}
            value={email}
            name="email"
          />
        </div>

        <div className="add-user__error">
          {emailError}
        </div>

        {
          !editData
          && <>
            <div className="add-user__input-block">
              <span>Password:</span>
              <InputGroup className="add-user__custom-group">
                <input
                  className={
              classnames(
                'add-user__input--short',
                'add-user__input',
                {
                  'add-user__input--error': !!passwordError,
                },
              )}
                  onChange={this.handleChange}
                  type={hiddenPassword ? 'password' : 'text'}
                  value={password}
                  name="password"
                />
                <InputGroupAddon
                  onClick={this.hidePass}
                  addonType="append"
                  className="add-user__input-eye"
                >
	              &#128065;
                </InputGroupAddon>
              </InputGroup>

            </div>

            <div className="add-user__error">
              {passwordError}
            </div>
          </>
        }

        <div className="add-user__input-block">
        Role:
          <select
            className="add-user__input"
            onChange={this.handleChange}
            value={role}
            name="role"
          >
            <option value="0">User</option>
            {
              isSuperAdmin && (
              <option value="1">Admin</option>
              )
            }
          </select>
        </div>

        <div className="add-user__error" />

        <div className="add-user__input-block">
        Status:
          <select
            className="add-user__input"
            onChange={this.handleChange}
            value={status}
            name="status"
          >
            <option value="1">Active</option>
            <option value="0">Suspended</option>
          </select>
        </div>

        <div className="add-user__error" />

        <div className="add-user__button-block">
          <button
            type="button"
            onClick={this.validForm}
            className="add-user__button"
          >
            {editData ? 'Save' : 'Add user'}
          </button>

          {
            editData
            && (
            <button
              type="button"
              onClick={this.cancenEdit}
              className="add-user__button"
            >
            Cancel
            </button>
            )
          }

          <span className={classnames({
            'add-user__success': !!successfulMsg,
            'add-user__fail': !!errMsg,
          })}
          >
            {successfulMsg}
            {errMsg}
          </span>
          {pending && <Spinner />}

        </div>

      </form>
    );
  }
}

export default AddUser;
