import React from 'react';

const RoomLink = ({room, joinRoom, activeClass}) => (
  <button
    key={room.id}
    onClick={joinRoom}
    className={activeClass}>
    {room.name} ({room.usersOnline})
  </button>
);

export default RoomLink;
