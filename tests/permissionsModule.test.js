const { PERMISSIONS } = require("../server/permissions/permissions");

describe("permissions module", () => {
  test("exports permission list", () => {
    expect(PERMISSIONS).toContain("Manage Calendar");
  });
});
