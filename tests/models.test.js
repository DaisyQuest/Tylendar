const { createAuditEntry, validateAuditEntry } = require("../server/models/auditEntry");
const { createCalendar, validateCalendar } = require("../server/models/calendar");
const { createCalendarPermissions, validateCalendarPermissions } = require("../server/models/calendarPermissions");
const { createEvent, validateEvent } = require("../server/models/event");
const { createOrganization, validateOrganization } = require("../server/models/organization");
const { createRole, validateRole } = require("../server/models/role");
const { createRoleAssignment, validateRoleAssignment } = require("../server/models/roleAssignment");
const { createUser, validateUser } = require("../server/models/user");

describe("domain models", () => {
  test("createUser validates required fields", () => {
    expect(() => createUser({ id: "u1" })).toThrow("Validation failed");
    expect(() => createUser()).toThrow("Validation failed");
    const user = createUser({
      id: "u1",
      name: "Test User",
      email: "test@example.com",
      organizationId: "org-1"
    });
    expect(user.role).toBe("member");
    expect(validateUser(user).valid).toBe(true);

    const invalidRole = validateUser({
      id: "u2",
      name: "Bad Role",
      email: "bad@example.com",
      organizationId: "org-1",
      role: 42,
      passwordHash: 42
    });
    expect(invalidRole.valid).toBe(false);

    const userWithRole = createUser({
      id: "u3",
      name: "Admin User",
      email: "admin@example.com",
      organizationId: "org-1",
      role: "admin",
      passwordHash: "salt:hash",
      createdAt: "2024-01-01T00:00:00.000Z"
    });
    expect(userWithRole.role).toBe("admin");

    const emptyUser = validateUser();
    expect(emptyUser.valid).toBe(false);

    const validUser = validateUser({
      id: "u4",
      name: "Valid",
      email: "valid@example.com",
      organizationId: "org-1",
      role: "member"
    });
    expect(validUser.valid).toBe(true);

    const emptyRoleUser = createUser({
      id: "u5",
      name: "Empty Role",
      email: "empty@example.com",
      organizationId: "org-1",
      role: ""
    });
    expect(emptyRoleUser.role).toBe("member");

    const userWithCreatedAtOnly = createUser({
      id: "u6",
      name: "Created",
      email: "created@example.com",
      organizationId: "org-1",
      createdAt: "2024-01-02T00:00:00.000Z"
    });
    expect(userWithCreatedAtOnly.createdAt).toBe("2024-01-02T00:00:00.000Z");

    const userWithRoleOnly = createUser({
      id: "u7",
      name: "Role Only",
      email: "role@example.com",
      organizationId: "org-1",
      role: "member"
    });
    expect(userWithRoleOnly.role).toBe("member");
  });

  test("createOrganization enforces roles array", () => {
    expect(() => createOrganization()).toThrow("Validation failed");
    const org = createOrganization({ id: "org-1", name: "Org" });
    expect(org.roles).toContain("owner");
    const result = validateOrganization({ id: "org-2", name: "Org", roles: "bad" });
    expect(result.valid).toBe(false);

    const badDescription = validateOrganization({ id: "org-3", name: "Org", description: 123, roles: [] });
    expect(badDescription.valid).toBe(false);

    const orgWithDetails = createOrganization({
      id: "org-4",
      name: "Detailed Org",
      description: "Detailed",
      roles: ["owner"],
      createdAt: "2024-02-01T00:00:00.000Z"
    });
    expect(orgWithDetails.description).toBe("Detailed");

    const defaultRoles = validateOrganization({ id: "org-5", name: "Default" });
    expect(defaultRoles.valid).toBe(true);

    const emptyOrg = validateOrganization();
    expect(emptyOrg.valid).toBe(false);

    const validOrg = validateOrganization({ id: "org-6", name: "Valid", roles: ["owner"] });
    expect(validOrg.valid).toBe(true);

    const orgWithDefaults = createOrganization({ id: "org-7", name: "Defaults", roles: [] });
    expect(orgWithDefaults.roles).toEqual([]);

    const orgWithEmptyDescription = createOrganization({
      id: "org-8",
      name: "Empty Desc",
      description: ""
    });
    expect(orgWithEmptyDescription.description).toBe("");

    const orgWithCreatedAtOnly = createOrganization({
      id: "org-9",
      name: "Created",
      createdAt: "2024-02-02T00:00:00.000Z"
    });
    expect(orgWithCreatedAtOnly.createdAt).toBe("2024-02-02T00:00:00.000Z");
  });

  test("createCalendar enforces owner type", () => {
    expect(() => createCalendar()).toThrow("Validation failed");
    const calendar = createCalendar({
      id: "cal-1",
      name: "Team",
      ownerId: "org-1",
      ownerType: "organization",
      isPublic: true
    });
    expect(calendar.isPublic).toBe(true);

    const result = validateCalendar({
      id: "cal-2",
      name: "Bad",
      ownerId: "org-1",
      ownerType: "team"
    });
    expect(result.valid).toBe(false);

    const badPublic = validateCalendar({
      id: "cal-3",
      name: "Public",
      ownerId: "org-1",
      ownerType: "organization",
      isPublic: "yes"
    });
    expect(badPublic.valid).toBe(false);

    const missingOwnerType = validateCalendar({
      id: "cal-5",
      name: "Missing",
      ownerId: "org-1",
      ownerType: ""
    });
    expect(missingOwnerType.valid).toBe(false);

    const emptyCalendar = validateCalendar();
    expect(emptyCalendar.valid).toBe(false);

    const invalidColor = validateCalendar({
      id: "cal-7",
      name: "Invalid Color",
      ownerId: "org-1",
      ownerType: "organization",
      color: 123,
      sharedOwnerIds: "bad"
    });
    expect(invalidColor.valid).toBe(false);

    const explicitPublic = validateCalendar({
      id: "cal-8",
      name: "Public",
      ownerId: "org-1",
      ownerType: "organization",
      sharedOwnerIds: [],
      isPublic: false
    });
    expect(explicitPublic.valid).toBe(true);

    const calendarWithEmptyColor = createCalendar({
      id: "cal-9",
      name: "No Color",
      ownerId: "org-1",
      ownerType: "organization",
      color: ""
    });
    expect(calendarWithEmptyColor.color).toBe("#8FB1FF");

    const calendarWithExplicitFalse = createCalendar({
      id: "cal-10",
      name: "Private",
      ownerId: "org-1",
      ownerType: "organization",
      isPublic: false
    });
    expect(calendarWithExplicitFalse.isPublic).toBe(false);

    const calendarWithShared = createCalendar({
      id: "cal-4",
      name: "Shared",
      ownerId: "user-1",
      ownerType: "user",
      sharedOwnerIds: ["user-2"],
      color: "#fff",
      createdAt: "2024-03-01T00:00:00.000Z"
    });
    expect(calendarWithShared.sharedOwnerIds).toContain("user-2");

    const validCalendar = validateCalendar({
      id: "cal-6",
      name: "Valid",
      ownerId: "org-1",
      ownerType: "organization",
      sharedOwnerIds: []
    });
    expect(validCalendar.valid).toBe(true);
  });

  test("createCalendarPermissions validates permissions", () => {
    expect(() => createCalendarPermissions()).toThrow("Validation failed");
    const entry = createCalendarPermissions({
      id: "perm-1",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: ["View Calendar"]
    });
    expect(entry.permissions).toHaveLength(1);

    const result = validateCalendarPermissions({
      id: "perm-2",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: ["Invalid"]
    });
    expect(result.valid).toBe(false);

    const emptyPermissions = validateCalendarPermissions({
      id: "perm-3",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: []
    });
    expect(emptyPermissions.valid).toBe(false);

    const invalidPermissionsType = validateCalendarPermissions({
      id: "perm-4",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: "View Calendar"
    });
    expect(invalidPermissionsType.valid).toBe(false);

    const missingPermissions = validateCalendarPermissions({
      id: "perm-5",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1"
    });
    expect(missingPermissions.valid).toBe(false);

    const emptyCalendarPermissions = validateCalendarPermissions();
    expect(emptyCalendarPermissions.valid).toBe(false);

    expect(() => createCalendarPermissions({
      id: "perm-6",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1"
    })).toThrow("Validation failed");

    const validPermissions = validateCalendarPermissions({
      id: "perm-7",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: ["View Calendar"]
    });
    expect(validPermissions.valid).toBe(true);

    const createdPermissions = createCalendarPermissions({
      id: "perm-8",
      calendarId: "cal-1",
      userId: "u1",
      grantedBy: "u1",
      permissions: ["View Calendar"],
      createdAt: "2024-01-01T00:00:00.000Z"
    });
    expect(createdPermissions.createdAt).toBe("2024-01-01T00:00:00.000Z");
  });

  test("createEvent enforces date ordering", () => {
    expect(() => createEvent()).toThrow("Validation failed");
    const event = createEvent({
      id: "evt-1",
      title: "Event",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1"
    });
    expect(event.description).toBe("");

    const result = validateEvent({
      id: "evt-2",
      title: "Bad",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T12:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1"
    });
    expect(result.valid).toBe(false);

    const invalidDate = validateEvent({
      id: "evt-3",
      title: "Bad Date",
      calendarIds: ["cal-1"],
      startsAt: "invalid",
      endsAt: "invalid",
      createdBy: "u1"
    });
    expect(invalidDate.valid).toBe(false);

    const missingEnd = validateEvent({
      id: "evt-5",
      title: "Missing End",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T10:00:00Z",
      createdBy: "u1"
    });
    expect(missingEnd.valid).toBe(false);

    const emptyEvent = validateEvent();
    expect(emptyEvent.valid).toBe(false);

    const eventWithDescription = createEvent({
      id: "evt-4",
      title: "Detailed",
      description: "Desc",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1",
      createdAt: "2024-01-01T09:00:00Z"
    });
    expect(eventWithDescription.description).toBe("Desc");

    const validEvent = validateEvent({
      id: "evt-6",
      title: "Valid",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1"
    });
    expect(validEvent.valid).toBe(true);

    const invalidDescription = validateEvent({
      id: "evt-7",
      title: "Invalid Desc",
      calendarIds: ["cal-1"],
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1",
      description: 123
    });
    expect(invalidDescription.valid).toBe(false);

    expect(() => createEvent({
      id: "evt-8",
      title: "Missing Calendars",
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1"
    })).toThrow("Validation failed");

    const emptyCalendars = validateEvent({
      id: "evt-9",
      title: "Empty Calendars",
      calendarIds: [],
      startsAt: "2024-01-01T10:00:00Z",
      endsAt: "2024-01-01T11:00:00Z",
      createdBy: "u1"
    });
    expect(emptyCalendars.valid).toBe(false);
  });

  test("createAuditEntry defaults optional fields", () => {
    expect(() => createAuditEntry()).toThrow("Validation failed");
    const entry = createAuditEntry({
      id: "audit-1",
      action: "login",
      actorId: "u1",
      status: "success"
    });
    expect(entry.targetId).toBe("");
    expect(validateAuditEntry(entry).valid).toBe(true);

    const invalidAudit = validateAuditEntry({ id: "audit-2", action: "login", actorId: "u1" });
    expect(invalidAudit.valid).toBe(false);

    const missingAuditFields = validateAuditEntry({});
    expect(missingAuditFields.valid).toBe(false);

    const emptyAudit = validateAuditEntry();
    expect(emptyAudit.valid).toBe(false);

    const auditWithEmptyStrings = createAuditEntry({
      id: "audit-6",
      action: "noop",
      actorId: "u1",
      status: "success",
      targetId: "",
      details: ""
    });
    expect(auditWithEmptyStrings.targetId).toBe("");

    const auditWithCreatedAtOnly = createAuditEntry({
      id: "audit-8",
      action: "noop",
      actorId: "u1",
      status: "success",
      createdAt: "2024-01-03T00:00:00.000Z"
    });
    expect(auditWithCreatedAtOnly.createdAt).toBe("2024-01-03T00:00:00.000Z");

    const minimalAudit = validateAuditEntry({
      id: "audit-7",
      action: "login",
      actorId: "u1",
      status: "success"
    });
    expect(minimalAudit.valid).toBe(true);

    const invalidDetails = validateAuditEntry({
      id: "audit-4",
      action: "login",
      actorId: "u1",
      status: "success",
      details: 123
    });
    expect(invalidDetails.valid).toBe(false);

    const auditWithDetails = createAuditEntry({
      id: "audit-3",
      action: "update",
      actorId: "u1",
      targetId: "target",
      details: "details",
      status: "success",
      createdAt: "2024-01-01T00:00:00.000Z"
    });
    expect(auditWithDetails.details).toBe("details");

    const validAudit = validateAuditEntry({
      id: "audit-5",
      action: "create",
      actorId: "u1",
      status: "success",
      targetId: "target",
      details: "ok"
    });
    expect(validAudit.valid).toBe(true);
  });

  test("createRole validates permissions", () => {
    expect(() => createRole()).toThrow("Validation failed");
    const role = createRole({
      id: "role-1",
      orgId: "org-1",
      name: "Viewer",
      permissions: ["View Calendar"]
    });
    expect(role.description).toBe("");

    const invalidRole = validateRole({
      id: "role-2",
      orgId: "org-1",
      name: "Invalid",
      permissions: []
    });
    expect(invalidRole.valid).toBe(false);

    const invalidDescription = validateRole({
      id: "role-3",
      orgId: "org-1",
      name: "Invalid",
      permissions: ["View Calendar"],
      description: 123
    });
    expect(invalidDescription.valid).toBe(false);

    const invalidPermissions = validateRole({
      id: "role-4",
      orgId: "org-1",
      name: "Invalid",
      permissions: "View Calendar"
    });
    expect(invalidPermissions.valid).toBe(false);
  });

  test("createRoleAssignment enforces required fields", () => {
    expect(() => createRoleAssignment()).toThrow("Validation failed");
    const assignment = createRoleAssignment({
      id: "assign-1",
      orgId: "org-1",
      roleId: "role-1",
      userId: "user-1",
      assignedBy: "user-2"
    });
    expect(assignment.assignedAt).toBeDefined();

    const invalidAssignment = validateRoleAssignment({
      id: "assign-2",
      orgId: "org-1",
      roleId: "role-1",
      userId: "user-1",
      assignedBy: "user-2",
      assignedAt: "invalid"
    });
    expect(invalidAssignment.valid).toBe(false);

    const missingAssignedAt = validateRoleAssignment({
      id: "assign-3",
      orgId: "org-1",
      roleId: "role-1",
      userId: "user-1",
      assignedBy: "user-2"
    });
    expect(missingAssignedAt.valid).toBe(false);
  });
});
