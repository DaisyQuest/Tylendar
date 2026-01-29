const {
  createPermissionEvaluator,
  normalizeRequirement,
  evaluatePermissions
} = require("../server/permissions/permissionEvaluator");

describe("permission evaluator", () => {
  test("evaluate returns denied with missing user or calendar", async () => {
    const record = jest.fn();
    const evaluator = createPermissionEvaluator({ auditService: { record } });

    const result = await evaluator.evaluate({ userId: null, calendarId: "cal-1", requirement: "View Calendar" });

    expect(result.allowed).toBe(false);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ status: "denied" }));
  });

  test("evaluate respects logAllowed and logDenied options", async () => {
    const record = jest.fn();
    const evaluator = createPermissionEvaluator({
      auditService: { record },
      calendarPermissionsRepository: { list: async () => [{ permissions: ["View Calendar"] }] }
    });

    const allowed = await evaluator.evaluate({
      userId: "user-1",
      calendarId: "cal-1",
      requirement: "View Calendar",
      auditContext: { logAllowed: false }
    });

    expect(allowed.allowed).toBe(true);
    expect(record).not.toHaveBeenCalled();

    const denied = await evaluator.evaluate({
      userId: "user-1",
      calendarId: "cal-1",
      requirement: "Manage Calendar",
      auditContext: { logDenied: false }
    });

    expect(denied.allowed).toBe(false);
    expect(record).not.toHaveBeenCalled();
  });

  test("evaluate logs denied entries with requirement description", async () => {
    const record = jest.fn();
    const evaluator = createPermissionEvaluator({
      auditService: { record },
      calendarPermissionsRepository: { list: async () => [{ permissions: ["View Calendar"] }] }
    });

    await evaluator.evaluate({
      userId: "user-1",
      calendarId: "cal-1",
      requirement: { allOf: ["Manage Calendar", "Add to Calendar"] }
    });

    expect(record).toHaveBeenCalledWith(expect.objectContaining({
      status: "denied",
      details: expect.stringContaining("allOf")
    }));
  });

  test("evaluate returns permissions list", async () => {
    const evaluator = createPermissionEvaluator({
      calendarPermissionsRepository: { list: async () => [{ permissions: ["View Calendar", "Add to Calendar"] }] }
    });

    const result = await evaluator.evaluate({
      userId: "user-1",
      calendarId: "cal-1",
      requirement: { anyOf: ["Add to Calendar"] }
    });

    expect(result.permissions).toEqual(["View Calendar", "Add to Calendar"]);
  });

  test("normalizeRequirement handles empty and array requirements", () => {
    expect(normalizeRequirement()).toEqual({ anyOf: [], allOf: [] });
    expect(normalizeRequirement(["View Calendar"])).toEqual({ anyOf: ["View Calendar"], allOf: [] });
  });

  test("evaluatePermissions returns false without requirements", () => {
    expect(evaluatePermissions(["View Calendar"])).toBe(false);
  });

  test("evaluatePermissions handles non-array permissions", () => {
    expect(evaluatePermissions(null, "View Calendar")).toBe(false);
  });

  test("listPermissions returns empty list when repo or user missing", async () => {
    const evaluator = createPermissionEvaluator();
    const missingUser = await evaluator.listPermissions();
    expect(missingUser).toEqual([]);

    const evaluatorWithRepo = createPermissionEvaluator({ calendarPermissionsRepository: { list: jest.fn() } });
    const missingUserWithRepo = await evaluatorWithRepo.listPermissions({});
    expect(missingUserWithRepo).toEqual([]);
  });

  test("listPermissions flattens entries with missing permissions", async () => {
    const evaluator = createPermissionEvaluator({
      calendarPermissionsRepository: {
        list: async () => [{ permissions: null }, { permissions: ["View Calendar"] }]
      }
    });

    const result = await evaluator.listPermissions({ userId: "user-1", calendarId: "cal-1" });

    expect(result).toEqual(["View Calendar"]);
  });

  test("evaluate logs allowed actions when audit is enabled", async () => {
    const record = jest.fn();
    const evaluator = createPermissionEvaluator({
      auditService: { record },
      calendarPermissionsRepository: { list: async () => [{ permissions: ["View Calendar"] }] }
    });

    const result = await evaluator.evaluate({
      userId: "user-1",
      calendarId: "cal-1",
      requirement: "View Calendar",
      auditContext: { action: "permission_check" }
    });

    expect(result.allowed).toBe(true);
    expect(record).toHaveBeenCalledWith(expect.objectContaining({ status: "allowed" }));
  });
});
