import * as R from 'ramda';

import React from 'react';
import Message from './Message.jsx';

const MessageList = ({messages}) => {
  const messageComponents = R.map(message => {
    return (
      <Message
        key={message.id}
        type={message.type}
        user={message.user}
        content={message.content}
        color={message.color}
        />
    );
  })(messages);
  
  return (
    <main className="messages">
      {messageComponents}
    </main>
  );
};

export default MessageList;
