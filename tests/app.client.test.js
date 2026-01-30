/**
 * @jest-environment jsdom
 */
const {
  buildAuthPayload,
  clearAuthState,
  fetchJson,
  init,
  initAuthUI,
  postJson,
  readAuthState,
  resolveAuthState,
  renderAccessMatrix,
  renderAuthStatus,
  renderCalendarView,
  renderDashboard,
  renderEventList,
  renderEventManagementList,
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
  renderProfile,
  renderProfileManagement,
  setFormFeedback,
  buildEventPayload,
  createEventId,
  parseEventDateTime,
  refreshEventList,
  setEventListFeedback,
  updateAuthStatus,
  writeAuthState,
  getSelectedPermissions,
  getAccountHighlights,
  initCalendarControls,
  initEventCreation,
  initEventManagement,
  initEventModal,
  initSharingControls,
  initProfileManagement,
  loadCalendarOverview,
  redirectToCalendar,
  updateAccountSections
} = require("../client/app");

describe("client rendering", () => {
  test("renderProfile shows empty state when missing", () => {
    const html = renderProfile(null);

    expect(html).toContain("Sign in to view your profile details");
  });

  test("renderProfile includes account details", () => {
    const html = renderProfile({
      name: "Test User",
      email: "user@example.com",
      organizationId: "org-1",
      role: "admin"
    });

    expect(html).toContain("Test User");
    expect(html).toContain("Email");
    expect(html).toContain("org-1");
  });

  test("renderProfile falls back to Account label when name is missing", () => {
    const html = renderProfile({
      email: "user@example.com"
    });

    expect(html).toContain("Account");
  });

  test("renderProfile falls back to default detail values", () => {
    const html = renderProfile({
      name: "Fallback User",
      email: "",
      organizationId: "",
      role: ""
    });

    expect(html).toContain("Email: —");
    expect(html).toContain("Organization: None");
    expect(html).toContain("Role: member");
  });

  test("renderProfileManagement shows empty state when missing", () => {
    const html = renderProfileManagement(null);

    expect(html).toContain("Sign in to update your account details");
  });

  test("renderProfileManagement renders an editable form", () => {
    const html = renderProfileManagement({
      name: "Profile User",
      email: "profile@example.com",
      organizationId: "org-9",
      role: "admin"
    });

    expect(html).toContain("Manage profile");
    expect(html).toContain('name="name"');
    expect(html).toContain('value="Profile User"');
    expect(html).toContain('value="profile@example.com"');
    expect(html).toContain('value="org-9"');
    expect(html).toContain('value="admin"');
  });

  test("renderProfileManagement falls back to empty values", () => {
    const html = renderProfileManagement({
      name: "",
      email: "",
      organizationId: "",
      role: ""
    });

    expect(html).toContain('value=""');
  });

  test("getAccountHighlights builds defaults when values are missing", () => {
    const highlights = getAccountHighlights({ email: "", organizationId: "", role: "" });

    expect(highlights).toEqual([
      { title: "Email", description: "—" },
      { title: "Organization", description: "None" },
      { title: "Role", description: "member" }
    ]);
  });

  test("getAccountHighlights defaults when user is missing", () => {
    const highlights = getAccountHighlights();

    expect(highlights).toEqual([
      { title: "Email", description: "—" },
      { title: "Organization", description: "None" },
      { title: "Role", description: "member" }
    ]);
  });

  test("renderAuthStatus returns signed-out label", () => {
    const html = renderAuthStatus(null);

    expect(html).toContain("Not signed in");
    expect(html).not.toContain("Log out");
  });

  test("renderAuthStatus returns signed-in label and logout", () => {
    const html = renderAuthStatus({ user: { name: "Avery" } });

    expect(html).toContain("Signed in as Avery");
    expect(html).toContain("Log out");
  });

  test("renderAuthStatus falls back to email and account label", () => {
    const htmlWithEmail = renderAuthStatus({ user: { email: "user@example.com" } });
    const htmlWithFallback = renderAuthStatus({ user: {} });

    expect(htmlWithEmail).toContain("Signed in as user@example.com");
    expect(htmlWithFallback).toContain("Signed in as Account");
  });

  test("renderHighlights renders empty state without items", () => {
    const html = renderHighlights([]);

    expect(html).toContain("No account details available yet");
  });

  test("renderHighlights uses defaults when highlights are missing", () => {
    const html = renderHighlights();

    expect(html).toContain("No account details available yet");
  });

  test("renderHighlights renders account summary items", () => {
    const html = renderHighlights([
      { title: "Email", description: "user@example.com" }
    ]);

    expect(html).toContain("Account Summary");
    expect(html).toContain("user@example.com");
  });

  test("renderDashboard renders empty state when no items", () => {
    const html = renderDashboard("User Dashboard", { items: [] });

    expect(html).toContain("No dashboard data is available yet");
  });

  test("renderDashboard handles missing summary payload", () => {
    const html = renderDashboard("User Dashboard");

    expect(html).toContain("No dashboard data is available yet");
  });

  test("renderDashboard renders provided items", () => {
    const html = renderDashboard("User Dashboard", { items: ["One"] });

    expect(html).toContain("User Dashboard");
    expect(html).toContain("One");
  });

  test("renderDashboard uses highlights when items are missing", () => {
    const html = renderDashboard("User Dashboard", { highlights: ["Note"] });

    expect(html).toContain("Note");
  });

  test("renderDashboard uses departments when highlights are missing", () => {
    const html = renderDashboard("Org Dashboard", { departments: ["Ops"] });

    expect(html).toContain("Ops");
  });

  test("renderOrganizationStats handles missing organization", () => {
    const html = renderOrganizationStats(null);

    expect(html).toContain("No organization data is available yet");
  });

  test("renderOrganizationStats includes stats", () => {
    const html = renderOrganizationStats({
      name: "Org",
      activeCalendars: 1,
      upcomingEvents: 2,
      memberCount: 5
    });

    expect(html).toContain("Org Dashboard");
    expect(html).toContain("Active calendars");
  });

  test("renderOrganizationStats uses defaults when counts are missing", () => {
    const html = renderOrganizationStats({
      name: "Org"
    });

    expect(html).toContain("Active calendars: 0");
    expect(html).toContain("Upcoming events: 0");
    expect(html).toContain("Members: 0");
  });

  test("renderCalendarView shows empty message when no events", () => {
    const html = renderCalendarView({ label: "Calendar", summary: "Summary", events: [] });

    expect(html).toContain("No events scheduled yet");
  });

  test("renderCalendarView uses defaults when calendar is missing", () => {
    const html = renderCalendarView();

    expect(html).toContain("Calendar");
    expect(html).toContain("No calendar data available.");
  });

  test("renderCalendarView falls back to default label and summary", () => {
    const html = renderCalendarView({
      label: "",
      summary: "",
      events: [{ title: "Event", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    expect(html).toContain("Calendar");
    expect(html).toContain("No calendar data available.");
  });

  test("renderCalendarView handles invalid reference dates", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "not-a-date",
      events: []
    });

    expect(html).toContain("Calendar");
  });

  test("renderCalendarView lists events when provided", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      events: [
        { title: "Event A", startsAt: "2024-01-10T10:00:00.000Z" },
        { title: "Event B", startsAt: "2024-01-12T08:00:00.000Z" }
      ]
    });

    expect(html).toContain("Event A");
    expect(html).toContain("Event B");
    expect(html).toContain("Jan");
  });

  test("renderCalendarView uses untitled label when title is missing", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      events: [{ startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    expect(html).toContain("Untitled");
  });

  test("renderCalendarView shows overflow counts for busy days", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      events: [
        { title: "Event A", startsAt: "2024-01-10T08:00:00.000Z" },
        { title: "Event B", startsAt: "2024-01-10T09:00:00.000Z" },
        { title: "Event C", startsAt: "2024-01-10T10:00:00.000Z" },
        { title: "Event D", startsAt: "2024-01-10T11:00:00.000Z" }
      ]
    });

    expect(html).toContain("+1 more");
  });

  test("renderCalendarView uses startsAt when day is missing", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ title: "Event", startsAt: "2024-01-01T09:00:00.000Z" }]
    });

    expect(html).toContain("Jan");
  });

  test("renderCalendarView falls back to unscheduled label", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ title: "Event" }]
    });

    expect(html).toContain("Unscheduled");
  });

  test("renderCalendarView falls back to featured events", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      featuredEvents: [{ title: "Featured" }]
    });

    expect(html).toContain("Featured");
  });

  test("renderCalendarView accepts unscheduled events", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-15T00:00:00.000Z",
      events: [
        { title: "Scheduled", startsAt: "2024-01-20T10:00:00.000Z" },
        { title: "Unscheduled" }
      ]
    });

    expect(html).toContain("Scheduled");
    expect(html).toContain("Summary");
  });

  test("renderEventList handles empty items", () => {
    const html = renderEventList({ title: "Events", items: [] });

    expect(html).toContain("No events scheduled");
  });

  test("renderEventList uses defaults when view is missing", () => {
    const html = renderEventList();

    expect(html).toContain("Events");
    expect(html).toContain("No events scheduled");
  });

  test("renderEventList renders item days when provided", () => {
    const html = renderEventList({
      title: "Events",
      items: [
        { title: "Event A", day: "Mon" },
        { title: "Event B", day: "" }
      ]
    });

    expect(html).toContain("Event A · Mon");
    expect(html).toContain("Event B · Unscheduled");
  });

  test("renderEventList uses unscheduled label for invalid dates", () => {
    const html = renderEventList({
      title: "Events",
      items: [{ title: "Event C", startsAt: "not-a-date" }]
    });

    expect(html).toContain("Event C · Unscheduled");
  });

  test("renderAccessMatrix handles empty and entries", () => {
    const emptyHtml = renderAccessMatrix([]);
    const defaultHtml = renderAccessMatrix();
    const nullHtml = renderAccessMatrix(null);
    const filledHtml = renderAccessMatrix([
      {
        user: "A",
        calendar: "Cal",
        permissions: ["View Calendar", "Manage Calendar"],
        status: "Active",
        lastUpdated: "Today"
      }
    ]);

    expect(emptyHtml).toContain("Permission control center");
    expect(emptyHtml).toContain("No one else has access");
    expect(defaultHtml).toContain("No one else has access");
    expect(nullHtml).toContain("No one else has access");
    expect(filledHtml).toContain("Permission coverage");
    expect(filledHtml).toContain("Manager");
    expect(filledHtml).toContain("Manage Calendar");
    expect(filledHtml).toContain("Active");
  });

  test("renderAccessMatrix handles missing permissions and timestamps", () => {
    const html = renderAccessMatrix([
      {
        user: "A",
        calendar: "Cal",
        permissions: undefined,
        updatedAt: ""
      }
    ]);

    expect(html).toContain("No permissions assigned");
    expect(html).toContain("Not updated yet");
  });

  test("renderAccessMatrix renders pending requests, notes, and status variants", () => {
    const html = renderAccessMatrix({
      entries: [
        {
          user: "B",
          calendar: "Ops",
          permissions: ["Comment on Calendar"],
          expiresAt: "2024-05-01"
        },
        {
          user: "C",
          calendar: "Ops",
          permissions: ["View Calendar - Times Only"],
          status: "Paused"
        },
        {
          user: "D",
          calendar: "Ops",
          permissions: ["View Calendar"],
          updatedAt: "Yesterday"
        },
        {
          user: "E",
          calendar: "Ops",
          permissions: ["Add to Calendar"]
        },
        {
          user: "F",
          calendar: "",
          permissions: []
        }
      ],
      pendingRequests: [
        {
          user: "Dana",
          calendar: "Ops",
          permissions: ["View Calendar"],
          requestedAt: "Today"
        },
        {
          user: "Evan",
          calendar: "Ops",
          requestedAt: "Yesterday"
        }
      ],
      defaults: {
        visibility: "Org-only visibility",
        approvals: "Manager approval required",
        notifications: "Weekly digests"
      },
      notes: ["Review external access quarterly."]
    });

    expect(html).toContain("Pending access requests");
    expect(html).toContain("Requested View Calendar");
    expect(html).toContain("Requested access");
    expect(html).toContain("Org-only visibility");
    expect(html).toContain("Review external access quarterly.");
    expect(html).toContain("Commenter");
    expect(html).toContain("Time-only viewer");
    expect(html).toContain("Viewer");
    expect(html).toContain("Contributor");
    expect(html).toContain("No access");
    expect(html).toContain("Expiring soon");
    expect(html).toContain("Paused");
    expect(html).toContain("Active");
  });

  test("renderMessageBoard handles empty and messages", () => {
    const emptyHtml = renderMessageBoard({ eventId: "evt", entries: [] });
    const defaultHtml = renderMessageBoard();
    const filledHtml = renderMessageBoard({
      eventId: "evt-1",
      entries: [{ author: "A", message: "Hello", time: "now" }]
    });

    expect(emptyHtml).toContain("No event comments available");
    expect(defaultHtml).toContain("No event comments available");
    expect(filledHtml).toContain("Hello");
  });

  test("renderEmbedWidget handles empty and snippet", () => {
    const emptyHtml = renderEmbedWidget(null);
    const filledHtml = renderEmbedWidget({
      title: "Embed",
      sampleSnippet: "<iframe />"
    });
    const fallbackHtml = renderEmbedWidget({
      title: "Embed"
    });

    expect(emptyHtml).toContain("No public embed is available");
    expect(filledHtml).toContain("<iframe");
    expect(fallbackHtml).toContain("Embed snippet unavailable");
  });

  test("renderEmbedWidget uses default title when missing", () => {
    const html = renderEmbedWidget({ sampleSnippet: "<iframe />" });

    expect(html).toContain("Embed");
  });

  test("renderSharingOptions handles empty and formats", () => {
    const emptyHtml = renderSharingOptions({ options: [] });
    const defaultHtml = renderSharingOptions();
    const filledHtml = renderSharingOptions({
      options: [
        { channel: "Export", description: "Export", formats: ["ICS", "CSV"] }
      ]
    });
    const linkHtml = renderSharingOptions({
      options: [
        { channel: "Share link", description: "Share", link: "https://example.com" }
      ]
    });
    const permissionHtml = renderSharingOptions({
      options: [
        { channel: "Share link", description: "Share", permissions: ["View Calendar"] }
      ]
    });
    const noExtrasHtml = renderSharingOptions({
      options: [
        { channel: "Internal", description: "Internal use only" }
      ]
    });

    expect(emptyHtml).toContain("No sharing options configured");
    expect(defaultHtml).toContain("No sharing options configured");
    expect(filledHtml).toContain("Formats: ICS, CSV");
    expect(linkHtml).toContain("https://example.com");
    expect(permissionHtml).toContain("Permissions: View Calendar");
    expect(noExtrasHtml).toContain("Internal use only");
  });

  test("renderSharingOptions handles missing descriptions", () => {
    const html = renderSharingOptions({
      options: [{ channel: "Share link", formats: ["ICS"] }]
    });

    expect(html).toContain("Share link");
    expect(html).toContain("Formats: ICS");
  });

  test("renderAuditHistory handles empty and entries", () => {
    const emptyHtml = renderAuditHistory({ entries: [] });
    const defaultHtml = renderAuditHistory();
    const filledHtml = renderAuditHistory({
      entries: [
        { action: "login", summary: "Logged in", actor: "A", status: "ok", occurredAt: "now" }
      ]
    });

    expect(emptyHtml).toContain("No audit activity recorded");
    expect(defaultHtml).toContain("No audit activity recorded");
    expect(filledHtml).toContain("Logged in");
  });

  test("renderAuditHistory uses action when summary is missing", () => {
    const html = renderAuditHistory({
      entries: [{ action: "login" }]
    });

    expect(html).toContain("login");
  });

  test("renderRoleManagement handles empty and content", () => {
    const emptyHtml = renderRoleManagement({ roles: [], assignments: [] });
    const defaultHtml = renderRoleManagement();
    const filledHtml = renderRoleManagement({
      roles: [{ name: "Admin", summary: "Full", permissions: ["All"] }],
      assignments: [{ user: "A", roleId: "role-1", assignedBy: "B", assignedAt: "today" }]
    });
    const minimalHtml = renderRoleManagement({
      roles: [{ name: "Viewer" }],
      assignments: []
    });

    expect(emptyHtml).toContain("No roles or assignments configured");
    expect(defaultHtml).toContain("No roles or assignments configured");
    expect(filledHtml).toContain("Admin");
    expect(filledHtml).toContain("role-1");
    expect(minimalHtml).toContain("Viewer");
  });

  test("renderFaultTolerance handles empty and entries", () => {
    const emptyHtml = renderFaultTolerance({ snapshots: [] });
    const defaultHtml = renderFaultTolerance();
    const filledHtml = renderFaultTolerance({
      snapshots: [{ pattern: "Retries", detail: "ok", status: "Healthy" }]
    });

    expect(emptyHtml).toContain("No fault-tolerance reports available");
    expect(defaultHtml).toContain("No fault-tolerance reports available");
    expect(filledHtml).toContain("Retries");
  });

  test("renderDeveloperPortal handles empty and resources", () => {
    const emptyHtml = renderDeveloperPortal({
      headline: "Developer Portal",
      description: "Docs",
      resources: []
    });
    const defaultHtml = renderDeveloperPortal();
    const missingHeadlineHtml = renderDeveloperPortal({
      headline: "",
      description: "",
      resources: []
    });
    const fallbackHtml = renderDeveloperPortal({
      headline: "Developer Portal",
      description: "",
      resources: []
    });
    const filledHtml = renderDeveloperPortal({
      headline: "Developer Portal",
      description: "Docs",
      resources: [{ title: "API", detail: "Ref" }],
      status: "Updated"
    });
    const noStatusHtml = renderDeveloperPortal({
      headline: "Developer Portal",
      description: "Docs",
      resources: [{ title: "API", detail: "Ref" }],
      status: ""
    });

    expect(emptyHtml).toContain("Docs");
    expect(defaultHtml).toContain("No developer resources are available");
    expect(missingHeadlineHtml).toContain("Developer Portal");
    expect(fallbackHtml).toContain("No developer resources are available");
    expect(filledHtml).toContain("API");
    expect(noStatusHtml).toContain("API");
  });

  test("renderObservability shows metrics and highlights", () => {
    const htmlWithHighlights = renderObservability({
      uptimeSeconds: 42,
      latencyP95Ms: 100,
      errorRate: 0,
      highlights: ["ok"],
      stats: {
        users: 3,
        events: 12,
        uptimeSeconds: 55
      }
    });
    const htmlNoHighlights = renderObservability({
      uptimeSeconds: 0,
      latencyP95Ms: null,
      errorRate: null,
      highlights: [],
      stats: {}
    });
    const htmlDefault = renderObservability();
    const htmlUndefinedHighlights = renderObservability({ uptimeSeconds: 5 });

    expect(htmlWithHighlights).toContain("42");
    expect(htmlWithHighlights).toContain("ok");
    expect(htmlWithHighlights).toContain("Users: 3");
    expect(htmlWithHighlights).toContain("Events: 12");
    expect(htmlNoHighlights).toContain("N/A");
    expect(htmlNoHighlights).toContain("Service statistics");
    expect(htmlDefault).toContain("Uptime (seconds)");
    expect(htmlUndefinedHighlights).toContain("Uptime (seconds): 5");
  });

  test("renderOperationalAlerts shows empty and alerts", () => {
    const emptyHtml = renderOperationalAlerts({ alerts: [] });
    const defaultHtml = renderOperationalAlerts();
    const filledHtml = renderOperationalAlerts({
      alerts: [{ severity: "info", message: "All good", status: "ok" }]
    });

    expect(emptyHtml).toContain("No alerts reported");
    expect(defaultHtml).toContain("No alerts reported");
    expect(filledHtml).toContain("All good");
  });
});

