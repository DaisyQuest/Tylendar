const { buildSeedData, seedDatabase, DEFAULT_USER_PASSWORD } = require("../server/migrations/seed");
const { verifyPassword } = require("../server/auth/passwords");
const { createRepositories } = require("../server/repositories");

describe("seed utilities", () => {
  test("buildSeedData returns structured data", () => {
    const seed = buildSeedData();
    expect(seed.organization.id).toBe("org-1");
    expect(seed.users).toHaveLength(2);
    expect(seed.defaultPassword).toBe(DEFAULT_USER_PASSWORD);
    expect(verifyPassword(seed.defaultPassword, seed.users[0].passwordHash)).toBe(true);
    expect(seed.events).toHaveLength(1);
    expect(seed.roles).toHaveLength(2);
  });

  test("seedDatabase populates repositories", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);

    const users = await repositories.users.list();
    const calendars = await repositories.calendars.list();
    const roles = await repositories.roles.list();

    expect(users).toHaveLength(2);
    expect(calendars).toHaveLength(1);
    expect(roles).toHaveLength(2);
  });

  test("seedDatabase skips optional role repositories", async () => {
    const repoStub = {
      organizations: { create: jest.fn() },
      users: { seed: jest.fn() },
      calendars: { seed: jest.fn() },
      calendarPermissions: { seed: jest.fn() },
      events: { seed: jest.fn() }
    };

    await seedDatabase(repoStub);

    expect(repoStub.organizations.create).toHaveBeenCalled();
    expect(repoStub.events.seed).toHaveBeenCalled();
  });
});
