const {MongoClient} = require('mongodb');
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'chatty';

const roomSeed = [
  {name: 'Main', users: [], messages: []}
];

(async function() {
  let client;

  try {
    client = await MongoClient.connect(mongoURL);
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