describe("profile management controls", () => {
  beforeEach(() => {
    window.localStorage.removeItem("tylendar-auth");
    document.body.innerHTML = "";
    global.fetch = undefined;
  });

  test("initProfileManagement does nothing without a form", async () => {
    await expect(initProfileManagement()).resolves.toBeUndefined();
  });

  test("initProfileManagement requires authentication", async () => {
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Test" />
          <input name="email" value="user@example.com" />
          <input name="organizationId" value="" />
          <input name="role" value="member" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    await initProfileManagement();

    const form = document.querySelector("[data-profile-form]");
    form.dispatchEvent(new Event("submit"));

    const feedback = form.querySelector("[data-form-feedback]");
    expect(feedback.textContent).toContain("Sign in to update your profile");
  });

  test("initProfileManagement validates required fields", async () => {
    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { name: "Test", email: "user@example.com" } })
    );
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="" />
          <input name="email" value="" />
          <input name="organizationId" value="" />
          <input name="role" value="member" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    await initProfileManagement();

    const form = document.querySelector("[data-profile-form]");
    form.dispatchEvent(new Event("submit"));

    const feedback = form.querySelector("[data-form-feedback]");
    expect(feedback.textContent).toContain("Name and email are required");
  });

  test("initProfileManagement updates profile state on success", async () => {
    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { name: "Test", email: "user@example.com" } })
    );
    document.body.innerHTML = `
      <span data-auth-status></span>
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Updated" />
          <input name="email" value="updated@example.com" />
          <input name="organizationId" value="org-2" />
          <input name="role" value="admin" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              name: "Updated",
              email: "updated@example.com",
              organizationId: "org-2",
              role: "admin"
            }
          })
      })
    );

    await initProfileManagement();

    const form = document.querySelector("[data-profile-form]");
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    const stored = JSON.parse(window.localStorage.getItem("tylendar-auth"));
    expect(stored.user.name).toBe("Updated");
    expect(document.getElementById("profile-card").innerHTML).toContain("Updated");

    global.fetch.mockRestore();
  });

  test("initProfileManagement surfaces update errors", async () => {
    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { name: "Test", email: "user@example.com" } })
    );
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Updated" />
          <input name="email" value="updated@example.com" />
          <input name="organizationId" value="" />
          <input name="role" value="admin" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Profile update failed" })
      })
    );

    await initProfileManagement();

    const form = document.querySelector("[data-profile-form]");
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    const feedback = form.querySelector("[data-form-feedback]");
    expect(feedback.textContent).toContain("Profile update failed");

    global.fetch.mockRestore();
  });

  test("initProfileManagement re-renders when form is missing", async () => {
    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { name: "Test", email: "user@example.com" } })
    );
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Updated" />
          <input name="email" value="updated@example.com" />
          <input name="organizationId" value="" />
          <input name="role" value="admin" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    global.fetch = jest.fn(() => {
      const container = document.getElementById("profile-management");
      container.innerHTML = "";
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              name: "Updated",
              email: "updated@example.com",
              organizationId: "org-2",
              role: "admin"
            }
          })
      });
    });

    await initProfileManagement();

    const form = document.querySelector("[data-profile-form]");
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("profile-management").innerHTML).toContain("Manage profile");

    global.fetch.mockRestore();
  });

  test("initProfileManagement recreates management markup when form is removed", async () => {
    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { name: "Test", email: "user@example.com" } })
    );
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Updated" />
          <input name="email" value="updated@example.com" />
          <input name="organizationId" value="" />
          <input name="role" value="admin" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ user: { name: "Updated", email: "updated@example.com" } })
      })
    );

    await initProfileManagement();
    const form = document.querySelector("[data-profile-form]");
    const container = document.getElementById("profile-management");
    container.id = "profile-management-removed";
    container.innerHTML = "";
    form.dispatchEvent(new Event("submit"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("profile-management-removed").innerHTML).toContain("Manage profile");

    global.fetch.mockRestore();
  });
});

describe("calendar and sharing controls", () => {
  beforeEach(() => {
    window.localStorage.removeItem("tylendar-auth");
    document.body.innerHTML = "";
  });

  test("setFormFeedback updates message and tone", () => {
    document.body.innerHTML = `
      <form id="test-form">
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;
    const form = document.getElementById("test-form");

    setFormFeedback(form, "Saved", "success");

    const feedback = form.querySelector("[data-form-feedback]");
    expect(feedback.textContent).toContain("Saved");
    expect(feedback.dataset.tone).toBe("success");
    expect(feedback.classList.contains("is-hidden")).toBe(false);
  });

  test("setFormFeedback is resilient without form or feedback", () => {
    expect(() => setFormFeedback(null, "Missing")).not.toThrow();

    document.body.innerHTML = `<form id="missing-feedback"></form>`;
    const form = document.getElementById("missing-feedback");
    expect(() => setFormFeedback(form, "Missing")).not.toThrow();
  });

  test("getSelectedPermissions returns checked values", () => {
    document.body.innerHTML = `
      <form id="perm-form">
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <input type="checkbox" name="permissions" value="Manage Calendar" />
      </form>
    `;
    const form = document.getElementById("perm-form");
    expect(getSelectedPermissions(form)).toEqual(["View Calendar"]);
  });

  test("getSelectedPermissions returns empty array when form is missing", () => {
    expect(getSelectedPermissions()).toEqual([]);
  });

  test("initCalendarControls warns when not signed in", async () => {
    document.body.innerHTML = `
      <form data-calendar-create>
        <input name="name" value="My Calendar" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    initCalendarControls();
    const form = document.querySelector("[data-calendar-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Sign in to create a calendar");
  });

  test("initCalendarControls validates missing calendar name", async () => {
    document.body.innerHTML = `
      <form data-calendar-create>
        <input name="name" value="" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initCalendarControls();
    const form = document.querySelector("[data-calendar-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Calendar name is required");
  });

  test("initCalendarControls handles calendar creation", async () => {
    document.body.innerHTML = `
      <form data-calendar-create>
        <input name="name" value="My Calendar" />
        <input name="ownerId" value="" />
        <select name="ownerType">
          <option value="user" selected>User</option>
        </select>
        <input type="checkbox" name="isPublic" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
        <button type="submit">Create</button>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: "cal-1", name: "My Calendar" })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-calendar-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/calendars",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Created calendar");
  });

  test("initCalendarControls reports calendar creation failures", async () => {
    document.body.innerHTML = `
      <form data-calendar-create>
        <input name="name" value="My Calendar" />
        <input name="ownerId" value="user-1" />
        <select name="ownerType">
          <option value="user" selected>User</option>
        </select>
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Create failed" })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-calendar-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Create failed");

    global.fetch.mockRestore();
  });

  test("initCalendarControls handles permission assignment errors", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <input name="calendarId" value="" />
        <input name="userId" value="" />
        <input type="checkbox" name="permissions" value="View Calendar" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
        <button type="submit">Assign</button>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Calendar ID and User ID");
  });

  test("initCalendarControls requires authentication for permissions", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <input name="calendarId" value="cal-1" />
        <input name="userId" value="user-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Sign in to assign permissions");
  });

  test("initCalendarControls requires at least one permission", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <input name="calendarId" value="cal-1" />
        <input name="userId" value="user-1" />
        <input type="checkbox" name="permissions" value="View Calendar" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Select at least one permission");
  });

  test("initCalendarControls assigns permissions on success", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <input name="calendarId" value="cal-1" />
        <input name="userId" value="user-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Permissions assigned successfully");

    global.fetch.mockRestore();
  });

  test("initCalendarControls surfaces permission assignment failures", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <input name="calendarId" value="cal-1" />
        <input name="userId" value="user-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Permission failed" })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Permission failed");

    global.fetch.mockRestore();
  });

  test("initSharingControls posts share link requests", async () => {
    document.body.innerHTML = `
      <form data-share-link>
        <input name="calendarId" value="cal-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
        <button type="submit">Share</button>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ link: "https://example.com?token=abc" })
      })
    );

    initSharingControls();
    const form = document.querySelector("[data-share-link]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Share link ready");
  });

  test("initSharingControls requires authentication", async () => {
    document.body.innerHTML = `
      <form data-share-link>
        <input name="calendarId" value="cal-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    initSharingControls();
    const form = document.querySelector("[data-share-link]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Sign in to generate a share link");
  });

  test("initSharingControls validates required fields", async () => {
    document.body.innerHTML = `
      <form data-share-link>
        <input name="calendarId" value="" />
        <input type="checkbox" name="permissions" value="View Calendar" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initSharingControls();
    const form = document.querySelector("[data-share-link]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Calendar ID is required");
  });

  test("initSharingControls requires permissions selection", async () => {
    document.body.innerHTML = `
      <form data-share-link>
        <input name="calendarId" value="cal-1" />
        <input type="checkbox" name="permissions" value="View Calendar" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initSharingControls();
    const form = document.querySelector("[data-share-link]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Select at least one permission");
  });

  test("initSharingControls surfaces share link errors", async () => {
    document.body.innerHTML = `
      <form data-share-link>
        <input name="calendarId" value="cal-1" />
        <input type="checkbox" name="permissions" value="View Calendar" checked />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Share failed" })
      })
    );

    initSharingControls();
    const form = document.querySelector("[data-share-link]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Share failed");

    global.fetch.mockRestore();
  });
});

describe("event creation and management", () => {
  beforeEach(() => {
    window.localStorage.removeItem("tylendar-auth");
    document.body.innerHTML = "";
  });

  test("createEventId returns a prefixed identifier", () => {
    const id = createEventId();

    expect(id).toMatch(/^evt-/);
  });

  test("parseEventDateTime returns null for missing or invalid values", () => {
    expect(parseEventDateTime("", "10:00")).toBeNull();
    expect(parseEventDateTime("not-a-date", "10:00")).toBeNull();
  });

  test("parseEventDateTime falls back to a default time", () => {
    const result = parseEventDateTime("2024-02-20");

    expect(result).toContain("2024-02-20");
  });

  test("buildEventPayload validates required fields", () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="" />
        <input name="calendarId" value="" />
        <input name="startsDate" value="" />
        <input name="startsTime" value="" />
        <input name="endsDate" value="" />
        <input name="endsTime" value="" />
      </form>
    `;

    const form = document.querySelector("[data-event-create]");
    const result = buildEventPayload(form, null);

    expect(result.errors).toContain("Sign in to create events.");
    expect(result.errors).toContain("Calendar ID is required.");
    expect(result.errors).toContain("Event title is required.");
    expect(result.errors).toContain("Start and end times are required.");
  });

  test("buildEventPayload rejects end times before start times", () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="Planning" />
        <input name="calendarId" value="cal-1" />
        <input name="startsDate" value="2024-02-20" />
        <input name="startsTime" value="12:00" />
        <input name="endsDate" value="2024-02-20" />
        <input name="endsTime" value="10:00" />
      </form>
    `;

    const form = document.querySelector("[data-event-create]");
    const result = buildEventPayload(form, { user: { id: "user-1" } });

    expect(result.errors).toContain("End time must be after the start time.");
  });

  test("buildEventPayload assembles event payloads", () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="Planning" />
        <input name="calendarId" value="cal-1" />
        <input name="startsDate" value="2024-02-20" />
        <input name="startsTime" value="10:00" />
        <input name="endsDate" value="2024-02-20" />
        <input name="endsTime" value="11:00" />
        <textarea name="description">Notes</textarea>
      </form>
    `;

    const form = document.querySelector("[data-event-create]");
    const result = buildEventPayload(form, { user: { id: "user-1" } });

    expect(result.errors).toHaveLength(0);
    expect(result.payload.calendarIds).toEqual(["cal-1"]);
    expect(result.payload.createdBy).toBe("user-1");
    expect(result.payload.startsAt).toBeTruthy();
    expect(result.payload.endsAt).toBeTruthy();
  });

  test("renderEventManagementList handles empty and populated events", () => {
    const emptyHtml = renderEventManagementList([]);
    const filledHtml = renderEventManagementList([
      { id: "evt-1", title: "Sync", startsAt: "2024-01-01T10:00:00.000Z", description: "Discuss" }
    ]);

    expect(emptyHtml).toContain("No events found yet");
    expect(filledHtml).toContain("Sync");
    expect(filledHtml).toContain("Remove");
  });

  test("initEventModal opens and closes event modal", () => {
    document.body.innerHTML = `
      <button data-event-modal-open="event-modal"></button>
      <div id="event-modal" data-event-modal aria-hidden="true">
        <button data-event-modal-close></button>
      </div>
    `;

    initEventModal();
    document.querySelector("[data-event-modal-open]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    const modal = document.getElementById("event-modal");
    expect(modal.classList.contains("event-modal--open")).toBe(true);

    document.querySelector("[data-event-modal-close]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    expect(modal.classList.contains("event-modal--open")).toBe(false);
  });

  test("initEventModal ignores missing modal targets", () => {
    document.body.innerHTML = `
      <button data-event-modal-open="missing-modal"></button>
    `;

    initEventModal();
    document.querySelector("[data-event-modal-open]")
      .dispatchEvent(new Event("click", { bubbles: true }));
  });

  test("initEventCreation ignores submit events from non-forms", () => {
    initEventCreation();

    expect(() => {
      document.dispatchEvent(new Event("submit", { bubbles: true }));
    }).not.toThrow();
  });

  test("initEventCreation ignores non-event forms", () => {
    document.body.innerHTML = `
      <form id="other-form">
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    initEventCreation();
    document.getElementById("other-form")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(document.querySelector("[data-form-feedback]").textContent).toBe("");
  });

  test("initEventCreation warns when not signed in", async () => {
    document.body.innerHTML = `
      <form data-event-create>
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    initEventCreation();
    const form = document.querySelector("[data-event-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Sign in to create events");
  });

  test("initEventCreation reports validation errors", async () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="" />
        <input name="calendarId" value="" />
        <input name="startsDate" value="" />
        <input name="startsTime" value="" />
        <input name="endsDate" value="" />
        <input name="endsTime" value="" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    initEventCreation();
    const form = document.querySelector("[data-event-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Calendar ID is required");
  });

  test("initEventCreation posts new events and closes the modal", async () => {
    document.body.innerHTML = `
      <div id="event-modal" data-event-modal class="event-modal--open" aria-hidden="false">
        <form data-event-create data-event-modal-close-on-success>
          <input name="title" value="Sync" />
          <input name="calendarId" value="cal-1" />
          <input name="startsDate" value="2024-02-20" />
          <input name="startsTime" value="10:00" />
          <input name="endsDate" value="2024-02-20" />
          <input name="endsTime" value="11:00" />
          <div class="form-feedback is-hidden" data-form-feedback></div>
        </form>
      </div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: "evt-1", title: "Sync" })
      })
    );

    initEventCreation();
    const form = document.querySelector("[data-event-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/events",
      expect.objectContaining({ method: "POST" })
    );
    expect(document.getElementById("event-modal").classList.contains("event-modal--open")).toBe(false);

    global.fetch.mockRestore();
  });

  test("initEventCreation refreshes event lists when configured", async () => {
    document.body.innerHTML = `
      <form data-event-create data-event-list-target="event-list">
        <input name="title" value="Sync" />
        <input name="calendarId" value="cal-1" />
        <input name="startsDate" value="2024-02-20" />
        <input name="startsTime" value="10:00" />
        <input name="endsDate" value="2024-02-20" />
        <input name="endsTime" value="11:00" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
      <div id="event-list"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn((url, options = {}) => {
      if (options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "evt-1", title: "Sync" })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ events: [] })
      });
    });

    initEventCreation();
    document.querySelector("[data-event-create]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/events?calendarId=cal-1",
      expect.any(Object)
    );

    global.fetch.mockRestore();
  });

  test("initEventCreation handles request failures", async () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="Sync" />
        <input name="calendarId" value="cal-1" />
        <input name="startsDate" value="2024-02-20" />
        <input name="startsTime" value="10:00" />
        <input name="endsDate" value="2024-02-20" />
        <input name="endsTime" value="11:00" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Create failed" })
      })
    );

    initEventCreation();
    document.querySelector("[data-event-create]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-form-feedback]").textContent).toContain("Create failed");

    global.fetch.mockRestore();
  });

  test("refreshEventList handles missing calendar identifiers", async () => {
    document.body.innerHTML = `<div id="event-list"></div>`;
    const container = document.getElementById("event-list");

    await refreshEventList(null, "cal-1", "token");
    await refreshEventList(container, "", "token");

    expect(container.innerHTML).toContain("Event Management");
    expect(container.dataset.calendarId).toBe("");
  });

  test("refreshEventList handles failed requests", async () => {
    document.body.innerHTML = `<div id="event-list"></div>`;
    const container = document.getElementById("event-list");

    global.fetch = jest.fn(() => Promise.resolve({ ok: false }));

    await refreshEventList(container, "cal-1", "token");

    expect(container.innerHTML).toContain("Unable to load events");

    global.fetch.mockRestore();
  });

  test("setEventListFeedback updates list feedback messages", () => {
    document.body.innerHTML = `
      <div id="event-list">
        <div class="form-feedback is-hidden" data-event-list-feedback></div>
      </div>
    `;

    const container = document.getElementById("event-list");
    expect(() => setEventListFeedback(null, "Ignored")).not.toThrow();
    setEventListFeedback(container, "Updated", "success");

    const feedback = container.querySelector("[data-event-list-feedback]");
    expect(feedback.textContent).toContain("Updated");
    expect(feedback.dataset.tone).toBe("success");
    expect(feedback.classList.contains("is-hidden")).toBe(false);
  });

  test("setEventListFeedback handles missing feedback element", () => {
    document.body.innerHTML = `<div id="event-list"></div>`;
    const container = document.getElementById("event-list");

    expect(() => setEventListFeedback(container, "Ignored")).not.toThrow();
  });

  test("initEventManagement loads events and deletes entries", async () => {
    document.body.innerHTML = `
      <form data-event-filter data-event-list-target="event-list">
        <input name="calendarId" value="cal-1" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
      <div id="event-list" data-event-list></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn((url, options = {}) => {
      if (options.method === "DELETE") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ events: [{ id: "evt-1", title: "Sync", startsAt: "2024-01-01T10:00:00.000Z" }] })
      });
    });

    initEventManagement();
    document.querySelector("[data-event-filter]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.getElementById("event-list").innerHTML).toContain("Sync");

    document.querySelector("[data-event-delete]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/events/evt-1",
      expect.objectContaining({ method: "DELETE" })
    );

    global.fetch.mockRestore();
  });

  test("initEventManagement handles missing auth and calendar values", async () => {
    document.body.innerHTML = `
      <form data-event-filter data-event-list-target="event-list">
        <input name="calendarId" value="" />
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
      <div id="event-list"></div>
    `;

    initEventManagement();
    document.querySelector("[data-event-filter]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-form-feedback]").textContent).toContain("Sign in to load events");

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    document.querySelector("[data-event-filter]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-form-feedback]").textContent).toContain("Calendar ID is required");
  });

  test("initEventManagement ignores non-form submit events", () => {
    initEventManagement();

    expect(() => {
      document.dispatchEvent(new Event("submit", { bubbles: true }));
    }).not.toThrow();
  });

  test("initEventManagement ignores forms without event filters", () => {
    document.body.innerHTML = `
      <form id="other-filter">
        <input name="calendarId" value="cal-1" />
      </form>
    `;

    global.fetch = jest.fn();
    initEventManagement();
    document.getElementById("other-filter")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("initEventManagement skips delete when missing context", async () => {
    document.body.innerHTML = `
      <div data-event-list>
        <button data-event-delete=""></button>
      </div>
    `;

    global.fetch = jest.fn();
    initEventManagement();
    document.querySelector("[data-event-delete]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("initEventManagement skips delete when event id is missing", () => {
    document.body.innerHTML = `
      <div data-event-list>
        <button data-event-delete=""></button>
      </div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn();
    initEventManagement();
    document.querySelector("[data-event-delete]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("initEventManagement reports delete failures", async () => {
    document.body.innerHTML = `
      <div data-event-list data-calendar-id="cal-1">
        <div class="form-feedback is-hidden" data-event-list-feedback></div>
        <button data-event-delete="evt-1"></button>
      </div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Delete failed" })
      })
    );

    initEventManagement();
    document.querySelector("[data-event-delete]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-event-list-feedback]").textContent).toContain("Unable to delete event");

    global.fetch.mockRestore();
  });

  test("initEventManagement handles delete exceptions", async () => {
    document.body.innerHTML = `
      <div data-event-list data-calendar-id="cal-1">
        <div class="form-feedback is-hidden" data-event-list-feedback></div>
        <button data-event-delete="evt-1"></button>
      </div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    initEventManagement();
    document.querySelector("[data-event-delete]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-event-list-feedback]").textContent).toContain("Unable to delete event");

    global.fetch.mockRestore();
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

  test("fetchJson returns payload on success", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    const result = await fetchJson("/ok");

    expect(result.status).toBe("ok");
  });

  test("fetchJson sends auth header when token is provided", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    await fetchJson("/secure", { token: "token-123" });

    expect(global.fetch).toHaveBeenCalledWith("/secure", {
      headers: {
        Authorization: "Bearer token-123"
      }
    });
  });

  test("fetchJson sends credentials when requested", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    await fetchJson("/auth/session", { includeCredentials: true });

    expect(global.fetch).toHaveBeenCalledWith("/auth/session", {
      credentials: "same-origin",
      headers: {}
    });
  });

  test("loadCalendarOverview returns null when token is missing", async () => {
    const result = await loadCalendarOverview(null);

    expect(result).toBeNull();
  });

  test("loadCalendarOverview returns calendars and events", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary" }] })
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [{ title: "Event", startsAt: "2024-01-01T09:00:00.000Z" }] })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const result = await loadCalendarOverview({ token: "token" });

    expect(result.primaryCalendar.name).toBe("Primary");
    expect(result.events).toHaveLength(1);

    global.fetch = originalFetch;
  });

  test("loadCalendarOverview handles missing calendars and events", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const result = await loadCalendarOverview({ token: "token" });

    expect(result.calendars).toEqual([]);
    expect(result.primaryCalendar).toBeNull();
    expect(result.events).toEqual([]);

    global.fetch = originalFetch;
  });

  test("resolveAuthState returns stored auth state when token exists", async () => {
    const storage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      }
    };
    storage.setItem("tylendar-auth", JSON.stringify({ token: "stored-token", user: { id: "user-1" } }));

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );

    const result = await resolveAuthState(storage);

    expect(result.token).toBe("stored-token");
    expect(global.fetch).not.toHaveBeenCalled();

    global.fetch.mockRestore();
  });

  test("resolveAuthState hydrates from session endpoint when storage is empty", async () => {
    const storage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      }
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: { id: "user-7", name: "Session User" },
          session: { token: "session-token" },
          permissions: ["View Calendar"]
        })
      })
    );

    const result = await resolveAuthState(storage);

    expect(result.token).toBe("session-token");
    expect(result.user.name).toBe("Session User");
    expect(JSON.parse(storage.getItem("tylendar-auth")).token).toBe("session-token");
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", {
      credentials: "same-origin",
      headers: {}
    });

    global.fetch.mockRestore();
  });

  test("postJson throws with API error message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid request" })
      })
    );

    await expect(postJson("/api/auth/login", { email: "bad" })).rejects.toThrow("Invalid request");
  });

  test("postJson sends auth header when token is provided", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    await postJson("/api/auth/logout", { ok: true }, { token: "token" });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });

  test("postJson omits auth header when token is missing", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      })
    );

    await postJson("/api/status", { ok: true });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/status",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          Authorization: "Bearer token"
        })
      })
    );
  });

  test("postJson handles non-json error responses", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error("No json"))
      })
    );

    await expect(postJson("/api/auth/login", { email: "bad" })).rejects.toThrow("Request failed");
  });

  test("init hydrates signed-out sections", async () => {
    window.localStorage.removeItem("tylendar-auth");
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="profile-management"></div>
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

    const result = await init();

    expect(result.hydrated).toBe(true);
    expect(document.getElementById("calendar-view").innerHTML).toContain("Sign in to view this section");
    expect(document.getElementById("profile-management").innerHTML).toContain("Sign in to update your account details");
  });

  test("init skips calendar placeholders when calendar elements are missing", async () => {
    window.localStorage.removeItem("tylendar-auth");
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="profile-management"></div>
    `;

    const result = await init();

    expect(result.hydrated).toBe(true);
    expect(document.getElementById("profile-card").innerHTML).toContain("Sign in");
  });

  test("init hydrates signed-in sections", async () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="profile-management"></div>
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

    const originalFetch = global.fetch;
    const fetchSpy = jest.fn((url) => {
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              calendars: [
                { id: "cal-1", name: "Primary Calendar" },
                { id: "cal-2", name: "Secondary Calendar" }
              ]
            })
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            events: [{ title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
          })
        });
      }
      if (url.startsWith("/api/monitoring/observability")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ uptimeSeconds: 0, latencyP95Ms: null, errorRate: null, highlights: [] })
        });
      }
      if (url.startsWith("/api/monitoring/metrics")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ users: 0, events: 0, uptimeSeconds: 0 })
        });
      }
      if (url.startsWith("/api/monitoring/alerts")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ alerts: [] })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      });
    });
    global.fetch = fetchSpy;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Test", email: "user@example.com", organizationId: "org-1" }
      })
    );

    await init();

    expect(document.getElementById("profile-card").innerHTML).toContain("Test");
    expect(document.getElementById("home-highlights").innerHTML).toContain("user@example.com");
    expect(document.getElementById("org-dashboard").innerHTML).toContain("org-1");
    expect(document.getElementById("profile-management").innerHTML).toContain("Manage profile");
    expect(document.getElementById("calendar-view").innerHTML).toContain("Primary Calendar");
    expect(document.getElementById("calendar-view").innerHTML).toContain("2 calendars connected");
    expect(document.getElementById("calendar-view").innerHTML).toContain("Kickoff");

    window.localStorage.removeItem("tylendar-auth");
    global.fetch = originalFetch;
  });

  test("init renders singular calendar summary", async () => {
    document.body.innerHTML = `
      <div id="calendar-view"></div>
      <div id="event-list"></div>
      <div id="access-matrix"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Solo", email: "solo@example.com" }
      })
    );

    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary" }] })
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [] })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await init();

    expect(document.getElementById("calendar-view").innerHTML).toContain("1 calendar connected.");

    window.localStorage.removeItem("tylendar-auth");
    global.fetch = originalFetch;
  });

  test("init handles signed-in users without an organization", async () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="org-dashboard"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Test", email: "user@example.com" }
      })
    );

    await init();

    expect(document.getElementById("org-dashboard").innerHTML).toContain("No organization data is available yet");

    window.localStorage.removeItem("tylendar-auth");
  });

  test("init handles empty calendar overview data", async () => {
    document.body.innerHTML = `
      <div id="calendar-view"></div>
      <div id="event-list"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Test", email: "user@example.com" }
      })
    );

    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(url.startsWith("/api/calendars") ? { calendars: [] } : { events: [] })
      })
    );

    await init();

    expect(document.getElementById("calendar-view").innerHTML).toContain("No calendars available yet");

    window.localStorage.removeItem("tylendar-auth");
    global.fetch = originalFetch;
  });

  test("init handles calendar overview failures", async () => {
    document.body.innerHTML = `
      <div id="calendar-view"></div>
      <div id="event-list"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Test", email: "user@example.com" }
      })
    );

    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false
      })
    );

    await init();

    expect(document.getElementById("calendar-view").innerHTML).toContain("Unable to load your calendar right now");

    window.localStorage.removeItem("tylendar-auth");
    global.fetch = originalFetch;
  });

  test("init loads calendar view when only session cookie is present", async () => {
    document.body.innerHTML = `
      <div id="calendar-view"></div>
    `;

    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url === "/api/auth/session") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            user: { id: "user-42", name: "Cookie User" },
            session: { token: "session-token" },
            permissions: []
          })
        });
      }
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ calendars: [{ id: "cal-42", name: "Primary Calendar" }] })
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ events: [{ title: "Kickoff", startsAt: "2024-01-01T09:00:00.000Z" }] })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    await init();

    expect(document.getElementById("calendar-view").innerHTML).toContain("Primary Calendar");
    expect(document.getElementById("calendar-view").innerHTML).toContain("Kickoff");

    global.fetch = originalFetch;
    window.localStorage.removeItem("tylendar-auth");
  });

  test("init uses fallback account highlights when email or org are missing", async () => {
    document.body.innerHTML = `
      <div id="home-highlights"></div>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({
        token: "token",
        user: { name: "Test", email: "", organizationId: "" }
      })
    );

    await init();

    expect(document.getElementById("home-highlights").innerHTML).toContain("Email");
    expect(document.getElementById("home-highlights").innerHTML).toContain("—");
    expect(document.getElementById("home-highlights").innerHTML).toContain("None");

    window.localStorage.removeItem("tylendar-auth");
  });

  test("init exits when no dashboard sections are present", async () => {
    document.body.innerHTML = `<div id="auth-modal"></div>`;

    const result = await init();

    expect(result.hydrated).toBe(false);
  });
});

describe("auth utilities", () => {
  const createStorage = () => {
    const store = {};
    return {
      getItem: jest.fn((key) => (key in store ? store[key] : null)),
      setItem: jest.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete store[key];
      })
    };
  };

  test("readAuthState returns null on invalid json", () => {
    const storage = createStorage();
    storage.setItem("tylendar-auth", "{not-json");

    const result = readAuthState(storage);

    expect(result).toBeNull();
  });

  test("readAuthState returns null when storage is empty", () => {
    const storage = createStorage();

    const result = readAuthState(storage);

    expect(result).toBeNull();
  });

  test("writeAuthState and clearAuthState update storage", () => {
    const storage = createStorage();
    const payload = { token: "token", user: { name: "Avery" } };

    writeAuthState(payload, storage);
    expect(readAuthState(storage)).toEqual(payload);

    clearAuthState(storage);
    expect(readAuthState(storage)).toBeNull();
  });

  test("redirectToCalendar uses assign when available", () => {
    const assign = jest.fn();
    const result = redirectToCalendar({ assign });

    expect(result).toBe(true);
    expect(assign).toHaveBeenCalledWith("/calendar");
  });

  test("redirectToCalendar returns false on invalid or failing location", () => {
    const failingLocation = { assign: jest.fn(() => { throw new Error("fail"); }) };
    const result = redirectToCalendar(failingLocation);

    expect(result).toBe(false);
    expect(redirectToCalendar(null)).toBe(false);
  });

  test("redirectToCalendar skips jsdom navigation on default location", () => {
    expect(redirectToCalendar()).toBe(false);
  });

  test("buildAuthPayload maps login and register forms", () => {
    document.body.innerHTML = `
      <form id="login-form">
        <input name="email" value="user@example.com" />
        <input name="password" value="Password123!" />
      </form>
      <form id="register-form">
        <input name="name" value="User" />
        <input name="email" value="user@example.com" />
        <input name="password" value="Password123!" />
        <input name="organizationId" value="org-1" />
        <input name="role" value="member" />
      </form>
    `;

    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    expect(buildAuthPayload("login", loginForm)).toEqual({
      email: "user@example.com",
      password: "Password123!"
    });
    expect(buildAuthPayload("register", registerForm)).toEqual({
      name: "User",
      email: "user@example.com",
      password: "Password123!",
      organizationId: "org-1",
      role: "member"
    });
  });

  test("buildAuthPayload handles missing fields", () => {
    document.body.innerHTML = `
      <form id="register-form">
        <input name="name" value="User" />
      </form>
    `;

    const registerForm = document.getElementById("register-form");

    expect(buildAuthPayload("register", registerForm)).toEqual({
      name: "User",
      email: "",
      password: "",
      organizationId: "",
      role: ""
    });
  });

  test("initAuthUI wires login flow and updates status", async () => {
    document.body.innerHTML = `
      <div class="nav-actions">
        <span data-auth-status></span>
        <button data-auth-trigger="login">Log in</button>
        <button data-auth-trigger="register">Register</button>
      </div>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <button data-auth-tab="register"></button>
        <form data-auth-panel="login">
          <input name="email" value="user@example.com" />
          <input name="password" value="Password123!" />
          <button type="submit">Log in</button>
        </form>
        <form data-auth-panel="register">
          <input name="name" value="User" />
          <input name="email" value="user@example.com" />
          <input name="password" value="Password123!" />
          <input name="organizationId" value="org-1" />
          <input name="role" value="member" />
        </form>
        <div data-auth-feedback></div>
      </div>
    `;

    const storage = createStorage();
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "token", user: { name: "User" } })
      })
    );

    initAuthUI({ storage });

    document.querySelector('[data-auth-trigger="login"]').click();
    const form = document.querySelector('form[data-auth-panel="login"]');
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(readAuthState(storage).token).toBe("token");
    expect(document.querySelector("[data-auth-status]").textContent).toContain("Signed in as");
  });

  test("initAuthUI handles registration flow", async () => {
    document.body.innerHTML = `
      <div class="nav-actions">
        <span data-auth-status></span>
        <button data-auth-trigger="register">Register</button>
      </div>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <button data-auth-tab="register"></button>
        <form data-auth-panel="register">
          <input name="name" value="User" />
          <input name="email" value="user@example.com" />
          <input name="password" value="Password123!" />
          <input name="organizationId" value="" />
          <input name="role" value="member" />
          <button type="submit">Register</button>
        </form>
        <div data-auth-feedback></div>
      </div>
    `;

    const storage = createStorage();
    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "token", user: { name: "User" } })
      })
    );
    initAuthUI({ storage });

    const form = document.querySelector('form[data-auth-panel="register"]');
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(readAuthState(storage).token).toBe("token");
    global.fetch = originalFetch;
  });

  test("initAuthUI uses email fallback in success message", async () => {
    document.body.innerHTML = `
      <div class="nav-actions">
        <span data-auth-status></span>
        <button data-auth-trigger="login">Log in</button>
      </div>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <form data-auth-panel="login">
          <input name="email" value="user@example.com" />
          <input name="password" value="Password123!" />
          <button type="submit">Log in</button>
        </form>
        <div data-auth-feedback></div>
      </div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "token", user: { email: "user@example.com" } })
      })
    );

    initAuthUI();
    document.querySelector('[data-auth-trigger="login"]').click();
    const form = document.querySelector('form[data-auth-panel="login"]');
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("user@example.com");
  });

  test("updateAuthStatus disables triggers when signed in", () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <span data-auth-status></span>
    `;

    updateAuthStatus({ token: "token", user: { email: "user@example.com" } });

    const trigger = document.querySelector("[data-auth-trigger]");
    expect(trigger.disabled).toBe(true);
    expect(trigger.classList.contains("is-hidden")).toBe(true);
  });

  test("updateAccountSections populates profile form fields", () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="" />
          <input name="email" value="" />
          <input name="organizationId" value="" />
          <input name="role" value="" />
        </form>
      </div>
    `;

    updateAccountSections({
      name: "Pat",
      email: "pat@example.com",
      organizationId: "org-12",
      role: "owner"
    });

    const form = document.querySelector("[data-profile-form]");
    expect(form.querySelector('[name="name"]').value).toBe("Pat");
    expect(form.querySelector('[name="email"]').value).toBe("pat@example.com");
    expect(form.querySelector('[name="organizationId"]').value).toBe("org-12");
    expect(form.querySelector('[name="role"]').value).toBe("owner");
  });

  test("updateAccountSections ignores missing profile fields", () => {
    document.body.innerHTML = `
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="" />
          <input name="email" value="" />
        </form>
      </div>
    `;

    updateAccountSections({
      name: "Taylor",
      email: "taylor@example.com",
      organizationId: "org-missing",
      role: "member"
    });

    const form = document.querySelector("[data-profile-form]");
    expect(form.querySelector('[name="name"]').value).toBe("Taylor");
    expect(form.querySelector('[name="email"]').value).toBe("taylor@example.com");
  });

  test("updateAccountSections renders profile management when form is missing", () => {
    document.body.innerHTML = `
      <div id="profile-management"></div>
    `;

    updateAccountSections({ name: "No Form", email: "noform@example.com" });

    expect(document.getElementById("profile-management").innerHTML).toContain("Manage profile");
  });

  test("updateAccountSections handles missing profile management element", () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
    `;

    updateAccountSections({ name: "Missing", email: "missing@example.com" });

    expect(document.getElementById("profile-card").innerHTML).toContain("Missing");
  });

  test("updateAuthStatus leaves triggers enabled when signed out", () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <span data-auth-status></span>
    `;

    updateAuthStatus(null);

    const trigger = document.querySelector("[data-auth-trigger]");
    expect(trigger.disabled).toBe(false);
    expect(trigger.classList.contains("is-hidden")).toBe(false);
  });

  test("initAuthUI switches tabs and closes on escape", () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <button data-auth-tab="register"></button>
        <form data-auth-panel="login"></form>
        <form data-auth-panel="register"></form>
        <div data-auth-feedback></div>
      </div>
    `;

    initAuthUI();

    const trigger = document.querySelector("[data-auth-trigger]");
    trigger.dataset.authTrigger = "";
    trigger.dispatchEvent(new Event("click", { bubbles: true }));
    expect(document.getElementById("auth-modal").classList.contains("auth-modal--open")).toBe(true);

    document.querySelector('[data-auth-tab="register"]').click();
    expect(document.querySelector('[data-auth-panel="register"]').classList.contains("auth-panel--active"))
      .toBe(true);

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(document.getElementById("auth-modal").classList.contains("auth-modal--open")).toBe(false);
  });

  test("initAuthUI ignores non-escape key presses", () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <form data-auth-panel="login"></form>
        <div data-auth-feedback></div>
      </div>
    `;

    initAuthUI();

    document.querySelector("[data-auth-trigger]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));

    expect(document.getElementById("auth-modal").classList.contains("auth-modal--open")).toBe(true);
  });

  test("initAuthUI handles submit errors", async () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <div id="auth-modal" aria-hidden="true">
        <div data-auth-close></div>
        <button data-auth-close></button>
        <button data-auth-tab="login"></button>
        <button data-auth-tab="register"></button>
        <form data-auth-panel="login">
          <input name="email" value="user@example.com" />
          <input name="password" value="Password123!" />
          <button type="submit">Log in</button>
        </form>
        <form data-auth-panel="register"></form>
        <div data-auth-feedback></div>
      </div>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid login" })
      })
    );

    initAuthUI();
    document.querySelector("[data-auth-trigger]")
      .dispatchEvent(new Event("click", { bubbles: true }));
    const form = document.querySelector('form[data-auth-panel="login"]');
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("Invalid login");
  });

  test("initAuthUI returns disabled when modal is missing", () => {
    document.body.innerHTML = `<button data-auth-trigger="login">Log in</button>`;

    const result = initAuthUI();

    expect(result.enabled).toBe(false);
  });

  test("updateAuthStatus handles logout failures", async () => {
    document.body.innerHTML = `
      <span data-auth-status></span>
      <div data-auth-feedback></div>
    `;

    const storage = createStorage();
    writeAuthState({ token: "token", user: { email: "user@example.com" } }, storage);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Logout failed" })
      })
    );

    updateAuthStatus(readAuthState(storage), storage);
    document.querySelector("[data-auth-logout]").click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("Logout failed");
    expect(readAuthState(storage)).toBeNull();
  });

  test("updateAuthStatus ignores missing feedback element", async () => {
    document.body.innerHTML = `
      <span data-auth-status></span>
    `;

    const storage = createStorage();
    writeAuthState({ token: "token", user: { email: "user@example.com" } }, storage);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Logout failed" })
      })
    );

    updateAuthStatus(readAuthState(storage), storage);
    document.querySelector("[data-auth-logout]").click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(readAuthState(storage)).toBeNull();
  });

  test("setAuthFeedback is resilient without a feedback element", () => {
    document.body.innerHTML = `
      <button data-auth-trigger="login">Log in</button>
      <div id="auth-modal" aria-hidden="true">
        <button data-auth-tab="login"></button>
        <form data-auth-panel="login"></form>
      </div>
    `;

    initAuthUI();
    document.querySelector("[data-auth-trigger]")
      .dispatchEvent(new Event("click", { bubbles: true }));

    expect(document.getElementById("auth-modal").classList.contains("auth-modal--open")).toBe(true);
  });

  test("readAuthState uses window storage when available", () => {
    window.localStorage.setItem("tylendar-auth", JSON.stringify({ token: "token" }));

    const result = readAuthState();

    expect(result.token).toBe("token");
    window.localStorage.removeItem("tylendar-auth");
  });
});
