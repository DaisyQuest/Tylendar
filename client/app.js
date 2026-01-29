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
