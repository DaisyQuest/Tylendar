const AUTH_STORAGE_KEY = "tylendar-auth";

function renderEmptyState({ title, message }) {
  return `
    <div class="empty-state">
      <h3>${title}</h3>
      <p class="muted">${message}</p>
    </div>
  `;
}

function formatEventDateLabel(value) {
  if (!value) {
    return "Unscheduled";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unscheduled";
  }
  return parsed.toLocaleString("en-US", { month: "short", day: "numeric" });
}

function renderAuthStatus(authState) {
  if (!authState || !authState.user) {
    return `<span class="auth-status__text">Not signed in</span>`;
  }
  const label = authState.user.name || authState.user.email || "Account";
  return `
    <span class="auth-status__text">Signed in as ${label}</span>
    <button class="auth-logout" type="button" data-auth-logout>Log out</button>
  `;
}

function getAccountHighlights(user = {}) {
  return [
    { title: "Email", description: user.email || "—" },
    { title: "Organization", description: user.organizationId || "None" },
    { title: "Role", description: user.role || "member" }
  ];
}

function renderProfile(user) {
  if (!user) {
    return renderEmptyState({
      title: "Profile",
      message: "Sign in to view your profile details."
    });
  }
  const label = user.name || "Account";
  const email = user.email || "—";
  const organization = user.organizationId || "None";
  const role = user.role || "member";
  return `
    <div class="profile-card">
      <h3>${label}</h3>
      <p>Email: ${email}</p>
      <p>Organization: ${organization}</p>
      <p>Role: ${role}</p>
    </div>
  `;
}

function renderProfileManagement(user) {
  if (!user) {
    return renderEmptyState({
      title: "Manage profile",
      message: "Sign in to update your account details."
    });
  }
  const name = user.name || "";
  const email = user.email || "";
  const organizationId = user.organizationId || "";
  const role = user.role || "";
  return `
    <div class="profile-management__card">
      <h3>Manage profile</h3>
      <form data-profile-form>
        <label>Name <input name="name" value="${name}" /></label>
        <label>Email <input name="email" value="${email}" /></label>
        <label>Organization <input name="organizationId" value="${organizationId}" /></label>
        <label>Role <input name="role" value="${role}" /></label>
        <div class="form-feedback is-hidden" data-form-feedback></div>
      </form>
    </div>
  `;
}

