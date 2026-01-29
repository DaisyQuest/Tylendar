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
const { createPermissionEvaluator } = require("./permissions/permissionEvaluator");
const { createRepositories } = require("./repositories");
const { createAuditService } = require("./services/auditService");
const { createDeveloperPortalService } = require("./services/developerPortalService");
const { createObservabilityService } = require("./services/observabilityService");
const { createSharingService } = require("./services/sharingService");
function createApp({ featureOverrides, repositories, auditService, sessionStore, envOverrides } = {}) {
  const app = express();
  const env = getEnv(envOverrides);
  const flags = getFeatureFlags({ overrides: featureOverrides, envFlags: env.featureFlags });
  const repos = repositories || createRepositories({ envOverrides });
  const audit = auditService || createAuditService({ auditRepository: repos.audit });
  const observability = createObservabilityService();
  const sharingService = createSharingService();
  const developerPortalService = createDeveloperPortalService();
  const sessions = sessionStore || createSessionStore();
  const permissionEvaluator = createPermissionEvaluator({
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit
  });
  const permissionGuard = createPermissionGuard({
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit,
    permissionEvaluator
  });

  app.use(express.json());
  app.use("/static", express.static(path.join(__dirname, "..", "client")));
  app.use(attachSession({ sessionStore: sessions, userRepository: repos.users }));
  app.use(async (req, res, next) => {
    if (!req.user) {
      req.permissions = [];
      return next();
    }
    req.permissions = await permissionEvaluator.listPermissions({ userId: req.user.id });
    return next();
  });

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
    { route: "/events", file: "events.html" },
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

  app.use("/api/auth", requireFeature("auth", flags), createAuthRouter({
    flags,
    sessionStore: sessions,
    userRepository: repos.users,
    organizationsRepository: repos.organizations,
    calendarsRepository: repos.calendars,
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit
  }));
  app.use("/api/org", requireFeature("org", flags), createOrgRouter({
    organizationsRepository: repos.organizations,
    auditService: audit
  }));
  app.use("/api/calendars", requireFeature("calendar", flags), createCalendarRouter({
    calendarsRepository: repos.calendars,
    eventsRepository: repos.events,
    calendarPermissionsRepository: repos.calendarPermissions,
    shareTokensRepository: repos.shareTokens,
    permissionGuard,
    auditService: audit,
    permissionEvaluator
  }));
  app.use("/api/events", requireFeature("event", flags), createEventRouter({
    eventsRepository: repos.events,
    calendarPermissionsRepository: repos.calendarPermissions,
    permissionGuard,
    auditService: audit,
    permissionEvaluator
  }));
  app.use("/api/permissions", requireFeature("permissions", flags), createPermissionsRouter({
    calendarPermissionsRepository: repos.calendarPermissions,
    auditService: audit
  }));
  app.use("/api/audit", requireFeature("audit", flags), createAuditRouter({
    auditService: audit
  }));
  app.use("/api/sharing", requireFeature("socialSharing", flags), createSharingRouter({
    sharingProvider: sharingService,
    shareTokensRepository: repos.shareTokens,
    auditService: audit
  }));
  app.use("/api/roles", requireFeature("roleManagement", flags), createRolesRouter({
    rolesRepository: repos.roles,
    roleAssignmentsRepository: repos.roleAssignments,
    auditService: audit
  }));
  app.use("/api/developer", requireFeature("developerPortal", flags), createDeveloperRouter({
    developerProvider: developerPortalService
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
