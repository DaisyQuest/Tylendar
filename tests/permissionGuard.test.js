const { createPermissionGuard } = require("../server/middleware/permissions");
const { createMemoryRepository } = require("../server/repositories/memoryRepository");
const { createCalendarPermissions } = require("../server/models/calendarPermissions");

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