function renderHighlights(highlights = []) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return renderEmptyState({
      title: "Account Summary",
      message: "No account details available yet."
    });
  }
  return `
    <div class="summary-card">
      <h3>Account Summary</h3>
      <ul>
        ${highlights
          .map((item) => `<li><strong>${item.title}</strong> ${item.description}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function renderDashboard(title, summary = {}) {
  const items = summary.items || summary.highlights || summary.departments || [];
  if (!items.length) {
    return renderEmptyState({
      title,
      message: "No dashboard data is available yet."
    });
  }
  return `
    <div class="dashboard-card">
      <h3>${title}</h3>
      <ul>
        ${items.map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderOrganizationStats(organization) {
  if (!organization) {
    return renderEmptyState({
      title: "Org Dashboard",
      message: "No organization data is available yet."
    });
  }
  const activeCalendars = organization.activeCalendars || 0;
  const upcomingEvents = organization.upcomingEvents || 0;
  const memberCount = organization.memberCount || 0;
  return `
    <div class="org-dashboard">
      <h3>Org Dashboard</h3>
      <p>${organization.name}</p>
      <p>Active calendars: ${activeCalendars}</p>
      <p>Upcoming events: ${upcomingEvents}</p>
      <p>Members: ${memberCount}</p>
    </div>
  `;
}

function renderCalendarView(payload) {
  if (!payload) {
    return renderEmptyState({
      title: "Calendar",
      message: "No calendar data available."
    });
  }
  const label = payload.label || "Calendar";
  const summary = payload.summary || "No calendar data available.";
  const events = Array.isArray(payload.events) ? payload.events : [];
  const featuredEvents = Array.isArray(payload.featuredEvents) ? payload.featuredEvents : [];
  const referenceDate = payload.referenceDate ? new Date(payload.referenceDate) : new Date();
  const monthLabel = Number.isNaN(referenceDate.getTime())
    ? ""
    : referenceDate.toLocaleString("en-US", { month: "short" });

  if (!events.length && !featuredEvents.length) {
    return `
      <div class="calendar-view">
        <h3>${label}</h3>
        <p class="muted">${summary}</p>
        <p class="muted">No events scheduled yet.</p>
      </div>
    `;
  }

  const schedule = (events.length ? events : featuredEvents).map((event) => {
    const dateLabel = event.day || formatEventDateLabel(event.startsAt);
    return `<li>${event.title || "Untitled"} · ${dateLabel}</li>`;
  });

  const grouped = {};
  events.forEach((event) => {
    const dateLabel = formatEventDateLabel(event.startsAt);
    grouped[dateLabel] = grouped[dateLabel] || [];
    grouped[dateLabel].push(event);
  });

  const overflowMarkup = Object.entries(grouped)
    .map(([date, dayEvents]) => {
      if (dayEvents.length <= 3 || date === "Unscheduled") {
        return "";
      }
      return `<div class="calendar-overflow">${date}: +${dayEvents.length - 3} more</div>`;
    })
    .join("");

  return `
    <div class="calendar-view">
      <h3>${label}</h3>
      <p class="muted">${summary}</p>
      <p class="muted">${monthLabel}</p>
      <ul>${schedule.join("")}</ul>
      ${overflowMarkup}
    </div>
  `;
}

function renderEventList(view = {}) {
  const title = view?.title || "Events";
  const items = Array.isArray(view?.items) ? view.items : [];
  if (!items.length) {
    return renderEmptyState({ title, message: "No events scheduled" });
  }
  const markup = items
    .map((item) => {
      const day = item.day || formatEventDateLabel(item.startsAt);
      return `<li>${item.title} · ${day}</li>`;
    })
    .join("");
  return `
    <div class="event-list">
      <h3>${title}</h3>
      <ul>${markup}</ul>
    </div>
  `;
}

function renderMessageBoard(payload = {}) {
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];
  if (!entries.length) {
    return renderEmptyState({
      title: "MessageBoard",
      message: "No event comments available."
    });
  }
  return `
    <div class="message-board">
      <ul>
        ${entries
          .map((entry) => `<li><strong>${entry.author}</strong> ${entry.message}</li>`)
          .join("")}
      </ul>
    </div>
  `;
}

function renderEmbedWidget(payload) {
  if (!payload) {
    return renderEmptyState({
      title: "Embed Widget",
      message: "No public embed is available."
    });
  }
  const snippet = payload.sampleSnippet || "Embed snippet unavailable.";
  return `
    <div class="embed-widget">
      <h3>${payload.title || "Embed"}</h3>
      <pre>${snippet}</pre>
    </div>
  `;
}

function renderSharingOptions(payload = {}) {
  const options = Array.isArray(payload?.options) ? payload.options : [];
  if (!options.length) {
    return renderEmptyState({
      title: "Sharing Options",
      message: "No sharing options configured."
    });
  }
  const markup = options
    .map((option) => {
      const extras = [];
      if (option.formats?.length) {
        extras.push(`Formats: ${option.formats.join(", ")}`);
      }
      if (option.link) {
        extras.push(option.link);
      }
      if (option.permissions?.length) {
        extras.push(`Permissions: ${option.permissions.join(", ")}`);
      }
      const extraMarkup = extras.length ? `<p>${extras.join(" · ")}</p>` : "";
      return `
        <li>
          <strong>${option.channel}</strong> ${option.description || ""}
          ${extraMarkup}
        </li>
      `;
    })
    .join("");
  return `
    <div class="sharing-options">
      <ul>${markup}</ul>
    </div>
  `;
}

function renderAuditHistory(payload = {}) {
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];
  if (!entries.length) {
    return renderEmptyState({
      title: "Audit history",
      message: "No audit activity recorded."
    });
  }
  return `
    <div class="audit-history">
      <ul>
        ${entries.map((entry) => `<li>${entry.summary || entry.action}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderRoleManagement(payload = {}) {
  const roles = Array.isArray(payload?.roles) ? payload.roles : [];
  const assignments = Array.isArray(payload?.assignments) ? payload.assignments : [];
  if (!roles.length && !assignments.length) {
    return renderEmptyState({
      title: "Role management",
      message: "No roles or assignments configured."
    });
  }
  const roleMarkup = roles
    .map((role) => `<li>${role.name}${role.summary ? ` · ${role.summary}` : ""}</li>`)
    .join("");
  const assignmentMarkup = assignments
    .map((assignment) => `<li>${assignment.user} · ${assignment.roleId}</li>`)
    .join("");
  return `
    <div class="role-management">
      <h3>Roles</h3>
      <ul>${roleMarkup}</ul>
      <h3>Assignments</h3>
      <ul>${assignmentMarkup}</ul>
    </div>
  `;
}

function renderFaultTolerance(payload = {}) {
  const snapshots = Array.isArray(payload?.snapshots) ? payload.snapshots : [];
  if (!snapshots.length) {
    return renderEmptyState({
      title: "Fault tolerance",
      message: "No fault-tolerance reports available."
    });
  }
  return `
    <div class="fault-tolerance">
      <ul>
        ${snapshots.map((snapshot) => `<li>${snapshot.pattern}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderDeveloperPortal(payload = {}) {
  const headline = payload.headline || "Developer Portal";
  const description = payload.description || "";
  const resources = Array.isArray(payload.resources) ? payload.resources : [];
  const status = payload.status || "";
  if (!resources.length && !description) {
    return renderEmptyState({
      title: headline,
      message: "No developer resources are available."
    });
  }
  const resourceMarkup = resources
    .map((resource) => `<li>${resource.title} · ${resource.detail}</li>`)
    .join("");
  const statusMarkup = status ? `<p class="muted">${status}</p>` : "";
  return `
    <div class="developer-portal">
      <h3>${headline}</h3>
      <p class="muted">${description}</p>
      ${statusMarkup}
      <ul>${resourceMarkup}</ul>
    </div>
  `;
}

function renderObservability(payload = {}) {
  const uptimeSeconds = payload.uptimeSeconds ?? "N/A";
  const latencyP95Ms = payload.latencyP95Ms ?? "N/A";
  const errorRate = payload.errorRate ?? "N/A";
  const highlights = Array.isArray(payload.highlights) ? payload.highlights : [];
  const stats = payload.stats || {};
  const highlightMarkup = highlights.length ? `<ul>${highlights.map((item) => `<li>${item}</li>`).join("")}</ul>` : "";
  return `
    <div class="observability">
      <h3>Service observability</h3>
      <p>Uptime (seconds): ${uptimeSeconds}</p>
      <p>Latency p95 (ms): ${latencyP95Ms}</p>
      <p>Error rate: ${errorRate}</p>
      ${highlightMarkup}
      <div class="observability-stats">
        <h4>Service statistics</h4>
        <p>Users: ${stats.users ?? "N/A"}</p>
        <p>Events: ${stats.events ?? "N/A"}</p>
      </div>
    </div>
  `;
}

function renderOperationalAlerts(payload = {}) {
  const alerts = Array.isArray(payload?.alerts) ? payload.alerts : [];
  if (!alerts.length) {
    return renderEmptyState({
      title: "Operational alerts",
      message: "No alerts reported."
    });
  }
  return `
    <div class="operational-alerts">
      <ul>${alerts.map((alert) => `<li>${alert.message}</li>`).join("")}</ul>
    </div>
  `;
}

function normalizeAccessPayload(payload = []) {
  if (Array.isArray(payload)) {
    return { entries: payload, pendingRequests: [], defaults: null, notes: [] };
  }
  if (!payload) {
    return { entries: [], pendingRequests: [], defaults: null, notes: [] };
  }
  return {
    entries: payload.entries || [],
    pendingRequests: payload.pendingRequests || [],
    defaults: payload.defaults || null,
    notes: payload.notes || []
  };
}

function summarizeAccess(entries) {
  const calendars = new Set();
  const permissionCounts = {
    view: 0,
    timeOnly: 0,
    add: 0,
    comment: 0,
    manage: 0
  };

  entries.forEach((entry) => {
    if (entry.calendar) {
      calendars.add(entry.calendar);
    }
    const permissions = entry.permissions || [];
    if (permissions.includes("View Calendar")) {
      permissionCounts.view += 1;
    }
    if (permissions.includes("View Calendar - Times Only")) {
      permissionCounts.timeOnly += 1;
    }
    if (permissions.includes("Add to Calendar")) {
      permissionCounts.add += 1;
    }
    if (permissions.includes("Comment on Calendar")) {
      permissionCounts.comment += 1;
    }
    if (permissions.includes("Manage Calendar")) {
      permissionCounts.manage += 1;
    }
  });

  return {
    totalShares: entries.length,
    calendarsShared: calendars.size,
    manageCount: permissionCounts.manage,
    permissionCounts
  };
}

function deriveAccessLevel(permissions = []) {
  if (!permissions.length) {
    return "No access";
  }
  if (permissions.includes("Manage Calendar")) {
    return "Manager";
  }
  if (permissions.includes("Add to Calendar")) {
    return "Contributor";
  }
  if (permissions.includes("Comment on Calendar")) {
    return "Commenter";
  }
  if (permissions.includes("View Calendar - Times Only")) {
    return "Time-only viewer";
  }
  return "Viewer";
}

function deriveAccessStatus(entry) {
  if (entry.status) {
    return entry.status;
  }
  if (entry.expiresAt) {
    return "Expiring soon";
  }
  return "Active";
}

function renderAccessMatrix(payload = []) {
  const { entries, pendingRequests, defaults, notes } = normalizeAccessPayload(payload);
  const summary = summarizeAccess(entries);
  const defaultPolicies = defaults || {
    visibility: "Private by default",
    approvals: "Approvals required for new share links",
    notifications: "Instant alerts for permission changes"
  };

  const emptyCopy = "No one else has access to your calendars yet.";

  const pendingMarkup = pendingRequests.length
    ? `
      <ul class="list">
        ${pendingRequests
          .map(
            (request) => `
            <li>
              <strong>${request.user}</strong> · ${request.calendar}
              <span class="muted">Requested ${request.permissions?.join(", ") || "access"} · ${request.requestedAt}</span>
            </li>
          `
          )
          .join("")}
      </ul>
    `
    : `<p class="muted">No pending requests right now.</p>`;

  const notesMarkup = notes.length
    ? `
      <div class="access-notes">
        <h4>Governance notes</h4>
        <ul class="list">
          ${notes.map((note) => `<li>${note}</li>`).join("")}
        </ul>
      </div>
    `
    : "";

  const tableMarkup = entries.length
    ? `
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Calendar</th>
            <th>Access level</th>
            <th>Permissions</th>
            <th>Status</th>
            <th>Last updated</th>
          </tr>
        </thead>
        <tbody>
          ${entries
            .map((entry) => {
              const permissionBadges = (entry.permissions?.length ? entry.permissions : ["No permissions assigned"])
                .map((permission) => `<span class="badge">${permission}</span>`)
                .join("");
              const status = deriveAccessStatus(entry);
              const lastUpdated = entry.lastUpdated || entry.updatedAt || "Not updated yet";
              return `
                <tr>
                  <td>${entry.user}</td>
                  <td>${entry.calendar}</td>
                  <td>${deriveAccessLevel(entry.permissions || [])}</td>
                  <td><div class="access-table__badges">${permissionBadges}</div></td>
                  <td><span class="access-status">${status}</span></td>
                  <td>${lastUpdated}</td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    `
    : `
      <div class="empty-state access-empty">
        <h3>Access Assignments</h3>
        <p class="muted">${emptyCopy}</p>
      </div>
    `;

  return `
    <div class="access-header">
      <div>
        <p class="eyebrow">Access overview</p>
        <h3>Permission control center</h3>
        <p class="muted">Manage who can view, add, comment on, and manage your calendars.</p>
      </div>
      <div class="access-actions">
        <a class="secondary" href="/sharing">Create share link</a>
        <a class="primary" href="/calendar">Open calendar</a>
      </div>
    </div>

    <div class="access-summary grid two">
      <div class="access-summary-card">
        <span class="access-summary__label">Active shares</span>
        <strong>${summary.totalShares}</strong>
        <p class="muted">${summary.totalShares ? "People with active access across your calendars." : "Invite teammates to collaborate."}</p>
      </div>
      <div class="access-summary-card">
        <span class="access-summary__label">Calendars shared</span>
        <strong>${summary.calendarsShared}</strong>
        <p class="muted">${summary.calendarsShared ? "Calendars with at least one external share." : "No shared calendars yet."}</p>
      </div>
      <div class="access-summary-card">
        <span class="access-summary__label">Managers</span>
        <strong>${summary.manageCount}</strong>
        <p class="muted">${summary.manageCount ? "People who can manage events and permissions." : "Keep management access limited."}</p>
      </div>
      <div class="access-summary-card">
        <span class="access-summary__label">Default policy</span>
        <p class="muted">${defaultPolicies.visibility}</p>
        <p class="muted">${defaultPolicies.approvals}</p>
        <p class="muted">${defaultPolicies.notifications}</p>
      </div>
    </div>

    <div class="access-insights">
      <h4>Permission coverage</h4>
      <div class="access-metrics">
        <span><strong>View Calendar</strong> ${summary.permissionCounts.view}</span>
        <span><strong>Times Only</strong> ${summary.permissionCounts.timeOnly}</span>
        <span><strong>Add to Calendar</strong> ${summary.permissionCounts.add}</span>
        <span><strong>Comment on Calendar</strong> ${summary.permissionCounts.comment}</span>
        <span><strong>Manage Calendar</strong> ${summary.permissionCounts.manage}</span>
      </div>
    </div>

    <div class="access-request">
      <h4>Pending access requests</h4>
      ${pendingMarkup}
    </div>
    ${notesMarkup}
    <div class="access-table">
      ${tableMarkup}
    </div>
  `;
}

function readAuthState(storage) {
  const targetStorage = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!targetStorage) {
    return null;
  }
  const raw = targetStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeAuthState(payload, storage) {
  const targetStorage = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!targetStorage) {
    return null;
  }
  targetStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

function clearAuthState(storage) {
  const targetStorage = storage || (typeof window !== "undefined" ? window.localStorage : null);
  if (!targetStorage) {
    return null;
  }
  targetStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

function setAuthFeedback(message, tone = "error") {
  const feedback = document.querySelector("[data-auth-feedback]");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.classList.remove("is-hidden");
}

function updateAuthStatus(authState, storage) {
  const statusEl = document.querySelector("[data-auth-status]");
  if (statusEl) {
    statusEl.innerHTML = renderAuthStatus(authState);
  }
  document.querySelectorAll("[data-auth-trigger]").forEach((trigger) => {
    const disabled = Boolean(authState?.token);
    trigger.disabled = disabled;
    trigger.classList.toggle("is-hidden", disabled);
  });

  const logout = document.querySelector("[data-auth-logout]");
  if (logout) {
    logout.addEventListener("click", async () => {
      try {
        await postJson("/api/auth/logout", {}, { token: authState?.token });
      } catch (error) {
        setAuthFeedback(error.message || "Logout failed");
      } finally {
        clearAuthState(storage);
        updateAuthStatus(null, storage);
      }
    });
  }
}

function buildAuthPayload(mode, form) {
  const getValue = (name) => form?.querySelector(`[name="${name}"]`)?.value ?? "";
  if (mode === "login") {
    return {
      email: getValue("email"),
      password: getValue("password")
    };
  }
  return {
    name: getValue("name"),
    email: getValue("email"),
    password: getValue("password"),
    organizationId: getValue("organizationId"),
    role: getValue("role")
  };
}

function redirectToCalendar(location = null) {
  if (!location || typeof location.assign !== "function") {
    return false;
  }
  try {
    location.assign("/calendar");
    return true;
  } catch (error) {
    return false;
  }
}

function openAuthModal(modal) {
  modal.classList.add("auth-modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function closeAuthModal(modal) {
  modal.classList.remove("auth-modal--open");
  modal.setAttribute("aria-hidden", "true");
}

function switchAuthTab(modal, target) {
  modal.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.classList.toggle("auth-tab--active", tab.dataset.authTab === target);
  });
  modal.querySelectorAll("[data-auth-panel]").forEach((panel) => {
    panel.classList.toggle("auth-panel--active", panel.dataset.authPanel === target);
  });
}

function initAuthUI({ storage } = {}) {
  const modal = document.getElementById("auth-modal");
  if (!modal) {
    return { enabled: false };
  }

  document.querySelectorAll("[data-auth-trigger]").forEach((trigger) => {
    trigger.addEventListener("click", () => openAuthModal(modal));
  });
  modal.querySelectorAll("[data-auth-close]").forEach((button) => {
    button.addEventListener("click", () => closeAuthModal(modal));
  });
  modal.querySelectorAll("[data-auth-tab]").forEach((tab) => {
    tab.addEventListener("click", () => switchAuthTab(modal, tab.dataset.authTab));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAuthModal(modal);
    }
  });

  modal.querySelectorAll("form[data-auth-panel]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const mode = form.dataset.authPanel;
      try {
        const payload = buildAuthPayload(mode, form);
        const response = await postJson(`/api/auth/${mode}`, payload);
        writeAuthState(response, storage);
        updateAuthStatus(response, storage);
        const label = response.user?.name || response.user?.email || "Account";
        setAuthFeedback(`Signed in as ${label}`, "success");
      } catch (error) {
        setAuthFeedback(error.message || "Authentication failed");
      }
    });
  });

  updateAuthStatus(readAuthState(storage), storage);
  return { enabled: true };
}

function setFormFeedback(form, message, tone = "error") {
  if (!form) {
    return;
  }
  const feedback = form.querySelector("[data-form-feedback]");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.classList.remove("is-hidden");
}

function getSelectedPermissions(form) {
  if (!form) {
    return [];
  }
  return Array.from(form.querySelectorAll('input[name="permissions"]:checked')).map((input) => input.value);
}

async function fetchJson(url, { token } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

async function postJson(url, payload, { token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });
  if (response.ok) {
    return response.json();
  }
  try {
    const data = await response.json();
    throw new Error(data.error || "Request failed");
  } catch (error) {
    if (error.message && error.message !== "No json") {
      throw new Error(error.message);
    }
    throw new Error("Request failed");
  }
}

function initCalendarControls() {
  document.querySelectorAll("form[data-calendar-create]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const authState = readAuthState();
      if (!authState?.token) {
        setFormFeedback(form, "Sign in to create a calendar");
        return;
      }
      const name = form.querySelector('[name="name"]')?.value?.trim();
      if (!name) {
        setFormFeedback(form, "Calendar name is required");
        return;
      }
      const payload = {
        name,
        ownerId: form.querySelector('[name="ownerId"]')?.value || authState.user?.id,
        ownerType: form.querySelector('[name="ownerType"]')?.value || "user",
        isPublic: Boolean(form.querySelector('[name="isPublic"]')?.checked)
      };
      try {
        await postJson("/api/calendars", payload, { token: authState.token });
        setFormFeedback(form, "Created calendar", "success");
      } catch (error) {
        setFormFeedback(form, error.message || "Create failed");
      }
    });
  });

  document.querySelectorAll("form[data-permission-create]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const authState = readAuthState();
      if (!authState?.token) {
        setFormFeedback(form, "Sign in to assign permissions");
        return;
      }
      const calendarId = form.querySelector('[name="calendarId"]')?.value?.trim();
      const userId = form.querySelector('[name="userId"]')?.value?.trim();
      if (!calendarId || !userId) {
        setFormFeedback(form, "Calendar ID and User ID are required");
        return;
      }
      const permissions = getSelectedPermissions(form);
      if (!permissions.length) {
        setFormFeedback(form, "Select at least one permission");
        return;
      }
      try {
        await postJson("/api/permissions", { calendarId, userId, permissions }, { token: authState.token });
        setFormFeedback(form, "Permissions assigned successfully", "success");
      } catch (error) {
        setFormFeedback(form, error.message || "Permission failed");
      }
    });
  });
}

