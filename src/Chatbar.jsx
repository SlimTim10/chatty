import React, {Component} from 'react';

class Chatbar extends Component {
  constructor(props) {
    super(props);
    this.state = {username: this.props.username};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.changeUsername = this.changeUsername.bind(this);
  }
  
  handleSubmit(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      const content = event.target.value;
      const username = this.state.username;
      this.props.sendMessage(username, content);
      event.target.value = "";
    }
  }

  changeUsername(event) {
    this.setState({username: event.target.value});
  }
  
  render() {
    console.log('Rendering <Chatbar />');
    return (
        <footer className="chatbar">
	    <input className="chatbar-username" placeholder="Your Name (Optional)" defaultValue={this.state.username} onChange={this.changeUsername} />
	    <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyPress={this.handleSubmit} />
        </footer>
    );
  }
}
export default Chatbar;
