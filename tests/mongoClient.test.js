jest.mock("mongodb", () => {
  return {
    MongoClient: class {
      constructor() {
        this.connected = false;
      }
      async connect() {
        this.connected = true;
        return this;
      }
      db() {
        return { collection: () => ({}) };
      }
      async close() {
        this.connected = false;
      }
    }
  };
});

const { createMongoClient } = require("../server/repositories/mongoClient");

describe("mongo client wrapper", () => {
  test("connect caches connection and closes", async () => {
    const client = createMongoClient("mongodb://localhost:27017/test");
    const first = await client.connect();
    const second = await client.connect();
    expect(first).toBe(second);
    await client.close();
  });

  test("close before connect is safe", async () => {
    const client = createMongoClient("mongodb://localhost:27017/test");
    await client.close();
  });
});
