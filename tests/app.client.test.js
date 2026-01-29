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
  renderAccessMatrix,
  renderAuthStatus,
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
  renderProfile,
  setFormFeedback,
  updateAuthStatus,
  writeAuthState,
  getSelectedPermissions,
  initCalendarControls,
  initSharingControls
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

    expect(html).toContain("No events scheduled");
  });

  test("renderCalendarView uses defaults when calendar is missing", () => {
    const html = renderCalendarView();

    expect(html).toContain("Calendar");
    expect(html).toContain("No calendar data available.");
  });

  test("renderCalendarView lists events when provided", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ title: "Event", day: "Mon" }]
    });

    expect(html).toContain("Event");
    expect(html).toContain("Mon");
  });

  test("renderCalendarView uses startsAt when day is missing", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ title: "Event", startsAt: "2024-01-01" }]
    });

    expect(html).toContain("2024-01-01");
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
      featuredEvents: [{ title: "Featured", day: "Tue" }]
    });

    expect(html).toContain("Featured");
    expect(html).toContain("Tue");
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
    expect(html).toContain("Event B");
  });

  test("renderAccessMatrix handles empty and entries", () => {
    const emptyHtml = renderAccessMatrix([]);
    const defaultHtml = renderAccessMatrix();
    const filledHtml = renderAccessMatrix([
      { user: "A", calendar: "Cal", permissions: ["View"] }
    ]);

    expect(emptyHtml).toContain("No access entries");
    expect(defaultHtml).toContain("No access entries");
    expect(filledHtml).toContain("Access Assignments");
    expect(filledHtml).toContain("View");
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
      highlights: ["ok"]
    });
    const htmlNoHighlights = renderObservability({
      uptimeSeconds: 0,
      latencyP95Ms: null,
      errorRate: null,
      highlights: []
    });
    const htmlDefault = renderObservability();
    const htmlUndefinedHighlights = renderObservability({ uptimeSeconds: 5 });

    expect(htmlWithHighlights).toContain("42");
    expect(htmlWithHighlights).toContain("ok");
    expect(htmlNoHighlights).toContain("N/A");
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
  });

  test("init hydrates signed-in sections", async () => {
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

    window.localStorage.removeItem("tylendar-auth");
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
