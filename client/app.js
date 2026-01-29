const defaultSelectors = {
  profileCard: "profile-card",
  profileManagement: "profile-management",
  homeHighlights: "home-highlights",
  userDashboard: "user-dashboard",
  orgDashboard: "org-dashboard",
  calendarView: "calendar-view",
  eventList: "event-list",
  accessMatrix: "access-matrix",
  messageBoard: "message-board",
  embedWidget: "embed-widget",
  sharingOptions: "sharing-options",
  auditHistory: "audit-history",
  roleManagement: "role-management",
  faultTolerance: "fault-tolerance",
  developerPortal: "developer-portal",
  observability: "observability",
  operationalAlerts: "operational-alerts"
};

const AUTH_STORAGE_KEY = "tylendar-auth";

function getStorage(storageOverride) {
  if (storageOverride) {
    return storageOverride;
  }
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage;
}

function readAuthState(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) {
    return null;
  }
  const raw = storage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
}

function writeAuthState(payload, storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) {
    return null;
  }
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

function clearAuthState(storageOverride) {
  const storage = getStorage(storageOverride);
  if (!storage) {
    return null;
  }
  storage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

function renderAuthStatus(state) {
  if (!state || !state.user) {
    return `<span class="auth-status__text">Not signed in</span>`;
  }
  const label = state.user.name || state.user.email || "Account";
  return `
    <span class="auth-status__text">Signed in as ${label}</span>
    <button class="ghost auth-logout" type="button" data-auth-logout>Log out</button>
  `;
}

function setAuthFeedback(message, tone = "info") {
  const feedback = document.querySelector("[data-auth-feedback]");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.classList.toggle("is-hidden", !message);
}

function setFormFeedback(form, message, tone = "info") {
  if (!form) {
    return;
  }
  const feedback = form.querySelector("[data-form-feedback]");
  if (!feedback) {
    return;
  }
  feedback.textContent = message;
  feedback.dataset.tone = tone;
  feedback.classList.toggle("is-hidden", !message);
}

function getSelectedPermissions(form) {
  if (!form) {
    return [];
  }
  return Array.from(form.querySelectorAll('input[name="permissions"]:checked'))
    .map((input) => input.value)
    .filter(Boolean);
}

function renderEmptyState({ title, message }) {
  return `
    <div class="empty-state">
      <h3>${title}</h3>
      <p class="muted">${message}</p>
    </div>
  `;
}

function updateAuthStatus(state, storageOverride) {
  const containers = document.querySelectorAll("[data-auth-status]");
  containers.forEach((container) => {
    container.innerHTML = renderAuthStatus(state);
    const logout = container.querySelector("[data-auth-logout]");
    if (logout) {
      logout.addEventListener("click", async () => {
        try {
          await postJson("/api/auth/logout", {}, { token: state?.token });
        } catch (error) {
          setAuthFeedback(error.message, "error");
        }
        clearAuthState(storageOverride);
        updateAuthStatus(null, storageOverride);
      });
    }
  });

  const isAuthed = Boolean(state && state.token);
  document.querySelectorAll("[data-auth-trigger]").forEach((button) => {
    button.disabled = isAuthed;
    button.classList.toggle("is-hidden", isAuthed);
  });
}

function buildAuthPayload(mode, form) {
  const getValue = (name) => {
    const input = form.querySelector(`[name="${name}"]`);
    return input ? input.value.trim() : "";
  };
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

function renderProfile(profile) {
  if (!profile) {
    return renderEmptyState({
      title: "Profile",
      message: "Sign in to view your profile details."
    });
  }

  const details = [
    { label: "Email", value: profile.email || "—" },
    { label: "Organization", value: profile.organizationId || "None" },
    { label: "Role", value: profile.role || "member" }
  ];

  return `
    <h3>${profile.name || "Account"}</h3>
    <ul class="list">
      ${details.map((item) => `<li>${item.label}: ${item.value}</li>`).join("")}
    </ul>
  `;
}

function renderProfileManagement(profile) {
  if (!profile) {
    return renderEmptyState({
      title: "Profile Management",
      message: "Sign in to update your account details."
    });
  }

  return `
    <h3>Manage profile</h3>
    <form class="form" data-profile-form>
      <label class="form-field">
        <span>Name</span>
        <input type="text" name="name" value="${profile.name || ""}" required />
      </label>
      <label class="form-field">
        <span>Email</span>
        <input type="email" name="email" value="${profile.email || ""}" required />
      </label>
      <label class="form-field">
        <span>Organization ID</span>
        <input type="text" name="organizationId" value="${profile.organizationId || ""}" />
      </label>
      <label class="form-field">
        <span>Role</span>
        <input type="text" name="role" value="${profile.role || "member"}" />
      </label>
      <button class="primary" type="submit">Save profile</button>
      <div class="form-feedback is-hidden" data-form-feedback></div>
    </form>
  `;
}

function renderHighlights(highlights = []) {
  if (!highlights.length) {
    return renderEmptyState({
      title: "Account Summary",
      message: "No account details available yet."
    });
  }

  const items = highlights
    .map(
      (highlight) => `
        <li>
          <strong>${highlight.title}</strong>
          <p>${highlight.description}</p>
        </li>
      `
    )
    .join("");

  return `
    <h3>Account Summary</h3>
    <ul class="list">${items}</ul>
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
    <h3>${title}</h3>
    <ul class="list">
      ${items.map((item) => `<li>${item}</li>`).join("")}
    </ul>
  `;
}

function renderOrganizationStats(org) {
  if (!org || !org.name) {
    return renderEmptyState({
      title: "Organization Dashboard",
      message: "No organization data is available yet."
    });
  }

  const stats = [
    `Active calendars: ${org.activeCalendars ?? 0}`,
    `Upcoming events: ${org.upcomingEvents ?? 0}`,
    `Members: ${org.memberCount ?? 0}`
  ];

  return `
    <h3>${org.name} Dashboard</h3>
    <ul class="list">${stats.map((stat) => `<li>${stat}</li>`).join("")}</ul>
  `;
}

function renderCalendarView(calendar = {}) {
  const label = calendar.label || "Calendar";
  const summary = calendar.summary || "No calendar data available.";
  const events = Array.isArray(calendar.events)
    ? calendar.events
    : Array.isArray(calendar.featuredEvents)
      ? calendar.featuredEvents
      : [];

  const items = events.length
    ? events
        .map((event) => {
          const dateLabel = event.day || event.startsAt || "Unscheduled";
          return `<li><strong>${event.title}</strong> · ${dateLabel}</li>`;
        })
        .join("")
    : `<li class="muted">No events scheduled.</li>`;

  return `
    <h3>${label}</h3>
    <p class="muted">${summary}</p>
    <ul class="list">${items}</ul>
  `;
}

function renderEventList(view = { title: "Events", items: [] }) {
  const list = view.items.length
    ? view.items
    : [
        {
          title: "No events scheduled",
          day: ""
        }
      ];

  return `
    <h3>${view.title}</h3>
    <ul class="list">
      ${list
        .map((event) => `<li>${event.title}${event.day ? ` · ${event.day}` : ""}</li>`)
        .join("")}
    </ul>
  `;
}

function renderAccessMatrix(entries = []) {
  if (!entries.length) {
    return renderEmptyState({
      title: "Access Assignments",
      message: "No access entries have been configured."
    });
  }

  return `
    <h3>Access Assignments</h3>
    <table class="table">
      <thead>
        <tr>
          <th>User</th>
          <th>Calendar</th>
          <th>Permissions</th>
        </tr>
      </thead>
      <tbody>
        ${entries
          .map(
            (entry) => `
          <tr>
            <td>${entry.user}</td>
            <td>${entry.calendar}</td>
            <td>${entry.permissions.join(", ")}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderMessageBoard(board = { eventId: "", entries: [] }) {
  if (!board.entries.length) {
    return renderEmptyState({
      title: "MessageBoard",
      message: "No event comments available."
    });
  }

  const messages = board.entries
    .map(
      (entry) => `
      <div class="message">
        <strong>${entry.author}</strong>
        <p>${entry.message}</p>
        <span>${entry.time}</span>
      </div>
    `
    )
    .join("");

  return `
    <h3>MessageBoard · ${board.eventId}</h3>
    ${messages}
  `;
}

function renderEmbedWidget(widget) {
  if (!widget || !widget.title) {
    return renderEmptyState({
      title: "Embed Widget",
      message: "No public embed is available."
    });
  }

  return `
    <h3>Embed Widget</h3>
    <p class="muted">${widget.title}</p>
    <div class="code-block">${widget.sampleSnippet || "Embed snippet unavailable."}</div>
  `;
}

function renderSharingOptions(payload = { options: [] }) {
  if (!payload.options.length) {
    return renderEmptyState({
      title: "Sharing",
      message: "No sharing options configured."
    });
  }

  const items = payload.options
    .map((option) => {
      const extras = option.formats
        ? `Formats: ${option.formats.join(", ")}`
        : option.link
          ? option.link
          : option.permissions
            ? `Permissions: ${option.permissions.join(", ")}`
            : "";
      return `
        <li>
          <strong>${option.channel}</strong>
          <p>${option.description}</p>
          ${extras ? `<span class="muted">${extras}</span>` : ""}
        </li>
      `;
    })
    .join("");

  return `
    <h3>Sharing</h3>
    <ul class="list">${items}</ul>
  `;
}

function renderAuditHistory(payload = { entries: [] }) {
  if (!payload.entries.length) {
    return renderEmptyState({
      title: "Audit History",
      message: "No audit activity recorded."
    });
  }

  const entries = payload.entries
    .map(
      (entry) => `
      <div class="audit-entry">
        <strong>${entry.action}</strong>
        <p>${entry.summary}</p>
        <span>${entry.actor} · ${entry.status} · ${entry.occurredAt}</span>
      </div>
    `
    )
    .join("");

  return `
    <h3>Audit History</h3>
    ${entries}
  `;
}

function renderRoleManagement(payload = { roles: [], assignments: [] }) {
  if (!payload.roles.length && !payload.assignments.length) {
    return renderEmptyState({
      title: "Role Management",
      message: "No roles or assignments configured."
    });
  }

  const roles = payload.roles
    .map(
      (role) => `
        <li>
          <strong>${role.name}</strong>
          ${role.summary ? `<p>${role.summary}</p>` : ""}
          ${role.permissions?.length ? `<span class="muted">${role.permissions.join(", ")}</span>` : ""}
        </li>
      `
    )
    .join("");

  const assignments = payload.assignments
    .map(
      (assignment) => `
        <li>
          ${assignment.user} · ${assignment.roleId} · ${assignment.assignedBy}
          <span class="muted">${assignment.assignedAt}</span>
        </li>
      `
    )
    .join("");

  return `
    <h3>Role Management</h3>
    <div class="grid two">
      <div>
        <h4>Roles</h4>
        <ul class="list">${roles}</ul>
      </div>
      <div>
        <h4>Assignments</h4>
        <ul class="list">${assignments}</ul>
      </div>
    </div>
  `;
}

function renderFaultTolerance(snapshot = { snapshots: [] }) {
  if (!snapshot.snapshots.length) {
    return renderEmptyState({
      title: "Fault Tolerance",
      message: "No fault-tolerance reports available."
    });
  }

  const items = snapshot.snapshots
    .map(
      (entry) => `
        <li>
          <strong>${entry.pattern}</strong>
          <p>${entry.detail}</p>
          <span class="muted">${entry.status}</span>
        </li>
      `
    )
    .join("");

  return `
    <h3>Fault Tolerance</h3>
    <ul class="list">${items}</ul>
  `;
}

function renderDeveloperPortal(portal = { headline: "Developer Portal", description: "", resources: [], status: "" }) {
  const resources = portal.resources
    .map(
      (resource) => `
        <li>
          <strong>${resource.title}</strong>
          <p>${resource.detail}</p>
        </li>
      `
    )
    .join("");

  if (!resources.length) {
    return renderEmptyState({
      title: portal.headline || "Developer Portal",
      message: portal.description || "No developer resources are available."
    });
  }

  return `
    <h3>${portal.headline}</h3>
    <p class="muted">${portal.description}</p>
    <ul class="list">${resources}</ul>
    ${portal.status ? `<p class="muted">${portal.status}</p>` : ""}
  `;
}

function renderObservability(
  overview = { uptimeSeconds: 0, latencyP95Ms: null, errorRate: null, highlights: [], stats: {} }
) {
  const latency = overview.latencyP95Ms ?? "N/A";
  const errorRate = overview.errorRate ?? "N/A";
  const highlights = overview.highlights || [];
  const stats = overview.stats || {};
  const statRows = [
    { label: "Users", value: stats.users ?? "N/A" },
    { label: "Events", value: stats.events ?? "N/A" },
    { label: "Metrics uptime (seconds)", value: stats.uptimeSeconds ?? "N/A" }
  ];

  return `
    <h3>Server Status</h3>
    <ul class="list">
      <li>Uptime (seconds): ${overview.uptimeSeconds ?? 0}</li>
      <li>P95 Latency (ms): ${latency}</li>
      <li>Error Rate: ${errorRate}</li>
    </ul>
    <h4>Service statistics</h4>
    <ul class="list">
      ${statRows.map((row) => `<li>${row.label}: ${row.value}</li>`).join("")}
    </ul>
    ${highlights.length
      ? `<div class="badges">
      ${highlights.map((item) => `<span class="badge">${item}</span>`).join("")}
    </div>`
      : ""}
  `;
}

function renderOperationalAlerts(payload = { alerts: [] }) {
  if (!payload.alerts.length) {
    return renderEmptyState({
      title: "Operational Alerts",
      message: "No alerts reported."
    });
  }

  const alerts = payload.alerts
    .map(
      (alert) => `
        <li>
          <strong>${alert.severity.toUpperCase()}</strong>
          <p>${alert.message}</p>
          <span class="muted">${alert.status}</span>
        </li>
      `
    )
    .join("");

  return `
    <h3>Operational Alerts</h3>
    <ul class="list">${alerts}</ul>
  `;
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

async function postJson(url, payload, { token } = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data && data.error ? data.error : "Request failed";
    throw new Error(message);
  }
  return data;
}

function getAccountHighlights(user) {
  if (!user) {
    return [];
  }
  return [
    { title: "Email", description: user.email || "—" },
    { title: "Organization", description: user.organizationId || "None" },
    { title: "Role", description: user.role || "member" }
  ];
}

function updateAccountSections(user) {
  const profileCard = document.getElementById(defaultSelectors.profileCard);
  if (profileCard) {
    profileCard.innerHTML = renderProfile(user);
  }
  const highlights = document.getElementById(defaultSelectors.homeHighlights);
  if (highlights) {
    highlights.innerHTML = renderHighlights(getAccountHighlights(user));
  }
  const profileManagement = document.getElementById(defaultSelectors.profileManagement);
  if (profileManagement) {
    const form = profileManagement.querySelector("[data-profile-form]");
    if (form) {
      const setValue = (name, value) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) {
          field.value = value;
        }
      };
      setValue("name", user?.name || "");
      setValue("email", user?.email || "");
      setValue("organizationId", user?.organizationId || "");
      setValue("role", user?.role || "member");
    } else {
      profileManagement.innerHTML = renderProfileManagement(user);
    }
  }
}

async function initProfileManagement() {
  const form = document.querySelector("[data-profile-form]");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const authState = readAuthState();
    const token = authState?.token;
    if (!token) {
      setFormFeedback(form, "Sign in to update your profile.", "error");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      organizationId: String(formData.get("organizationId") || "").trim(),
      role: String(formData.get("role") || "").trim()
    };

    if (!payload.name || !payload.email) {
      setFormFeedback(form, "Name and email are required.", "error");
      return;
    }

    try {
      const response = await postJson("/api/auth/profile", payload, { token });
      const updatedState = { token, user: response.user };
      writeAuthState(updatedState);
      updateAuthStatus(updatedState);
      updateAccountSections(response.user);
      setFormFeedback(form, "Profile updated successfully.", "success");
    } catch (error) {
      setFormFeedback(form, error.message, "error");
    }
  });
}

