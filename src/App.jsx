import React, {Component} from 'react';
import Navbar from './Navbar.jsx';
import MessageList from './MessageList.jsx';
import Chatbar from './Chatbar.jsx';

const SERVER_PORT = 3001;

const MSG = Object.freeze({
  user: 'user',
  system: 'system'
});

const TEST_MESSAGES = [
  {
    id: 0,
    type: "user",
    username: "Bob",
    content: "Has anyone seen my marbles?"
  },
  {
    id: 1,
    type: "user",
    username: "Anonymous",
    content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
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
      currentUser: {name: "Bob"},
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

  recvUserMessage = username => content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "user", username: username, content: content};
    const messages = this.state.messages.concat(newMessage);
    this.setState({messages: messages});
  };

  recvSystemMessage = content => {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "system", content: content};
    const messages = this.state.messages.concat(newMessage);
    this.setState({messages: messages});
  };
  
  render() {
    console.log('Rendering <App />');
    return (
        <div>
          <Navbar usersOnline={this.state.usersOnline} />
        <MessageList messages={this.state.messages} />
        <Chatbar username={this.state.currentUser.name} sendUserMessage={this.sendUserMessage} sendSystemMessage={this.sendSystemMessage} />
        </div>
    );
  }
}
export default App;
