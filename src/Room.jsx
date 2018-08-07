import React from 'react';
import PropTypes from 'prop-types';

import MessageList from './MessageList.jsx';
import UserList from './UserList.jsx';

const Room = ({messages, users}) => (
  <div className="room">
    <MessageList messages={messages} />
    <UserList users={users} />
  </div>
);

Room.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      user: PropTypes.object,
      content: PropTypes.string.isRequired
    }).isRequired
  ).isRequired,
  users: PropTypes.arrayOf(PropTypes.object)
};

export default Room;
