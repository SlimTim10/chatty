import React, {Component} from 'react';
import PropTypes from 'prop-types';

class Message extends Component {
  constructor() {
    super();
    this.state = {
      fading: true
    };
  }
  
  componentDidMount() {
    window.scrollTo(0,document.body.scrollHeight);

    setTimeout(() => {
      this.setState({fading: false});
    }, 200);
  }
  
  render() {
    switch (this.props.type) {
    case 'user': {
      const userStyle = {
        color: this.props.user.color
      };

      const classes = ['message'];
      if (this.state.fading) classes.push('fading');
      
      return (
        <div className={classes.join(' ')}>
          <span className="message-username" style={userStyle}>{this.props.user.name}</span>
          <span className="message-content">{this.props.content}</span>
	    </div>
      );
      break; }
    case 'system':
      return (
        <div className="message system">
          <span className="message-content">{this.props.content}</span>
        </div>
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

Message.propTypes = {
  type: PropTypes.string.isRequired,
  user: PropTypes.object,
  content: PropTypes.string.isRequired
};

export default Message;
