import React from 'react';
import PropTypes from 'prop-types';

const enterKey = 13;

const Chatbar = ({
  user,
  changeUsername,
  sendSystemMessage,
  sendUserMessage
}) => {
  
  const handleSubmitUsername = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const newName = event.target.value;
      const content = `${user.name} changed their name to ${newName}.`;
      changeUsername(newName);
      sendSystemMessage(content);
    }
  };
  
  const handleSubmitMessage = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const content = event.target.value;
      sendUserMessage(user)(content);
      event.target.value = "";
    }
  };
  
  return (
    <footer className="chatbar">
	  <input
        className="chatbar-username"
        placeholder="Your Name (Optional)"
        defaultValue={user.name}
        onKeyPress={handleSubmitUsername}
        />
	  <input
        className="chatbar-message"
        placeholder="Type a message and hit ENTER"
        onKeyPress={handleSubmitMessage}
        />
    </footer>
  );
};

Chatbar.propTypes = {
  user: PropTypes.object.isRequired,
  changeUsername: PropTypes.func.isRequired,
  sendSystemMessage: PropTypes.func.isRequired,
  sendUserMessage: PropTypes.func.isRequired
};

export default Chatbar;
