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
  updateAuthStatus,
  writeAuthState
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

  test("postJson throws with API error message", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid request" })
      })
    );

    await expect(postJson("/api/auth/login", { email: "bad" })).rejects.toThrow("Invalid request");
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

  test("init tolerates missing sections", async () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
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
        "/api/home": { highlights: [] },
        "/api/dashboard/user": { highlights: [] },
        "/api/dashboard/org": { departments: [] },
        "/api/calendar/view?view=month": { days: [], featuredEvents: [] },
        "/api/events/list?range=month": { title: "month", items: [] },
        "/api/access": { entries: [] },
        "/api/events/evt-100/comments": { eventId: "evt-100", entries: [] },
        "/api/embed/widget?calendarId=cal-1": { title: "", theme: "", visibility: "", endpoint: "", sampleSnippet: "" },
        "/api/sharing/preview?calendarId=cal-1": { options: [] },
        "/api/audit/history-snapshot": { entries: [] },
        "/api/roles/summary?orgId=org-1": { roles: [], assignments: [] },
        "/api/fault-tolerance/snapshot": { snapshots: [] },
        "/api/developer/portal": { headline: "", description: "", resources: [], status: "" },
        "/api/monitoring/observability": { uptime: "", latencyP95: "", errorRate: "", highlights: [] },
        "/api/monitoring/alerts": { alerts: [] }
      };

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(responses[url])
      });
    });

    const result = await init();

    expect(result.hydrated).toBe(true);
    expect(document.getElementById("profile-card").innerHTML).toContain("Test");
  });

  test("readAuthState uses window storage when available", () => {
    window.localStorage.setItem("tylendar-auth", JSON.stringify({ token: "token" }));

    const result = readAuthState();

    expect(result.token).toBe("token");
    window.localStorage.removeItem("tylendar-auth");
  });
});