function initSharingControls() {
  document.querySelectorAll("form[data-share-link]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const authState = readAuthState();
      if (!authState?.token) {
        setFormFeedback(form, "Sign in to generate a share link");
        return;
      }
      const calendarId = form.querySelector('[name="calendarId"]')?.value?.trim();
      if (!calendarId) {
        setFormFeedback(form, "Calendar ID is required");
        return;
      }
      const permissions = getSelectedPermissions(form);
      if (!permissions.length) {
        setFormFeedback(form, "Select at least one permission");
        return;
      }
      try {
        const response = await postJson("/api/sharing", { calendarId, permissions }, { token: authState.token });
        setFormFeedback(form, `Share link ready: ${response.link}`, "success");
      } catch (error) {
        setFormFeedback(form, error.message || "Share failed");
      }
    });
  });
}

function createEventId() {
  return `evt-${Math.random().toString(16).slice(2, 10)}`;
}

function parseEventDateTime(dateValue, timeValue = "09:00") {
  if (!dateValue) {
    return null;
  }
  const candidate = new Date(`${dateValue}T${timeValue || "09:00"}:00.000Z`);
  if (Number.isNaN(candidate.getTime())) {
    return null;
  }
  return candidate.toISOString();
}

function buildEventPayload(form, authState) {
  const errors = [];
  if (!authState?.user) {
    errors.push("Sign in to create events.");
  }
  const title = form?.querySelector('[name="title"]')?.value?.trim() || "";
  const calendarId = form?.querySelector('[name="calendarId"]')?.value?.trim() || "";
  const startsDate = form?.querySelector('[name="startsDate"]')?.value || "";
  const startsTime = form?.querySelector('[name="startsTime"]')?.value || "";
  const endsDate = form?.querySelector('[name="endsDate"]')?.value || "";
  const endsTime = form?.querySelector('[name="endsTime"]')?.value || "";
  const description = form?.querySelector('[name="description"]')?.value || "";

  if (!calendarId) {
    errors.push("Calendar ID is required.");
  }
  if (!title) {
    errors.push("Event title is required.");
  }
  if (!startsDate || !endsDate || (!startsTime && !endsTime)) {
    errors.push("Start and end times are required.");
  }

  const startsAt = parseEventDateTime(startsDate, startsTime);
  const endsAt = parseEventDateTime(endsDate, endsTime);
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    errors.push("End time must be after the start time.");
  }

  return {
    errors,
    payload: {
      id: createEventId(),
      title,
      calendarId,
      calendarIds: calendarId ? [calendarId] : [],
      startsAt,
      endsAt,
      description,
      createdBy: authState?.user?.id
    }
  };
}

