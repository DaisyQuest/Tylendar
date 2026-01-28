const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { seedDatabase } = require("../server/migrations/seed");

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

  test("admin dashboard requires auth", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const unauthorized = await request(app).get("/api/monitoring/admin/dashboard");
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({ userId: "user-1" });
    const dashboard = await request(app)
      .get("/api/monitoring/admin/dashboard")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(dashboard.body.totals.users).toBeGreaterThan(0);
  });
});
