import React from 'react';
import PropTypes from 'prop-types';

const RoomLink = ({room, joinRoom, active}) => (
  <button
    key={room.id}
    onClick={joinRoom}
    className={active ? 'active-room' : ''}>
    {room.name} ({room.usersOnline})
  </button>
);

RoomLink.propTypes = {
  room: PropTypes.object.isRequired,
  joinRoom: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired
};

export default RoomLink;
