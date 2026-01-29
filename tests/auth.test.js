const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { sanitizeUser } = require("../server/api/auth");
const { DEFAULT_PASSWORD, createOrganization, createUser } = require("./helpers/fixtures");

describe("auth API", () => {
  test("sanitizeUser returns null for missing users", () => {
    expect(sanitizeUser(null)).toBeNull();
  });

  test("registration and login flow", async () => {
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

    const missing = await request(app).post("/api/auth/register").send({});
    expect(missing.status).toBe(400);

    const shortPassword = await request(app).post("/api/auth/register").send({
      name: "Short",
      email: "short@example.com",
      password: "short",
      organizationId: "org-1"
    });
    expect(shortPassword.status).toBe(400);

    const unknownOrg = await request(app).post("/api/auth/register").send({
      name: "Unknown Org",
      email: "unknown@example.com",
      password: "Password123!",
      organizationId: "org-missing"
    });
    expect(unknownOrg.status).toBe(404);

    const registerNoOrg = await request(app).post("/api/auth/register").send({
      name: "Solo User",
      email: "solo@example.com",
      password: "Password123!"
    });
    expect(registerNoOrg.status).toBe(201);
    expect(registerNoOrg.body.user.organizationId).toBeUndefined();

    const soloCalendars = await repositories.calendars.list({ ownerId: registerNoOrg.body.user.id });
    expect(soloCalendars).toHaveLength(1);
    expect(soloCalendars[0].isPublic).toBe(false);
    const soloPermissions = await repositories.calendarPermissions.list({ calendarId: soloCalendars[0].id });
    expect(soloPermissions[0].userId).toBe(registerNoOrg.body.user.id);
    expect(soloPermissions[0].permissions.length).toBeGreaterThan(0);

    const register = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "newuser@example.com",
      password: "Password123!",
      organizationId: "org-1",
      role: "member"
    });
    expect(register.status).toBe(201);
    expect(register.body.token).toBeDefined();
    expect(register.body.user.email).toBe("newuser@example.com");
    expect(register.body.user.passwordHash).toBeUndefined();

    const duplicate = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "newuser@example.com",
      password: "Password123!",
      organizationId: "org-1"
    });
    expect(duplicate.status).toBe(409);

    const loginMissing = await request(app).post("/api/auth/login").send({});
    expect(loginMissing.status).toBe(400);

    const notFound = await request(app).post("/api/auth/login").send({
      email: "missing@example.com",
      password: "Password123!"
    });
    expect(notFound.status).toBe(404);

    const invalidPassword = await request(app).post("/api/auth/login").send({
      email: "newuser@example.com",
      password: "BadPassword!"
    });
    expect(invalidPassword.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });
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

  test("profile updates validate and persist", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createOrganization(repositories, { id: "org-2" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    await createUser(repositories, {
      id: "user-2",
      name: "Other User",
      email: "other@example.com"
    });
    const app = createApp({ repositories });

    const unauthorized = await request(app).post("/api/auth/profile").send({ name: "No Auth" });
    expect(unauthorized.status).toBe(401);

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });

    const missingPayload = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({});
    expect(missingPayload.status).toBe(400);

    const duplicateEmail = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ email: "other@example.com" });
    expect(duplicateEmail.status).toBe(409);

    const unknownOrg = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ organizationId: "org-missing" });
    expect(unknownOrg.status).toBe(404);

    const update = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        name: "Avery Updated",
        email: "avery.updated@example.com",
        organizationId: "org-2",
        role: "owner"
      });
    expect(update.status).toBe(200);
    expect(update.body.user.name).toBe("Avery Updated");
    expect(update.body.user.email).toBe("avery.updated@example.com");
    expect(update.body.user.organizationId).toBe("org-2");
    expect(update.body.user.role).toBe("owner");

    const updatedRecord = await repositories.users.getById("user-1");
    expect(updatedRecord.name).toBe("Avery Updated");

    const roleFallback = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ role: " " });
    expect(roleFallback.body.user.role).toBe("owner");
  });

  test("profile updates return not found when repository fails", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    repositories.users.update = jest.fn(() => null);
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });

    const response = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ name: "Avery Updated" });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("User not found");
  });
});
