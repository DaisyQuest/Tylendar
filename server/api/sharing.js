const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createSharingRouter({ sharingProvider, auditService }) {
  const router = express.Router();

  router.get("/preview", asyncHandler(async (req, res) => {
    const calendarId = req.query.calendarId;
    const options = sharingProvider.getSharingOptions(calendarId);
    return res.json({ calendarId, options });
  }));

  router.post("/link", requireAuth, asyncHandler(async (req, res) => {
    const { calendarId } = req.body;
    if (!calendarId) {
      return res.status(400).json({ error: "calendarId is required" });
    }
    const shareId = `share-${Date.now()}`;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const link = `${baseUrl}/share/${calendarId}`;
    await auditService.record({
      action: "share_link_create",
      actorId: req.user.id,
      targetId: shareId,
      status: "success",
      details: `Share link created for ${calendarId}`
    });
    return res.status(201).json({ shareId, link });
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
