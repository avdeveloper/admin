import React from 'react';
import className from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { uniq } from 'lodash';
import moment from 'moment';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

import tableConfig from './tableConfig';
import DeleteModal from '../../components/DeleteModal';
import { isLogin } from '../../stores/action/auth';
import './formsPage.scss';
import config from '../../constants/firebaseConfig';
import Table from '../../components/FormsTable';
import AddForm from '../../components/AddForm';
import get from 'lodash/get';
import getForm from '../../components/AddForm/service';

class FormsPage extends React.PureComponent {
  static propsTypes = {
    isLogin: PropTypes.func,
  }

  constructor(props) {
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    super(props);
    this.state = {
      tableData: [],
      activeTab: '1',
      loading: true,
      editData: null,
      idForDelete: '',
      idForEdit: '',
      pending: false,
      status: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getNewForms = this.getNewForms.bind(this);
    this.setIdForDelete = this.setIdForDelete.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.deleteForm = this.deleteForm.bind(this);
    this.editForm = this.editForm.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.db = firebase.firestore();
    this.deleteFormFromGroups = this.deleteFormFromGroups.bind(this);
  }

  componentDidMount() {
    const {
      isLogin,
    } = this.props;
    isLogin();
    this.getNewForms();
  }

  async getNewForms() {
    const dataList = [];
    const { docs } = await this.db.collection('forms').get();

    await Promise.all(docs.map(async (doc) => {
      const item = await this.db.collection('submissions').where('formId', '==', doc.id).get();
      const groups = await this.db.collection('groups').where('formsId', 'array-contains', doc.id).get();
      const submissions = [];
      const groupsName = [];

      item.forEach((localDoc) => {
        const data = localDoc.data();
        submissions.push(data.userId);
      });

      groups.forEach((localDoc) => {
        const data = localDoc.data();
        groupsName.push(data.name);
      });

      const formatDoc = doc.data();
      formatDoc.id = doc.id;
      formatDoc.Group = groupsName;
      formatDoc.submissions = submissions.length;
      formatDoc.unique_users = uniq(submissions).length;
      formatDoc.DatePublishedForUpdate = formatDoc.DatePublished;
      formatDoc.DateCreatedForUpdate = formatDoc.DateCreated;
      formatDoc.DatePublished = formatDoc.DatePublished
        ? moment.unix(formatDoc.DatePublished.seconds).format('DD/MM/YYYY h:mm a') : '-';
      formatDoc.DateCreated = formatDoc.DateCreated
        ? moment.unix(formatDoc.DateCreated.seconds).format('DD/MM/YYYY h:mm a') : '-';
      formatDoc.removeButton = () => this.setIdForDelete(doc.id);
      formatDoc.editButton = () => this.editForm(doc.id);

      dataList.push(formatDoc);
    }));

    this.setState({
      tableData: dataList,
      loading: false,
    });
  }

  setIdForDelete(idForDelete) {
    this.setState({
      idForDelete,
    });
  }

  cancelEdit() {
    this.setState({
      editData: null,
      activeTab: '1',
      idForEdit: '',
    });
  }

  editForm(id) {
    let currentFrom = {};
    this.db.collection('forms').get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === id) {
            currentFrom = doc.data();
          }
        });
        this.setState({
          editData: currentFrom,
          activeTab: '2',
          idForEdit: id,
        });
      });
  }

  closeModal() {
    this.setState({
      idForDelete: '',
      pending: false,
    });
  }


  async deleteForm(id) {
    this.setState({
      pending: true,
    });
    await this.db.collection('forms').doc(id).delete();
    this.deleteFormFromGroups(id);
    this.closeModal();
    this.cancelEdit();
    this.getNewForms();
  }

  async deleteFormFromGroups(id) {
    const groups = await this.db.collection('groups').where('formsId', 'array-contains', id).get();

    groups.forEach((localDoc) => {
      const data = localDoc.data();
      data.forms = data.forms.filter(item => item.value !== id);
      data.formsId = data.formsId.filter(item => item !== id);
      this.db.collection('groups').doc(localDoc.id).set(data);
    });
  }

  updateFormLink = () => {
    const { tableData } = this.state;
    this.setState({ loading: true });
    Promise.all(tableData.map(async (item) => {
      const data = {
        name: item.name,
        Icon: item.Icon,
        formEndpoint: item.formEndpoint,
        Status: item.Status,
        form: await getForm(item.formEndpoint),
        categories: item.categories || [],
        DateCreated: item.DateCreatedForUpdate,
        DatePublished: item.DatePublishedForUpdate,
      };
      return this.db.collection('forms').doc(item.id).set(data);
    }))
      .then(() => {
        this.setState({ loading: false, status: 'Forms Updated' });
        setTimeout(() => this.setState({ status: '' }), 2000);
      })
      .catch(e => {
        this.setState({ loading: false, status: e.message });
        setTimeout(() => this.setState({ status: '' }), 2000);
      });
  }

  toggle(tab) {
    const {
      activeTab,
    } = this.state;
    if (activeTab !== tab) {
      this.setState({
        activeTab: tab,
      });
    }
  }

  handleChange({ target }) {
    this.setState({
      errMsg: '',
      [target.name]: target.value,
    });
  }

  render() {
    const {
      tableData,
      activeTab,
      editData,
      idForDelete,
      pending,
      idForEdit,
      loading,
      status,
    } = this.state;
    return (
      <div className="homepage">
        <DeleteModal
          onClose={this.closeModal}
          deleteFunction={this.deleteForm}
          idForDelete={idForDelete}
          pending={pending}
          objectDelete="form"
        />
        <Nav tabs>
          <NavItem>
            <NavLink
              className={className({ active: activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Show forms
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={className({ active: activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Add/Edit form
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Table data={tableData} tableConfig={tableConfig} loading={loading} />
            <div className="d-flex align-items-center mt-3">
              <button
                type="button"
                onClick={this.updateFormLink}
                className="btn btn-danger mr-3"
                disabled={loading}
              >
                Update Form Definitions
              </button>
              {
                status === 'Forms Updated' && <p className="text-success m-0">{ status }</p>
              }
              {
                status && status !== 'Forms Updated' && <p className="text-danger m-0">{ status }</p>
              }
            </div>
          </TabPane>
          <TabPane tabId="2">
            <AddForm
              firestoreDb={this.db}
              editData={editData}
              getNewForms={this.getNewForms}
              cancelEdit={this.cancelEdit}
              idForEdit={idForEdit}
            />
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  auth: state.auth,
});

const mapDispatchToProps = dispatch => ({
  isLogin: () => dispatch(isLogin()),
});

export default connect(mapStateToProps, mapDispatchToProps)(FormsPage);
