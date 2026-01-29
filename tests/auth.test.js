const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { DEFAULT_PASSWORD, createOrganization, createUser } = require("./helpers/fixtures");

describe("auth API", () => {
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
    const registerCookie = register.headers["set-cookie"]?.[0];
    expect(registerCookie).toContain("session=");
    const registerSessionCookie = registerCookie.split(";")[0];
    const registerSession = await request(app)
      .get("/api/auth/session")
      .set("Cookie", registerSessionCookie);
    expect(registerSession.body.user.email).toBe("newuser@example.com");

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
    const loginCookie = login.headers["set-cookie"]?.[0];
    expect(loginCookie).toContain("session=");
    const loginSessionCookie = loginCookie.split(";")[0];
    const cookieSession = await request(app)
      .get("/api/auth/session")
      .set("Cookie", loginSessionCookie);
    expect(cookieSession.body.user.id).toBe("user-1");

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
