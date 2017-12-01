import React, {Component} from 'react';

class Chatbar extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  handleSubmit(event) {
    if (event.charCode === 13) {
      event.preventDefault();
      const content = event.target.value;
      this.props.sendMessage(this.props.username, content);
      event.target.value = "";
    }
  }
  
  render() {
    console.log('Rendering <Chatbar />');
    return (
        <footer className="chatbar">
	    <input className="chatbar-username" placeholder="Your Name (Optional)" defaultValue={this.props.username} />
	    <input className="chatbar-message" placeholder="Type a message and hit ENTER" onKeyPress={this.handleSubmit} />
        </footer>
    );
  }
}
export default Chatbar;
