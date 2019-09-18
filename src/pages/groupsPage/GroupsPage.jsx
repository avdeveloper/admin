import React from 'react';
import className from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import tableConfig from './tableConfig';
import 'bootstrap/dist/css/bootstrap.css';

import DeleteModal from '../../components/DeleteModal';
import { isLogin } from '../../stores/action/auth';
import './groupsPage.scss';
import config from '../../constants/firebaseConfig';
import Table from '../../components/FormsTable';
import AddGroup from '../../components/AddGroup';

class GroupsPage extends React.PureComponent {
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
      editData: null,
      idForDelete: '',
      idForEdit: '',
      pending: false,
      users: [],
      forms: [],
      currentGroupId: '',
      loading: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getNewForms = this.getNewForms.bind(this);
    this.setIdForDelete = this.setIdForDelete.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.deleteForm = this.deleteForm.bind(this);
    this.editGroup = this.editGroup.bind(this);
    this.cancenEdit = this.cancenEdit.bind(this);
    this.getFormsUsersList = this.getFormsUsersList.bind(this);
    this.db = firebase.firestore();
  }

  componentDidMount() {
    const {
      isLogin,
    } = this.props;
    isLogin();
    this.getFormsUsersList();
  }

  getNewForms() {
    const { users } = this.state;
    this.db.collection('groups').get()
      .then((snapshot) => {
        const dataList = [];
        snapshot.forEach((doc) => {
          const formatDoc = doc.data();
          formatDoc.DatePublished = formatDoc.DatePublished ? moment.unix(formatDoc.DatePublished.seconds).format('DD/MM/YYYY h:mm a') : '-';
          formatDoc.DateCreated = formatDoc.DateCreated ? moment.unix(formatDoc.DateCreated.seconds).format('DD/MM/YYYY h:mm a') : '-';
          formatDoc.removeButton = () => this.setIdForDelete(doc.id);
          formatDoc.editButton = () => this.editGroup(doc.id);
          formatDoc.userCount = formatDoc.type === 'Public' ? users.length : formatDoc.users.length;
          dataList.push(formatDoc);
        });
        this.setState({
          tableData: dataList,
          loading: false,
        });
      });
  }

  getFormsUsersList() {
    this.db.collection('users').get()
      .then((snapshot) => {
        const dataList = [];
        snapshot.forEach((doc) => {
          const formatDoc = doc.data();
          dataList.push({ value: doc.id, label: formatDoc.fullName });
        });
        this.setState({
          users: dataList,
        }, () => this.getNewForms());
      });

    this.db.collection('forms').get()
      .then((snapshot) => {
        const dataList = [];
        snapshot.forEach((doc) => {
          const formatDoc = doc.data();
          if (formatDoc.Status !== 'Draft') {
            dataList.push({ value: doc.id, label: formatDoc.name });
          }
        });
        this.setState({
          forms: dataList,
        });
      });
  }

  setIdForDelete(idForDelete) {
    this.setState({
      idForDelete,
    });
  }

  cancenEdit() {
    this.setState({
      editData: null,
      activeTab: '1',
      idForEdit: '',
      currentGroupId: '',
    });
  }

  editGroup(id) {
    this.setState({
      editData: null,
    });
    let currentFrom = {};
    let grId = '';
    this.db.collection('groups').get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === id) {
            currentFrom = doc.data();
            grId = doc.id;
          }
        });
        this.setState({
          currentGroupId: grId,
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
    await this.db.collection('groups').doc(id).delete();
    await this.db.collection('users_in_groups').where('groupId', '==', id).get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          this.db.collection('users_in_groups').doc(doc.id).delete();
        });
      });

    this.cancenEdit();
    this.closeModal();
    this.getNewForms();
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
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
      users,
      forms,
      idForEdit,
      currentGroupId,
      loading,
    } = this.state;
    return (
      <div className="homepage">
        <DeleteModal
          onClose={this.closeModal}
          deleteFunction={this.deleteForm}
          idForDelete={idForDelete}
          pending={pending}
          objectDelete="group"
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
              Add/Edit group
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Table data={tableData} tableConfig={tableConfig} loading={loading} />
          </TabPane>
          <TabPane tabId="2">
            <AddGroup
              firestoreDb={this.db}
              editData={editData}
              getNewForms={this.getNewForms}
              cancenEdit={this.cancenEdit}
              idForEdit={idForEdit}
              usersList={users}
              formsList={forms}
              currentGroupId={currentGroupId}
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

export default connect(mapStateToProps, mapDispatchToProps)(GroupsPage);
