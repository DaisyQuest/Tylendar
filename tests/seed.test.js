const { buildSeedData, seedDatabase } = require("../server/migrations/seed");
const { createRepositories } = require("../server/repositories");

describe("seed utilities", () => {
  test("buildSeedData returns structured data", () => {
    const seed = buildSeedData();
    expect(seed.organization.id).toBe("org-1");
    expect(seed.users).toHaveLength(2);
    expect(seed.events).toHaveLength(1);
  });

  test("seedDatabase populates repositories", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);

    const users = await repositories.users.list();
    const calendars = await repositories.calendars.list();

    expect(users).toHaveLength(2);
    expect(calendars).toHaveLength(1);
  });
});
