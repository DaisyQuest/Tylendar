const { run } = require("../server/scripts/seed");

describe("seed script", () => {
  test("runs with in-memory repository", async () => {
    const repositories = await run({ useInMemory: true });
    const users = await repositories.users.list();
    expect(users.length).toBeGreaterThan(0);
  });

  test("runs with default options", async () => {
    const repositories = await run();
    const calendars = await repositories.calendars.list();
    expect(calendars.length).toBeGreaterThan(0);
  });

  test("closes client when provided", async () => {
    const close = jest.fn();
    const repositories = { client: { close } };
    await run({ repositories, seed: async () => {} });
    expect(close).toHaveBeenCalled();
  });
});
