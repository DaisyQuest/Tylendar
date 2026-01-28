const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { seedDatabase } = require("../server/migrations/seed");

describe("auth API", () => {
  test("login, session, logout flow", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const missing = await request(app).post("/api/auth/login").send({});
    expect(missing.status).toBe(400);

    const notFound = await request(app).post("/api/auth/login").send({ userId: "missing" });
    expect(notFound.status).toBe(404);

    const login = await request(app).post("/api/auth/login").send({ userId: "user-1" });
    expect(login.body.token).toBeDefined();
    expect(login.body.user.id).toBe("user-1");

    const session = await request(app)
      .get("/api/auth/session")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(session.body.user.id).toBe("user-1");

    const flags = await request(app).get("/api/auth/flags");
    expect(flags.body.authEnabled).toBe(true);

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(logout.body.status).toBe("ok");
  });
});
