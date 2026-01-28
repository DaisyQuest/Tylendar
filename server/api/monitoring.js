const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const {
  createCircuitBreaker,
  createGracefulError,
  withRetries
} = require("../services/faultTolerance");

function createMonitoringRouter({ repositories, observabilityService }) {
  const router = express.Router();
  const breaker = createCircuitBreaker({ failureThreshold: 2, successThreshold: 1, cooldownMs: 50 });

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

  router.get("/observability", asyncHandler(async (req, res) => {
    res.json(observabilityService.getDashboard());
  }));

  router.get("/alerts", asyncHandler(async (req, res) => {
    res.json({ alerts: observabilityService.getAlerts() });
  }));

  router.get("/fault-tolerance", asyncHandler(async (req, res) => {
    const simulate = req.query.simulate;
    const shouldFail = simulate === "fail";
    const alwaysFail = simulate === "always";
    let attempts = 0;

    try {
      const response = await breaker.execute(() =>
        withRetries(async () => {
          attempts += 1;
          if (alwaysFail) {
            throw new Error("Upstream dependency unavailable");
          }
          if (shouldFail && attempts === 1) {
            throw new Error("Upstream dependency unavailable");
          }
          return { ok: true };
        }, { retries: 1, delayMs: 5 })
      );

      return res.json({
        status: "ok",
        attempts,
        breaker: breaker.getSnapshot(),
        response
      });
    } catch (error) {
      return res.status(503).json({
        status: "degraded",
        attempts,
        breaker: breaker.getSnapshot(),
        fallback: createGracefulError(error)
      });
    }
  }));

  return router;
}

module.exports = {
  createMonitoringRouter
};
