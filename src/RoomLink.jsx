import React, {Component} from 'react';

class RoomLink extends Component {
  render() {
    return (
      <button
        key={this.props.room.id}
        onClick={this.props.joinRoom}
        className={this.props.activeClass}>
        {this.props.room.name} ({this.props.room.usersOnline})
      </button>
    );
  }
}
export default RoomLink;
