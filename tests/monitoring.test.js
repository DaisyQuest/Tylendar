const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { seedDatabase, DEFAULT_USER_PASSWORD } = require("../server/migrations/seed");

describe("monitoring endpoints", () => {
  test("health and metrics endpoints", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const health = await request(app).get("/api/monitoring/health");
    expect(health.body.status).toBe("ok");

    const metrics = await request(app).get("/api/monitoring/metrics");
    expect(metrics.body.users).toBeGreaterThan(0);
  });

  test("observability and alerts endpoints", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const overview = await request(app).get("/api/monitoring/observability");
    const alerts = await request(app).get("/api/monitoring/alerts");

    expect(overview.body.uptime).toContain("%");
    expect(alerts.body.alerts.length).toBeGreaterThan(0);
  });

  test("fault tolerance endpoint reports status", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const response = await request(app).get("/api/monitoring/fault-tolerance?simulate=fail");

    expect(response.body.status).toBe("ok");
    expect(response.body.attempts).toBeGreaterThan(0);
  });

  test("fault tolerance endpoint returns degraded on persistent failure", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const response = await request(app).get("/api/monitoring/fault-tolerance?simulate=always");

    expect(response.status).toBe(503);
    expect(response.body.status).toBe("degraded");
    expect(response.body.fallback).toHaveProperty("message");
  });

  test("admin dashboard requires auth", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const unauthorized = await request(app).get("/api/monitoring/admin/dashboard");
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_USER_PASSWORD
    });
    const dashboard = await request(app)
      .get("/api/monitoring/admin/dashboard")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(dashboard.body.totals.users).toBeGreaterThan(0);
  });
});
