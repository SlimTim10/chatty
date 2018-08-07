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
  return (
    <nav className="navbar">
	  <a href="/" className="navbar-brand">Chatty</a>
      <RoomLinks
        rooms={rooms}
        currentRoom={currentRoom}
        joinRoom={joinRoom}
        />
      <button onClick={addRoom}>+</button>
      <span className="users-online">{usersOnline} users online</span>
    </nav>
  );
};

Navbar.propTypes = {
  rooms: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentRoom: PropTypes.string,
  joinRoom: PropTypes.func.isRequired,
  addRoom: PropTypes.func.isRequired,
  usersOnline: PropTypes.number.isRequired
};

export default Navbar;
