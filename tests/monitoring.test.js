const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const {
  DEFAULT_PASSWORD,
  createEvent,
  createOrganization,
  createUser
} = require("./helpers/fixtures");

describe("monitoring endpoints", () => {
  test("health and metrics endpoints", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, { id: "user-1", email: "user@example.com" });
    await createEvent(repositories, { id: "evt-1", calendarIds: ["cal-1"] });
    const app = createApp({ repositories });

    const health = await request(app).get("/api/monitoring/health");
    expect(health.body.status).toBe("ok");

    const metrics = await request(app).get("/api/monitoring/metrics");
    expect(metrics.body.users).toBeGreaterThan(0);
  });

  test("observability and alerts endpoints", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, { id: "user-1", email: "user@example.com" });
    const app = createApp({ repositories });

    const overview = await request(app).get("/api/monitoring/observability");
    const alerts = await request(app).get("/api/monitoring/alerts");

    expect(overview.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(overview.body.highlights)).toBe(true);
    expect(alerts.body.alerts).toHaveLength(0);
  });

  test("fault tolerance endpoint reports status", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    const app = createApp({ repositories });

    const response = await request(app).get("/api/monitoring/fault-tolerance?simulate=fail");

    expect(response.body.status).toBe("ok");
    expect(response.body.attempts).toBeGreaterThan(0);
  });

  test("fault tolerance endpoint returns degraded on persistent failure", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    const app = createApp({ repositories });

    const response = await request(app).get("/api/monitoring/fault-tolerance?simulate=always");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");
    expect(response.body.fallback).toHaveProperty("message");
  });

  test("admin dashboard requires auth", async () => {
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

    const unauthorized = await request(app).get("/api/monitoring/admin/dashboard");
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });
    const dashboard = await request(app)
      .get("/api/monitoring/admin/dashboard")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(dashboard.body.totals.users).toBeGreaterThan(0);
  });
});
