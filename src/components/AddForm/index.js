import React from 'react';
import classnames from 'classnames';
import { Spinner } from 'reactstrap';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import isURL from 'validator/lib/isURL';
import TagsInput from 'react-tagsinput';
import 'react-tagsinput/react-tagsinput.css';
import getForm from './service';

import './style.scss';

const FORMS_TYPES = ['Draft', 'Publish', 'Archive', 'Preview'];

class AddForm extends React.PureComponent {
  static propsTypes = {
    editData: PropTypes.any,
    cancelEdit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      names: '',
      status: 'Draft',
      formEndpoint: '',
      icon: 'https://firebasestorage.googleapis.com/v0/b/form2platform.appspot.com/o/formIcon.png?alt=media&token=4d883ef2-8a3e-4134-aa5e-5b35b3c0e0e5',

      namesError: '',
      formEndpointError: '',
      iconError: '',
      currentEditId: '',

      pending: false,
      successfulMsg: '',
      categories: [],

      isUpdate: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.validForm = this.validForm.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.createForm = this.createForm.bind(this);
    this.updateForm = this.updateForm.bind(this);
    this.handleChangeCategories = this.handleChangeCategories.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.currentEditId !== nextProps.idForEdit) {
      return {
        names: get(nextProps, 'editData.name', ''),
        status: get(nextProps, 'editData.Status', ''),
        formEndpoint: get(nextProps, 'editData.formEndpoint', ''),
        currentEditId: get(nextProps, 'idForEdit'),
        categories: get(nextProps, 'editData.categories') || [],
        namesError: '',
        formEndpointError: '',
        iconError: '',
      };
    }
    return null;
  }

  handleChangeCategories(categories) {
    this.setState({ categories });
  }

  cancelEdit() {
    const {
      cancelEdit,
    } = this.props;
    cancelEdit();
    this.setState({
      names: '',
      status: 'Draft',
      formEndpoint: '',
      currentEditId: '',
      isUpdate: false,
    });
  }

  handleChange({ target }) {
    this.setState({
      [`${target.name}Error`]: '',
      [target.name]: target.value,
    });
  }

  async validForm () {
    let isValid = true;

    const {
      names,
      formEndpoint,
      icon,
      status,
      categories,
    } = this.state;

    const {
      editData,
      idForEdit,
    } = this.props;

    let namesError = '';
    let formEndpointError = '';

    if (!names.trim()) {
      namesError = 'Enter name';
      isValid = false;
    }

    if (!formEndpoint.trim()) {
      formEndpointError = 'Enter endpoint';
      isValid = false;
    } else if (!isURL(formEndpoint.trim())) {
      formEndpointError = 'Endpoint must be an URL';
      isValid = false;
    }

    this.setState({
      namesError,
      formEndpointError,
    });

    // be use after realize
    // image uploading fucntion

    // if (!icon.trim()) {
    //   this.setState({
    //     iconError: 'Add icon',
    //   });
    //   isValid = false;
    // }

    if (isValid) {
      const data = {
        name: names,
        Icon: icon,
        formEndpoint,
        Status: status,
        form: await getForm(formEndpoint),
        categories,
        DateCreated: firebase.firestore.Timestamp.now(),
      };
      if (data.Status === 'Publish') {
        data.DatePublished = firebase.firestore.Timestamp.now();
      }
      this.setState({
        pending: true,
      });
      if (!editData) {
        this.createForm(data);
      } else {
        this.updateForm(idForEdit);
      }
    }
  }

  createForm(data) {
    const {
      firestoreDb,
      getNewForms,
    } = this.props;

    firestoreDb.collection('forms').add(data)
      .then((ref) => {
        if (ref.id) {
          this.setState({
            pending: false,
            successfulMsg: 'Form has been added',
            names: '',
            formEndpoint: '',
            icon: 'https://firebasestorage.googleapis.com/v0/b/form2platform.appspot.com/o/formIcon.png?alt=media&token=4d883ef2-8a3e-4134-aa5e-5b35b3c0e0e5',
            status: 'Draft',
            categories: [],
          });
          getNewForms();
          setTimeout(() => this.setState({
            successfulMsg: '',
          }), 1000);
        }
      });
  }

  async updateForm(idForEdit) {
    const {
      names,
      formEndpoint,
      icon,
      status,
      categories,
    } = this.state;

    const {
      firestoreDb,
      getNewForms,
      editData,
    } = this.props;

    const data = {
      name: names,
      Icon: icon,
      formEndpoint,
      Status: status,
      categories,
      DateCreated: firebase.firestore.Timestamp.now(),
    };
    if (data.Status === 'Publish' && editData.DatePublished === '') {
      data.DatePublished = firebase.firestore.Timestamp.now();
    } else {
      data.DatePublished = get(editData, 'DatePublished', '');
    }
    data.DateCreated = editData.DateCreated;
    await firestoreDb.collection('forms').doc(idForEdit).set(data);
    this.setState({
      pending: false,
    });
    this.cancelEdit();
    getNewForms();
  }

  render() {
    const {
      names,
      status,
      formEndpoint,
      icon,

      namesError,
      formEndpointError,
      iconError,

      pending,
      successfulMsg,
      categories,

    } = this.state;

    const {
      editData,
    } = this.props;
    return (
      <div className="add-form">
        <div className="add-form__input-block">
        App Name:
          <input
            className={
              classnames(
                'add-form__input',
                {
                  'add-form__input--error': !!namesError,
                },
              )}
            onChange={this.handleChange}
            value={names}
            name="names"
          />
        </div>
        <div className="add-form__error">
          {namesError}
        </div>
        <div className="add-form__input-block">
        Status:
          <select
            className="add-form__input"
            onChange={this.handleChange}
            value={status}
            name="status"
          >
            {FORMS_TYPES.map(item => (
              <option key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="add-form__error" />

        <div className="add-form__input-block">
        Icon:
          <input
            disabled
            placeholder="Coming soon..."
            className={
              classnames(
                'add-form__input',
                {
                  'add-form__input--error': !!iconError,
                },
              )}
            onChange={this.handleChange}
            value={icon}
            name="icon"
          />
        </div>

        <div className="add-form__error">
          {iconError}
        </div>

        <div className="add-form__input-block">
        Formio Endpoint:
          <input
            className={
              classnames(
                'add-form__input',
                {
                  'add-form__input--error': !!formEndpointError,
                },
              )}
            onChange={this.handleChange}
            value={formEndpoint}
            name="formEndpoint"
          />
        </div>

        <div className="add-form__input-block">
          Categories:
          <TagsInput
            value={categories}
            onChange={this.handleChangeCategories}
            className={
            classnames(
              'add-form__input',
              'add-form__input--tag',
            )}
          />
        </div>


        <div className="add-form__error">
          {formEndpointError}
        </div>

        <div className="add-form__button-block">
          <button
            type="button"
            onClick={this.validForm}
            className="add-form__button"
          >
            {editData ? 'Save' : 'Add form'}
          </button>

          {
            editData
            && (
            <button
              type="button"
              onClick={this.cancelEdit}
              className="add-form__button"
            >
            Cancel
            </button>
            )
          }

          {successfulMsg
            && <span className="add-form__success">{successfulMsg}</span>
          }
          {pending && <Spinner />}

        </div>

      </div>
    );
  }
}

export default AddForm;
