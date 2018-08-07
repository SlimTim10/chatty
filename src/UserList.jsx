import * as R from 'ramda';

import React from 'react';
import PropTypes from 'prop-types';

import UserItem from './UserItem.jsx';

const UserList = ({users}) => {
  const userItems = R.map(user => <UserItem key={user.id} name={user.name} />)(users);
  
  return (
    <ul className="user-list">
      {userItems}
    </ul>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default UserList;
