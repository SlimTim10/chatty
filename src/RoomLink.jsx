import React from 'react';
import PropTypes from 'prop-types';

const RoomLink = ({room, joinRoom, activeClass}) => (
  <button
    key={room.id}
    onClick={joinRoom}
    className={activeClass}>
    {room.name} ({room.usersOnline})
  </button>
);

RoomLink.propTypes = {
  room: PropTypes.object.isRequired,
  joinRoom: PropTypes.func.isRequired,
  activeClass: PropTypes.string
};

export default RoomLink;