function initCalendarControls() {
  const authState = readAuthState();
  const token = authState?.token;

  const createForm = document.querySelector("[data-calendar-create]");
  if (createForm) {
    createForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!token) {
        setFormFeedback(createForm, "Sign in to create a calendar.", "error");
        return;
      }

      const formData = new FormData(createForm);
      const name = String(formData.get("name") || "").trim();
      const ownerType = String(formData.get("ownerType") || "").trim();
      const ownerId = String(formData.get("ownerId") || "").trim();
      const isPublic = formData.get("isPublic") === "on";

      if (!name) {
        setFormFeedback(createForm, "Calendar name is required.", "error");
        return;
      }

      try {
        const calendar = await postJson(
          "/api/calendars",
          {
            name,
            ownerType: ownerType || undefined,
            ownerId: ownerId || undefined,
            isPublic
          },
          { token }
        );
        setFormFeedback(
          createForm,
          `Created calendar "${calendar.name}" with id ${calendar.id}.`,
          "success"
        );
        createForm.reset();
      } catch (error) {
        setFormFeedback(createForm, error.message, "error");
      }
    });
  }

  const permissionForm = document.querySelector("[data-permission-create]");
  if (permissionForm) {
    permissionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!token) {
        setFormFeedback(permissionForm, "Sign in to assign permissions.", "error");
        return;
      }

      const formData = new FormData(permissionForm);
      const calendarId = String(formData.get("calendarId") || "").trim();
      const userId = String(formData.get("userId") || "").trim();
      const permissions = getSelectedPermissions(permissionForm);

      if (!calendarId || !userId) {
        setFormFeedback(permissionForm, "Calendar ID and User ID are required.", "error");
        return;
      }
      if (permissions.length === 0) {
        setFormFeedback(permissionForm, "Select at least one permission.", "error");
        return;
      }

      try {
        await postJson(
          "/api/permissions",
          {
            calendarId,
            userId,
            permissions
          },
          { token }
        );
        setFormFeedback(permissionForm, "Permissions assigned successfully.", "success");
        permissionForm.reset();
      } catch (error) {
        setFormFeedback(permissionForm, error.message, "error");
      }
    });
  }
}

