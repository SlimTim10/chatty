import React, {Component} from 'react';

const enterKey = 13;

class Chatbar extends Component {
  constructor(props) {
    super(props);
    this.state = {username: this.props.username};
  }

  handleSubmitUsername = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const newName = event.target.value;
      const content = `${this.state.username} changed their name to ${newName}.`;
      this.setState({username: newName});
      this.props.sendSystemMessage(content);
    }
  };
  
  handleSubmitMessage = event => {
    if (event.charCode === enterKey) {
      event.preventDefault();
      const content = event.target.value;
      const username = this.state.username;
      this.props.sendUserMessage(username)(content);
      event.target.value = "";
    }
  };
  
  render() {
    console.log('Rendering <Chatbar />');
    return (
        <footer className="chatbar">
	      <input className="chatbar-username" placeholder="Your Name (Optional)" defaultValue={this.state.username} onKeyPress={this.handleSubmitUsername} />
	    <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyPress={this.handleSubmitMessage} />
        </footer>
    );
  }
}
export default Chatbar;