function renderEventManagementList(events = []) {
  if (!events.length) {
    return renderEmptyState({
      title: "Event Management",
      message: "No events found yet. Create one to get started."
    });
  }

  return `
    <ul class="event-manager">
      ${events
        .map(
          (event) => `
        <li class="event-manager__item">
          <div>
            <strong>${event.title}</strong>
            <p class="muted">${formatEventDateLabel(event.startsAt)}</p>
            <p>${event.description || "No description provided."}</p>
          </div>
          <button class="ghost event-manager__action" type="button" data-event-delete="${event.id}">
            Remove
          </button>
        </li>
      `
        )
        .join("")}
    </ul>
  `;
}

function setEventListFeedback(container, message, tone = "error") {
  if (!container) {
    return;
  }
  const feedback = container.querySelector("[data-event-list-feedback]");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.classList.remove("is-hidden");
}

async function refreshEventList(container, calendarId, token) {
  if (!container) {
    return;
  }
  container.dataset.calendarId = calendarId || "";
  if (!calendarId) {
    container.innerHTML = renderEventManagementList([]);
    return;
  }
  try {
    const response = await fetchJson(`/api/events?calendarId=${calendarId}`, { token });
    container.innerHTML = renderEventManagementList(response.events || []);
  } catch (error) {
    container.innerHTML = renderEmptyState({
      title: "Event Management",
      message: "Unable to load events right now."
    });
  }
}