function initSharingControls() {
  const authState = readAuthState();
  const token = authState?.token;
  const shareForm = document.querySelector("[data-share-link]");
  if (!shareForm) {
    return;
  }

  shareForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!token) {
      setFormFeedback(shareForm, "Sign in to generate a share link.", "error");
      return;
    }

    const formData = new FormData(shareForm);
    const calendarId = String(formData.get("calendarId") || "").trim();
    const permissions = getSelectedPermissions(shareForm);

    if (!calendarId) {
      setFormFeedback(shareForm, "Calendar ID is required.", "error");
      return;
    }
    if (permissions.length === 0) {
      setFormFeedback(shareForm, "Select at least one permission.", "error");
      return;
    }

    try {
      const response = await postJson(
        "/api/sharing/link",
        {
          calendarId,
          permissions
        },
        { token }
      );
      setFormFeedback(
        shareForm,
        `Share link ready: ${response.link}`,
        "success"
      );
    } catch (error) {
      setFormFeedback(shareForm, error.message, "error");
    }
  });
}

function initAuthUI({ storage } = {}) {
  const modal = document.getElementById("auth-modal");
  const triggers = document.querySelectorAll("[data-auth-trigger]");
  if (!modal || triggers.length === 0) {
    return { enabled: false };
  }

  const tabs = modal.querySelectorAll("[data-auth-tab]");
  const panels = modal.querySelectorAll("[data-auth-panel]");
  const forms = modal.querySelectorAll("form[data-auth-panel]");
  const closeTargets = modal.querySelectorAll("[data-auth-close]");

  const setMode = (mode) => {
    tabs.forEach((tab) => {
      tab.classList.toggle("auth-tab--active", tab.dataset.authTab === mode);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("auth-panel--active", panel.dataset.authPanel === mode);
    });
  };

  const openModal = (mode) => {
    setMode(mode);
    modal.classList.add("auth-modal--open");
    modal.setAttribute("aria-hidden", "false");
    setAuthFeedback("");
  };

  const closeModal = () => {
    modal.classList.remove("auth-modal--open");
    modal.setAttribute("aria-hidden", "true");
  };

  triggers.forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.authTrigger || "login");
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setMode(tab.dataset.authTab);
    });
  });

  closeTargets.forEach((target) => {
    target.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  forms.forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const mode = form.dataset.authPanel;
      try {
        const payload = buildAuthPayload(mode, form);
        const response = await postJson(`/api/auth/${mode}`, payload);
        writeAuthState(response, storage);
        updateAuthStatus(response);
        setAuthFeedback(`Signed in as ${response.user?.name || response.user?.email}`, "success");
        closeModal();
        form.reset();
      } catch (error) {
        setAuthFeedback(error.message, "error");
      }
    });
  });

  updateAuthStatus(readAuthState(storage), storage);
  return { enabled: true };
}

