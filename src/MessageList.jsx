import * as R from 'ramda';

import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component {
  render() {
    console.log('Rendering <MessageList />');

    const messages = R.map(message => {
      return (
        <Message key={message.id} type={message.type} username={message.username} content={message.content} />
      );
    })(this.props.messages);
    
    return (
        <main className="messages">
        {messages}
        </main>
    );
  }
}
export default MessageList;
