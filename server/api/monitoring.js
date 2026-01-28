const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createMonitoringRouter({ repositories }) {
  const router = express.Router();

  router.get("/health", asyncHandler(async (req, res) => {
    res.json({ status: "ok", mode: repositories.mode });
  }));

  router.get("/metrics", asyncHandler(async (req, res) => {
    const [userCount, eventCount] = await Promise.all([
      repositories.users.list(),
      repositories.events.list()
    ]);

    res.json({
      users: userCount.length,
      events: eventCount.length,
      uptimeSeconds: Math.round(process.uptime())
    });
  }));

  router.get("/admin/dashboard", requireAuth, asyncHandler(async (req, res) => {
    const [users, orgs, calendars, events] = await Promise.all([
      repositories.users.list(),
      repositories.organizations.list(),
      repositories.calendars.list(),
      repositories.events.list()
    ]);

    res.json({
      totals: {
        users: users.length,
        organizations: orgs.length,
        calendars: calendars.length,
        events: events.length
      },
      generatedAt: new Date().toISOString()
    });
  }));

  return router;
}

module.exports = {
  createMonitoringRouter
};
