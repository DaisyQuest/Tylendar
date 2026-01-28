const API_MODULES = Object.freeze({
  auth: {
    prefix: '/api/auth',
    description: 'Authentication and session management',
  },
  org: {
    prefix: '/api/orgs',
    description: 'Organization lifecycle and membership',
  },
  calendar: {
    prefix: '/api/calendars',
    description: 'Calendar CRUD operations',
  },
  event: {
    prefix: '/api/events',
    description: 'Event lifecycle management',
  },
  permissions: {
    prefix: '/api/permissions',
    description: 'Permission enforcement and assignments',
  },
  audit: {
    prefix: '/api/audit',
    description: 'Audit logging pipeline',
  },
  monitoring: {
    prefix: '/api/monitoring',
    description: 'Monitoring and diagnostics',
  },
});

function listModules() {
  return Object.entries(API_MODULES).map(([key, value]) => ({
    key,
    ...value,
  }));
}

module.exports = {
  API_MODULES,
  listModules,
};
