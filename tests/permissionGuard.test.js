const { createPermissionGuard } = require("../server/middleware/permissions");
const { createMemoryRepository } = require("../server/repositories/memoryRepository");
const { createCalendarPermissions } = require("../server/models/calendarPermissions");
const { createPermissionEvaluator } = require("../server/permissions/permissionEvaluator");

describe("permission guard", () => {
  test("allows when permission present without audit service", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    await repo.create({
      id: "perm-1",
      calendarId: "cal-1",
      userId: "user-1",
      grantedBy: "user-1",
      permissions: ["View Calendar"]
    });

    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard("View Calendar");

    const req = { user: { id: "user-1" }, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("denies without audit service when missing calendar", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard("View Calendar");

    const req = { user: { id: "user-1" }, params: {}, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("denies without audit service when permission missing", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard("Manage Calendar");

    const req = { user: { id: "user-1" }, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("denies when user is missing", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard("View Calendar");

    const req = { user: null, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("logs anonymous actor when audit service is enabled", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    const record = jest.fn();
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo, auditService: { record } });
    const middleware = guard("View Calendar");

    const req = { user: null, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(record).toHaveBeenCalledWith(expect.objectContaining({ actorId: "anonymous" }));
  });

  test("respects audit context options", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    await repo.create({
      id: "perm-5",
      calendarId: "cal-5",
      userId: "user-5",
      grantedBy: "user-5",
      permissions: ["View Calendar"]
    });
    const record = jest.fn();
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo, auditService: { record } });
    const middleware = guard("View Calendar", { logAllowed: false, action: "custom_check" });

    const req = { user: { id: "user-5" }, params: { calendarId: "cal-5" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(record).not.toHaveBeenCalled();
  });

  test("supports any-of permission requirements", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    await repo.create({
      id: "perm-2",
      calendarId: "cal-2",
      userId: "user-2",
      grantedBy: "user-2",
      permissions: ["Add to Calendar"]
    });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard({ anyOf: ["Add to Calendar", "Manage Calendar"] });

    const req = { user: { id: "user-2" }, params: { calendarId: "cal-2" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test("supports all-of permission requirements", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    await repo.create({
      id: "perm-3",
      calendarId: "cal-3",
      userId: "user-3",
      grantedBy: "user-3",
      permissions: ["Add to Calendar", "Manage Calendar"]
    });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard({ allOf: ["Add to Calendar", "Manage Calendar"] });

    const req = { user: { id: "user-3" }, params: { calendarId: "cal-3" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test("denies when all-of requirements missing", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    await repo.create({
      id: "perm-4",
      calendarId: "cal-4",
      userId: "user-4",
      grantedBy: "user-4",
      permissions: ["Add to Calendar"]
    });
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard({ allOf: ["Add to Calendar", "Manage Calendar"] });

    const req = { user: { id: "user-4" }, params: { calendarId: "cal-4" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("uses injected permission evaluator", async () => {
    const repo = createMemoryRepository({ createModel: createCalendarPermissions });
    const evaluator = createPermissionEvaluator({ calendarPermissionsRepository: repo });
    const guard = createPermissionGuard({ permissionEvaluator: evaluator });
    const middleware = guard("View Calendar");

    const req = { user: { id: "user-1" }, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("handles missing permissions array", async () => {
    const repo = {
      list: async () => [{ permissions: null }]
    };
    const guard = createPermissionGuard({ calendarPermissionsRepository: repo });
    const middleware = guard("Manage Calendar");

    const req = { user: { id: "user-1" }, params: { calendarId: "cal-1" }, body: {}, query: {} };
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
