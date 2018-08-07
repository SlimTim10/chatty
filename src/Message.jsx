import React, {Component} from 'react';

class Message extends Component {
  componentDidMount() {
    window.scrollTo(0,document.body.scrollHeight);
  }
  
  render() {
    switch (this.props.type) {
    case 'user':
      const userStyle = {
        color: this.props.user.color
      };
      
      return (
        <div className="message">
          <span className="message-username" style={userStyle}>{this.props.user.name}</span>
          <span className="message-content">{this.props.content}</span>
	    </div>
      );
      break;
    case 'system':
      return (
        <div className="message system">{this.props.content}</div>
      );
      break;
    case 'command':
      return (
        <div className="message">
          <span className="message-username"></span>
          <pre className="message-content">{this.props.content}</pre>
        </div>
      );
    default:
      break;
    }
  }
}
export default Message;
