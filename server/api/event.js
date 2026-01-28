const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { PERMISSIONS } = require("../models/calendarPermissions");

function createEventRouter({ eventsRepository, permissionGuard, auditService }) {
  const router = express.Router();

  router.get("/:eventId", requireAuth, asyncHandler(async (req, res) => {
    const event = await eventsRepository.getById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.json(event);
  }));

  router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const events = await eventsRepository.list(req.query.calendarId ? { calendarIds: req.query.calendarId } : {});
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
