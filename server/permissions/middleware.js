const { hasPermission } = require('./permissions');

function requirePermission(requiredPermission) {
  return (context) => {
    if (!context || !context.permissions) {
      return { allowed: false, reason: 'missing permissions context' };
    }

    if (!hasPermission(requiredPermission, context.permissions)) {
      return { allowed: false, reason: 'forbidden' };
    }

    return { allowed: true };
  };
}

module.exports = {
  requirePermission,
};
