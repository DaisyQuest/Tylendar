/**
 * @jest-environment jsdom
 */
const {
  fetchJson,
  init,
  renderAccessMatrix,
  renderCalendarView,
  renderDashboard,
  renderEventList,
  renderHighlights,
  renderMessageBoard,
  renderEmbedWidget,
  renderSharingOptions,
  renderAuditHistory,
  renderRoleManagement,
  renderFaultTolerance,
  renderDeveloperPortal,
  renderObservability,
  renderOperationalAlerts,
  renderOrganizationStats,
  renderProfile
} = require("../client/app");

describe("client rendering", () => {
  test("renderProfile includes notifications", () => {
    const html = renderProfile({
      name: "Test User",
      title: "Planner",
      role: "Owner",
      location: "Remote",
      notifications: ["Note"],
      lastActive: "Now"
    });

    expect(html).toContain("Test User");
    expect(html).toContain("Note");
  });

  test("renderHighlights renders items", () => {
    const html = renderHighlights([
      { title: "Title", description: "Description" }
    ]);

    expect(html).toContain("Home Page Highlights");
    expect(html).toContain("Description");
  });

  test("renderDashboard handles missing milestones", () => {
    const html = renderDashboard("User", { focusLabel: "Focus", highlights: ["One"] });

    expect(html).toContain("User");
    expect(html).toContain("Focus");
  });

  test("renderDashboard renders milestones when provided", () => {
    const html = renderDashboard("User", {
      focusLabel: "Focus",
      highlights: ["One"],
      milestones: ["Plan"]
    });

    expect(html).toContain("Plan");
  });

  test("renderDashboard falls back to organization pulse and departments", () => {
    const html = renderDashboard("Org", {
      departments: ["Ops", "People"]
    });

    expect(html).toContain("Community pulse");
    expect(html).toContain("People");
  });

  test("renderDashboard handles missing highlights and departments", () => {
    const html = renderDashboard("Org", {});

    expect(html).toContain("Community pulse");
  });

  test("renderOrganizationStats includes departments", () => {
    const html = renderOrganizationStats({
      name: "Org",
      activeCalendars: 1,
      upcomingEvents: 2,
      complianceScore: "99%",
      departments: ["Ops"]
    });

    expect(html).toContain("Org Dashboard");
    expect(html).toContain("Ops");
  });

  test("renderCalendarView includes summary and grid", () => {
    const html = renderCalendarView({
      view: "month",
      label: "Month",
      summary: "Month view",
      days: ["Mon"],
      featuredEvents: [{ title: "Event", day: "Mon", time: "9" }]
    });

    expect(html).toContain("Month Calendar View");
    expect(html).toContain("Event");
    expect(html).toContain("calendar-grid");
  });

  test("renderCalendarView handles empty days and all-day events", () => {
    const html = renderCalendarView({
      view: "day",
      label: "Day",
      summary: "Day view",
      days: [],
      featuredEvents: [
        { title: "No time", day: "Mon", calendar: "Team", owner: "Taylor" }
      ]
    });

    expect(html).toContain("All day");
    expect(html).toContain("No time");
    expect(html).toContain("Mon");
  });

  test("renderCalendarView falls back when calendar metadata is missing", () => {
    const html = renderCalendarView({
      view: "week",
      label: "Week",
      summary: "Week view",
      days: ["Tue"],
      featuredEvents: [{ title: "Open slot", day: "Tue", time: "10:00 AM" }]
    });

    expect(html).toContain("Shared · Unassigned");
  });

  test("renderCalendarView sorts agenda items by day and time", () => {
    const html = renderCalendarView({
      view: "month",
      label: "Schedule",
      summary: "Agenda order",
      days: ["Mon", "Tue"],
      featuredEvents: [
        { title: "Later", day: "Tue", time: "3:00 PM", calendar: "Cal", owner: "A" },
        { title: "Mid", day: "Mon", time: "1:00 PM", calendar: "Cal", owner: "A" },
        { title: "Early", day: "Mon", time: "8:00 AM", calendar: "Cal", owner: "A" }
      ]
    });

    expect(html.indexOf("Early")).toBeLessThan(html.indexOf("Mid"));
    expect(html.indexOf("Mid")).toBeLessThan(html.indexOf("Later"));
  });

  test("renderCalendarView handles missing featured events list", () => {
    const html = renderCalendarView({
      view: "custom",
      label: "Week",
      summary: "Empty agenda"
    });

    expect(html).toContain("No featured events scheduled yet.");
    expect(html).toContain("calendar-pill--active");
  });

  test("renderCalendarView falls back to default label and summary", () => {
    const html = renderCalendarView({
      days: ["Mon"],
      featuredEvents: []
    });

    expect(html).toContain("Calendar Calendar View");
    expect(html).toContain("Overview of scheduled moments and focus blocks.");
  });

  test("renderCalendarView handles events outside configured days and slots", () => {
    const html = renderCalendarView({
      label: "Month",
      summary: "Expanded",
      days: ["Mon"],
      featuredEvents: [
        { title: "Overflow", day: "Sun", time: "7:00 AM", calendar: "Cal", owner: "A" },
        { title: "Overflow Two", day: "Sun", time: "6:00 AM", calendar: "Cal", owner: "A" }
      ]
    });

    expect(html).toContain("Overflow");
    expect(html).toContain("Sun · 7:00 AM");
  });

  test("renderEventList handles empty items", () => {
    const html = renderEventList({ title: "day", items: [] });

    expect(html).toContain("No events scheduled");
  });

  test("renderEventList renders item days when provided", () => {
    const html = renderEventList({
      title: "week",
      items: [
        { title: "Event A", day: "Mon" },
        { title: "Event B", day: "" }
      ]
    });

    expect(html).toContain("Event A · Mon");
    expect(html).toContain("Event B");
  });

  test("renderAccessMatrix includes permissions", () => {
    const html = renderAccessMatrix([
      { user: "A", calendar: "Cal", permissions: ["View"] }
    ]);

    expect(html).toContain("Access Assignments");
    expect(html).toContain("View");
  });

  test("renderMessageBoard includes messages", () => {
    const html = renderMessageBoard({
      eventId: "evt-1",
      entries: [{ author: "A", message: "Hello", time: "now" }]
    });

    expect(html).toContain("MessageBoard");
    expect(html).toContain("Hello");
  });

  test("renderEmbedWidget includes snippet", () => {
    const html = renderEmbedWidget({
      title: "Embed",
      theme: "Glow",
      visibility: "Public",
      endpoint: "/api",
      sampleSnippet: "<iframe />"
    });

    expect(html).toContain("Embed Widget");
    expect(html).toContain("<iframe");
  });

  test("renderSharingOptions lists channels", () => {
    const html = renderSharingOptions({
      options: [
        { channel: "Social", description: "Share", link: "link" }
      ]
    });

    expect(html).toContain("Social Sharing");
    expect(html).toContain("Share");
  });

  test("renderSharingOptions renders formats when provided", () => {
    const html = renderSharingOptions({
      options: [
        { channel: "Export", description: "Export", formats: ["ICS", "CSV"] }
      ]
    });

    expect(html).toContain("Formats: ICS, CSV");
  });

  test("renderAuditHistory lists entries", () => {
    const html = renderAuditHistory({
      entries: [
        { action: "login", summary: "Logged in", actor: "A", status: "ok", occurredAt: "now" }
      ]
    });

    expect(html).toContain("Audit History");
    expect(html).toContain("Logged in");
  });

  test("renderRoleManagement renders roles and assignments", () => {
    const html = renderRoleManagement({
      roles: [
        { name: "Admin", summary: "Full", permissions: ["All"] }
      ],
      assignments: [
        { user: "A", roleId: "role-1", assignedBy: "B", assignedAt: "today" }
      ]
    });

    expect(html).toContain("Role Management");
    expect(html).toContain("Admin");
    expect(html).toContain("role-1");
  });

  test("renderFaultTolerance lists patterns", () => {
    const html = renderFaultTolerance({
      snapshots: [
        { pattern: "Retries", detail: "ok", status: "Healthy" }
      ]
    });

    expect(html).toContain("Fault Tolerance");
    expect(html).toContain("Retries");
  });

  test("renderDeveloperPortal renders resources", () => {
    const html = renderDeveloperPortal({
      headline: "Developer Hub",
      description: "Docs",
      resources: [{ title: "API", detail: "Ref" }],
      status: "Updated"
    });

    expect(html).toContain("Developer Hub");
    expect(html).toContain("API");
  });

  test("renderObservability shows metrics", () => {
    const html = renderObservability({
      uptime: "99%",
      latencyP95: "1s",
      errorRate: "0%",
      highlights: ["ok"]
    });

    expect(html).toContain("Observability");
    expect(html).toContain("99%");
  });

  test("renderOperationalAlerts shows alerts", () => {
    const html = renderOperationalAlerts({
      alerts: [{ severity: "info", message: "All good", status: "ok" }]
    });

    expect(html).toContain("Operational Alerts");
    expect(html).toContain("All good");
  });
});

