const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createPermissionsRouter({ calendarPermissionsRepository, auditService }) {
  const router = express.Router();

  router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.calendarId) {
      filter.calendarId = req.query.calendarId;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const entries = await calendarPermissionsRepository.list(filter);
    return res.json({ entries });
  }));

  router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const entry = await calendarPermissionsRepository.create(req.body);
    await auditService.record({
      action: "permission_grant",
      actorId: req.user.id,
      targetId: entry.id,
      status: "success",
      details: "Permission granted"
    });
    return res.status(201).json(entry);
  }));

  return router;
}

module.exports = {
  createPermissionsRouter
};
