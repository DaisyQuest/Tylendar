const {
  getAccessMatrix,
  getAuditHistory,
  getCalendarView,
  getDeveloperPortal,
  getEmbedWidget,
  getEventListView,
  getFeatureFlags,
  getFaultToleranceSnapshots,
  getHomeHighlights,
  getMessageBoard,
  getObservabilityOverview,
  getOperationalAlerts,
  getOrganizationDashboard,
  getRoleManagement,
  getSharingOptions,
  getUserDashboard,
  getUserProfile
} = require("../server/data/sampleData");

describe("sample data providers", () => {
  test("getFeatureFlags merges overrides", () => {
    const flags = getFeatureFlags({ messageBoard: false });

    expect(flags.homePage).toBe(true);
    expect(flags.messageBoard).toBe(false);
  });

  test("getHomeHighlights returns three cards", () => {
    const highlights = getHomeHighlights();

    expect(highlights).toHaveLength(3);
    expect(highlights[0]).toHaveProperty("title");
  });

  test("getUserProfile returns fallback", () => {
    const profile = getUserProfile("missing");

    expect(profile.name).toBe("Avery Chen");
    expect(profile.notifications).toHaveLength(3);
  });

  test("getUserProfile returns a specific profile", () => {
    const profile = getUserProfile("user-2");

    expect(profile.name).toBe("Riley Patel");
  });

  test("getUserDashboard and org dashboard return stats", () => {
    const user = getUserDashboard();
    const org = getOrganizationDashboard();

    expect(user.highlights).toContain("2 upcoming invites");
    expect(org.departments).toContain("Friends");
  });

  test("getCalendarView handles day view and fallback view", () => {
    const defaultView = getCalendarView();
    const day = getCalendarView("day");
    const fallback = getCalendarView("quarter");
    const month = getCalendarView("month");
    const week = getCalendarView("week");

    expect(defaultView.view).toBe("month");
    expect(day.days).toEqual(["Tue"]);
    expect(fallback.view).toBe("quarter");
    expect(fallback.label).toBe("Month");
    expect(month.label).toBe("Month");
    expect(week.featuredEvents[0].range).toBe("week");
  });

  test("getEventListView handles n-month and default", () => {
    const rolling = getEventListView("n-month");
    const fallback = getEventListView("decade");
    const yearly = getEventListView("year");
    const defaultRange = getEventListView();

    expect(rolling.title).toBe("Rolling 3-month");
    expect(rolling.items.length).toBeGreaterThan(0);
    expect(fallback.range).toBe("month");
    expect(yearly.range).toBe("year");
    expect(defaultRange.range).toBe("month");
  });

  test("getAccessMatrix enriches permission counts", () => {
    const matrix = getAccessMatrix();

    expect(matrix[0].permissionCount).toBe(3);
  });

  test("getMessageBoard falls back to default event", () => {
    const board = getMessageBoard("missing");
    const exact = getMessageBoard("evt-200");
    const defaultBoard = getMessageBoard();

    expect(board.eventId).toBe("evt-100");
    expect(board.total).toBeGreaterThan(0);
    expect(exact.eventId).toBe("evt-200");
    expect(defaultBoard.entries.length).toBeGreaterThan(0);
  });

  test("getAuditHistory returns entries", () => {
    const history = getAuditHistory();

    expect(history.length).toBeGreaterThan(0);
    expect(history[0]).toHaveProperty("action");
  });

  test("getEmbedWidget returns embed details", () => {
    const widget = getEmbedWidget("cal-1");
    const fallback = getEmbedWidget("missing");

    expect(widget.calendarId).toBe("cal-1");
    expect(widget.sampleSnippet).toContain("iframe");
    expect(fallback.calendarId).toBe("cal-1");
  });

  test("getSharingOptions returns options by calendar", () => {
    const options = getSharingOptions("cal-1");

    expect(options.length).toBeGreaterThan(0);
  });

  test("getRoleManagement returns roles and assignments", () => {
    const management = getRoleManagement("org-1");

    expect(management.roles.length).toBeGreaterThan(0);
    expect(management.assignments.length).toBeGreaterThan(0);
  });

  test("getFaultToleranceSnapshots returns patterns", () => {
    const snapshots = getFaultToleranceSnapshots();

    expect(snapshots[0]).toHaveProperty("pattern");
  });

  test("getDeveloperPortal returns resources", () => {
    const portal = getDeveloperPortal();

    expect(portal.resources.length).toBeGreaterThan(0);
  });

  test("getObservabilityOverview and alerts return data", () => {
    const overview = getObservabilityOverview();
    const alerts = getOperationalAlerts();

    expect(overview.uptime).toContain("%");
    expect(alerts.length).toBeGreaterThan(0);
  });
});
