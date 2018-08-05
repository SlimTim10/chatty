import * as R from 'ramda';

import React, {Component} from 'react';

class Navbar extends Component {
  render() {
    console.log('Rendering <Navbar />');

    const roomLinks = R.map(room => {
      const activeClass =
            this.props.currentRoom && (this.props.currentRoom.name === room.name)
            ? 'active'
            : '';
      const joinRoom = () => this.props.joinRoom(room.name);
      
      return (
        <button
          key={room.id}
          onClick={joinRoom}
          className={activeClass}>
          {room.name} ({room.users.length})
        </button>
      );
    })(this.props.rooms);
    
    return (
      <nav className="navbar">
	    <a href="/" className="navbar-brand">Chatty</a>
        {roomLinks}
        <button onClick={this.props.addRoom}>+</button>
        <span className="users-online">{this.props.usersOnline} users online</span>
      </nav>
    );
  }
}
export default Navbar;
