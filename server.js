var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
const express = require('express');
const WebSocket = require('ws');
const uuid = require('uuid/v4');

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000,
      ignored: /node_modules/
    }
  })
  .listen(3000, '0.0.0.0', function (err, result) {
    if (err) {
      console.log(err);
    }

    console.log('Client running at http://0.0.0.0:3000');
  });

const PORT = 3001;

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected');

  sendUsersOnline();

  ws.on('close', () => {
    sendUsersOnline();
    console.log('Client disconnected');
  });

  ws.on('message', msg => {
    console.log('received: %s', msg);

    const data = JSON.parse(msg);
    switch (data.type) {
    case 'user':
    case 'system':
      broadcastAll(data);
      break;
    default:
      break;
    }
  })
});

const broadcastAll = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  })
};

const sendUsersOnline = () => {
  const data = {
    type: 'usersOnline',
    usersOnline: wss.clients.size
  };
  broadcastAll(data);
};