function initEventModal() {
  document.querySelectorAll("[data-event-modal-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modalId = trigger.dataset.eventModalOpen;
      const modal = document.getElementById(modalId);
      if (!modal) {
        return;
      }
      modal.classList.add("event-modal--open");
      modal.setAttribute("aria-hidden", "false");
    });
  });
  document.querySelectorAll("[data-event-modal]").forEach((modal) => {
    modal.querySelectorAll("[data-event-modal-close]").forEach((button) => {
      button.addEventListener("click", () => {
        modal.classList.remove("event-modal--open");
        modal.setAttribute("aria-hidden", "true");
      });
    });
  });
}

function initEventCreation() {
  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!form || form.nodeName !== "FORM") {
      return;
    }
    if (!form.hasAttribute("data-event-create")) {
      return;
    }
    event.preventDefault();
    const authState = readAuthState();
    const { errors, payload } = buildEventPayload(form, authState);
    if (errors.length) {
      setFormFeedback(form, errors.join(" "));
      return;
    }
    try {
      await postJson("/api/events", payload, { token: authState.token });
      setFormFeedback(form, "Event created successfully", "success");
      const targetId = form.dataset.eventListTarget;
      if (targetId) {
        const container = document.getElementById(targetId);
        await refreshEventList(container, payload.calendarId, authState.token);
      }
      if (form.hasAttribute("data-event-modal-close-on-success")) {
        const modal = form.closest("[data-event-modal]");
        if (modal) {
          modal.classList.remove("event-modal--open");
          modal.setAttribute("aria-hidden", "true");
        }
      }
    } catch (error) {
      setFormFeedback(form, error.message || "Unable to create event");
    }
  });
}

