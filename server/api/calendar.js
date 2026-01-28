const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { PERMISSIONS } = require("../models/calendarPermissions");

function createCalendarRouter({ calendarsRepository, eventsRepository, permissionGuard, auditService }) {
  const router = express.Router();

  router.get("/:calendarId", requireAuth, asyncHandler(async (req, res) => {
    const calendar = await calendarsRepository.getById(req.params.calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    return res.json(calendar);
  }));

  router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const calendar = await calendarsRepository.create(req.body);
    await auditService.record({
      action: "calendar_create",
      actorId: req.user.id,
      targetId: calendar.id,
      status: "success",
      details: "Calendar created"
    });
    return res.status(201).json(calendar);
  }));

  router.delete(
    "/:calendarId",
    requireAuth,
    permissionGuard(PERMISSIONS[4]),
    asyncHandler(async (req, res) => {
      const deleted = await calendarsRepository.remove(req.params.calendarId);
      if (!deleted) {
        return res.status(404).json({ error: "Calendar not found" });
      }
      await auditService.record({
        action: "calendar_delete",
        actorId: req.user.id,
        targetId: req.params.calendarId,
        status: "success",
        details: "Calendar deleted"
      });
      return res.json({ status: "deleted" });
    })
  );

  router.get("/:calendarId/embed", asyncHandler(async (req, res) => {
    const calendar = await calendarsRepository.getById(req.params.calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    if (!calendar.isPublic && !req.user) {
      return res.status(403).json({ error: "Calendar is private" });
    }

    const allEvents = await eventsRepository.list();
    const events = allEvents.filter((event) =>
      Array.isArray(event.calendarIds) && event.calendarIds.includes(calendar.id)
    );

    return res.json({
      calendar: {
        id: calendar.id,
        name: calendar.name,
        isPublic: calendar.isPublic
      },
      events,
      embed: {
        theme: "Lavender Glow",
        refreshSeconds: 60,
        source: `/api/calendars/${calendar.id}`
      }
    });
  }));

  return router;
}

module.exports = {
  createCalendarRouter
};
