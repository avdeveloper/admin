
import React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import className from 'classnames';

import { signOut } from '../../stores/action/auth';
import './sideBar.scss';
import sideBarData from '../../constants/sidebarData';

const SideBar = props => (
  JSON.parse(localStorage.getItem('isAuth')) && (
    <div className="sidebar">
      {
      sideBarData.map(item => (
        <NavLink
          to={item.link[0]}
          key={item.title}
          className={className('sidebar__element',
            {
              'sidebar__element--active': item.link.includes(window.location.pathname),
            })}
        >
          {item.title}
        </NavLink>
      ))
    }
      <span
        className="sidebar__exit"
        onClick={props.signOut}
      >
      Exit
      </span>
    </div>
  )
);

const mapDispatchToProps = dispatch => ({
  signOut: () => dispatch(signOut()),
});

export default withRouter(connect(null, mapDispatchToProps)(SideBar));
