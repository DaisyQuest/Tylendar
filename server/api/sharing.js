const express = require("express");
const crypto = require("crypto");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { PERMISSIONS } = require("../models/calendarPermissions");

function createSharingRouter({ sharingProvider, shareTokensRepository, auditService }) {
  const router = express.Router();

  router.get("/preview", asyncHandler(async (req, res) => {
    const calendarId = req.query.calendarId;
    const options = sharingProvider.getSharingOptions(calendarId);
    return res.json({ calendarId, options });
  }));

  router.post("/link", requireAuth, asyncHandler(async (req, res) => {
    const { calendarId, permissions } = req.body;
    if (!calendarId) {
      return res.status(400).json({ error: "calendarId is required" });
    }
    const selectedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : [PERMISSIONS[0]];
    const shareId = `share-${Date.now()}`;
    const token = crypto.randomBytes(16).toString("hex");
    if (shareTokensRepository) {
      await shareTokensRepository.create({
        id: shareId,
        calendarId,
        token,
        createdBy: req.user.id,
        permissions: selectedPermissions
      });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const link = `${baseUrl}/api/calendars/${calendarId}/embed?token=${token}`;
    await auditService.record({
      action: "share_link_create",
      actorId: req.user.id,
      targetId: shareId,
      status: "success",
      details: `Share link created for ${calendarId}`
    });
    return res.status(201).json({ shareId, link, permissions: selectedPermissions });
  }));

  router.post("/export", requireAuth, asyncHandler(async (req, res) => {
    const { calendarId, format } = req.body;
    if (!calendarId) {
      return res.status(400).json({ error: "calendarId is required" });
    }
    await auditService.record({
      action: "calendar_export",
      actorId: req.user.id,
      targetId: calendarId,
      status: "success",
      details: `Exported calendar in ${format || "ICS"} format`
    });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.status(201).json({
      calendarId,
      format: format || "ICS",
      status: "ready",
      downloadUrl: `${baseUrl}/export/${calendarId}.${(format || "ics").toLowerCase()}`
    });
  }));

  return router;
}

module.exports = {
  createSharingRouter
};
