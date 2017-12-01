import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component {
  render() {
    console.log('Rendering <MessageList />');
    return (
        <main className="messages">
        <Message type="user" username="Anonymous1" content="I won't be impressed with technology until I can download food." />
        <Message type="system" content="Anonymous1 changed their name to nomnom." />
        </main>
    );
  }
}
export default MessageList;
