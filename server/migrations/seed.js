const { hashPassword } = require("../auth/passwords");

const DEFAULT_USER_PASSWORD = "Password123!";

function buildSeedData() {
  const organization = {
    id: "org-1",
    name: "Tylendar Community",
    description: "Local community gatherings",
    roles: ["owner", "admin", "member"]
  };

  const users = [
    {
      id: "user-1",
      name: "Avery Chen",
      email: "avery@example.com",
      organizationId: organization.id,
      role: "admin",
      passwordHash: hashPassword(DEFAULT_USER_PASSWORD)
    },
    {
      id: "user-2",
      name: "Riley Patel",
      email: "riley@example.com",
      organizationId: organization.id,
      role: "member",
      passwordHash: hashPassword(DEFAULT_USER_PASSWORD)
    }
  ];

  const calendars = [
    {
      id: "cal-1",
      name: "Community Events",
      ownerId: organization.id,
      ownerType: "organization",
      sharedOwnerIds: [users[0].id],
      isPublic: true
    }
  ];

  const permissions = [
    {
      id: "perm-1",
      calendarId: calendars[0].id,
      userId: users[0].id,
      grantedBy: users[0].id,
      permissions: ["View Calendar", "Manage Calendar", "Add to Calendar"]
    },
    {
      id: "perm-2",
      calendarId: calendars[0].id,
      userId: users[1].id,
      grantedBy: users[0].id,
      permissions: ["View Calendar", "Comment on Calendar"]
    }
  ];

  const events = [
    {
      id: "evt-1",
      title: "Community Brunch",
      description: "Monthly brunch gathering",
      calendarIds: [calendars[0].id],
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      createdBy: users[0].id
    }
  ];

  const roles = [
    {
      id: "role-1",
      orgId: organization.id,
      name: "Event Coordinator",
      permissions: ["Create Events", "Comment on Calendar", "View Calendar"]
    },
    {
      id: "role-2",
      orgId: organization.id,
      name: "Calendar Steward",
      permissions: ["Manage Calendar", "Add to Calendar", "View Calendar"]
    }
  ];

  const roleAssignments = [
    {
      id: "assign-1",
      orgId: organization.id,
      roleId: roles[0].id,
      userId: users[1].id,
      assignedBy: users[0].id
    }
  ];

  return {
    organization,
    users,
    calendars,
    permissions,
    events,
    roles,
    roleAssignments,
    defaultPassword: DEFAULT_USER_PASSWORD
  };
}

async function seedDatabase(repositories) {
  const seed = buildSeedData();

  await repositories.organizations.create(seed.organization);
  await repositories.users.seed(seed.users);
  await repositories.calendars.seed(seed.calendars);
  await repositories.calendarPermissions.seed(seed.permissions);
  await repositories.events.seed(seed.events);
  if (repositories.roles) {
    await repositories.roles.seed(seed.roles);
  }
  if (repositories.roleAssignments) {
    await repositories.roleAssignments.seed(seed.roleAssignments);
  }

  return seed;
}

module.exports = {
  buildSeedData,
  seedDatabase,
  DEFAULT_USER_PASSWORD
};
