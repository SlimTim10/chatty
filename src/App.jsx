import * as R from 'ramda';

import React, {Component} from 'react';
import Navbar from './Navbar.jsx';
import MessageList from './MessageList.jsx';
import Chatbar from './Chatbar.jsx';

const SERVER_PORT = 3001;

const MSG = Object.freeze({
  user: 'user',
  system: 'system',
  usersOnline: 'usersOnline',
  color: 'color',
  command: 'command'
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
    content: "Anonymous1 changed their name to nomnom."
  }
];

class App extends Component {
  constructor(props) {
    super(props);

    this.socket = null;
    
    this.state = {
      currentUser: {
        name: "Guest",
        color: "#000000"
      },
      usersOnline: 1,
      messages: TEST_MESSAGES
    };
  }

  componentDidMount() {
    this.socket = new WebSocket(`ws://localhost:${SERVER_PORT}`);

    this.socket.onopen = event => {
      console.log('Connected to server');
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
      default:
        break;
      }
    };
  }

  sendUserMessage = user => message => {
    this.socket.send(JSON.stringify({
      type: MSG.user,
      user: user,
      message: message
    }));
  };
  
  sendSystemMessage = message => {
    this.socket.send(JSON.stringify({
      type: MSG.system,
      message: message
    }));
  };

  changeUsername = name => {
    const user = {
      name: name,
      color: this.state.currentUser.color
    };
    this.setState({ currentUser: user });
  };

  addMessage = message => {
    const messages = R.append(message)(this.state.messages);
    this.setState({ messages: messages });
  };

  recvUserMessage = user => content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "user", user: user, content: content};
    this.addMessage(newMessage);
  };

  recvSystemMessage = content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "system", content: content};
    this.addMessage(newMessage);
  };

  recvCommandMessage = content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "command", content: content};
    this.addMessage(newMessage);
  };

  recvUsersOnline = n => {
    this.setState({ usersOnline: n });
  };

  recvColor = color => {
    const user = {
      name: this.state.currentUser.name,
      color: color
    };
    this.setState({ currentUser: user });
  };
  
  render() {
    console.log('Rendering <App />');
    return (
      <div>
        <Navbar usersOnline={this.state.usersOnline} />
        <MessageList messages={this.state.messages} />
        <Chatbar user={this.state.currentUser} sendUserMessage={this.sendUserMessage} sendSystemMessage={this.sendSystemMessage} changeUsername={this.changeUsername} />
      </div>
    );
  }
}
export default App;
