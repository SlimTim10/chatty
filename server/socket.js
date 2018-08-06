'use strict';

const R = require('ramda');
const WebSocket = require('ws');

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

module.exports = {
  broadcast,
  sendUsersOnline,
  assignColor,
  broadcastRoomInfo,
  broadcastRoomsOverview
};
