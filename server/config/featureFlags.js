const baseFlags = {
  homePage: true,
  userManagement: true,
  userDashboard: true,
  organizationDashboard: true,
  calendarViews: true,
  eventListViews: true,
  manageAccess: true,
  messageBoard: true,
  embedWidget: true,
  socialSharing: true,
  auditHistory: true,
  faultTolerance: true,
  roleManagement: true,
  developerPortal: true,
  observability: true,
  auth: true,
  org: true,
  calendar: true,
  event: true,
  permissions: true,
  audit: true,
  monitoring: true
};

function getFeatureFlags({ overrides = {}, envFlags = {} } = {}) {
  return {
    ...baseFlags,
    ...envFlags,
    ...overrides
  };
}

module.exports = {
  baseFlags,
  getFeatureFlags
};
