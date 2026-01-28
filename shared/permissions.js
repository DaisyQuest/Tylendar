const PERMISSIONS = Object.freeze({
  VIEW_ALL: 'view_all',
  VIEW_TIMES_ONLY: 'view_times_only',
  ADD: 'add',
  COMMENT: 'comment',
  MANAGE: 'manage',
});

const PERMISSION_DESCRIPTIONS = Object.freeze({
  [PERMISSIONS.VIEW_ALL]: 'View calendar details',
  [PERMISSIONS.VIEW_TIMES_ONLY]: 'View calendar times only',
  [PERMISSIONS.ADD]: 'Add events to calendar',
  [PERMISSIONS.COMMENT]: 'Comment on calendar events',
  [PERMISSIONS.MANAGE]: 'Manage calendar events',
});

module.exports = {
  PERMISSIONS,
  PERMISSION_DESCRIPTIONS,
};
