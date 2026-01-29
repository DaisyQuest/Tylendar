const { hashPassword } = require("../../server/auth/passwords");

const DEFAULT_PASSWORD = "Password123!";

async function createOrganization(repositories, overrides = {}) {
  const payload = {
    id: "org-1",
    name: "Test Organization",
    description: "Test organization",
    roles: ["owner", "admin", "member"],
    ...overrides
  };
  return repositories.organizations.create(payload);
}

async function createUser(repositories, overrides = {}) {
  const payload = {
    id: "user-1",
    name: "Test User",
    email: "user@example.com",
    organizationId: undefined,
    role: "member",
    passwordHash: hashPassword(DEFAULT_PASSWORD),
    ...overrides
  };
  return repositories.users.create(payload);
}

async function createCalendar(repositories, overrides = {}) {
  const payload = {
    id: "cal-1",
    name: "Test Calendar",
    ownerId: "org-1",
    ownerType: "organization",
    sharedOwnerIds: [],
    isPublic: true,
    ...overrides
  };
  return repositories.calendars.create(payload);
}

async function createCalendarPermission(repositories, overrides = {}) {
  const payload = {
    id: "perm-1",
    calendarId: "cal-1",
    userId: "user-1",
    grantedBy: "user-1",
    permissions: ["View Calendar"],
    ...overrides
  };
  return repositories.calendarPermissions.create(payload);
}

async function createEvent(repositories, overrides = {}) {
  const now = new Date();
  const payload = {
    id: "evt-1",
    title: "Test Event",
    calendarIds: ["cal-1"],
    startsAt: now.toISOString(),
    endsAt: new Date(now.getTime() + 60 * 60 * 1000).toISOString(),
    createdBy: "user-1",
    ...overrides
  };
  return repositories.events.create(payload);
}

async function createRole(repositories, overrides = {}) {
  const payload = {
    id: "role-1",
    orgId: "org-1",
    name: "Manager",
    permissions: ["View Calendar"],
    ...overrides
  };
  return repositories.roles.create(payload);
}

async function createRoleAssignment(repositories, overrides = {}) {
  const payload = {
    id: "assign-1",
    orgId: "org-1",
    roleId: "role-1",
    userId: "user-1",
    assignedBy: "user-1",
    ...overrides
  };
  return repositories.roleAssignments.create(payload);
}

module.exports = {
  DEFAULT_PASSWORD,
  createCalendar,
  createCalendarPermission,
  createEvent,
  createOrganization,
  createRole,
  createRoleAssignment,
  createUser
};
