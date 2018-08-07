import React from 'react';
import PropTypes from 'prop-types';

const UserItem = ({name}) => (
  <li>
    {name}
  </li>
);

UserItem.propTypes = {
  name: PropTypes.string.isRequired
};

export default UserItem;
