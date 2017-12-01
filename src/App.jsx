import React, {Component} from 'react';
import Navbar from './Navbar.jsx';
import MessageList from './MessageList.jsx';
import Chatbar from './Chatbar.jsx';

class App extends Component {
  render() {
    console.log('Rendering <App />');
    return (
        <div>
        <Navbar />
        <MessageList />
        <Chatbar />
        </div>
    );
  }
}
export default App;
