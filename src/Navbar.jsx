import React, {Component} from 'react';
import RoomLinks from './RoomLinks.jsx';

class Navbar extends Component {
  render() {
    return (
      <nav className="navbar">
	    <a href="/" className="navbar-brand">Chatty</a>
        <RoomLinks
          rooms={this.props.rooms}
          currentRoom={this.props.currentRoom}
          joinRoom={this.props.joinRoom}
          />
        <button onClick={this.props.addRoom}>+</button>
        <span className="users-online">{this.props.usersOnline} users online</span>
      </nav>
    );
  }
}
export default Navbar;
