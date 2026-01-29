const { createDeveloperPortalService } = require("../server/services/developerPortalService");

describe("developer portal service", () => {
  test("returns default portal payload", () => {
    const service = createDeveloperPortalService();
    const portal = service.getDeveloperPortal();

    expect(portal.headline).toBe("Developer Portal");
    expect(portal.resources).toHaveLength(0);
  });
});
