const { PERMISSIONS } = require('../../shared/permissions');

function normalizePermissions(permissions) {
  if (!Array.isArray(permissions)) {
    return [];
  }
  return permissions.filter(Boolean);
}

function hasPermission(required, granted) {
  if (!required) {
    return false;
  }
  const normalized = new Set(normalizePermissions(granted));
  return normalized.has(required);
}

function canViewCalendar(granted) {
  return (
    hasPermission(PERMISSIONS.VIEW_ALL, granted) ||
    hasPermission(PERMISSIONS.VIEW_TIMES_ONLY, granted)
  );
}

module.exports = {
  normalizePermissions,
  hasPermission,
  canViewCalendar,
};
