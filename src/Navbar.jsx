import React, {Component} from 'react';

class Navbar extends Component {
  render() {
    console.log('Rendering <Navbar />');
    return (
      <nav className="navbar">
	    <a href="/" className="navbar-brand">Chatty</a>
        <span className="users-online">{this.props.usersOnline} users online</span>
      </nav>
    );
  }
}
export default Navbar;
