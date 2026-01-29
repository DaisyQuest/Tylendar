const { createSharingService } = require("../server/services/sharingService");

describe("sharing service", () => {
  test("returns empty options without calendar id", () => {
    const service = createSharingService();
    const options = service.getSharingOptions();

    expect(options).toHaveLength(0);
  });

  test("returns default sharing options for calendar", () => {
    const service = createSharingService();
    const options = service.getSharingOptions("cal-1");

    expect(options).toHaveLength(2);
    expect(options[1]).toHaveProperty("formats");
  });
});
