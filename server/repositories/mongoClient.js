const { MongoClient } = require('mongodb');
const { loadConfig } = require('../config/env');

async function connectMongo(env = process.env) {
  const { mongoUri } = loadConfig(env);
  const client = new MongoClient(mongoUri, {
    maxPoolSize: 5,
  });

  await client.connect();
  return client;
}

module.exports = {
  connectMongo,
};