async function init(selectorOverrides = {}) {
  const selectors = { ...defaultSelectors, ...selectorOverrides };
  const targets = Object.values(selectors);
  const shouldHydrate = targets.some((selector) => document.getElementById(selector));
  if (!shouldHydrate) {
    return { hydrated: false };
  }

  const authState = readAuthState();
  const isSignedIn = Boolean(authState && authState.token);
  const accountHighlights = getAccountHighlights(authState?.user);

  const signInMessage = "Sign in to view this section.";

  const setSection = (selector, html) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerHTML = html;
    }
  };

  if (isSignedIn) {
    const orgPayload = authState.user.organizationId
      ? {
          name: authState.user.organizationId,
          activeCalendars: 0,
          upcomingEvents: 0,
          memberCount: 0
        }
      : null;

    setSection(selectors.profileCard, renderProfile(authState.user));
    setSection(selectors.profileManagement, renderProfileManagement(authState.user));
    setSection(selectors.homeHighlights, renderHighlights(accountHighlights));
    setSection(selectors.userDashboard, renderDashboard("User Dashboard", { items: [] }));
    setSection(selectors.orgDashboard, renderOrganizationStats(orgPayload));
    setSection(selectors.calendarView, renderCalendarView({ label: "Calendar", summary: "No calendars available.", events: [] }));
    setSection(selectors.eventList, renderEventList({ title: "Events", items: [] }));
    setSection(selectors.accessMatrix, renderAccessMatrix([]));
    setSection(selectors.messageBoard, renderMessageBoard({ eventId: "", entries: [] }));
    setSection(selectors.embedWidget, renderEmbedWidget(null));
    setSection(selectors.sharingOptions, renderSharingOptions({ options: [] }));
    setSection(selectors.auditHistory, renderAuditHistory({ entries: [] }));
    setSection(selectors.roleManagement, renderRoleManagement({ roles: [], assignments: [] }));
    setSection(selectors.faultTolerance, renderFaultTolerance({ snapshots: [] }));
    setSection(
      selectors.developerPortal,
      renderDeveloperPortal({ headline: "Developer Portal", description: "No developer resources are available.", resources: [], status: "" })
    );
    setSection(
      selectors.observability,
      renderObservability({ uptimeSeconds: 0, latencyP95Ms: null, errorRate: null, highlights: [], stats: {} })
    );
    setSection(selectors.operationalAlerts, renderOperationalAlerts({ alerts: [] }));
  } else {
    setSection(selectors.profileCard, renderProfile(null));
    setSection(selectors.profileManagement, renderProfileManagement(null));
    setSection(selectors.homeHighlights, renderHighlights([]));
    setSection(selectors.userDashboard, renderEmptyState({ title: "User Dashboard", message: signInMessage }));
    setSection(selectors.orgDashboard, renderEmptyState({ title: "Organization Dashboard", message: signInMessage }));
    setSection(selectors.calendarView, renderEmptyState({ title: "Calendar", message: signInMessage }));
    setSection(selectors.eventList, renderEmptyState({ title: "Events", message: signInMessage }));
    setSection(selectors.accessMatrix, renderEmptyState({ title: "Access", message: signInMessage }));
    setSection(selectors.messageBoard, renderEmptyState({ title: "MessageBoard", message: signInMessage }));
    setSection(selectors.embedWidget, renderEmptyState({ title: "Embed Widget", message: signInMessage }));
    setSection(selectors.sharingOptions, renderEmptyState({ title: "Sharing", message: signInMessage }));
    setSection(selectors.auditHistory, renderEmptyState({ title: "Audit History", message: signInMessage }));
    setSection(selectors.roleManagement, renderEmptyState({ title: "Role Management", message: signInMessage }));
    setSection(selectors.faultTolerance, renderEmptyState({ title: "Fault Tolerance", message: signInMessage }));
    setSection(selectors.developerPortal, renderEmptyState({ title: "Developer Portal", message: signInMessage }));
    setSection(
      selectors.observability,
      renderObservability({ uptimeSeconds: 0, latencyP95Ms: null, errorRate: null, highlights: [], stats: {} })
    );
    setSection(selectors.operationalAlerts, renderOperationalAlerts({ alerts: [] }));
  }

  if (document.getElementById(selectors.observability) && typeof window !== "undefined" && typeof window.fetch === "function") {
    try {
      const [observability, metrics, alerts] = await Promise.all([
        fetchJson("/api/monitoring/observability"),
        fetchJson("/api/monitoring/metrics"),
        fetchJson("/api/monitoring/alerts")
      ]);
      setSection(
        selectors.observability,
        renderObservability({
          ...observability,
          stats: {
            users: metrics.users,
            events: metrics.events,
            uptimeSeconds: metrics.uptimeSeconds
          }
        })
      );
      setSection(selectors.operationalAlerts, renderOperationalAlerts(alerts));
    } catch (error) {
      setSection(
        selectors.observability,
        renderEmptyState({ title: "Server Status", message: "Unable to load server status metrics." })
      );
    }
  }

  await initProfileManagement();
  initCalendarControls();
  initSharingControls();

  return { hydrated: true };
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    initAuthUI();
    init().catch((error) => {
      console.error(error);
    });
  });
}

/* istanbul ignore next */
if (typeof module !== "undefined") {
  module.exports = {
    buildAuthPayload,
    clearAuthState,
    fetchJson,
    init,
    initAuthUI,
    initCalendarControls,
    initSharingControls,
    postJson,
    readAuthState,
    getSelectedPermissions,
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
    renderProfileManagement,
    setFormFeedback,
    updateAuthStatus,
    writeAuthState,
    getAccountHighlights,
    initProfileManagement
  };
}
