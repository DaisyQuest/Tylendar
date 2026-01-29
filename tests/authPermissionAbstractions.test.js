const express = require("express");
const request = require("supertest");
const { createApp } = require("../server/app");
const { createAuthRouter } = require("../server/api/auth");
const { createCalendarRouter } = require("../server/api/calendar");
const { createEventRouter } = require("../server/api/event");
const { createSharingRouter } = require("../server/api/sharing");
const { createSessionStore } = require("../server/auth/sessionStore");
const { attachSession } = require("../server/middleware/auth");
const { createPermissionGuard } = require("../server/middleware/permissions");
const { createRepositories } = require("../server/repositories");
const { createAuditService } = require("../server/services/auditService");
const { createSharingService } = require("../server/services/sharingService");
const {
  DEFAULT_PASSWORD,
  createCalendar,
  createCalendarPermission,
  createOrganization,
  createUser
} = require("./helpers/fixtures");

describe("auth and permission abstractions", () => {
  test("registration skips calendar provisioning when repositories are omitted", async () => {
    const repositories = createRepositories({ useInMemory: true });
    const app = express();
    app.use(express.json());
    app.use("/api/auth", createAuthRouter({
      flags: { auth: true },
      sessionStore: createSessionStore(),
      userRepository: repositories.users,
      organizationsRepository: repositories.organizations,
      calendarsRepository: null,
      calendarPermissionsRepository: null,
      auditService: createAuditService({ auditRepository: repositories.audit })
    }));

    const response = await request(app).post("/api/auth/register").send({
      name: "No Calendar",
      email: "no-calendar@example.com",
      password: "Password123!"
    });

    expect(response.status).toBe(201);
    expect(await repositories.calendars.list()).toHaveLength(0);
  });

  test("registration trims blank organization ids", async () => {
    const repositories = createRepositories({ useInMemory: true });
    const app = createApp({ repositories });

    const response = await request(app).post("/api/auth/register").send({
      name: "Blank Org",
      email: "blank-org@example.com",
      password: "Password123!",
      organizationId: "  "
    });

    expect(response.status).toBe(201);
    expect(response.body.user.organizationId).toBeUndefined();
  });

  test("profile updates allow unchanged email addresses", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, { email: "same@example.com" });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "same@example.com",
      password: DEFAULT_PASSWORD
    });

    const update = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ email: "same@example.com", name: "Same User" });

    expect(update.status).toBe(200);
    expect(update.body.user.email).toBe("same@example.com");
  });

  test("profile updates treat blank organization id as empty", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, { organizationId: "org-1" });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: DEFAULT_PASSWORD
    });

    const update = await request(app)
      .post("/api/auth/profile")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({ organizationId: "  " });

    expect(update.status).toBe(200);
    expect(update.body.user.organizationId).toBeUndefined();
  });

  test("session endpoint returns empty permissions when missing on request", async () => {
    const repositories = createRepositories({ useInMemory: true });
    const app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: "user-1" };
      req.session = { token: "token" };
      next();
    });
    app.use("/api/auth", createAuthRouter({
      flags: { auth: true },
      sessionStore: createSessionStore(),
      userRepository: repositories.users,
      organizationsRepository: repositories.organizations,
      calendarsRepository: null,
      calendarPermissionsRepository: null,
      auditService: createAuditService({ auditRepository: repositories.audit })
    }));

    const response = await request(app).get("/api/auth/session");

    expect(response.status).toBe(200);
    expect(response.body.permissions).toEqual([]);
  });

  test("login applies secure cookies in production", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, { email: "secure@example.com" });
    const app = createApp({ repositories });
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const response = await request(app).post("/api/auth/login").send({
      email: "secure@example.com",
      password: DEFAULT_PASSWORD
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"][0]).toContain("Secure");

    process.env.NODE_ENV = originalEnv;
  });

  test("calendar router uses fallback permission evaluator", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, { id: "user-1", email: "user@example.com" });
    await createCalendar(repositories, { id: "cal-1", ownerId: "user-1", ownerType: "user" });
    await createCalendarPermission(repositories, {
      calendarId: "cal-1",
      userId: "user-1",
      permissions: ["View Calendar"]
    });
    const sessionStore = createSessionStore();
    const session = sessionStore.createSession({ userId: "user-1" });
    const auditService = createAuditService({ auditRepository: repositories.audit });
    const permissionGuard = createPermissionGuard({
      calendarPermissionsRepository: repositories.calendarPermissions,
      auditService
    });

    const app = express();
    app.use(express.json());
    app.use(attachSession({ sessionStore, userRepository: repositories.users }));
    app.use("/api/calendars", createCalendarRouter({
      calendarsRepository: repositories.calendars,
      eventsRepository: repositories.events,
      calendarPermissionsRepository: repositories.calendarPermissions,
      shareTokensRepository: repositories.shareTokens,
      permissionGuard,
      auditService
    }));

    const response = await request(app)
      .get("/api/calendars")
      .set("Authorization", `Bearer ${session.token}`);

    expect(response.status).toBe(200);
    expect(response.body.calendars).toHaveLength(1);
  });

  test("event router uses fallback permission evaluator", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, { id: "user-1", email: "user@example.com" });
    await createCalendarPermission(repositories, {
      calendarId: "cal-1",
      userId: "user-1",
      permissions: ["View Calendar"]
    });
    const sessionStore = createSessionStore();
    const session = sessionStore.createSession({ userId: "user-1" });
    const auditService = createAuditService({ auditRepository: repositories.audit });
    const permissionGuard = createPermissionGuard({
      calendarPermissionsRepository: repositories.calendarPermissions,
      auditService
    });

    const app = express();
    app.use(express.json());
    app.use(attachSession({ sessionStore, userRepository: repositories.users }));
    app.use("/api/events", createEventRouter({
      eventsRepository: repositories.events,
      calendarPermissionsRepository: repositories.calendarPermissions,
      permissionGuard,
      auditService
    }));

    const response = await request(app)
      .get("/api/events")
      .query({ calendarId: "cal-1" })
      .set("Authorization", `Bearer ${session.token}`);

    expect(response.status).toBe(200);
    expect(response.body.events).toEqual([]);
  });

  test("sharing router defaults permissions without share token repository", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, { id: "user-1", email: "user@example.com" });
    const sessionStore = createSessionStore();
    const session = sessionStore.createSession({ userId: "user-1" });
    const auditService = createAuditService({ auditRepository: repositories.audit });

    const app = express();
    app.use(express.json());
    app.use(attachSession({ sessionStore, userRepository: repositories.users }));
    app.use("/api/sharing", createSharingRouter({
      sharingProvider: createSharingService(),
      shareTokensRepository: null,
      auditService
    }));

    const response = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${session.token}`)
      .send({ calendarId: "cal-1", permissions: [] });

    expect(response.status).toBe(201);
    expect(response.body.permissions).toEqual(["View Calendar"]);
  });

  test("calendar embeds reject share tokens without view permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createCalendar(repositories, { id: "cal-1", isPublic: false, ownerId: "user-1", ownerType: "user" });
    const shareTokensRepository = {
      list: async () => [{ calendarId: "cal-1", token: "token-1", permissions: undefined }]
    };
    const auditService = createAuditService({ auditRepository: repositories.audit });
    const permissionGuard = createPermissionGuard({
      calendarPermissionsRepository: repositories.calendarPermissions,
      auditService
    });

    const app = express();
    app.use(express.json());
    app.use(attachSession({ sessionStore: createSessionStore(), userRepository: repositories.users }));
    app.use("/api/calendars", createCalendarRouter({
      calendarsRepository: repositories.calendars,
      eventsRepository: repositories.events,
      calendarPermissionsRepository: repositories.calendarPermissions,
      shareTokensRepository,
      permissionGuard,
      auditService
    }));

    const response = await request(app).get("/api/calendars/cal-1/embed?token=token-1");

    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Share link does not allow viewing");
  });
});
