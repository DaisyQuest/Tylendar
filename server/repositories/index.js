const { createAuditEntry } = require("../models/auditEntry");
const { createCalendar } = require("../models/calendar");
const { createCalendarPermissions } = require("../models/calendarPermissions");
const { createEvent } = require("../models/event");
const { createOrganization } = require("../models/organization");
const { createUser } = require("../models/user");
const { getEnv } = require("../config/env");
const { createMemoryRepository } = require("./memoryRepository");
const { createMongoClient } = require("./mongoClient");
const { createMongoRepository } = require("./mongoRepository");

function createInMemoryRepositories() {
  return {
    audit: createMemoryRepository({ createModel: createAuditEntry }),
    calendars: createMemoryRepository({ createModel: createCalendar }),
    calendarPermissions: createMemoryRepository({ createModel: createCalendarPermissions }),
    events: createMemoryRepository({ createModel: createEvent }),
    organizations: createMemoryRepository({ createModel: createOrganization }),
    users: createMemoryRepository({ createModel: createUser })
  };
}

function createMongoRepositories({ mongoUri }) {
  const client = createMongoClient(mongoUri);
  const getCollection = (name) => async () => {
    const connection = await client.connect();
    const db = connection.db();
    return db.collection(name);
  };

  return {
    client,
    audit: createMongoRepository({
      collectionName: "audit",
      createModel: createAuditEntry,
      getCollection: getCollection("audit")
    }),
    calendars: createMongoRepository({
      collectionName: "calendars",
      createModel: createCalendar,
      getCollection: getCollection("calendars")
    }),
    calendarPermissions: createMongoRepository({
      collectionName: "calendarPermissions",
      createModel: createCalendarPermissions,
      getCollection: getCollection("calendarPermissions")
    }),
    events: createMongoRepository({
      collectionName: "events",
      createModel: createEvent,
      getCollection: getCollection("events")
    }),
    organizations: createMongoRepository({
      collectionName: "organizations",
      createModel: createOrganization,
      getCollection: getCollection("organizations")
    }),
    users: createMongoRepository({
      collectionName: "users",
      createModel: createUser,
      getCollection: getCollection("users")
    })
  };
}

function createRepositories(options = {}) {
  const env = getEnv(options.envOverrides);
  const useInMemory = (options.useInMemory ?? env.useInMemoryDb) || !env.mongoUri;

  if (useInMemory) {
    return { ...createInMemoryRepositories(), client: null, mode: "memory" };
  }

  return { ...createMongoRepositories({ mongoUri: env.mongoUri }), mode: "mongo" };
}

module.exports = {
  createInMemoryRepositories,
  createMongoRepositories,
  createRepositories
};
