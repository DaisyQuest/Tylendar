const { PERMISSIONS, PERMISSION_SETS, createPermissionEvaluator } = require("../server/permissions/permissions");

describe("permissions module", () => {
  test("exports permission list", () => {
    expect(PERMISSIONS).toContain("Manage Calendar");
  });

  test("exports permission sets", () => {
    expect(PERMISSION_SETS.view).toContain("View Calendar");
    expect(PERMISSION_SETS.shareView).toContain("View Calendar - Times Only");
  });

  test("permission evaluator handles any-of and all-of rules", () => {
    const evaluator = createPermissionEvaluator();
    expect(evaluator.evaluatePermissions(["View Calendar"], { anyOf: ["View Calendar", "Manage Calendar"] })).toBe(true);
    expect(evaluator.evaluatePermissions(["View Calendar"], { allOf: ["View Calendar", "Manage Calendar"] })).toBe(false);
    expect(evaluator.evaluatePermissions(["View Calendar", "Manage Calendar"], {
      allOf: ["View Calendar", "Manage Calendar"]
    })).toBe(true);
  });
});
