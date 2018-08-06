const express = require('express');
const WebSocket = require('ws');
const uuid = require('uuid/v4');
const R = require('ramda');
const {MongoClient} = require('mongodb');
const {mongoURL, dbName} = require('./dbconfig');

const util = require('./util');
const devServer = require('./dev-server');
const {execCommand} = require('./command');
const {
  broadcast,
  sendUsersOnline,
  assignColor,
  broadcastRoomInfo,
  broadcastRoomsOverview
} = require('./socket');

(async function() {
  let client;

  try {
    client = await MongoClient.connect(mongoURL, { useNewUrlParser: true });
    console.log(`Connected to mongodb: ${mongoURL}`);

    const db = client.db(dbName);

    const numRooms = await db.collection('rooms').countDocuments({});
    if (numRooms < 1) {
      throw 'ERROR: No rooms in database. Try seeding first.';
    }

    devServer.start();

    const server = express()
          .use(express.static('public'))
          .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Server listening on ${ PORT }`));

    const wss = new WebSocket.Server({ server });

    wss.on('connection', ws => {
      console.log('Client connected');

      ws.id = uuid();
      
      sendUsersOnline(wss);
      
      const { color, colors } = util.availableColor(colorsDB);
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
          if (util.commandMessage(data.message)) {
            execCommand(data)(ws);
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
    client.close();
    console.log(err);
  }
})();

const PORT = 3001;

let colorsDB = [
  {color: '#008080', used: false},
  {color: '#ffc0cb', used: false},
  {color: '#ff0000', used: false},
  {color: '#ffd700', used: false}
];

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
