const request = require("supertest");
const { createApp } = require("../server/app");

describe("server app", () => {
  test("serves home page", async () => {
    const app = createApp();
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Tylendar");
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
});
