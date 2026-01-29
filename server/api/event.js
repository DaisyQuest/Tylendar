const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { PERMISSIONS } = require("../models/calendarPermissions");

function createEventRouter({ eventsRepository, calendarPermissionsRepository, permissionGuard, auditService }) {
  const router = express.Router();
  const viewPermissions = new Set([PERMISSIONS[0], PERMISSIONS[1], PERMISSIONS[2]]);
  const hasViewPermission = (permissions = []) => permissions.some((permission) => viewPermissions.has(permission));

  router.get("/:eventId", requireAuth, asyncHandler(async (req, res) => {
    const event = await eventsRepository.getById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.json(event);
  }));

  router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const calendarId = req.query.calendarId;
    if (calendarId) {
      const entries = await calendarPermissionsRepository.list({ calendarId, userId: req.user.id });
      const permissions = entries.flatMap((entry) => entry.permissions || []);
      if (!hasViewPermission(permissions)) {
        await auditService.record({
          action: "permission_check",
          actorId: req.user.id,
          targetId: calendarId,
          status: "denied",
          details: "Missing permission: View Calendar"
        });
        return res.status(403).json({ error: "Permission denied" });
      }
    }
    const events = await eventsRepository.list(calendarId ? { calendarIds: calendarId } : {});
    return res.json({ events });
  }));

  router.post(
    "/",
    requireAuth,
    permissionGuard(PERMISSIONS[2]),
    asyncHandler(async (req, res) => {
      const event = await eventsRepository.create(req.body);
      await auditService.record({
        action: "event_create",
        actorId: req.user.id,
        targetId: event.id,
        status: "success",
        details: "Event created"
      });
      return res.status(201).json(event);
    })
  );

  router.delete(
    "/:eventId",
    requireAuth,
    permissionGuard(PERMISSIONS[4]),
    asyncHandler(async (req, res) => {
      const deleted = await eventsRepository.remove(req.params.eventId);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      await auditService.record({
        action: "event_delete",
        actorId: req.user.id,
        targetId: req.params.eventId,
        status: "success",
        details: "Event deleted"
      });
      return res.json({ status: "deleted" });
    })
  );

  return router;
}

module.exports = {
  createEventRouter
};
