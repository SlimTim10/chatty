import * as R from 'ramda';

import React from 'react';
import PropTypes from 'prop-types';
import RoomLink from './RoomLink.jsx';

const RoomLinks = ({currentRoom, joinRoom, rooms}) => {
  
  const roomLinks = R.map(room => {
    
    const active = currentRoom && (currentRoom === room.name);
    
    return (
      <RoomLink
        key={room.id}
        room={room}
        joinRoom={() => joinRoom(room.name)}
        active={active}
        />
    );
  })(rooms);

  return (
    <div>
      {roomLinks}
    </div>
  );
};

RoomLinks.propTypes = {
  currentRoom: PropTypes.string,
  joinRoom: PropTypes.func.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RoomLinks;
