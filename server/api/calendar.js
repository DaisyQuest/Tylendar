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

  const viewPermissions = new Set([PERMISSIONS[0], PERMISSIONS[1], PERMISSIONS[2]]);
  const shareViewPermissions = new Set([PERMISSIONS[0], PERMISSIONS[1]]);
  const hasViewPermission = (permissions = []) => permissions.some((permission) => viewPermissions.has(permission));

  async function ensureDefaultCalendar(user) {
    const calendarId = `cal-${crypto.randomBytes(8).toString("hex")}`;
    const calendar = await calendarsRepository.create({
      id: calendarId,
      name: `${user.name}'s Calendar`,
      ownerId: user.id,
      ownerType: "user",
      isPublic: false
    });
    await calendarPermissionsRepository.create({
      id: `perm-${crypto.randomBytes(8).toString("hex")}`,
      calendarId: calendar.id,
      userId: user.id,
      grantedBy: user.id,
      permissions: PERMISSIONS
    });
    await auditService.record({
      action: "calendar_auto_provision",
      actorId: user.id,
      targetId: calendar.id,
      status: "success",
      details: "Default calendar created for user"
    });
    return calendar;
  }

  async function filterCalendarsForUser(calendars, user) {
    const permissions = await calendarPermissionsRepository.list({ userId: user.id });
    const permitted = new Set(
      permissions
        .filter((entry) => hasViewPermission(entry.permissions))
        .map((entry) => entry.calendarId)
    );
    return calendars.filter(
      (calendar) =>
        calendar.ownerId === user.id ||
        (Array.isArray(calendar.sharedOwnerIds) && calendar.sharedOwnerIds.includes(user.id)) ||
        permitted.has(calendar.id)
    );
  }

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
    const visible = await filterCalendarsForUser(calendars, req.user);
    if (visible.length === 0 && Object.keys(filter).length === 0) {
      const calendar = await ensureDefaultCalendar(req.user);
      return res.json({ calendars: [calendar] });
    }
    return res.json({ calendars: visible });
  }));

  router.get("/:calendarId", requireAuth, asyncHandler(async (req, res) => {
    const calendar = await calendarsRepository.getById(req.params.calendarId);
    if (!calendar) {
      return res.status(404).json({ error: "Calendar not found" });
    }
    const visibleCalendars = await filterCalendarsForUser([calendar], req.user);
    if (visibleCalendars.length === 0) {
      return res.status(403).json({ error: "Permission denied" });
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
    await calendarPermissionsRepository.create({
      id: `perm-${crypto.randomBytes(8).toString("hex")}`,
      calendarId: calendar.id,
      userId: req.user.id,
      grantedBy: req.user.id,
      permissions: PERMISSIONS
    });
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
      const allowed = sharePermissions.some((permission) => shareViewPermissions.has(permission));
      if (!allowed) {
        return res.status(403).json({ error: "Share link does not allow viewing" });
      }
    }

    const allEvents = await eventsRepository.list();
    const events = allEvents.filter((event) => event.calendarIds.includes(calendar.id));

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
