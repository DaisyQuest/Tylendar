const request = require("supertest");
const { getFeatureFlags } = require("../server/config/featureFlags");
const { createApp } = require("../server/app");


describe("feature flags", () => {
  test("getFeatureFlags merges overrides", () => {
    const flags = getFeatureFlags({ overrides: { auth: false }, envFlags: { calendar: false } });
    expect(flags.auth).toBe(false);
    expect(flags.calendar).toBe(false);
    expect(flags.homePage).toBe(true);
  });

  test("getFeatureFlags returns defaults", () => {
    const flags = getFeatureFlags();
    expect(flags.auth).toBe(true);
    expect(flags.embedWidget).toBe(true);
  });

  test("requireFeature blocks disabled modules", async () => {
    const app = createApp({ featureOverrides: { auth: false } });
    const response = await request(app).post("/api/auth/login").send({
      email: "avery@example.com",
      password: "Password123!"
    });
    expect(response.status).toBe(404);
  });
});
