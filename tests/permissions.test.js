const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const {
  DEFAULT_PASSWORD,
  createCalendar,
  createCalendarPermission,
  createOrganization,
  createUser
} = require("./helpers/fixtures");

describe("permission enforcement", () => {
  test("denies and allows based on calendar permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    await createUser(repositories, {
      id: "user-2",
      name: "Riley Patel",
      email: "riley@example.com",
      organizationId: "org-1",
      role: "member"
    });
    await createCalendar(repositories, { id: "cal-1", ownerId: "org-1", ownerType: "organization" });
    await createCalendarPermission(repositories, {
      id: "perm-1",
      calendarId: "cal-1",
      userId: "user-1",
      grantedBy: "user-1",
      permissions: ["Add to Calendar"]
    });
    const app = createApp({ repositories });

    const loginAdmin = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });
    const loginMember = await request(app).post("/api/auth/login").send({
      email: "riley@example.com",
      password: DEFAULT_PASSWORD
    });

    const denied = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${loginMember.body.token}`)
      .send({
        id: "evt-2",
        title: "Denied",
        calendarId: "cal-1",
        calendarIds: ["cal-1"],
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
        calendarId: "cal-1",
        calendarIds: ["cal-1"],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-1"
      });

    expect(allowed.status).toBe(201);
  });

  test("denies when calendar is missing", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
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

  test("allows viewing events with view permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    await createCalendar(repositories, { id: "cal-1", ownerId: "org-1", ownerType: "organization" });
    await createCalendarPermission(repositories, {
      id: "perm-1",
      calendarId: "cal-1",
      userId: "user-1",
      grantedBy: "user-1",
      permissions: ["View Calendar"]
    });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });

    const response = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${login.body.token}`)
      .query({ calendarId: "cal-1" });

    expect(response.status).toBe(200);
  });

  test("denies viewing events without view permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    await createCalendar(repositories, { id: "cal-1", ownerId: "org-1", ownerType: "organization" });
    await createCalendarPermission(repositories, {
      id: "perm-1",
      calendarId: "cal-1",
      userId: "user-1",
      grantedBy: "user-1",
      permissions: ["Comment on Calendar"]
    });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });

    const response = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${login.body.token}`)
      .query({ calendarId: "cal-1" });

    expect(response.status).toBe(403);
  });
});
