const defaultSelectors = {
  profileCard: "profile-card",
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
  return `
    <h3>${profile.name}</h3>
    <p>${profile.title} · ${profile.role}</p>
    <p class="muted">${profile.location}</p>
    <div class="badges">
      ${profile.notifications
        .map((note) => `<span class="badge">${note}</span>`)
        .join("")}
    </div>
    <p class="muted">Last active: ${profile.lastActive}</p>
  `;
}

function renderHighlights(highlights) {
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
    <h3>Home Page Highlights</h3>
    <ul class="list">${items}</ul>
  `;
}

function renderDashboard(title, summary) {
  return `
    <h3>${title}</h3>
    <p class="muted">${summary.focusLabel || "Community pulse"}</p>
    <ul class="list">
      ${(summary.highlights || summary.departments || []).map((item) => `<li>${item}</li>`).join("")}
    </ul>
    <div class="badges">
      ${(summary.milestones || []).map((item) => `<span class="badge">${item}</span>`).join("")}
    </div>
  `;
}

function renderOrganizationStats(org) {
  const stats = [
    `Active calendars: ${org.activeCalendars}`,
    `Upcoming events: ${org.upcomingEvents}`,
    `Compliance score: ${org.complianceScore}`
  ];

  return `
    <h3>${org.name} Dashboard</h3>
    <ul class="list">${stats.map((stat) => `<li>${stat}</li>`).join("")}</ul>
    <div class="badges">
      ${org.departments.map((dept) => `<span class="badge">${dept}</span>`).join("")}
    </div>
  `;
}

function renderCalendarView(calendar) {
  const viewLabel = calendar.label || "Calendar";
  const summary = calendar.summary || "Overview of scheduled moments and focus blocks.";
  const ownerLabel = calendar.ownerName || calendar.userName || "You";
  const timezoneLabel = calendar.timezone || "Local time";
  const rangeLabel = calendar.rangeLabel || "This week";
  const availabilityLabel = calendar.availability || "3 open slots today";
  const inboxCount = typeof calendar.inboxCount === "number" ? calendar.inboxCount : 0;
  const quickActions =
    Array.isArray(calendar.quickActions) && calendar.quickActions.length
      ? calendar.quickActions
      : ["New event", "Block focus", "Share availability"];
  const focusAreas =
    Array.isArray(calendar.focusAreas) && calendar.focusAreas.length
      ? calendar.focusAreas
      : ["Deep work", "Team syncs", "Recharge"];
  const syncLabel = calendar.syncStatus || "Synced moments ago";
  const days =
    Array.isArray(calendar.days) && calendar.days.length
      ? calendar.days
      : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const events = Array.isArray(calendar.featuredEvents) ? calendar.featuredEvents : [];
  const viewKey = String(calendar.view || viewLabel).toLowerCase();
  const viewOptions = [
    { key: "month", label: "Month" },
    { key: "2-week", label: "2-week" },
    { key: "week", label: "Week" },
    { key: "day", label: "Day" }
  ];
  const baseSlots = ["8:00 AM", "10:00 AM", "12:00 PM", "1:00 PM", "3:00 PM", "5:00 PM"];
  const timeSlots = ["All day", ...baseSlots];
  const dayOrder = new Map(days.map((day, index) => [day, index]));
  const timeOrder = new Map(baseSlots.map((slot, index) => [slot, index]));
  const isAllDayEvent = (event) => !event.time || !timeOrder.has(event.time);
  const agendaItems = [...events].sort((a, b) => {
    const dayDelta = (dayOrder.get(a.day) ?? 99) - (dayOrder.get(b.day) ?? 99);
    if (dayDelta !== 0) {
      return dayDelta;
    }
    return (timeOrder.get(a.time) ?? 99) - (timeOrder.get(b.time) ?? 99);
  });
  const dayBadges = days
    .map((day) => {
      const count = events.filter((event) => event.day === day).length;
      return `
        <div class="calendar-pill">
          <span>${day}</span>
          <span class="calendar-pill__count">${count}</span>
        </div>
      `;
    })
    .join("");
  const viewPills = viewOptions
    .map((option) => {
      const isActive =
        viewKey.includes(option.key) ||
        viewLabel.toLowerCase().includes(option.label.toLowerCase());
      return `
        <span class="calendar-pill${isActive ? " calendar-pill--active" : ""}">
          ${option.label}
        </span>
      `;
    })
    .join("");
  const gridHeader = days.map((day) => `<div class="calendar-grid__day">${day}</div>`).join("");
  const gridRows = timeSlots
    .map((slot) => {
      const cells = days
        .map((day) => {
          const slotEvents = events.filter((event) => {
            if (event.day !== day) {
              return false;
            }
            if (slot === "All day") {
              return isAllDayEvent(event);
            }
            return event.time === slot;
          });
          const eventCards = slotEvents
            .map((event) => {
              const calendarName = event.calendar || "Shared";
              const ownerName = event.owner || "Unassigned";
              return `
              <div class="calendar-event">
                <div class="calendar-event__title">${event.title}</div>
                <div class="calendar-event__meta">${calendarName} · ${ownerName}</div>
              </div>
            `;
            })
            .join("");
          const emptyState = `<span class="calendar-slot__empty">—</span>`;
          return `
            <div class="calendar-slot${slotEvents.length ? "" : " calendar-slot--empty"}">
              ${slotEvents.length ? eventCards : emptyState}
            </div>
          `;
        })
        .join("");
      return `
        <div class="calendar-grid__time">${slot}</div>
        ${cells}
      `;
    })
    .join("");
  const agendaList = agendaItems.length
    ? agendaItems
        .map((event) => {
          const calendarName = event.calendar || "Shared";
          const ownerName = event.owner || "Unassigned";
          return `
            <li>
              <strong>${event.title}</strong>
              <p>${calendarName} · ${ownerName}</p>
              <span class="muted">${event.day} · ${event.time || "All day"}</span>
            </li>
          `;
        })
        .join("")
    : `<li class="muted">No featured events scheduled yet.</li>`;
  const actionButtons = quickActions
    .map(
      (action) => `
        <button class="calendar-action" type="button">${action}</button>
      `
    )
    .join("");
  const focusList = focusAreas.map((area) => `<li>${area}</li>`).join("");

  return `
    <div class="calendar-view">
      <div class="calendar-view__header">
        <div>
          <p class="calendar-kicker">${rangeLabel} · ${timezoneLabel}</p>
          <h3>${viewLabel} Calendar View</h3>
          <p class="muted">${summary}</p>
          <div class="calendar-meta">
            <span>Owner: ${ownerLabel}</span>
            <span>Availability: ${availabilityLabel}</span>
            <span>Invites: ${inboxCount}</span>
          </div>
        </div>
        <div class="calendar-view__controls">
          <div class="calendar-control">
            <span class="calendar-control__label">Quick actions</span>
            <div class="calendar-control__actions">${actionButtons}</div>
          </div>
          <div class="calendar-control">
            <span class="calendar-control__label">Search & filters</span>
            <div class="calendar-search">
              <input type="search" placeholder="Search events or people" />
              <button class="ghost calendar-search__button" type="button">Filters</button>
            </div>
          </div>
          <div class="calendar-control">
            <span class="calendar-control__label">View</span>
            <div class="calendar-control__pills">${viewPills}</div>
          </div>
          <div class="calendar-control">
            <span class="calendar-control__label">Focus days</span>
            <div class="calendar-control__pills">${dayBadges}</div>
          </div>
        </div>
      </div>
      <div class="calendar-spotlight">
        <div class="calendar-panel">
          <h4>Focus areas</h4>
          <p class="muted">Balance the moments that matter most.</p>
          <ul class="list">${focusList}</ul>
        </div>
        <div class="calendar-panel">
          <h4>Availability pulse</h4>
          <p class="muted">${availabilityLabel}</p>
          <div class="calendar-panel__meta">
            <span>${timezoneLabel}</span>
            <span>${syncLabel}</span>
          </div>
        </div>
      </div>
      <div class="calendar-view__body">
        <div class="calendar-grid">
          <div class="calendar-grid__corner">Time</div>
          ${gridHeader}
          ${gridRows}
        </div>
        <div class="calendar-agenda">
          <h4>Upcoming focus</h4>
          <p class="muted">Quick list for the next featured moments.</p>
          <ul class="list">${agendaList}</ul>
        </div>
      </div>
    </div>
  `;
}

function renderEventList(view) {
  const list = view.items.length
    ? view.items
    : [
        {
          title: "No events scheduled",
          day: "",
          time: ""
        }
      ];

  return `
    <h3>Event List · ${view.title}</h3>
    <ul class="list">
      ${list
        .map((event) => `<li>${event.title} ${event.day ? `· ${event.day}` : ""}</li>`)
        .join("")}
    </ul>
  `;
}

function renderAccessMatrix(entries) {
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

function renderMessageBoard(board) {
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
  return `
    <h3>Embed Widget</h3>
    <p class="muted">${widget.title} · ${widget.theme}</p>
    <div class="badges">
      <span class="badge">Visibility: ${widget.visibility}</span>
      <span class="badge">API: ${widget.endpoint}</span>
    </div>
    <div class="code-block">${widget.sampleSnippet}</div>
  `;
}

function renderSharingOptions(payload) {
  const items = payload.options
    .map((option) => {
      const extras = option.formats ? `Formats: ${option.formats.join(", ")}` : option.link;
      return `
        <li>
          <strong>${option.channel}</strong>
          <p>${option.description}</p>
          <span class="muted">${extras}</span>
        </li>
      `;
    })
    .join("");

  return `
    <h3>Social Sharing & Export</h3>
    <ul class="list">${items}</ul>
  `;
}

function renderAuditHistory(payload) {
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

function renderRoleManagement(payload) {
  const roles = payload.roles
    .map(
      (role) => `
        <li>
          <strong>${role.name}</strong>
          <p>${role.summary}</p>
          <span class="muted">${role.permissions.join(", ")}</span>
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

function renderFaultTolerance(snapshot) {
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

function renderDeveloperPortal(portal) {
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

  return `
    <h3>${portal.headline}</h3>
    <p class="muted">${portal.description}</p>
    <ul class="list">${resources}</ul>
    <p class="muted">${portal.status}</p>
  `;
}

function renderObservability(overview) {
  return `
    <h3>Observability Dashboard</h3>
    <ul class="list">
      <li>Uptime: ${overview.uptime}</li>
      <li>P95 Latency: ${overview.latencyP95}</li>
      <li>Error Rate: ${overview.errorRate}</li>
    </ul>
    <div class="badges">
      ${overview.highlights.map((item) => `<span class="badge">${item}</span>`).join("")}
    </div>
  `;
}

function renderOperationalAlerts(payload) {
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
    setAuthFeedback("", "info");
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

  const [
    profile,
    home,
    userDash,
    orgDash,
    calendar,
    events,
    access,
    message,
    embed,
    sharing,
    audit,
    roles,
    faultTolerance,
    developer,
    observability,
    alerts
  ] =
    await Promise.all([
      fetchJson("/api/profile/user-1"),
      fetchJson("/api/home"),
      fetchJson("/api/dashboard/user"),
      fetchJson("/api/dashboard/org"),
      fetchJson("/api/calendar/view?view=month"),
      fetchJson("/api/events/list?range=month"),
      fetchJson("/api/access"),
      fetchJson("/api/events/evt-100/comments"),
      fetchJson("/api/embed/widget?calendarId=cal-1"),
      fetchJson("/api/sharing/preview?calendarId=cal-1"),
      fetchJson("/api/audit/history-snapshot"),
      fetchJson("/api/roles/summary?orgId=org-1"),
      fetchJson("/api/fault-tolerance/snapshot"),
      fetchJson("/api/developer/portal"),
      fetchJson("/api/monitoring/observability"),
      fetchJson("/api/monitoring/alerts")
    ]);

  const setSection = (selector, html) => {
    const element = document.getElementById(selector);
    if (element) {
      element.innerHTML = html;
    }
  };

  setSection(selectors.profileCard, renderProfile(profile));
  setSection(selectors.homeHighlights, renderHighlights(home.highlights));
  setSection(selectors.userDashboard, renderDashboard("User Dashboard", userDash));
  setSection(selectors.orgDashboard, renderOrganizationStats(orgDash));
  setSection(selectors.calendarView, renderCalendarView(calendar));
  setSection(selectors.eventList, renderEventList(events));
  setSection(selectors.accessMatrix, renderAccessMatrix(access.entries));
  setSection(selectors.messageBoard, renderMessageBoard(message));
  setSection(selectors.embedWidget, renderEmbedWidget(embed));
  setSection(selectors.sharingOptions, renderSharingOptions(sharing));
  setSection(selectors.auditHistory, renderAuditHistory(audit));
  setSection(selectors.roleManagement, renderRoleManagement(roles));
  setSection(selectors.faultTolerance, renderFaultTolerance(faultTolerance));
  setSection(selectors.developerPortal, renderDeveloperPortal(developer));
  setSection(selectors.observability, renderObservability(observability));
  setSection(selectors.operationalAlerts, renderOperationalAlerts(alerts));
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

if (typeof module !== "undefined") {
  module.exports = {
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
  };
}
