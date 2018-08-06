'use strict';

const {broadcast} = require('./socket');
const util = require('./util');
const weather = require('./weather');

const commandList = [
  '?',
  'h',
  'help',
  'ping',
  'weather <city>'
];

const handleCommand = (cmd, body) => client => {
  const respond = resp => {
    const data = {
      type: 'command',
      message: resp
    };
    broadcast(data)(client);
  };
  
  switch (cmd) {
  case 'ping': {
    respond('pong');
    break; }
  case 'weather': {
    weather.getWeather(body)(respond);
    break; }
  case '?':
  case 'h':
  case 'help': 
  default: {
    const message = 'Commands:\n'
      + commandList.map(x => '/'+x).join('\n');
    respond(message);
    break; }
  }
};

const execCommand = data => client => {
  // Show own message to user or hide it?
  // broadcast(data)(client);
  const message = data.message;
  const messageParts = util.splitAtFirst(' ')(message);
  const [cmd, body] = [messageParts[0].slice(1), messageParts[1]];
  handleCommand(cmd, body)(client);
};

module.exports = {execCommand};
