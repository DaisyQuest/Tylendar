const request = require("supertest");
const { createApp } = require("../server/app");
const { createRepositories } = require("../server/repositories");
const { seedDatabase } = require("../server/migrations/seed");

describe("API modules", () => {
  test("org, calendar, permissions, audit flow", async () => {
    const repositories = createRepositories({ useInMemory: true });
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({ userId: "user-1" });
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

    const calendarGet = await request(app)
      .get("/api/calendars/cal-2")
      .set("Authorization", `Bearer ${token}`);
    expect(calendarGet.body.name).toBe("Launch");

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
    expect(permissionList.body.entries).toHaveLength(1);

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
    await seedDatabase(repositories);
    const app = createApp({ repositories });

    const login = await request(app).post("/api/auth/login").send({ userId: "user-1" });
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
    expect(sharingPreviewDefault.body.calendarId).toBe("cal-1");

    const shareLink = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1" });
    expect(shareLink.status).toBe(201);

    const shareLinkDefault = await request(app)
      .post("/api/sharing/link")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(shareLinkDefault.body.link).toContain("/share/cal-1");

    const exportResponse = await request(app)
      .post("/api/sharing/export")
      .set("Authorization", `Bearer ${token}`)
      .send({ calendarId: "cal-1", format: "ICS" });
    expect(exportResponse.status).toBe(201);

    const exportDefault = await request(app)
      .post("/api/sharing/export")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(exportDefault.body.format).toBe("ICS");

    const embedResponse = await request(app).get("/api/calendars/cal-1/embed");
    expect(embedResponse.body.calendar.id).toBe("cal-1");

    const privateCalendar = await request(app)
      .post("/api/calendars")
      .set("Authorization", `Bearer ${token}`)
      .send({ id: "cal-private", name: "Private", ownerId: "org-1", ownerType: "organization", isPublic: false });
    expect(privateCalendar.status).toBe(201);

    const embedPrivate = await request(app).get("/api/calendars/cal-private/embed");
    expect(embedPrivate.status).toBe(403);

    const embedMissing = await request(app).get("/api/calendars/missing/embed");
    expect(embedMissing.status).toBe(404);

    const developer = await request(app).get("/api/developer/portal");
    expect(developer.body.resources.length).toBeGreaterThan(0);
  });
});
