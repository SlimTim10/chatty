import * as R from 'ramda';

import React from 'react';
import RoomLink from './RoomLink.jsx';

const RoomLinks = ({currentRoom, joinRoom, rooms}) => {
  
  const roomLinks = R.map(room => {
    
    const activeClass =
      currentRoom && (currentRoom.name === room.name)
      ? 'active'
      : '';
    
    return (
      <RoomLink
        key={room.id}
        room={room}
        joinRoom={() => joinRoom(room.name)}
        activeClass={activeClass}
        />
    );
  })(rooms);

  return (
    <div>
      {roomLinks}
    </div>
  );
};

export default RoomLinks;
