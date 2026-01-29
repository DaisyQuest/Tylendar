const express = require("express");
const path = require("path");

const { createAuthRouter } = require("./api/auth");
const { createAuditRouter } = require("./api/audit");
const { createCalendarRouter } = require("./api/calendar");
const { createEventRouter } = require("./api/event");
const { createDeveloperRouter } = require("./api/developer");
const { createMonitoringRouter } = require("./api/monitoring");
const { createOrgRouter } = require("./api/org");
const { createPermissionsRouter } = require("./api/permissions");
const { createRolesRouter } = require("./api/roles");
const { createSharingRouter } = require("./api/sharing");
const { getFeatureFlags } = require("./config/featureFlags");
const { getEnv } = require("./config/env");
const { createSessionStore } = require("./auth/sessionStore");
const { attachSession } = require("./middleware/auth");
const { requireFeature } = require("./middleware/featureFlags");
const { createPermissionGuard } = require("./middleware/permissions");
const { createRepositories } = require("./repositories");
const { createAuditService } = require("./services/auditService");
const { createObservabilityService } = require("./services/observabilityService");
const {
  getAccessMatrix,
  getAuditHistory,
  getCalendarView,
  getDeveloperPortal,
  getEmbedWidget,
  getEventListView,
  getHomeHighlights,
  getFaultToleranceSnapshots,
  getMessageBoard,
  getOrganizationDashboard,
  getRoleManagement,
  getSharingOptions,
  getUserDashboard,
  getUserProfile
} = require("./data/sampleData");

function createApp({ featureOverrides, repositories, auditService, sessionStore, envOverrides } = {}) {
  const app = express();
  const env = getEnv(envOverrides);
  const flags = getFeatureFlags({ overrides: featureOverrides, envFlags: env.featureFlags });
  const repos = repositories || createRepositories({ envOverrides });
  const audit = auditService || createAuditService({ auditRepository: repos.audit });
  const observability = createObservabilityService();
  const sessions = sessionStore || createSessionStore();
  const permissionGuard = createPermissionGuard({
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit
  });

  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "client")));
  app.use(attachSession({ sessionStore: sessions, userRepository: repos.users }));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
  });

  app.get("/details", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "details.html"));
  });

  const pageRoutes = [
    { route: "/profiles", file: "profiles.html" },
    { route: "/dashboards", file: "dashboards.html" },
    { route: "/calendar", file: "calendar.html" },
    { route: "/access", file: "access.html" },
    { route: "/messageboard", file: "messageboard.html" },
    { route: "/embed", file: "embed.html" },
    { route: "/sharing", file: "sharing.html" },
    { route: "/audit", file: "audit.html" },
    { route: "/roles", file: "roles.html" },
    { route: "/resilience", file: "resilience.html" },
    { route: "/developer", file: "developer.html" },
    { route: "/observability", file: "observability.html" }
  ];

  pageRoutes.forEach((page) => {
    app.get(page.route, (req, res) => {
      res.sendFile(path.join(__dirname, "..", "client", page.file));
    });
  });

  app.get("/api/flags", (req, res) => {
    res.json(flags);
  });

  app.get("/api/home", (req, res) => {
    res.json({
      highlights: getHomeHighlights()
    });
  });

  app.get("/api/profile/:userId", (req, res) => {
    res.json(getUserProfile(req.params.userId));
  });

  app.get("/api/dashboard/user", (req, res) => {
    res.json(getUserDashboard());
  });

  app.get("/api/dashboard/org", (req, res) => {
    res.json(getOrganizationDashboard());
  });

  app.get("/api/calendar/view", (req, res) => {
    res.json(getCalendarView(req.query.view));
  });

  app.get("/api/events/list", (req, res) => {
    res.json(getEventListView(req.query.range));
  });

  app.get("/api/access", (req, res) => {
    res.json({
      entries: getAccessMatrix()
    });
  });

  app.get("/api/events/:eventId/comments", (req, res) => {
    res.json(getMessageBoard(req.params.eventId));
  });

  app.get("/api/audit/history-snapshot", requireFeature("auditHistory", flags), (req, res) => {
    res.json({ entries: getAuditHistory() });
  });

  app.get("/api/embed/widget", requireFeature("embedWidget", flags), (req, res) => {
    res.json(getEmbedWidget(req.query.calendarId));
  });

  app.get("/api/roles/summary", requireFeature("roleManagement", flags), (req, res) => {
    res.json(getRoleManagement(req.query.orgId));
  });

  app.get("/api/fault-tolerance/snapshot", requireFeature("faultTolerance", flags), (req, res) => {
    res.json({ snapshots: getFaultToleranceSnapshots() });
  });

  app.use("/api/auth", requireFeature("auth", flags), createAuthRouter({
    flags,
    sessionStore: sessions,
    userRepository: repos.users,
    organizationsRepository: repos.organizations,
    auditService: audit
  }));
  app.use("/api/org", requireFeature("org", flags), createOrgRouter({
    organizationsRepository: repos.organizations,
    auditService: audit
  }));
  app.use("/api/calendars", requireFeature("calendar", flags), createCalendarRouter({
    calendarsRepository: repos.calendars,
    eventsRepository: repos.events,
    permissionGuard,
    auditService: audit
  }));
  app.use("/api/events", requireFeature("event", flags), createEventRouter({
    eventsRepository: repos.events,
    permissionGuard,
    auditService: audit
  }));
  app.use("/api/permissions", requireFeature("permissions", flags), createPermissionsRouter({
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit
  }));
  app.use("/api/audit", requireFeature("audit", flags), createAuditRouter({
    auditService: audit
  }));
  app.use("/api/sharing", requireFeature("socialSharing", flags), createSharingRouter({
    sharingProvider: { getSharingOptions },
    auditService: audit
  }));
  app.use("/api/roles", requireFeature("roleManagement", flags), createRolesRouter({
    rolesRepository: repos.roles,
    roleAssignmentsRepository: repos.roleAssignments,
    auditService: audit
  }));
  app.use("/api/developer", requireFeature("developerPortal", flags), createDeveloperRouter({
    developerProvider: { getDeveloperPortal }
  }));
  app.use("/api/monitoring", requireFeature("monitoring", flags), createMonitoringRouter({
    repositories: repos,
    observabilityService: observability
  }));

  app.use((err, req, res, next) => {
    if (err && err.status) {
      return res.status(err.status).json({ error: err.message, details: err.details || [] });
    }
    return next(err);
  });

  return app;
}

module.exports = { createApp };
