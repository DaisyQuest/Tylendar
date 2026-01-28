jest.mock('mongodb', () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(),
    })),
  };
});

const { MongoClient } = require('mongodb');
const { connectMongo } = require('../server/repositories/mongoClient');

describe('mongo client', () => {
  test('connects using config', async () => {
    const env = { MONGODB_URI: 'mongodb://localhost:27017/test' };
    const client = await connectMongo(env);
    expect(MongoClient).toHaveBeenCalledWith(env.MONGODB_URI, { maxPoolSize: 5 });
    expect(client).toBeDefined();
  });

  test('connects using process.env when no env provided', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/default';
    const client = await connectMongo();
    expect(MongoClient).toHaveBeenCalledWith(process.env.MONGODB_URI, { maxPoolSize: 5 });
    expect(client).toBeDefined();
  });
});
