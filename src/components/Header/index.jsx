import React from 'react';
import get from 'lodash/get';

import './style.scss';

const Header = props => (
  <div className="header">
     ForMobile App Manager

    <span className="header__username">
      {get(props, 'userData.email', '')}
    </span>
  </div>
);

export default Header;