function initEventManagement() {
  document.addEventListener("submit", async (event) => {
    const form = event.target;
    if (!form || form.nodeName !== "FORM") {
      return;
    }
    if (!form.hasAttribute("data-event-filter")) {
      return;
    }
    event.preventDefault();
    const authState = readAuthState();
    if (!authState?.token) {
      setFormFeedback(form, "Sign in to load events");
      return;
    }
    const calendarId = form.querySelector('[name="calendarId"]')?.value?.trim();
    if (!calendarId) {
      setFormFeedback(form, "Calendar ID is required");
      return;
    }
    const targetId = form.dataset.eventListTarget;
    const container = targetId ? document.getElementById(targetId) : null;
    await refreshEventList(container, calendarId, authState.token);
  });

  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!target || !target.matches("[data-event-delete]")) {
      return;
    }
    const eventId = target.dataset.eventDelete;
    const container = target.closest("[data-event-list]");
    const calendarId = container?.dataset.calendarId;
    const authState = readAuthState();
    if (!eventId || !container || !calendarId || !authState?.token) {
      return;
    }
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      if (!response.ok) {
        setEventListFeedback(container, "Unable to delete event");
        return;
      }
      await refreshEventList(container, calendarId, authState.token);
    } catch (error) {
      setEventListFeedback(container, "Unable to delete event");
    }
  });
}

