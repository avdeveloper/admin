import React from 'react';
import className from 'classnames';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
} from 'reactstrap';
import get from 'lodash/get';

import tableConfig from './tableConfig';
import DeleteModal from '../../components/DeleteModal';
import {
  isLogin,
  createUser,
  deleteUser,
  updateUser,
} from '../../stores/action/auth';
import config from '../../constants/firebaseConfig';
import Table from '../../components/FormsTable';
import AddForm from '../../components/AddUser';

import './users.scss';
import 'bootstrap/dist/css/bootstrap.css';

const filterData = (data, role) => {
  let filterList = [];
  if (Number(role) === 1) {
    filterList = data.filter(item => Number(item.role) === 0);
  }
  if (Number(role) === 2) {
    filterList = data.filter(item => [0, 1].includes(Number(item.role)));
  }
  return filterList;
};

class UsersPage extends React.PureComponent {
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
      loading: true,
    };
    this.handleChange = this.handleChange.bind(this);
    this.toggle = this.toggle.bind(this);
    this.getNewUsers = this.getNewUsers.bind(this);
    this.setIdForDelete = this.setIdForDelete.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
    this.editUser = this.editUser.bind(this);
    this.cancenEdit = this.cancenEdit.bind(this);
    this.deleteUserFromGroups = this.deleteUserFromGroups.bind(this);
    this.db = firebase.firestore();
    this.firestoreAuth = firebase.auth();
  }

  componentDidMount() {
    const {
      isLogin,
    } = this.props;
    isLogin();
    this.getNewUsers();
  }

  async getNewUsers() {
    const dataList = [];
    const { docs } = await this.db.collection('users').get();

    await Promise.all(docs.map(async (doc) => {
      const groups = await this.db.collection('groups').where('usersId', 'array-contains', doc.id).get();
      const groupsName = [];

      groups.forEach((localDoc) => {
        const data = localDoc.data();
        groupsName.push(data.name);
      });

      const formatDoc = doc.data();
      formatDoc.groups = groupsName;
      formatDoc.removeButton = () => this.setIdForDelete(doc.id);
      formatDoc.editButton = () => this.editUser(doc.id);

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

  cancenEdit() {
    this.setState({
      editData: null,
      activeTab: '1',
      idForEdit: '',
    });
  }

  editUser(id) {
    let currentFrom = {};
    this.db.collection('users').get()
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


  async deleteUser(id) {
    const {
      deleteUser,
    } = this.props;

    this.setState({
      pending: true,
    });
    await this.db.collection('users').doc(id).delete();
    this.deleteUserFromGroups(id);
    deleteUser(id);
    this.closeModal();
    this.cancenEdit();
    this.getNewUsers();
  }

  async deleteUserFromGroups(id) {
    const groups = await this.db.collection('groups').where('usersId', 'array-contains', id).get();
    groups.forEach((localDoc) => {
      const data = localDoc.data();
      data.users = data.users.filter(item => item.value !== id);
      data.usersId = data.usersId.filter(item => item !== id);
      this.db.collection('groups').doc(localDoc.id).set(data);
    });
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
      idForEdit,
      loading,
    } = this.state;
    const {
      createUser,
      updateUser,
      auth,
    } = this.props;
    return (
      <div className="homepage">
        <DeleteModal
          onClose={this.closeModal}
          deleteFunction={this.deleteUser}
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
              Show users
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={className({ active: activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Add/Edit user
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={activeTab}>
          <TabPane tabId="1">
            <Table
              data={filterData(tableData, get(auth, 'currentUser.role'))}
              tableConfig={tableConfig}
              loading={loading}
            />
          </TabPane>
          <TabPane tabId="2">
            <AddForm
              firestoreDb={this.db}
              firestoreAuth={this.firestoreAuth}
              editData={editData}
              getNewUsers={this.getNewUsers}
              cancenEdit={this.cancenEdit}
              idForEdit={idForEdit}
              createUser={createUser}
              updateUser={updateUser}
              isSuperAdmin={get(auth, 'currentUser.role') === 2}
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
  createUser: data => dispatch(createUser(data)),
  deleteUser: data => dispatch(deleteUser(data)),
  updateUser: data => dispatch(updateUser(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(UsersPage);
