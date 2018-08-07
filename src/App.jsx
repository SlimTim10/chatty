import * as R from 'ramda';

import React, {Component} from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

import Navbar from './Navbar.jsx';
import Room from './Room.jsx';
import Chatbar from './Chatbar.jsx';

const SERVER_PORT = 3001;

const MSG = Object.freeze({
  user: 'user',
  system: 'system',
  usersOnline: 'usersOnline',
  color: 'color',
  command: 'command',
  action: 'action'
});

const TEST_MESSAGES = [
  {
    id: 0,
    type: "user",
    user: {
      name: "Bob",
      color: "#000000"
    },
    content: "Has anyone seen my marbles?"
  },
  {
    id: 1,
    type: "user",
    user: {
      name: "Bob",
      color: "#000000"
    },
    content: "No, I think you lost them. You lost your marbles Bob. You lost them for good.",
    color: "#000000"
  },
  {
    id: 2,
    type: "system",
    content: "Guest changed their name to Tim."
  }
];

const findRoom = roomName => {
  return R.find(R.propEq('name', roomName));
};

const findCurrentRoom = user => {
  return R.find(room => {
    const names = R.map(user => user.name)(room.users);
    return names.includes(user.name);
  });
};

const defaultUser = {
  name: "Guest",
  color: "#000000"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.socket = null;
    
    this.state = {
      currentUser: defaultUser,
      currentRoom: null,
      rooms: [],
      usersOnline: 1,
      messages: []
    };
  }

  componentDidMount() {
    this.socket = new WebSocket(`ws://localhost:${SERVER_PORT}`);

    this.socket.onopen = event => {
      console.log('Connected to server');

      this.sendActionMessage({
        action: 'joinServer',
        user: this.state.currentUser
      });
    };

    this.socket.onmessage = event => {
      console.log('Message received', event);

      if (!event.isTrusted) return;

      const data = JSON.parse(event.data);
      switch (data.type) {
      case MSG.user:
        this.recvUserMessage(data.user)(data.message);
        break;
      case MSG.system:
        this.recvSystemMessage(data.message);
        break;
      case MSG.usersOnline:
        this.recvUsersOnline(data.usersOnline);
        break;
      case MSG.color:
        this.recvColor(data.color);
        break;
      case MSG.command:
        this.recvCommandMessage(data.message);
        break;
      case MSG.action:
        this.recvActionMessage(data.message);
        break;
      default:
        break;
      }
    };
  }

  sendUserMessage = user => message => {
    this.socket.send(JSON.stringify({
      type: MSG.user,
      roomName: this.state.currentRoom.name,
      user: user,
      message: message
    }));
  }
  
  sendSystemMessage = message => {
    this.socket.send(JSON.stringify({
      type: MSG.system,
      roomName: this.state.currentRoom.name,
      message: message
    }));
  }

  sendActionMessage = message => {
    this.socket.send(JSON.stringify({
      type: MSG.action,
      message: message
    }));
  }

  changeUsername = name => {
    const user = {
      name: name,
      color: this.state.currentUser.color
    };
    
    this.setState({
      currentUser: user
    }, () => {
      this.joinRoom(this.state.currentRoom.name);
    });
  }

  addMessage = message => {
    const messages = R.append(message)(this.state.messages);
    this.setState({ messages: messages });
  }

  recvUserMessage = user => content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "user", user: user, content: content};
    this.addMessage(newMessage);
  }

  recvSystemMessage = content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "system", content: content};
    this.addMessage(newMessage);
  }

  recvCommandMessage = content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "command", content: content};
    this.addMessage(newMessage);
  }

  recvUsersOnline = n => {
    this.setState({ usersOnline: n });
  }

  recvColor = color => {
    const user = {
      name: this.state.currentUser.name,
      color: color
    };
    this.setState({ currentUser: user });
  }

  recvActionMessage = message => {
    switch (message.action) {
    case 'roomInfo':
      this.setState({
        currentRoom: message.room,
        messages: message.room.messages
      });
      break;
    case 'roomsOverview':
      this.setState(prevState => ({
        rooms: message.rooms
      }));
      break;
    default:
      break;
    }
  }

  addRoom = () => {
    this.sendActionMessage({
      action: 'addRoom'
    });
  }

  joinRoom = roomName => {
    this.sendActionMessage({
      action: 'joinRoom',
      user: this.state.currentUser,
      roomName: roomName
    });
  }
  
  render() {

    const users = this.state.currentRoom ? this.state.currentRoom.users : [];
    
    return (
      <Router>
        <div>
          <Navbar
            usersOnline={this.state.usersOnline}
            currentRoom={this.state.currentRoom}
            rooms={this.state.rooms}
            addRoom={this.addRoom}
            joinRoom={this.joinRoom}
            />
          <Room messages={this.state.messages} users={users} />
          <Chatbar
            user={this.state.currentUser}
            sendUserMessage={this.sendUserMessage}
            sendSystemMessage={this.sendSystemMessage}
            changeUsername={this.changeUsername}
            />
        </div>
      </Router>
    );
  }
}
export default App;
