const defaultSelectors = {
  profileCard: "profile-card",
  homeHighlights: "home-highlights",
  userDashboard: "user-dashboard",
  orgDashboard: "org-dashboard",
  calendarView: "calendar-view",
  eventList: "event-list",
  accessMatrix: "access-matrix",
  messageBoard: "message-board"
};

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
    <p class="muted">${summary.focusLabel || "Organization pulse"}</p>
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
  return `
    <h3>${calendar.label} Calendar View</h3>
    <p class="muted">${calendar.summary}</p>
    <div class="badges">
      ${calendar.days.map((day) => `<span class="badge">${day}</span>`).join("")}
    </div>
    <ul class="list">
      ${calendar.featuredEvents
        .map((event) => `<li>${event.title} · ${event.day} · ${event.time}</li>`)
        .join("")}
    </ul>
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return response.json();
}

async function init(selectorOverrides = {}) {
  const selectors = { ...defaultSelectors, ...selectorOverrides };

  const [profile, home, userDash, orgDash, calendar, events, access, message] =
    await Promise.all([
      fetchJson("/api/profile/user-1"),
      fetchJson("/api/home"),
      fetchJson("/api/dashboard/user"),
      fetchJson("/api/dashboard/org"),
      fetchJson("/api/calendar/view?view=month"),
      fetchJson("/api/events/list?range=month"),
      fetchJson("/api/access"),
      fetchJson("/api/events/evt-100/comments")
    ]);

  document.getElementById(selectors.profileCard).innerHTML = renderProfile(profile);
  document.getElementById(selectors.homeHighlights).innerHTML = renderHighlights(home.highlights);
  document.getElementById(selectors.userDashboard).innerHTML = renderDashboard(
    "User Dashboard",
    userDash
  );
  document.getElementById(selectors.orgDashboard).innerHTML = renderOrganizationStats(orgDash);
  document.getElementById(selectors.calendarView).innerHTML = renderCalendarView(calendar);
  document.getElementById(selectors.eventList).innerHTML = renderEventList(events);
  document.getElementById(selectors.accessMatrix).innerHTML = renderAccessMatrix(access.entries);
  document.getElementById(selectors.messageBoard).innerHTML = renderMessageBoard(message);
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    init().catch((error) => {
      console.error(error);
    });
  });
}

if (typeof module !== "undefined") {
  module.exports = {
    fetchJson,
    init,
    renderAccessMatrix,
    renderCalendarView,
    renderDashboard,
    renderEventList,
    renderHighlights,
    renderMessageBoard,
    renderOrganizationStats,
    renderProfile
  };
}
