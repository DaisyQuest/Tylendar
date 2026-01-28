const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { seedDatabase, DEFAULT_USER_PASSWORD } = require("../server/migrations/seed");

describe("permission enforcement", () => {
  test("denies and allows based on calendar permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    const seed = await seedDatabase(repositories);
    const app = createApp({ repositories });

    const loginAdmin = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_USER_PASSWORD
    });
    const loginMember = await request(app).post("/api/auth/login").send({
      email: "riley@example.com",
      password: DEFAULT_USER_PASSWORD
    });

    const denied = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${loginMember.body.token}`)
      .send({
        id: "evt-2",
        title: "Denied",
        calendarId: seed.calendars[0].id,
        calendarIds: [seed.calendars[0].id],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-2"
      });

    expect(denied.status).toBe(403);

    const allowed = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${loginAdmin.body.token}`)
      .send({
        id: "evt-3",
        title: "Allowed",
        calendarId: seed.calendars[0].id,
        calendarIds: [seed.calendars[0].id],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-1"
      });

    expect(allowed.status).toBe(201);
  });

  test("denies when calendar is missing", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_USER_PASSWORD
    });
    const denied = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        id: "evt-4",
        title: "Missing calendar",
        calendarIds: ["cal-1"],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-1"
      });

    expect(denied.status).toBe(403);
  });
});
