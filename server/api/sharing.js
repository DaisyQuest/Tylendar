const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createSharingRouter({ sharingProvider, auditService }) {
  const router = express.Router();

  router.get("/preview", asyncHandler(async (req, res) => {
    const calendarId = req.query.calendarId || "cal-1";
    const options = sharingProvider.getSharingOptions(calendarId);
    return res.json({ calendarId, options });
  }));

  router.post("/link", requireAuth, asyncHandler(async (req, res) => {
    const { calendarId } = req.body;
    const shareId = `share-${Date.now()}`;
    const link = `https://tylendar.app/share/${calendarId || "cal-1"}`;
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
    await auditService.record({
      action: "calendar_export",
      actorId: req.user.id,
      targetId: calendarId || "cal-1",
      status: "success",
      details: `Exported calendar in ${format || "ICS"} format`
    });
    return res.status(201).json({
      calendarId: calendarId || "cal-1",
      format: format || "ICS",
      status: "ready",
      downloadUrl: `https://tylendar.app/export/${calendarId || "cal-1"}.${(format || "ics").toLowerCase()}`
    });
  }));

  return router;
}

module.exports = {
  createSharingRouter
};
