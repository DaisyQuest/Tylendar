const { createPermissionEvaluator } = require("../permissions/permissionEvaluator");

function createPermissionGuard({ calendarPermissionsRepository, auditService, permissionEvaluator } = {}) {
  const evaluator = permissionEvaluator || createPermissionEvaluator({ calendarPermissionsRepository, auditService });
  return function requirePermission(requirement, options = {}) {
    return async (req, res, next) => {
      const user = req.user;
      const calendarId = req.params.calendarId || req.body.calendarId || req.query.calendarId;
      const result = await evaluator.evaluate({
        userId: user?.id,
        calendarId,
        requirement,
        auditContext: {
          action: options.action || "permission_check",
          actorId: user?.id || "anonymous",
          targetId: calendarId || "unknown",
          logAllowed: options.logAllowed,
          logDenied: options.logDenied,
          details: options.details
        }
      });

      if (!result.allowed) {
        return res.status(403).json({ error: "Permission denied" });
      }

      req.permissions = result.permissions;
      return next();
    };
  };
}

module.exports = {
  createPermissionGuard
};
