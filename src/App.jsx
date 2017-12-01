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
          id: 1,
          type: "user",
          username: "Bob",
          content: "Has anyone seen my marbles?",
        },
        {
          id: 2,
          type: "user",
          username: "Anonymous",
          content: "No, I think you lost them. You lost your marbles Bob. You lost them for good."
        },
        {
          id: 3,
          type: "system",
          content: "Anonymous1 changed their name to nomnom."
        }
      ]
    };
  }
  
  render() {
    console.log('Rendering <App />');
    return (
        <div>
        <Navbar />
        <MessageList messages={this.state.messages} />
        <Chatbar username={this.state.currentUser.name} />
        </div>
    );
  }
}
export default App;
