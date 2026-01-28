const { MongoClient } = require("mongodb");

function createMongoClient(uri) {
  const client = new MongoClient(uri);
  let connectionPromise = null;

  return {
    async connect() {
      if (!connectionPromise) {
        connectionPromise = client.connect();
      }
      await connectionPromise;
      return client;
    },
    async close() {
      if (connectionPromise) {
        await client.close();
      }
    }
  };
}

module.exports = {
  createMongoClient
};