describe("client data loading", () => {
  test("fetchJson throws on error response", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false
      })
    );

    await expect(fetchJson("/bad")).rejects.toThrow("Failed to load /bad");
  });

  test("init hydrates dashboard sections", async () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
      <div id="user-dashboard"></div>
      <div id="org-dashboard"></div>
      <div id="calendar-view"></div>
      <div id="event-list"></div>
      <div id="access-matrix"></div>
      <div id="message-board"></div>
      <div id="embed-widget"></div>
      <div id="sharing-options"></div>
      <div id="audit-history"></div>
      <div id="role-management"></div>
      <div id="fault-tolerance"></div>
      <div id="developer-portal"></div>
      <div id="observability"></div>
      <div id="operational-alerts"></div>
    `;

    global.fetch = jest.fn((url) => {
      const responses = {
        "/api/profile/user-1": {
          name: "Test",
          title: "Role",
          role: "Owner",
          location: "Remote",
          notifications: ["Note"],
          lastActive: "Now"
        },
        "/api/home": {
          highlights: [{ title: "Hello", description: "World" }]
        },
        "/api/dashboard/user": {
          focusLabel: "Focus",
          highlights: ["Highlight"],
          milestones: []
        },
        "/api/dashboard/org": {
          name: "Org",
          activeCalendars: 1,
          upcomingEvents: 2,
          complianceScore: "99%",
          departments: ["Ops"]
        },
        "/api/calendar/view?view=month": {
          label: "Month",
          summary: "Summary",
          days: ["Mon"],
          featuredEvents: []
        },
        "/api/events/list?range=month": {
          title: "month",
          items: []
        },
        "/api/access": {
          entries: [{ user: "A", calendar: "Cal", permissions: ["View"] }]
        },
        "/api/events/evt-100/comments": {
          eventId: "evt-100",
          entries: [{ author: "A", message: "Hi", time: "now" }]
        },
        "/api/embed/widget?calendarId=cal-1": {
          title: "Embed",
          theme: "Glow",
          visibility: "Public",
          endpoint: "/api",
          sampleSnippet: "<iframe />"
        },
        "/api/sharing/preview?calendarId=cal-1": {
          options: [{ channel: "Social", description: "Share", link: "link" }]
        },
        "/api/audit/history-snapshot": {
          entries: [{ action: "login", summary: "Logged in", actor: "A", status: "ok", occurredAt: "now" }]
        },
        "/api/roles/summary?orgId=org-1": {
          roles: [{ name: "Admin", summary: "Full", permissions: ["All"] }],
          assignments: [{ user: "A", roleId: "role-1", assignedBy: "B", assignedAt: "today" }]
        },
        "/api/fault-tolerance/snapshot": {
          snapshots: [{ pattern: "Retries", detail: "ok", status: "Healthy" }]
        },
        "/api/developer/portal": {
          headline: "Dev",
          description: "Docs",
          resources: [{ title: "API", detail: "Ref" }],
          status: "Updated"
        },
        "/api/monitoring/observability": {
          uptime: "99%",
          latencyP95: "1s",
          errorRate: "0%",
          highlights: ["ok"]
        },
        "/api/monitoring/alerts": {
          alerts: [{ severity: "info", message: "All good", status: "ok" }]
        }
      };

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses[url])
      });
    });

    await init();

    expect(document.getElementById("profile-card").innerHTML).toContain("Test");
    expect(document.getElementById("message-board").innerHTML).toContain("evt-100");
    expect(document.getElementById("embed-widget").innerHTML).toContain("Embed");
  });
});