async function initProfileManagement() {
  const container = document.getElementById("profile-management");
  const form = container?.querySelector("[data-profile-form]");
  if (!form) {
    return;
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const authState = readAuthState();
    if (!authState?.token) {
      setFormFeedback(form, "Sign in to update your profile");
      return;
    }
    const name = form.querySelector('[name="name"]')?.value?.trim();
    const email = form.querySelector('[name="email"]')?.value?.trim();
    if (!name || !email) {
      setFormFeedback(form, "Name and email are required");
      return;
    }
    const organizationId = form.querySelector('[name="organizationId"]')?.value || "";
    const role = form.querySelector('[name="role"]')?.value || "";
    try {
      const response = await postJson(
        "/api/auth/profile",
        { name, email, organizationId, role },
        { token: authState.token }
      );
      const updatedState = { ...authState, user: response.user };
      writeAuthState(updatedState);
      updateAccountSections(response.user);
      if (!container.querySelector("[data-profile-form]")) {
        container.innerHTML = renderProfileManagement(response.user);
      }
      setFormFeedback(form, "Profile updated successfully", "success");
    } catch (error) {
      setFormFeedback(form, error.message || "Profile update failed");
    }
  });
}

function updateAccountSections(user) {
  const profileCard = document.getElementById("profile-card");
  if (profileCard) {
    profileCard.innerHTML = renderProfile(user);
  }
  const highlights = document.getElementById("home-highlights");
  if (highlights) {
    highlights.innerHTML = renderHighlights(getAccountHighlights(user));
  }
  const profileManagement = document.getElementById("profile-management");
  if (profileManagement) {
    const form = profileManagement.querySelector("[data-profile-form]");
    if (form) {
      const assignValue = (name, value) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (input) {
          input.value = value || "";
        }
      };
      assignValue("name", user?.name);
      assignValue("email", user?.email);
      assignValue("organizationId", user?.organizationId);
      assignValue("role", user?.role);
    } else {
      profileManagement.innerHTML = renderProfileManagement(user);
    }
  }
}

async function loadCalendarOverview(authState) {
  if (!authState?.token) {
    return null;
  }
  const calendarsResponse = await fetchJson("/api/calendars", { token: authState.token });
  const calendars = calendarsResponse.calendars || [];
  const primaryCalendar = calendars[0] || null;
  const eventsResponse = primaryCalendar
    ? await fetchJson(`/api/events?calendarId=${primaryCalendar.id}`, { token: authState.token })
    : { events: [] };
  const events = eventsResponse.events || [];
  return { calendars, primaryCalendar, events };
}

