import * as R from 'ramda';

import React, {Component} from 'react';
import Message from './Message.jsx';

class MessageList extends Component {
  render() {
    const messages = R.map(message => {
      return (
        <Message
          key={message.id}
          type={message.type}
          user={message.user}
          content={message.content}
          color={message.color}
          />
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
