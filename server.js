const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');
const express = require('express');
const WebSocket = require('ws');
const {MongoClient} = require('mongodb');
const uuid = require('uuid/v4');
const R = require('ramda');
const weather = require('./server/weather');

const mongoURL = 'mongodb://localhost:27017';
const dbName = 'chatty';

(async function() {
  let client;

  try {
    client = await MongoClient.connect(mongoURL);
    console.log(`Connected to mongodb: ${mongoURL}`);

    const db = client.db(dbName);

    const server = express()
          .use(express.static('public'))
          .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

    const wss = new WebSocket.Server({ server });

    wss.on('connection', ws => {
      console.log('Client connected');

      ws.id = uuid();
      sendUsersOnline(wss);
      const { color, colors } = availableColor(colorsDB);
      assignColor(ws)(color);
      colorsDB = colors;

      ws.on('close', () => {
        console.log('Client disconnected');

        sendUsersOnline(wss);
        colorsDB = R.append({color: color, used: false})(colorsDB);

        // Notify room that user has left
        // const user = R.find(R.propEq('id', ws.id), users);
        // const roomIdx = R.findIndex(r => R.contains(user.name, R.map(u => u.name, r.users)))(rooms);
        // const room = R.nth(roomIdx, rooms);
        // const roomUsers = R.reject(u => u.id === ws.id)(room.users);
        
        users = R.reject(u => u.id === ws.id)(users);
      });

      ws.on('message', msg => {
        console.log('received: %s', msg);

        const data = JSON.parse(msg);
        switch (data.type) {
        case 'user':
          if (commandMessage(data.message)) {
            parseCommand(data)(ws);
          } else {
            broadcastAll(data)(wss);
          }
          break;
        case 'system':
          broadcastAll(data)(wss);
          break;
        case 'action':
          handleAction(data.message)(ws)(db);
        default:
          break;
        }
      })
    });

  } catch (err) {
    console.log(err.stack);
  }
})();

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
  '?',
  'h',
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

const defaultRoom = {
  id: 0,
  name: 'Main',
  users: []
};
let rooms = [defaultRoom];
let users = [];

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

const parseCommand = data => client => {
  // Show own message to user or hide it?
  // broadcast(data)(client);
  const message = data.message;
  const messageParts = splitAtFirst(' ')(message);
  const [cmd, body] = [messageParts[0].slice(1), messageParts[1]];
  handleCommand(cmd, body)(client);
};

const handleAction = message => client => db => {
  let data;
  switch (message.action) {
  case 'switchRoom':
    const user = R.find(R.propEq('id', client.id), users);
    
    rooms = updateRooms(user)(message.changeRooms)(rooms);
    
    data = {
      type: 'action',
      message: {
        action: 'updateRooms',
        currentRoom: R.find(R.propEq('name', message.changeRooms.joining))(rooms),
        rooms: rooms
      }
    };
    break;
  case 'addRoom':
    rooms = addRoom({
      id: rooms.length,
      name: 'Room' + rooms.length,
      users: []
    })(rooms);
    
    data = {
      type: 'action',
      message: {
        action: 'updateRooms',
        rooms: rooms
      }
    };
    break;
  case 'joinServer':
    const newUser = {
      id: ws.id,
      name: message.user.name,
      currentRoom: R.head(rooms).name
    };

    const rooms = await db.collection('rooms').find({}).limit(1).toArray();
    console.log(rooms);
    
    await db.collection('users').insertOne({
      name: message.user.name,
      currentRoom: R.head(rooms).name
    });
    
    users = R.append(newUser, users);
    
    const changeRooms = {
      joining: R.head(rooms).name
    };
    
    rooms = updateRooms(newUser)(changeRooms)(rooms);
    
    data = {
      type: 'action',
      message: {
        action: 'updateRooms',
        currentRoom: R.head(rooms),
        rooms: rooms
      }
    };
    break;
  default:
    break;
  }
  broadcastAll(data)(wss);
};

// User -> {leaving, joining} -> [Room] -> [Room]
const updateRooms = user => changeRooms => rooms => {
  if (changeRooms.leaving) {
    const roomIdx = R.findIndex(R.propEq('name', changeRooms.leaving), rooms);
    rooms = R.adjust(room => ({
      id: room.id,
      name: room.name,
      users: R.reject(u => u.name === user.name)(room.users)
    }), roomIdx, rooms);
  }
  
  if (changeRooms.joining) {
    const roomIdx = R.findIndex(R.propEq('name', changeRooms.joining), rooms);
    rooms = R.adjust(room => ({
      id: room.id,
      name: room.name,
      users: R.append(user, room.users)
    }), roomIdx, rooms);
  }

  return rooms;
};

// Room -> [Room] -> [Room]
const addRoom = newRoom => rooms => {
  return rooms.concat(newRoom);
};

const broadcast = data => client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

const broadcastAll = data => wss => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const sendUsersOnline = wss => {
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