async function init() {
  const sections = [
    "profile-card",
    "profile-management",
    "home-highlights",
    "user-dashboard",
    "org-dashboard",
    "calendar-view",
    "event-list",
    "access-matrix",
    "message-board",
    "embed-widget",
    "sharing-options",
    "audit-history",
    "role-management",
    "fault-tolerance",
    "developer-portal",
    "observability",
    "operational-alerts"
  ];
  const hasSections = sections.some((id) => document.getElementById(id));
  if (!hasSections) {
    return { hydrated: false };
  }

  const authState = readAuthState();
  if (!authState?.token) {
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) {
        return;
      }
      if (id === "profile-card") {
        element.innerHTML = renderProfile(null);
        return;
      }
      if (id === "profile-management") {
        element.innerHTML = renderProfileManagement(null);
        return;
      }
      if (id === "home-highlights") {
        element.innerHTML = renderHighlights([]);
        return;
      }
      element.innerHTML = renderEmptyState({
        title: id.replace(/-/g, " "),
        message: "Sign in to view this section."
      });
    });
    return { hydrated: true };
  }

  updateAccountSections(authState.user);

  const orgDashboard = document.getElementById("org-dashboard");
  if (orgDashboard) {
    if (authState.user?.organizationId) {
      orgDashboard.innerHTML = renderOrganizationStats({
        name: authState.user.organizationId
      });
    } else {
      orgDashboard.innerHTML = renderOrganizationStats(null);
    }
  }

  const calendarView = document.getElementById("calendar-view");
  const eventList = document.getElementById("event-list");
  if (calendarView || eventList) {
    try {
      const overview = await loadCalendarOverview(authState);
      if (!overview || overview.calendars.length === 0) {
        if (calendarView) {
          calendarView.innerHTML = renderEmptyState({
            title: "Calendar",
            message: "No calendars available yet."
          });
        }
      } else if (calendarView) {
        const count = overview.calendars.length;
        const summary = `${count} calendar${count === 1 ? "" : "s"} connected.`;
        calendarView.innerHTML = renderCalendarView({
          label: overview.primaryCalendar?.name || "Calendar",
          summary,
          events: overview.events
        });
      }
      if (eventList) {
        eventList.innerHTML = renderEventList({
          title: "Events",
          items: overview?.events?.map((event) => ({
            title: event.title,
            startsAt: event.startsAt
          })) || []
        });
      }
    } catch (error) {
      if (calendarView) {
        calendarView.innerHTML = renderEmptyState({
          title: "Calendar",
          message: "Unable to load your calendar right now."
        });
      }
    }
  }

  const accessMatrix = document.getElementById("access-matrix");
  if (accessMatrix) {
    accessMatrix.innerHTML = renderAccessMatrix([]);
  }
  const messageBoard = document.getElementById("message-board");
  if (messageBoard) {
    messageBoard.innerHTML = renderMessageBoard();
  }
  const embedWidget = document.getElementById("embed-widget");
  if (embedWidget) {
    embedWidget.innerHTML = renderEmbedWidget(null);
  }
  const sharingOptions = document.getElementById("sharing-options");
  if (sharingOptions) {
    sharingOptions.innerHTML = renderSharingOptions();
  }
  const auditHistory = document.getElementById("audit-history");
  if (auditHistory) {
    auditHistory.innerHTML = renderAuditHistory();
  }
  const roleManagement = document.getElementById("role-management");
  if (roleManagement) {
    roleManagement.innerHTML = renderRoleManagement();
  }
  const faultTolerance = document.getElementById("fault-tolerance");
  if (faultTolerance) {
    faultTolerance.innerHTML = renderFaultTolerance();
  }
  const developerPortal = document.getElementById("developer-portal");
  if (developerPortal) {
    developerPortal.innerHTML = renderDeveloperPortal();
  }
  const observability = document.getElementById("observability");
  if (observability) {
    const metrics = await fetchJson("/api/monitoring/metrics", { token: authState.token }).catch(() => ({}));
    const observabilityData = await fetchJson("/api/monitoring/observability", { token: authState.token }).catch(() => ({}));
    observability.innerHTML = renderObservability({
      ...observabilityData,
      stats: metrics
    });
  }
  const operationalAlerts = document.getElementById("operational-alerts");
  if (operationalAlerts) {
    const alerts = await fetchJson("/api/monitoring/alerts", { token: authState.token }).catch(() => ({}));
    operationalAlerts.innerHTML = renderOperationalAlerts(alerts);
  }

  return { hydrated: true };
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
    init()
      .then(() => {
        initProfileManagement();
        initCalendarControls();
        initSharingControls();
        initEventModal();
        initEventCreation();
        initEventManagement();
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

module.exports = {
  buildAuthPayload,
  clearAuthState,
  fetchJson,
  init,
  initAuthUI,
  readAuthState,
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
  postJson,
  redirectToCalendar,
  updateAccountSections
};
