const request = require("supertest");
const { createApp } = require("../server/app");

describe("server app", () => {
  test("serves home page", async () => {
    const app = createApp();
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Calendar Workspace");
  });

  test("serves experience overview page", async () => {
    const app = createApp();
    const response = await request(app).get("/details");

    expect(response.status).toBe(200);
    expect(response.text).toContain("System overview");
  });

  test("serves focused experience pages", async () => {
    const app = createApp();
    const pages = [
      ["/profiles", "Account profile"],
      ["/dashboards", "Dashboards"],
      ["/calendar", "Calendar workspace"],
      ["/access", "Access management"],
      ["/messageboard", "Event message board"],
      ["/embed", "Embed widget"],
      ["/sharing", "Sharing & export"],
      ["/audit", "Audit history"],
      ["/roles", "Role management"],
      ["/resilience", "Fault tolerance"],
      ["/developer", "Developer portal"],
      ["/observability", "Server status"]
    ];

    for (const [route, text] of pages) {
      // eslint-disable-next-line no-await-in-loop
      const response = await request(app).get(route);
      expect(response.status).toBe(200);
      expect(response.text).toContain(text);
    }
  });

  test("serves feature flags with overrides", async () => {
    const app = createApp({ featureOverrides: { manageAccess: false } });
    const response = await request(app).get("/api/flags");

    expect(response.body.manageAccess).toBe(false);
    expect(response.body.homePage).toBe(true);
  });
});
