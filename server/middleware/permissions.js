function createPermissionGuard({ calendarPermissionsRepository, auditService }) {
  return function requirePermission(permission) {
    return async (req, res, next) => {
      const user = req.user;
      const calendarId = req.params.calendarId || req.body.calendarId || req.query.calendarId;

      if (!user || !calendarId) {
        if (auditService) {
          auditService.record({
            action: "permission_check",
            actorId: user ? user.id : "anonymous",
            targetId: calendarId || "unknown",
            status: "denied",
            details: "Missing user or calendar"
          });
        }
        return res.status(403).json({ error: "Permission denied" });
      }

      const entries = await calendarPermissionsRepository.list({ calendarId, userId: user.id });
      const permissions = entries.flatMap((entry) => entry.permissions || []);
      const allowed = permissions.includes(permission);

      if (!allowed) {
        if (auditService) {
          auditService.record({
            action: "permission_check",
            actorId: user.id,
            targetId: calendarId,
            status: "denied",
            details: `Missing permission: ${permission}`
          });
        }
        return res.status(403).json({ error: "Permission denied" });
      }

      if (auditService) {
        auditService.record({
          action: "permission_check",
          actorId: user.id,
          targetId: calendarId,
          status: "allowed",
          details: `Permission granted: ${permission}`
        });
      }

      return next();
    };
  };
}

module.exports = {
  createPermissionGuard
};
