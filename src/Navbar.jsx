import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';

class Navbar extends Component {
  renderRooms = () => {
    return (
      <h3>Room 1</h3>
    );
  };
  
  render() {
    console.log('Rendering <Navbar />');
    return (
      <nav className="navbar">
	    <a href="/" className="navbar-brand">Chatty</a>
        <Link to="/room1">Room 1</Link>
        <Route exact path="/room1" render={this.renderRooms} />
        <span className="users-online">{this.props.usersOnline} users online</span>
      </nav>
    );
  }
}
export default Navbar;
