import React, {Component} from 'react';

const enterKey = 13;

class Chatbar extends Component {
  constructor(props) {
    super(props);
  }

  handleSubmitUsername = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const newName = event.target.value;
      const content = `${this.props.user.name} changed their name to ${newName}.`;
      this.props.changeUsername(newName);
      this.props.sendSystemMessage(content);
    }
  };
  
  handleSubmitMessage = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const content = event.target.value;
      this.props.sendUserMessage(this.props.user)(content);
      event.target.value = "";
    }
  };
  
  render() {
    return (
        <footer className="chatbar">
	      <input className="chatbar-username" placeholder="Your Name (Optional)" defaultValue={this.props.user.name} onKeyPress={this.handleSubmitUsername} />
	    <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyPress={this.handleSubmitMessage} />
        </footer>
    );
  }
}
export default Chatbar;
