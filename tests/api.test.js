const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const {
  DEFAULT_PASSWORD,
  createCalendar,
  createOrganization,
  createUser
} = require("./helpers/fixtures");

describe("API modules", () => {
  test("org, calendar, permissions, audit flow", async () => {
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
    const token = login.body.token;

    const badOrg = await request(app)
      .post("/api/org")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: "", name: "" });
    expect(badOrg.status).toBe(400);

    const missingOrg = await request(app)
      .get("/api/org/missing")
      .set("Authorization", `Bearer ${token}`);
    expect(missingOrg.status).toBe(404);

    const orgResponse = await request(app)
      .post("/api/org")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: "org-2", name: "New Org", description: "Test" });
    expect(orgResponse.status).toBe(201);

    const orgGet = await request(app)
      .get("/api/org/org-2")
      .set("Authorization", `Bearer ${token}`);
    expect(orgGet.body.name).toBe("New Org");

    const calendarResponse = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: "cal-2", name: "Launch", ownerId: "org-2", ownerType: "organization" });
    expect(calendarResponse.status).toBe(201);
    expect(calendarResponse.body.id).toBeDefined();

    const calendarGet = await request(app)
      .get("/api/calendars/cal-2")
      .set("Authorization", `Bearer ${token}`);
    expect(calendarGet.body.name).toBe("Launch");

    const calendarList = await request(app)
      .get("/api/calendars?ownerId=org-2&ownerType=organization")
      .set("Authorization", `Bearer ${token}`);
    expect(calendarList.body.calendars.length).toBeGreaterThan(0);

    const autoCalendar = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Auto Calendar" });
    expect(autoCalendar.body.id).toContain("cal-");

    const sharedCalendar = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Shared Calendar", sharedOwnerIds: ["user-1"] });
    expect(sharedCalendar.status).toBe(201);

    const sharedList = await request(app)
      .get("/api/calendars?sharedOwnerId=user-1")
      .set("Authorization", `Bearer ${token}`);
    expect(sharedList.body.calendars.length).toBeGreaterThan(0);

    const missingCalendar = await request(app)
      .get("/api/calendars/missing")
      .set("Authorization", `Bearer ${token}`);
    expect(missingCalendar.status).toBe(404);

    const permissionResponse = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "perm-3",
        calendarId: "cal-2",
        userId: "user-1",
        grantedBy: "user-1",
        permissions: ["Manage Calendar", "Add to Calendar"]
      });
    expect(permissionResponse.status).toBe(201);

    const permissionDefault = await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        calendarId: "cal-2",
        userId: "user-1",
        permissions: ["View Calendar"]
      });
    expect(permissionDefault.body.id).toContain("perm-");
    expect(permissionDefault.body.grantedBy).toBe("user-1");

    await request(app)
      .post("/api/permissions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "perm-missing",
        calendarId: "missing",
        userId: "user-1",
        grantedBy: "user-1",
        permissions: ["Manage Calendar"]
      });

    const permissionList = await request(app)
      .get("/api/permissions?calendarId=cal-2")
      .set("Authorization", `Bearer ${token}`);
    expect(permissionList.body.entries.length).toBeGreaterThan(0);

    const permissionListAll = await request(app)
      .get("/api/permissions")
      .set("Authorization", `Bearer ${token}`);
    expect(permissionListAll.body.entries.length).toBeGreaterThan(0);

    const permissionListByUser = await request(app)
      .get("/api/permissions?userId=user-1")
      .set("Authorization", `Bearer ${token}`);
    expect(permissionListByUser.body.entries.length).toBeGreaterThan(0);

    const eventResponse = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "evt-2",
        title: "Launch Party",
        calendarId: "cal-2",
        calendarIds: ["cal-2"],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-1"
      });
    expect(eventResponse.status).toBe(201);

    const eventGet = await request(app)
      .get("/api/events/evt-2")
      .set("Authorization", `Bearer ${token}`);
    expect(eventGet.body.title).toBe("Launch Party");

    const missingEvent = await request(app)
      .get("/api/events/missing")
      .set("Authorization", `Bearer ${token}`);
    expect(missingEvent.status).toBe(404);

    const eventList = await request(app)
      .get("/api/events?calendarId=cal-2")
      .set("Authorization", `Bearer ${token}`);
    expect(eventList.body.events).toHaveLength(1);

    const eventListAll = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);
    expect(eventListAll.body.events.length).toBeGreaterThan(0);

    const auditLogs = await request(app)
      .get("/api/audit/logs")
      .set("Authorization", `Bearer ${token}`);
    expect(auditLogs.body.entries.length).toBeGreaterThan(0);

    const calendarDelete = await request(app)
      .delete("/api/calendars/cal-2")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-2" });
    expect(calendarDelete.body.status).toBe("deleted");

    const calendarDeleteMissing = await request(app)
      .delete("/api/calendars/missing")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "missing" });
    expect(calendarDeleteMissing.status).toBe(404);

    const eventDelete = await request(app)
      .delete("/api/events/evt-2")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-2" });
    expect(eventDelete.body.status).toBe("deleted");

    const eventDeleteMissing = await request(app)
      .delete("/api/events/missing")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-2" });
    expect(eventDeleteMissing.status).toBe(404);
  });

  test("roles, sharing, developer, and embed flows", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createOrganization(repositories, { id: "org-1" });
    await createUser(repositories, {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: "org-1",
      role: "admin"
    });
    await createCalendar(repositories, { id: "cal-1", ownerId: "org-1", ownerType: "organization", isPublic: true });
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: DEFAULT_PASSWORD
    });
    const token = login.body.token;

    const roleResponse = await request(app)
      .post("/api/roles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "role-99",
        orgId: "org-1",
        name: "Viewer",
        permissions: ["View Calendar"]
      });
    expect(roleResponse.status).toBe(201);

    const rolesList = await request(app)
      .get("/api/roles?orgId=org-1")
      .set("Authorization", `Bearer ${token}`);
    expect(rolesList.body.roles.length).toBeGreaterThan(0);

    const rolesListAll = await request(app)
      .get("/api/roles")
      .set("Authorization", `Bearer ${token}`);
    expect(rolesListAll.body.roles.length).toBeGreaterThan(0);

    const assignmentResponse = await request(app)
      .post("/api/roles/assignments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "assign-99",
        orgId: "org-1",
        roleId: "role-99",
        userId: "user-1",
        assignedBy: "user-1"
      });
    expect(assignmentResponse.status).toBe(201);

    const assignmentsList = await request(app)
      .get("/api/roles/assignments?orgId=org-1")
      .set("Authorization", `Bearer ${token}`);
    expect(assignmentsList.body.assignments.length).toBeGreaterThan(0);

    const assignmentsByRole = await request(app)
      .get("/api/roles/assignments?roleId=role-99")
      .set("Authorization", `Bearer ${token}`);
    expect(assignmentsByRole.body.assignments.length).toBeGreaterThan(0);

    const assignmentsByUser = await request(app)
      .get("/api/roles/assignments?userId=user-1")
      .set("Authorization", `Bearer ${token}`);
    expect(assignmentsByUser.body.assignments.length).toBeGreaterThan(0);

    const sharingPreview = await request(app).get("/api/sharing/preview?calendarId=cal-1");
    expect(sharingPreview.body.options.length).toBeGreaterThan(0);

    const sharingPreviewDefault = await request(app).get("/api/sharing/preview");
    expect(sharingPreviewDefault.body.calendarId).toBeUndefined();

    const shareLink = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1", permissions: ["View Calendar - Times Only"] });
    expect(shareLink.status).toBe(201);
    expect(shareLink.body.link).toContain("token=");

    const shareLinkDefaultPerms = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1" });
    expect(shareLinkDefaultPerms.body.permissions).toEqual(["View Calendar"]);

    const shareLinkDefault = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(shareLinkDefault.status).toBe(400);

    const exportResponse = await request(app)
      .post("/api/sharing/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1", format: "ICS" });
    expect(exportResponse.status).toBe(201);

    const exportDefaultFormat = await request(app)
      .post("/api/sharing/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1" });
    expect(exportDefaultFormat.body.format).toBe("ICS");

    const exportDefault = await request(app)
      .post("/api/sharing/export")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(exportDefault.status).toBe(400);

    await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "evt-embed",
        title: "Public Event",
        calendarId: "cal-1",
        calendarIds: ["cal-1"],
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        createdBy: "user-1"
      });

    const embedResponse = await request(app).get("/api/calendars/cal-1/embed");
    expect(embedResponse.body.calendar.id).toBe("cal-1");

    const privateCalendar = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: "cal-private", name: "Private", ownerId: "org-1", ownerType: "organization", isPublic: false });
    expect(privateCalendar.status).toBe(201);

    const embedPrivate = await request(app).get("/api/calendars/cal-private/embed");
    expect(embedPrivate.status).toBe(403);

    const embedPrivateBadToken = await request(app)
      .get("/api/calendars/cal-private/embed?token=bad-token");
    expect(embedPrivateBadToken.status).toBe(403);

    const sharePrivate = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-private", permissions: ["View Calendar"] });
    const shareUrl = new URL(sharePrivate.body.link);
    const shareToken = shareUrl.searchParams.get("token");

    const embedPrivateViaToken = await request(app)
      .get(`/api/calendars/cal-private/embed?token=${shareToken}`);
    expect(embedPrivateViaToken.status).toBe(200);

    const shareNoView = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-private", permissions: ["Add to Calendar"] });
    const noViewUrl = new URL(shareNoView.body.link);
    const noViewToken = noViewUrl.searchParams.get("token");

    const embedPrivateDenied = await request(app)
      .get(`/api/calendars/cal-private/embed?token=${noViewToken}`);
    expect(embedPrivateDenied.status).toBe(403);

    const embedPrivateAuthed = await request(app)
      .get("/api/calendars/cal-private/embed")
      .set("Authorization", `Bearer ${token}`);
    expect(embedPrivateAuthed.status).toBe(200);

    const embedMissing = await request(app).get("/api/calendars/missing/embed");
    expect(embedMissing.status).toBe(404);

    const developer = await request(app).get("/api/developer/portal");
    expect(developer.body.headline).toBe("Developer Portal");
  });

  test("calendar auto-provisioning and event visibility enforcement", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, {
      id: "user-9",
      name: "Auto Calendar User",
      email: "auto@example.com"
    });
    await repositories.calendars.create({
      id: "cal-locked",
      name: "Locked Calendar",
      ownerId: "org-locked",
      ownerType: "organization",
      isPublic: false
    });
    await repositories.events.create({
      id: "evt-locked",
      title: "Private Event",
      calendarIds: ["cal-locked"],
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      createdBy: "user-9"
    });

    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "auto@example.com",
      password: DEFAULT_PASSWORD
    });
    const token = login.body.token;

    const calendarList = await request(app)
      .get("/api/calendars")
      .set("Authorization", `Bearer ${token}`);
    expect(calendarList.body.calendars).toHaveLength(1);
    expect(calendarList.body.calendars[0].ownerId).toBe("user-9");

    const deniedCalendar = await request(app)
      .get("/api/calendars/cal-locked")
      .set("Authorization", `Bearer ${token}`);
    expect(deniedCalendar.status).toBe(403);

    const eventList = await request(app)
      .get("/api/events?calendarId=cal-locked")
      .set("Authorization", `Bearer ${token}`);
    expect(eventList.status).toBe(403);
  });

  test("calendar visibility honors times-only permissions", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await createUser(repositories, {
      id: "user-10",
      name: "Times Only User",
      email: "times@example.com"
    });
    await repositories.calendars.create({
      id: "cal-times",
      name: "Times Calendar",
      ownerId: "org-1",
      ownerType: "organization",
      isPublic: false
    });
    await repositories.calendarPermissions.create({
      id: "perm-times",
      calendarId: "cal-times",
      userId: "user-10",
      grantedBy: "user-10",
      permissions: ["View Calendar - Times Only"]
    });
    await repositories.calendars.create({
      id: "cal-add",
      name: "Add Calendar",
      ownerId: "org-1",
      ownerType: "organization",
      isPublic: false
    });
    await repositories.calendarPermissions.create({
      id: "perm-add",
      calendarId: "cal-add",
      userId: "user-10",
      grantedBy: "user-10",
      permissions: ["Add to Calendar"]
    });
    await repositories.events.create({
      id: "evt-times",
      title: "Times Event",
      calendarIds: ["cal-times"],
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      createdBy: "user-10"
    });
    await repositories.events.create({
      id: "evt-add",
      title: "Add Event",
      calendarIds: ["cal-add"],
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      createdBy: "user-10"
    });

    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({
      email: "times@example.com",
      password: DEFAULT_PASSWORD
    });
    const token = login.body.token;

    const calendarList = await request(app)
      .get("/api/calendars")
      .set("Authorization", `Bearer ${token}`);
    const calendarIds = calendarList.body.calendars.map((calendar) => calendar.id);
    expect(calendarIds).toEqual(expect.arrayContaining(["cal-times", "cal-add"]));

    const eventList = await request(app)
      .get("/api/events?calendarId=cal-times")
      .set("Authorization", `Bearer ${token}`);
    expect(eventList.body.events).toHaveLength(1);
    const addEventList = await request(app)
      .get("/api/events?calendarId=cal-add")
      .set("Authorization", `Bearer ${token}`);
    expect(addEventList.body.events).toHaveLength(1);
  });

  test("calendar overview and event creation work with session cookies", async () => {
    const repositories = createRepositories({ useInMemory: true });
    const app = createApp({ repositories });

    const register = await request(app).post("/api/auth/register").send({
      name: "Calendar Viewer",
      email: "viewer@example.com",
      password: DEFAULT_PASSWORD
    });
    expect(register.status).toBe(201);

    const sessionCookie = register.headers["set-cookie"].find((cookie) => cookie.startsWith("session="));
    expect(sessionCookie).toBeDefined();

    const calendarList = await request(app)
      .get("/api/calendars")
      .set("Cookie", sessionCookie);
    expect(calendarList.status).toBe(200);
    expect(calendarList.body.calendars).toHaveLength(1);

    const [defaultCalendar] = calendarList.body.calendars;
    const userId = register.body.user.id;
    expect(defaultCalendar.ownerId).toBe(userId);

    const calendarDetail = await request(app)
      .get(`/api/calendars/${defaultCalendar.id}`)
      .set("Cookie", sessionCookie);
    expect(calendarDetail.status).toBe(200);
    expect(calendarDetail.body.id).toBe(defaultCalendar.id);

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + 60 * 60 * 1000);
    const eventResponse = await request(app)
      .post("/api/events")
      .set("Cookie", sessionCookie)
      .send({
        id: "evt-viewer-1",
        title: "Calendar Kickoff",
        calendarId: defaultCalendar.id,
        calendarIds: [defaultCalendar.id],
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        createdBy: userId
      });
    expect(eventResponse.status).toBe(201);

    const eventList = await request(app)
      .get(`/api/events?calendarId=${defaultCalendar.id}`)
      .set("Cookie", sessionCookie);
    expect(eventList.status).toBe(200);
    expect(eventList.body.events).toHaveLength(1);
    expect(eventList.body.events[0].title).toBe("Calendar Kickoff");
  });
});
