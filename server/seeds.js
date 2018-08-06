'use strict';

const {MongoClient} = require('mongodb');
const {mongoURL, dbName} = require('./dbconfig');

const roomSeed = [
  {name: 'Main', users: [], messages: []}
];

(async function() {
  let client;

  try {
    client = await MongoClient.connect(mongoURL, { useNewUrlParser: true });
    console.log(`Connected to mongodb: ${mongoURL}`);

    const db = client.db(dbName);

    console.log('Seeding rooms');
    await db.collection('rooms').deleteMany({});
    await db.collection('rooms').insertMany(roomSeed);
    
  } catch (err) {
    console.log(err.stack);
  }
  
  client.close();
  
})();
