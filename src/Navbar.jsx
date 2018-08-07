import React from 'react';
import PropTypes from 'prop-types';
import RoomLinks from './RoomLinks.jsx';

const Navbar = ({
  rooms,
  currentRoom,
  joinRoom,
  addRoom,
  usersOnline
}) => {
  
  const usersOnlineText = usersOnline === 1 ? 'user online' : 'users online';
  
  return (
    <nav className="navbar">
	  <a href="/" className="navbar-brand">Chatty</a>
      <RoomLinks
        rooms={rooms}
        currentRoom={currentRoom}
        joinRoom={joinRoom}
        />
      <button onClick={addRoom}>+</button>
      <span className="users-online">{usersOnline} {usersOnlineText}</span>
    </nav>
  );
};

Navbar.propTypes = {
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentRoom: PropTypes.object,
  joinRoom: PropTypes.func.isRequired,
  addRoom: PropTypes.func.isRequired,
  usersOnline: PropTypes.number.isRequired
};

export default Navbar;
