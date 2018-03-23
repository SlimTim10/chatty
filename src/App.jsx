import React, {Component} from 'react';
import Navbar from './Navbar.jsx';
import MessageList from './MessageList.jsx';
import Chatbar from './Chatbar.jsx';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: {name: "Bob"},
      messages: [
        {
          id: 0,
          type: "user",
          username: "Bob",
          content: "Has anyone seen my marbles?",
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
      ]
    };

    this.sendMessage = this.sendMessage.bind(this);
    this.sendSystemMessage = this.sendSystemMessage.bind(this);
  }

  sendMessage(username, content) {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "user", username: username, content: content};
    const messages = this.state.messages.concat(newMessage);
    this.setState({messages: messages});
  }

  sendSystemMessage(content) {
    const id = this.state.messages.length;
    const newMessage = {id: id, type: "system", content: content};
    const messages = this.state.messages.concat(newMessage);
    this.setState({messages: messages});
  }
  
  render() {
    console.log('Rendering <App />');
    return (
        <div>
        <Navbar />
        <MessageList messages={this.state.messages} />
        <Chatbar username={this.state.currentUser.name} sendMessage={this.sendMessage} sendSystemMessage={this.sendSystemMessage} />
        </div>
    );
  }
}
export default App;
