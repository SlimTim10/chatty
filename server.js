const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const express = require('express');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const R = require('ramda');
const weather = require('./server/weather');

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

let colorsDB = [
  {color: '#008080', used: false},
  {color: '#ffc0cb', used: false},
  {color: '#ff0000', used: false},
  {color: '#ffd700', used: false}
];

const commandList = [
  'help',
  'ping',
  'weather <city>'
];

// [colorObj] -> (color, [colorObj])
const availableColor = cs => {
  const i = R.findIndex(R.propEq('used', false))(cs);
  
  if (i === -1) return { color: '#000000', colors: cs };
  
  cs[i].used = true;
  return { color: cs[i].color, colors: cs };
};

const server = express()
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected');

  ws.id = uuid();
  sendUsersOnline();
  const { color, colors } = availableColor(colorsDB);
  assignColor(ws)(color);
  colorsDB = colors;

  ws.on('close', () => {
    sendUsersOnline();
    colorsDB = R.append({color: color, used: false})(colorsDB);
    console.log('Client disconnected');
  });

  ws.on('message', msg => {
    console.log('received: %s', msg);

    const data = JSON.parse(msg);
    switch (data.type) {
    case 'user':
      if (commandMessage(data.message)) {
        parseCommand(data)(ws);
      } else {
        broadcastAll(data);
      }
      break;
    case 'system':
      broadcastAll(data);
      break;
    default:
      break;
    }
  })
});

// String -> Bool
const commandMessage = message => message.startsWith('/');

// (a -> Bool) -> [a] -> ([a], [a])
const span = p => xs => {
  if (xs.length === 0) return [];
  if (p(R.head(xs))) {
    const x = R.head(xs);
    const rest = R.tail(xs);
    const ys = span(p)(rest);
    return [[x] + ys[0], ys[1]];
  } else {
    return [[], xs];
  }
};

// a -> [a] -> ([a], [a])
const splitAtFirst = y => xs => ([
  R.takeWhile(z => z !== y)(xs),
  R.tail(R.dropWhile(z => z !== y)(xs))
]);

const getWeather = () => 'test';

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
  case 'help': 
  default: {
    const message = 'Commands:\n'
      + commandList.map(x => '/'+x).join('\n');
    respond(message);
    break; }
  }
};

const parseCommand = data => client => {
  // Show own message to user or hide it?
  // broadcast(data)(client);
  const message = data.message;
  const messageParts = splitAtFirst(' ')(message);
  const [cmd, body] = [messageParts[0].slice(1), messageParts[1]];
  handleCommand(cmd, body)(client);
};

const broadcast = data => client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

const broadcastAll = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const sendUsersOnline = () => {
  const data = {
    type: 'usersOnline',
    usersOnline: wss.clients.size
  };
  broadcastAll(data);
};

const assignColor = client => color => {
  const data = {
    type: 'color',
    color: color
  };
  client.send(JSON.stringify(data));
};
