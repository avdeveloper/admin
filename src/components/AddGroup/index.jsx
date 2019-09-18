import React, { Component } from 'react';
import classnames from 'classnames';
import { Spinner } from 'reactstrap';
import { get, difference } from 'lodash';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import Select from 'react-select';

import './style.scss';

const GROUPS_TYPES = ['Private', 'Public', 'Preview'];

class AddGroup extends Component {
  static propsTypes = {
    editData: PropTypes.any,
    cancenEdit: PropTypes.func.isRequired,
    usersList: PropTypes.array.isRequired,
    formsList: PropTypes.array.isRequired,
    currentGroupId: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      names: '',
      type: 'Private',
      description: '',
      forms: '',
      users: '',
      currentEditId: '',
      namesError: '',
      descriptionError: '',
      usersError: '',
      formsError: '',
      pending: false,
      successfulMsg: '',
      isUpdate: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.validForm = this.validForm.bind(this);
    this.cancenEdit = this.cancenEdit.bind(this);
    this.handleSelectForms = this.handleSelectForms.bind(this);
    this.handleSelectUsers = this.handleSelectUsers.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.currentEditId !== nextProps.idForEdit) {
      return {
        names: get(nextProps, 'editData.name', ''),
        type: get(nextProps, 'editData.type', ''),
        description: get(nextProps, 'editData.description', ''),
        forms: get(nextProps, 'editData.forms', ''),
        users: get(nextProps, 'editData.users', ''),
        currentEditId: get(nextProps, 'idForEdit'),

        namesError: '',
        descriptionError: '',
        formsError: '',
        usersError: '',
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
      names: '',
      type: 'Private',
      description: '',
      forms: '',
      users: '',

      namesError: '',
      descriptionError: '',
      formsError: '',
      usersError: '',
      currentEditId: '',

      isUpdate: false,
    });
  }

  handleChange({ target: { name, value } }) {
    this.setState({
      [`${name}Error`]: '',
      [name]: value,
    });
    if (name === 'type' && value === 'Public') {
      this.setState({
        users: [],
      });
    }
  }

  handleSelectUsers(users) {
    this.setState({
      usersError: '',
      users,
    });
  }

  handleSelectForms(forms) {
    this.setState({
      formsError: '',
      forms,
    });
  }

  async validForm() {
    let isValid = true;

    const {
      names,
      type,
      description,
      forms,
      users,
    } = this.state;

    const {
      firestoreDb,
      getNewForms,
      editData,
      currentGroupId,
      idForEdit,
    } = this.props;

    let namesError = '';
    let descriptionError = '';

    if (!names.trim()) {
      namesError = 'Enter label';
      isValid = false;
    }

    if (!description.trim()) {
      descriptionError = 'Enter description';
      isValid = false;
    }

    // May be used in the future

    // if (!forms) {
    //   this.setState({
    //     formsError: 'Add forms',
    //   });
    //   isValid = false;
    // }

    this.setState({
      namesError,
      descriptionError,
    });

    if (!users) {
      this.setState({
        usersError: 'Add users',
      });
      isValid = false;
    }

    if (isValid) {
      const data = {
        name: names,
        type,
        description,
        forms,
        users,
        usersId: users.map(item => item.value),
        formsId: forms && forms.map(item => item.value),
        DateCreated: firebase.firestore.Timestamp.now(),
      };

      this.setState({
        pending: true,
      });
      if (!editData) {
        firestoreDb.collection('groups').add(data)
          .then((ref) => {
            if (ref.id) {
              this.setState({
                pending: false,
                successfulMsg: 'Group has been added',
                names: '',
                type: 'Private',
                description: '',
                forms: '',
                users: '',
              });
              getNewForms();
              setTimeout(() => this.setState({
                successfulMsg: '',
              }), 1000);
              users.map((i) => {
                firestoreDb.collection('users_in_groups').doc(`${i.value}_${ref.id}`).set({
                  dateJoined: firebase.firestore.Timestamp.now(),
                  groupId: ref.id,
                  userId: i.value,
                });
                return null;
              });
            }
          });
      } else {
        await firestoreDb.collection('groups').doc(idForEdit).set(data);

        const oldUsers = editData.users.map(i => i.value);
        const newUsers = users.map(i => i.value);

        const deleted = difference(oldUsers, newUsers);
        const added = difference(newUsers, oldUsers);

        deleted.map((id) => {
          firestoreDb.collection('users_in_groups').doc(`${id}_${currentGroupId}`).delete();
          return null;
        });

        added.map((id) => {
          firestoreDb.collection('users_in_groups').doc(`${id}_${currentGroupId}`).set({
            dateJoined: firebase.firestore.Timestamp.now(),
            groupId: currentGroupId,
            userId: id,
          });
          return null;
        });

        this.setState({
          pending: false,
        });
        this.cancenEdit();
        getNewForms();
      }
    }
  }

  render() {
    const {
      names,
      type,
      description,
      forms,
      users,

      namesError,
      descriptionError,
      usersError,
      formsError,

      successfulMsg,
      pending,
    } = this.state;

    const {
      editData,
      formsList,
      usersList,
    } = this.props;
    return (
      <form className="add-group">
        <div className="add-group__input-block">
        Label:
          <input
            className={
              classnames(
                'add-group__input',
                {
                  'add-group__input--error': !!namesError,
                },
              )}
            onChange={this.handleChange}
            value={names}
            name="names"
          />
        </div>

        <div className="add-group__error">
          {namesError}
        </div>


        <div className="add-group__input-block">
        Type:
          <select
            className="add-group__input"
            onChange={this.handleChange}
            value={type}
            name="type"
          >
            {GROUPS_TYPES.map(item => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="add-group__error" />

        <div className="add-group__input-block">
        Description:
          <input
            className={
              classnames(
                'add-group__input',
                {
                  'add-group__input--error': !!descriptionError,
                },
              )}
            onChange={this.handleChange}
            value={description}
            name="description"
          />
        </div>

        <div className="add-group__error">
          {descriptionError}
        </div>

        <div className="add-group__input-block">
        Forms:
          <Select
            isMulti
            options={formsList}
            className={
              classnames(
                'add-group__input',
                'add-group__select-to-input',
                'add-group__custom-select',
                {
                  'add-group__input--error': !!formsError,
                },
              )}
            onChange={this.handleSelectForms}
            value={forms}
            name="forms"
          />
        </div>

        <div className="add-group__error">
          {formsError}
        </div>

        <div className="add-group__input-block">
        Users:
          <Select
            isMulti
            isDisabled={type === 'Public'}
            options={usersList}
            className={
              classnames(
                'add-group__input',
                'add-group__select-to-input',
                'add-group__custom-select',
                {
                  'add-group__input--error': !!usersError,
                },
              )}
            onChange={this.handleSelectUsers}
            value={users}
            name="users"
          />
        </div>

        <div className="add-group__error">
          {usersError}
        </div>

        <div className="add-group__button-block">
          <button
            type="button"
            onClick={this.validForm}
            className="add-group__button"
          >
            {editData ? 'Save' : 'Add group'}
          </button>

          {
            editData
            && (
            <button
              type="button"
              onClick={this.cancenEdit}
              className="add-group__button"
            >
            Cancel
            </button>
            )
          }

          {successfulMsg
            && <span className="add-group__success">{successfulMsg}</span>
          }
          {pending && <Spinner />}

        </div>

      </form>
    );
  }
}

export default AddGroup;
