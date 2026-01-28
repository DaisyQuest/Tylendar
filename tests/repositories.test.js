const { createMemoryRepository } = require("../server/repositories/memoryRepository");
const { createMongoRepository } = require("../server/repositories/mongoRepository");
const { createRepositories } = require("../server/repositories");
const { createUser } = require("../server/models/user");

function buildFakeCollection() {
  const items = [];
  return {
    items,
    async insertOne(doc) {
      items.push(doc);
    },
    async findOne(filter) {
      return items.find((item) => item.id === filter.id) || null;
    },
    find(filter) {
      return {
        toArray: async () => items.filter((item) => {
          if (!filter || Object.keys(filter).length === 0) {
            return true;
          }
          return Object.keys(filter).every((key) => item[key] === filter[key]);
        })
      };
    },
    async replaceOne(filter, doc) {
      const index = items.findIndex((item) => item.id === filter.id);
      if (index >= 0) {
        items[index] = doc;
      }
    },
    async deleteOne(filter) {
      const index = items.findIndex((item) => item.id === filter.id);
      if (index >= 0) {
        items.splice(index, 1);
      }
    }
  };
}

describe("memory repository", () => {
  test("supports create, list, update, remove", async () => {
    const repo = createMemoryRepository({ createModel: createUser });
    await repo.create({ id: "u1", name: "A", email: "a@a.com", organizationId: "org" });
    await repo.create({ id: "u2", name: "B", email: "b@b.com", organizationId: "org" });

    const list = await repo.list({ organizationId: "org" });
    expect(list).toHaveLength(2);

    const updated = await repo.update("u1", { name: "Updated" });
    expect(updated.name).toBe("Updated");

    const missingUpdateMongo = await repo.update("missing", { name: "Nope" });
    expect(missingUpdateMongo).toBeNull();

    const removed = await repo.remove("u2");
    expect(removed.id).toBe("u2");

    const missing = await repo.getById("missing");
    expect(missing).toBeNull();
  });
});

describe("mongo repository", () => {
  test("performs CRUD operations", async () => {
    const collection = buildFakeCollection();
    const repo = createMongoRepository({
      collectionName: "users",
      createModel: createUser,
      getCollection: async () => collection
    });

    await repo.create({ id: "u1", name: "A", email: "a@a.com", organizationId: "org" });
    const found = await repo.getById("u1");
    expect(found.name).toBe("A");

    const list = await repo.list({ organizationId: "org" });
    expect(list).toHaveLength(1);

    const listAll = await repo.list();
    expect(listAll).toHaveLength(1);

    const updated = await repo.update("u1", { name: "Updated" });
    expect(updated.name).toBe("Updated");

    const missingUpdateMongo = await repo.update("missing", { name: "Nope" });
    expect(missingUpdateMongo).toBeNull();

    const removed = await repo.remove("u1");
    expect(removed.id).toBe("u1");
    const none = await repo.remove("u1");
    expect(none).toBeNull();
  });
});

describe("createRepositories", () => {
  test("uses defaults when no options are provided", () => {
    const repos = createRepositories();
    expect(repos.mode).toBe("memory");
  });

  test("defaults to in-memory when no mongo uri", () => {
    const repos = createRepositories({ useInMemory: true });
    expect(repos.mode).toBe("memory");
  });

  test("uses mongo mode when configured", () => {
    const repos = createRepositories({ useInMemory: false, envOverrides: { mongoUri: "mongodb://localhost:27017/test" } });
    expect(repos.mode).toBe("mongo");
    expect(repos.client).toBeDefined();
  });
});
