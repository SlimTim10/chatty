import * as R from 'ramda';

import React from 'react';
import PropTypes from 'prop-types';
import RoomLink from './RoomLink.jsx';

const RoomLinks = ({currentRoom, joinRoom, rooms}) => {
  
  const roomLinks = R.map(room => {
    
    const activeClass =
      currentRoom && (currentRoom === room.name)
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

RoomLinks.propTypes = {
  currentRoom: PropTypes.string,
  joinRoom: PropTypes.func.isRequired,
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default RoomLinks;
