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

      ws.on('close', async () => {
        console.log('Client disconnected');

        sendUsersOnline(wss);
        colorsDB = R.append({color: color, used: false})(colorsDB);
        await leaveAllRooms(ws, db);
        await broadcastRoomsOverview(wss, db);
      });

      ws.on('message', async msg => {
        console.log('received: %s', msg);

        const data = JSON.parse(msg);
        switch (data.type) {
        case 'user':
          if (commandMessage(data.message)) {
            parseCommand(data)(ws);
          } else {
            const newMessage = {
              type: 'user',
              user: data.user,
              content: data.message
            };
            await addRoomMessage(data.roomName, newMessage, db);
            await broadcastRoomInfo(data.roomName, wss, db);
          }
          break;
        case 'system':
          const newMessage = {
            type: 'system',
            content: data.message
          };
          await addRoomMessage(data.roomName, newMessage, db);
          await broadcastRoomInfo(data.roomName, wss, db);
          break;
        case 'action':
          handleAction(data.message, ws, wss, db);
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

const leaveAllRooms = async (client, db) => {
  const rooms = await db.collection('rooms').find({}).toArray();

  for (const room of rooms) {
    const found = R.find(R.propEq('id', client.id), room.users);
    if (found) {
      const users = R.reject(R.propEq('id', client.id), room.users);
      await db.collection('rooms').updateMany(
        {},
        {$pull: {users: {id: client.id}}}
      );
    }
  };
};

const handleAction = async (message, client, wss, db) => {
  switch (message.action) {
  case 'joinRoom':
    await leaveAllRooms(client, db);
    await joinRoom(message.roomName, message.user.name, client, db);
    await broadcastRoomInfo(message.roomName, wss, db);
    await broadcastRoomsOverview(wss, db);
    break;
  case 'addRoom': {
    const rooms = await db.collection('rooms').find({}).toArray();
    
    await db.collection('rooms').insertOne({
      name: 'Room' + rooms.length,
      users: [],
      messages: []
    });

    await broadcastRoomsOverview(wss, db);
    
    break; }
  case 'joinServer': {
    const rooms = await db.collection('rooms').find({}).toArray();
    const room = R.head(rooms);

    await joinRoom(room.name, message.user.name, client, db);
    await broadcastRoomInfo(room.name, wss, db);
    await broadcastRoomsOverview(wss, db);
    
    break; }
  default:
    break;
  }
};

const addRoomMessage = async (roomName, message, db) => {
  const room = await db.collection('rooms').findOne({name: roomName});
  const newMessage = {...message, id: room.messages.length};
  
  await db.collection('rooms').updateOne(
    {name: roomName},
    {$push: {messages: newMessage}}
  );
};

const joinRoom = async (roomName, userName, client, db) => {
  const rooms = await db.collection('rooms').find({}).toArray();
  const room = R.find(R.propEq('name', roomName))(rooms);

  if (!room) {
    console.log(`Room ${roomName} does not exist`);
    return;
  }
  
  const user = {
    id: client.id,
    name: userName
  };

  
  await db.collection('rooms').updateOne(
    {_id: room._id},
    {$push: {users: user}}
  )
};

const broadcastRoomInfo = async (roomName, wss, db) => {
  const rooms = await db.collection('rooms').find({}).toArray();
  const room = R.find(R.propEq('name', roomName))(rooms);

  if (!room) {
    console.log(`Room ${roomName} does not exist`);
    return;
  }
  
  const roomInfo = {
    type: 'action',
    message: {
      action: 'roomInfo',
      room: room
    }
  };

  const ids = R.map(u => u.id)(room.users);

  broadcastTo(roomInfo)(ids)(wss); 
};

const broadcastRoomsOverview = async (wss, db) => {
  const rooms = await db.collection('rooms').find({}).toArray();

  const overview = R.map(r => ({
    id: r._id,
    name: r.name,
    usersOnline: r.users.length
  }))(rooms);
  
  const roomsOverview = {
    type: 'action',
    message: {
      action: 'roomsOverview',
      rooms: overview
    }
  };

  broadcastAll(roomsOverview)(wss);
};

const broadcast = data => client => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

const broadcastTo = data => ids => wss => {
  wss.clients.forEach(client => {
    if (ids.includes(client.id) && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
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
