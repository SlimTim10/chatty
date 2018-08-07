import React from 'react';
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

export default Navbar;
