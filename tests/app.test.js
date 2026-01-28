const request = require("supertest");
const { createApp } = require("../server/app");

describe("server app", () => {
  test("serves home page", async () => {
    const app = createApp();
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("social calendar space");
  });

  test("serves home details page", async () => {
    const app = createApp();
    const response = await request(app).get("/details");

    expect(response.status).toBe(200);
    expect(response.text).toContain("User Management & Profile");
  });

  test("serves feature flags with overrides", async () => {
    const app = createApp({ featureOverrides: { manageAccess: false } });
    const response = await request(app).get("/api/flags");

    expect(response.body.manageAccess).toBe(false);
    expect(response.body.homePage).toBe(true);
  });

  test("serves home highlights", async () => {
    const app = createApp();
    const response = await request(app).get("/api/home");

    expect(response.body.highlights).toHaveLength(3);
  });

  test("serves profile and dashboards", async () => {
    const app = createApp();

    const profile = await request(app).get("/api/profile/user-1");
    const userDash = await request(app).get("/api/dashboard/user");
    const orgDash = await request(app).get("/api/dashboard/org");

    expect(profile.body.name).toBe("Avery Chen");
    expect(userDash.body.highlights).toHaveLength(3);
    expect(orgDash.body.departments).toContain("Friends");
  });

  test("serves calendar and event list views", async () => {
    const app = createApp();

    const calendar = await request(app).get("/api/calendar/view?view=week");
    const list = await request(app).get("/api/events/list?range=week");

    expect(calendar.body.label).toBe("Week");
    expect(list.body.range).toBe("week");
  });

  test("serves access matrix and message board", async () => {
    const app = createApp();

    const access = await request(app).get("/api/access");
    const message = await request(app).get("/api/events/evt-200/comments");

    expect(access.body.entries).toHaveLength(3);
    expect(message.body.entries).toHaveLength(1);
  });

  test("serves embed widget and sharing preview", async () => {
    const app = createApp();

    const embed = await request(app).get("/api/embed/widget?calendarId=cal-1");
    const sharing = await request(app).get("/api/sharing/preview?calendarId=cal-1");

    expect(embed.body.calendarId).toBe("cal-1");
    expect(sharing.body.options.length).toBeGreaterThan(0);
  });

  test("serves audit history snapshots and role summaries", async () => {
    const app = createApp();

    const audit = await request(app).get("/api/audit/history-snapshot");
    const roles = await request(app).get("/api/roles/summary?orgId=org-1");

    expect(audit.body.entries.length).toBeGreaterThan(0);
    expect(roles.body.roles.length).toBeGreaterThan(0);
  });

  test("serves fault tolerance snapshot and developer portal", async () => {
    const app = createApp();

    const faultTolerance = await request(app).get("/api/fault-tolerance/snapshot");
    const developer = await request(app).get("/api/developer/portal");

    expect(faultTolerance.body.snapshots.length).toBeGreaterThan(0);
    expect(developer.body.resources.length).toBeGreaterThan(0);
  });
});
