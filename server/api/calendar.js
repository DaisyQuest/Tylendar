const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { PERMISSIONS } = require("../models/calendarPermissions");

function createCalendarRouter({
  calendarsRepository,
  eventsRepository,
  calendarPermissionsRepository,
  shareTokensRepository,
  permissionGuard,
  auditService
}) {
  const router = express.Router();

  router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.ownerId) {
      filter.ownerId = req.query.ownerId;
    }
    if (req.query.ownerType) {
      filter.ownerType = req.query.ownerType;
    }
    if (req.query.sharedOwnerId) {
      filter.sharedOwnerIds = req.query.sharedOwnerId;
    }
    const calendars = await calendarsRepository.list(filter);
    return res.json({ calendars });
  }));

  router.get("/:calendarId", requireAuth, asyncHandler(async (req, res) => {
    const calendar = await calendarsRepository.getById(req.params.calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    return res.json(calendar);
  }));

  router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const payload = { ...req.body };
    if (!payload.id) {
      payload.id = `cal-${crypto.randomBytes(8).toString("hex")}`;
    }
    if (!payload.ownerId) {
      payload.ownerId = req.user.id;
    }
    if (!payload.ownerType) {
      payload.ownerType = "user";
    }
    const calendar = await calendarsRepository.create(payload);
    if (calendarPermissionsRepository) {
      await calendarPermissionsRepository.create({
        id: `perm-${crypto.randomBytes(8).toString("hex")}`,
        calendarId: calendar.id,
        userId: req.user.id,
        grantedBy: req.user.id,
        permissions: PERMISSIONS
      });
    }
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
    let sharePermissions = null;
    if (!calendar.isPublic && !req.user) {
      const token = req.query.token;
      if (!token || !shareTokensRepository) {
        return res.status(403).json({ error: "Calendar is private" });
      }
      const matches = await shareTokensRepository.list({ calendarId: calendar.id, token });
      const entry = matches[0];
      if (!entry) {
        return res.status(403).json({ error: "Calendar is private" });
      }
      sharePermissions = entry.permissions || [];
      const allowed = sharePermissions.includes(PERMISSIONS[0]) || sharePermissions.includes(PERMISSIONS[1]);
      if (!allowed) {
        return res.status(403).json({ error: "Share link does not allow viewing" });
      }
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
      permissions: sharePermissions || undefined,
      embed: {
        theme: "default",
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
