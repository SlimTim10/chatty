import * as R from 'ramda';

import React, {Component} from 'react';
import RoomLink from './RoomLink.jsx';

class RoomLinks extends Component {
  render() {
    const roomLinks = R.map(room => {
      const activeClass =
            this.props.currentRoom && (this.props.currentRoom.name === room.name)
            ? 'active'
            : '';
      const joinRoom = () => this.props.joinRoom(room.name);
      
      return (
        <RoomLink
          key={room.id}
          room={room}
          joinRoom={joinRoom}
          activeClass={activeClass}
          />
      );
    })(this.props.rooms);

    return (
      <div>
        {roomLinks}
      </div>
    );
  }
}
export default RoomLinks;
