jest.mock("../server/repositories/mongoClient", () => {
  return {
    createMongoClient: () => ({
      connect: async () => ({
        db: () => ({
          collection: () => ({
            find: () => ({
              toArray: async () => []
            })
          })
        })
      })
    })
  };
});

const { createMongoRepositories } = require("../server/repositories");

describe("createMongoRepositories", () => {
  test("getCollection uses client connection", async () => {
    const repos = createMongoRepositories({ mongoUri: "mongodb://localhost:27017/test" });
    const result = await repos.users.list({});
    expect(result).toEqual([]);
  });
});
