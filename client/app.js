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

const COPY_FIELD_OPTIONS = [
  { key: "title", label: "Title", checked: true },
  { key: "description", label: "Description", checked: true },
  { key: "startsAt", label: "Start time", checked: true },
  { key: "endsAt", label: "End time", checked: true },
  { key: "calendarId", label: "Calendar", checked: true }
];

function encodeMenuPayload(payload) {
  if (!payload) {
    return "";
  }
  try {
    return encodeURIComponent(JSON.stringify(payload));
  } catch (error) {
    return "";
  }
}

function decodeMenuPayload(payload) {
  if (!payload) {
    return null;
  }
  try {
    return JSON.parse(decodeURIComponent(payload));
  } catch (error) {
    return null;
  }
}

function createEventCopyPayload(event, fields = []) {
  if (!event || !Array.isArray(fields) || fields.length === 0) {
    return {};
  }
  return fields.reduce((acc, field) => {
    if (Object.prototype.hasOwnProperty.call(event, field)) {
      acc[field] = event[field];
    }
    return acc;
  }, {});
}

function getTimeFromIso(value, fallback = "09:00") {
  if (!value) {
    return fallback;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return fallback;
  }
  const pad = (entry) => String(entry).padStart(2, "0");
  return `${pad(parsed.getUTCHours())}:${pad(parsed.getUTCMinutes())}`;
}

function addHourToTime(value = "") {
  const [hourPart, minutePart] = String(value).split(":");
  const hour = hourPart || "09";
  const minute = minutePart || "00";
  const nextHour = (Number.parseInt(hour, 10) + 1) % 24;
  return `${String(nextHour).padStart(2, "0")}:${minute}`;
}

function buildPasteEventPayload(clipboardEvent, { dateKey, calendarId } = {}) {
  if (!clipboardEvent || typeof clipboardEvent !== "object") {
    return null;
  }
  const resolvedCalendarId = clipboardEvent.calendarId || calendarId || "";
  const startsTime = getTimeFromIso(clipboardEvent.startsAt, "09:00");
  const endsTime = getTimeFromIso(clipboardEvent.endsAt, addHourToTime(startsTime));
  const resolvedDate = dateKey || "";
  const startsAt = resolvedDate ? parseEventDateTime(resolvedDate, startsTime) : clipboardEvent.startsAt || null;
  const endsAt = resolvedDate ? parseEventDateTime(resolvedDate, endsTime) : clipboardEvent.endsAt || null;
  return {
    id: clipboardEvent.id || createEventId(),
    title: clipboardEvent.title || "Copied event",
    description: clipboardEvent.description || "",
    calendarId: resolvedCalendarId,
    calendarIds: resolvedCalendarId ? [resolvedCalendarId] : [],
    startsAt,
    endsAt
  };
}

async function copyTextToClipboard(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const result = document.execCommand("copy");
  document.body.removeChild(textarea);
  return result;
}

async function readClipboardText() {
  if (typeof navigator !== "undefined" && navigator.clipboard?.readText) {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      return "";
    }
  }
  return "";
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
  const calendarId = payload.calendarId || "";
  const events = Array.isArray(payload.events) ? payload.events : [];
  const featuredEvents = Array.isArray(payload.featuredEvents) ? payload.featuredEvents : [];
  const scheduledEvents = events.length ? events : featuredEvents;
  const resolveReferenceDate = () => {
    if (payload.referenceDate) {
      const candidate = new Date(payload.referenceDate);
      if (!Number.isNaN(candidate.getTime())) {
        return candidate;
      }
    }
    const seeded = scheduledEvents.find((event) => event?.startsAt);
    if (seeded?.startsAt) {
      const candidate = new Date(seeded.startsAt);
      if (!Number.isNaN(candidate.getTime())) {
        return candidate;
      }
    }
    return new Date();
  };
  const referenceDate = resolveReferenceDate();
  const monthLabel = referenceDate.toLocaleString("en-US", { month: "long" });
  const yearLabel = referenceDate.getFullYear();
  const pad = (value) => String(value).padStart(2, "0");
  const formatDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const formatTimeLabel = (value) => {
    if (!value) {
      return "Unscheduled";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "Unscheduled";
    }
    return parsed.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };
  const validEvents = [];
  const unscheduledEvents = [];
  scheduledEvents.forEach((event) => {
    if (!event?.startsAt) {
      unscheduledEvents.push(event);
      return;
    }
    const parsed = new Date(event.startsAt);
    if (Number.isNaN(parsed.getTime())) {
      unscheduledEvents.push(event);
      return;
    }
    validEvents.push({ ...event, __date: parsed });
  });
  const eventMap = validEvents.reduce((acc, event) => {
    const key = formatDateKey(event.__date);
    acc[key] = acc[key] || [];
    acc[key].push(event);
    return acc;
  }, {});
  validEvents.sort((a, b) => a.__date - b.__date);
  const agendaItems = [
    ...validEvents.map((event) => ({
      title: event.title || "Untitled",
      label: `${formatEventDateLabel(event.startsAt)} · ${formatTimeLabel(event.startsAt)}`
    })),
    ...unscheduledEvents.map((event) => ({
      title: event?.title || "Untitled",
      label: formatTimeLabel(event?.startsAt)
    }))
  ];

  const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const startWeekday = startOfMonth.getDay();
  const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - startWeekday + 1;
    if (dayOffset <= 0) {
      const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, daysInPrevMonth + dayOffset);
      return { date, inMonth: false };
    }
    if (dayOffset > daysInMonth) {
      const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, dayOffset - daysInMonth);
      return { date, inMonth: false };
    }
    return { date: new Date(referenceDate.getFullYear(), referenceDate.getMonth(), dayOffset), inMonth: true };
  });

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekdayMarkup = weekdayLabels.map((day) => `<div>${day}</div>`).join("");
  const renderDayEventMenuItems = (dayEvents, action, dateKey) => {
    if (!dayEvents.length) {
      return `<span class="calendar-day-menu__empty">No events</span>`;
    }
    return dayEvents
      .map((event, index) => {
        const payload = encodeMenuPayload({
          ...event,
          id: event.id || `${dateKey}-${index}`
        });
        return `
          <button
            class="calendar-day-menu__item calendar-day-menu__item--nested"
            type="button"
            data-day-action="${action}"
            data-event-payload="${payload}"
            data-date-key="${dateKey}"
            data-calendar-id="${calendarId}"
          >
            ${event.title || "Untitled"}
          </button>
        `;
      })
      .join("");
  };
  const monthGrid = cells
    .map((cell) => {
      const key = formatDateKey(cell.date);
      const dayEvents = eventMap[key] || [];
      const eventMarkup = dayEvents.slice(0, 3).map((event) => `
        <li class="calendar-month__event">
          <span class="calendar-month__event-title">${event.title || "Untitled"}</span>
          <span class="calendar-month__event-time">${formatTimeLabel(event.startsAt)}</span>
        </li>
      `);
      const overflow = dayEvents.length > 3
        ? `<li class="calendar-month__more">+${dayEvents.length - 3} more</li>`
        : "";
      return `
        <div class="calendar-month__cell${cell.inMonth ? "" : " calendar-month__cell--outside"}">
          <div class="calendar-month__cell-header">
            <span class="calendar-month__date">${cell.date.getDate()}</span>
            <div class="calendar-day-menu" data-calendar-menu>
              <button
                class="calendar-day-menu__toggle"
                type="button"
                aria-expanded="false"
                aria-label="Open day actions"
                data-calendar-menu-toggle
              >
                ⋯
              </button>
              <div class="calendar-day-menu__panel" role="menu">
                <button
                  class="calendar-day-menu__item"
                  type="button"
                  data-day-action="new"
                  data-date-key="${key}"
                  data-calendar-id="${calendarId}"
                >
                  New Event
                </button>
                <div class="calendar-day-menu__group">
                  <span class="calendar-day-menu__label">Edit Events</span>
                  <div class="calendar-day-menu__list">
                    ${renderDayEventMenuItems(dayEvents, "edit", key)}
                  </div>
                </div>
                <div class="calendar-day-menu__group">
                  <span class="calendar-day-menu__label">Copy Event</span>
                  <div class="calendar-day-menu__list">
                    ${renderDayEventMenuItems(dayEvents, "copy", key)}
                  </div>
                </div>
                <div class="calendar-day-menu__group">
                  <span class="calendar-day-menu__label">Paste Event</span>
                  <button
                    class="calendar-day-menu__item calendar-day-menu__item--nested"
                    type="button"
                    data-day-action="paste"
                    data-date-key="${key}"
                    data-calendar-id="${calendarId}"
                  >
                    Paste from clipboard
                  </button>
                  <div class="calendar-day-menu__list">
                    ${renderDayEventMenuItems(dayEvents, "paste", key)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ul class="calendar-month__events">
            ${eventMarkup.join("")}
            ${overflow}
          </ul>
        </div>
      `;
    })
    .join("");

  const startOfWeek = new Date(referenceDate);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(referenceDate.getDate() - referenceDate.getDay());
  const buildRangeDays = (count) => Array.from({ length: count }, (_, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    return {
      key: formatDateKey(date),
      label: date.toLocaleString("en-US", { weekday: "short" }),
      date
    };
  });
  const weekDays = buildRangeDays(7);
  const twoWeekDays = buildRangeDays(14);
  const timeSlots = [
    { label: "08:00", hour: 8 },
    { label: "10:00", hour: 10 },
    { label: "12:00", hour: 12 },
    { label: "14:00", hour: 14 },
    { label: "16:00", hour: 16 }
  ];
  const gridHeader = `
    <div class="calendar-grid__corner">Week focus</div>
    ${weekDays.map((day) => `<div class="calendar-grid__day">${day.label} ${day.date.getDate()}</div>`).join("")}
  `;
  const gridRows = timeSlots
    .map((slot) => {
      const slotsMarkup = weekDays
        .map((day) => {
          const dayEvents = eventMap[day.key] || [];
          const slotEvents = dayEvents.filter((event) => {
            const hour = event.__date?.getHours?.();
            return hour === slot.hour;
          });
          if (!slotEvents.length) {
            return `
              <div class="calendar-slot calendar-slot--empty">
                <div class="calendar-slot__empty">Open</div>
              </div>
            `;
          }
          return `
            <div class="calendar-slot">
              ${slotEvents
                .map(
                  (event) => `
                  <div class="calendar-event">
                    <div class="calendar-event__title">${event.title || "Untitled"}</div>
                    <div class="calendar-event__meta">${formatTimeLabel(event.startsAt)}</div>
                  </div>
                `
                )
                .join("")}
            </div>
          `;
        })
        .join("");
      return `
        <div class="calendar-grid__time">${slot.label}</div>
        ${slotsMarkup}
      `;
    })
    .join("");

  const twoWeekMarkup = twoWeekDays
    .map((day) => {
      const dayEvents = eventMap[day.key] || [];
      const dayEventMarkup = dayEvents.length
        ? dayEvents.slice(0, 3).map((event) => `<span>${event.title || "Untitled"}</span>`).join("")
        : `<span class="muted">No events</span>`;
      return `
        <div class="calendar-range__day">
          <div class="calendar-range__header">
            <span>${day.label}</span>
            <span>${day.date.getDate()}</span>
          </div>
          <div class="calendar-range__events">
            ${dayEventMarkup}
          </div>
        </div>
      `;
    })
    .join("");

  const dayKey = formatDateKey(referenceDate);
  const dayEvents = eventMap[dayKey] || [];
  const dayPlanMarkup = dayEvents.length
    ? dayEvents.map((event) => `
        <div class="calendar-day-plan__slot">
          <span>${formatTimeLabel(event.startsAt)}</span>
          <span>${event.title || "Untitled"}</span>
        </div>
      `).join("")
    : `<p class="muted">No events planned for this day.</p>`;

  const nextEvent = validEvents[0];
  const agendaMarkup = agendaItems.length
    ? `<ul class="list">${agendaItems
        .slice(0, 6)
        .map((event) => `<li><strong>${event.title}</strong> · ${event.label}</li>`)
        .join("")}</ul>`
    : `<p class="muted">No events scheduled yet.</p>`;

  const copyFieldMarkup = COPY_FIELD_OPTIONS.map((option) => `
    <label class="form-checkbox">
      <input
        type="checkbox"
        name="copyFields"
        value="${option.key}"
        checked
      />
      <span>${option.label}</span>
    </label>
  `).join("");

  return `
    <div class="calendar-view" data-calendar-view>
      <div class="calendar-toast" data-calendar-toast aria-live="polite"></div>
      <div class="calendar-view__header">
        <div>
          <p class="calendar-kicker">Calendar workspace</p>
          <h3>${label}</h3>
          <div class="calendar-meta">
            <span>${summary}</span>
            <span>${monthLabel} ${yearLabel}</span>
            <span>${scheduledEvents.length} event${scheduledEvents.length === 1 ? "" : "s"} scheduled</span>
          </div>
        </div>
        <div class="calendar-view__controls">
          <div>
            <span class="calendar-control__label">Views</span>
            <div class="calendar-control__pills">
              <button class="calendar-pill calendar-pill--active" type="button" data-calendar-view-toggle="month">Month</button>
              <button class="calendar-pill" type="button" data-calendar-view-toggle="two-week">2-week</button>
              <button class="calendar-pill" type="button" data-calendar-view-toggle="week">Week</button>
              <button class="calendar-pill" type="button" data-calendar-view-toggle="day">Day</button>
            </div>
          </div>
          <div>
            <span class="calendar-control__label">Quick actions</span>
            <div class="calendar-control__actions">
              <button class="calendar-action" type="button">Create event</button>
              <button class="calendar-action" type="button">Share calendar</button>
            </div>
          </div>
          <div>
            <span class="calendar-control__label">Search</span>
            <div class="calendar-search">
              <input type="search" placeholder="Search events" />
              <button class="calendar-action calendar-search__button" type="button">Go</button>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-spotlight">
        <div class="calendar-panel">
          <strong>Primary calendar</strong>
          <p class="muted">${label}</p>
          <div class="calendar-panel__meta">
            <span>${scheduledEvents.length} scheduled</span>
            <span>${unscheduledEvents.length} unscheduled</span>
          </div>
        </div>
        <div class="calendar-panel">
          <strong>Next up</strong>
          <p class="muted">${nextEvent ? nextEvent.title || "Untitled" : "No upcoming events yet."}</p>
          <div class="calendar-panel__meta">
            <span>${nextEvent ? formatEventDateLabel(nextEvent.startsAt) : "Plan your next event"}</span>
            <span>${nextEvent ? formatTimeLabel(nextEvent.startsAt) : "—"}</span>
          </div>
        </div>
        <div class="calendar-panel">
          <strong>Context</strong>
          <p class="muted">Focus day availability and team sync context.</p>
          <div class="calendar-panel__meta">
            <span>Time zone: Local</span>
            <span>Status: Ready</span>
          </div>
        </div>
      </div>

      <div class="calendar-view__panels">
        <section class="calendar-view__panel calendar-view__panel--active" data-calendar-view-panel="month">
          <div class="calendar-view__body">
            <div class="calendar-month">
              <div class="calendar-month__weekdays">${weekdayMarkup}</div>
              <div class="calendar-month__grid">${monthGrid}</div>
            </div>
            <div class="calendar-agenda">
              <h4>Agenda highlights</h4>
              ${agendaMarkup}
            </div>
          </div>
        </section>
        <section class="calendar-view__panel" data-calendar-view-panel="two-week">
          <div class="calendar-range">
            ${twoWeekMarkup}
          </div>
        </section>
        <section class="calendar-view__panel" data-calendar-view-panel="week">
          <div class="calendar-grid">
            ${gridHeader}
            ${gridRows}
          </div>
        </section>
        <section class="calendar-view__panel" data-calendar-view-panel="day">
          <div class="calendar-day-plan">
            <h4>${referenceDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h4>
            ${dayPlanMarkup}
          </div>
        </section>
      </div>

      <div class="event-modal event-modal--compact" id="calendar-event-modal" data-event-modal aria-hidden="true">
        <div class="event-modal__backdrop" data-event-modal-close></div>
        <div class="event-modal__card" role="dialog" aria-modal="true" aria-labelledby="calendar-event-title">
          <div class="event-modal__header">
            <h3 id="calendar-event-title">Create an event</h3>
            <button class="event-modal__close" type="button" data-event-modal-close aria-label="Close">
              ×
            </button>
          </div>
          <form class="form" data-event-create data-event-modal-close-on-success data-calendar-event-form>
            <input type="hidden" name="calendarId" value="${calendarId}" />
            <label class="form-field">
              <span>Event title</span>
              <input type="text" name="title" placeholder="Add a title" required />
            </label>
            <div class="form-row">
              <label class="form-field">
                <span>Start date</span>
                <input type="date" name="startsDate" required />
              </label>
              <label class="form-field">
                <span>Start time</span>
                <input type="time" name="startsTime" value="09:00" required />
              </label>
            </div>
            <div class="form-row">
              <label class="form-field">
                <span>End date</span>
                <input type="date" name="endsDate" required />
              </label>
              <label class="form-field">
                <span>End time</span>
                <input type="time" name="endsTime" value="10:00" required />
              </label>
            </div>
            <label class="form-field">
              <span>Description</span>
              <textarea name="description" rows="3" placeholder="Add details"></textarea>
            </label>
            <div class="form-feedback is-hidden" data-form-feedback></div>
            <div class="event-modal__actions">
              <button class="primary" type="submit">Save event</button>
              <button class="ghost" type="button" data-event-modal-close>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div class="event-modal event-modal--compact" id="calendar-event-detail-modal" data-event-modal aria-hidden="true">
        <div class="event-modal__backdrop" data-event-modal-close></div>
        <div class="event-modal__card" role="dialog" aria-modal="true" aria-labelledby="calendar-edit-title">
          <div class="event-modal__header">
            <h3 id="calendar-edit-title">Edit event details</h3>
            <button class="event-modal__close" type="button" data-event-modal-close aria-label="Close">
              ×
            </button>
          </div>
          <div class="calendar-edit-details" data-calendar-edit-details>
            <p class="muted">Select an event to review details.</p>
          </div>
          <div class="event-modal__actions">
            <a class="primary" href="/events">Open Event Studio</a>
            <button class="ghost" type="button" data-event-modal-close>Close</button>
          </div>
        </div>
      </div>

      <div class="event-modal event-modal--compact" id="calendar-copy-modal" data-event-modal aria-hidden="true">
        <div class="event-modal__backdrop" data-event-modal-close></div>
        <div class="event-modal__card" role="dialog" aria-modal="true" aria-labelledby="calendar-copy-title">
          <div class="event-modal__header">
            <h3 id="calendar-copy-title">Copy event settings</h3>
            <button class="event-modal__close" type="button" data-event-modal-close aria-label="Close">
              ×
            </button>
          </div>
          <form class="form" data-calendar-copy-form>
            <p class="muted" data-calendar-copy-summary>Select fields to copy.</p>
            <div class="calendar-copy-fields">
              ${copyFieldMarkup}
            </div>
            <div class="form-feedback is-hidden" data-calendar-copy-feedback></div>
            <div class="event-modal__actions">
              <button class="primary" type="submit">Copy JSON</button>
              <button class="ghost" type="button" data-event-modal-close>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <div class="event-modal event-modal--compact" id="calendar-paste-modal" data-event-modal aria-hidden="true">
        <div class="event-modal__backdrop" data-event-modal-close></div>
        <div class="event-modal__card" role="dialog" aria-modal="true" aria-labelledby="calendar-paste-title">
          <div class="event-modal__header">
            <h3 id="calendar-paste-title">Paste event JSON</h3>
            <button class="event-modal__close" type="button" data-event-modal-close aria-label="Close">
              ×
            </button>
          </div>
          <form class="form" data-calendar-paste-form>
            <label class="form-field">
              <span>Event payload</span>
              <textarea name="pastePayload" rows="6" placeholder='{"title":"Weekly sync","startsAt":"2024-06-01T10:00:00.000Z"}'></textarea>
            </label>
            <div class="form-feedback is-hidden" data-calendar-paste-feedback></div>
            <div class="event-modal__actions">
              <button class="primary" type="submit">Paste event</button>
              <button class="ghost" type="button" data-event-modal-close>Cancel</button>
            </div>
          </form>
        </div>
      </div>
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

function normalizeAccessPayload(payload) {
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
                  <td>${deriveAccessLevel(entry.permissions)}</td>
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

function buildCalendarSelectorMarkup(calendars = [], selectedId = "") {
  if (!calendars.length) {
    return {
      optionsMarkup: `<option value="">No calendars available</option>`,
      listMarkup: `<p class="muted">No calendars available.</p>`,
      selectedId: ""
    };
  }
  const resolvedId = selectedId || calendars[0]?.id || "";
  const optionsMarkup = [
    `<option value="">Select a calendar</option>`,
    ...calendars.map((calendar, index) => {
      const label = index === 0 ? `${calendar.name} (Default)` : calendar.name;
      return `<option value="${calendar.id}">${label}</option>`;
    })
  ].join("");
  const listMarkup = calendars
    .map((calendar, index) => {
      const isDefault = index === 0;
      const isActive = calendar.id === resolvedId;
      return `
        <button
          class="calendar-option${isActive ? " calendar-option--active" : ""}"
          type="button"
          data-calendar-option
          data-calendar-id="${calendar.id}"
          aria-pressed="${isActive ? "true" : "false"}"
        >
          <div class="calendar-option__meta">
            <strong>${calendar.name}</strong>
            <span class="muted">ID: ${calendar.id}</span>
          </div>
          ${isDefault ? '<span class="calendar-option__badge">Default</span>' : ""}
        </button>
      `;
    })
    .join("");
  return { optionsMarkup, listMarkup, selectedId: resolvedId };
}

async function fetchJson(url, { token, includeCredentials } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const options = { headers };
  if (includeCredentials) {
    options.credentials = "same-origin";
  }
  const response = await fetch(url, options);
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

async function hydrateCalendarSelectors({ authState } = {}) {
  const forms = Array.from(document.querySelectorAll("form[data-permission-create]"));
  if (!forms.length) {
    return { hydrated: false };
  }
  if (!authState?.token) {
    forms.forEach((form) => {
      const selector = form.querySelector("[data-calendar-selector]");
      if (selector) {
        selector.innerHTML = `<p class="muted">Sign in to load calendars.</p>`;
      }
    });
    return { hydrated: true };
  }
  try {
    const response = await fetchJson("/api/calendars", { token: authState.token });
    const calendars = response.calendars || [];
    const defaultCalendarId = calendars[0]?.id || "";
    forms.forEach((form) => {
      const select = form.querySelector("[data-calendar-select]");
      const selector = form.querySelector("[data-calendar-selector]");
      if (!select || !selector) {
        return;
      }
      const { optionsMarkup, listMarkup, selectedId } = buildCalendarSelectorMarkup(calendars, defaultCalendarId);
      select.innerHTML = optionsMarkup;
      select.value = selectedId;
      selector.innerHTML = listMarkup;
      selector.querySelectorAll("[data-calendar-option]").forEach((button) => {
        button.addEventListener("click", () => {
          const calendarId = button.dataset.calendarId;
          if (!calendarId) {
            return;
          }
          select.value = calendarId;
          selector.querySelectorAll("[data-calendar-option]").forEach((option) => {
            const isActive = option.dataset.calendarId === calendarId;
            option.classList.toggle("calendar-option--active", isActive);
            option.setAttribute("aria-pressed", isActive ? "true" : "false");
          });
        });
      });
    });
    return { hydrated: true };
  } catch (error) {
    forms.forEach((form) => {
      const selector = form.querySelector("[data-calendar-selector]");
      if (selector) {
        selector.innerHTML = `<p class="muted">Unable to load calendars right now.</p>`;
      }
    });
    return { hydrated: false };
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

  hydrateCalendarSelectors({ authState: readAuthState() });

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

function initCalendarViewSwitcher({ documentRef = document } = {}) {
  const root = documentRef.querySelector("[data-calendar-view]");
  if (!root) {
    return { enabled: false };
  }
  const toggles = Array.from(root.querySelectorAll("[data-calendar-view-toggle]"));
  const panels = Array.from(root.querySelectorAll("[data-calendar-view-panel]"));
  if (!toggles.length || !panels.length) {
    return { enabled: false };
  }
  const setActiveView = (view) => {
    toggles.forEach((toggle) => {
      toggle.classList.toggle("calendar-pill--active", toggle.dataset.calendarViewToggle === view);
    });
    panels.forEach((panel) => {
      panel.classList.toggle("calendar-view__panel--active", panel.dataset.calendarViewPanel === view);
    });
    root.dataset.activeView = view;
  };
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      setActiveView(toggle.dataset.calendarViewToggle);
    });
  });
  setActiveView(root.dataset.activeView || "month");
  return { enabled: true };
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

function showCalendarToast(root, message, tone = "info") {
  const toast = root?.querySelector?.("[data-calendar-toast]");
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.dataset.tone = tone;
  toast.classList.add("calendar-toast--visible");
  if (toast._hideTimer) {
    clearTimeout(toast._hideTimer);
  }
  toast._hideTimer = setTimeout(() => {
    toast.classList.remove("calendar-toast--visible");
  }, 3000);
}

function openEventModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.add("event-modal--open");
  modal.setAttribute("aria-hidden", "false");
}

function closeEventModal(modal) {
  if (!modal) {
    return;
  }
  modal.classList.remove("event-modal--open");
  modal.setAttribute("aria-hidden", "true");
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

function initCalendarDayMenus({ documentRef = document } = {}) {
  const root = documentRef.querySelector("[data-calendar-view]");
  if (!root) {
    return { enabled: false };
  }
  const eventModal = documentRef.getElementById("calendar-event-modal");
  const editModal = documentRef.getElementById("calendar-event-detail-modal");
  const copyModal = documentRef.getElementById("calendar-copy-modal");
  const pasteModal = documentRef.getElementById("calendar-paste-modal");
  const eventForm = eventModal?.querySelector("[data-calendar-event-form]");
  const editDetails = editModal?.querySelector("[data-calendar-edit-details]");
  const copyForm = copyModal?.querySelector("[data-calendar-copy-form]");
  const copyFeedback = copyModal?.querySelector("[data-calendar-copy-feedback]");
  const copySummary = copyModal?.querySelector("[data-calendar-copy-summary]");
  const pasteForm = pasteModal?.querySelector("[data-calendar-paste-form]");
  const pasteFeedback = pasteModal?.querySelector("[data-calendar-paste-feedback]");
  let activeMenu = null;

  const closeMenus = () => {
    root.querySelectorAll("[data-calendar-menu]").forEach((menu) => {
      menu.classList.remove("calendar-day-menu--open");
      const toggle = menu.querySelector("[data-calendar-menu-toggle]");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    activeMenu = null;
  };

  const setCopyFeedback = (message, tone = "error") => {
    if (!copyFeedback) {
      return;
    }
    copyFeedback.textContent = message;
    copyFeedback.dataset.tone = tone;
    copyFeedback.classList.remove("is-hidden");
  };

  const setPasteFeedback = (message, tone = "error") => {
    if (!pasteFeedback) {
      return;
    }
    pasteFeedback.textContent = message;
    pasteFeedback.dataset.tone = tone;
    pasteFeedback.classList.remove("is-hidden");
  };

  const submitPastePayload = async ({ rawText, dateKey, calendarId }) => {
    const authState = readAuthState();
    if (!authState?.token) {
      setPasteFeedback("Sign in to paste events.");
      return;
    }
    let clipboardEvent;
    try {
      clipboardEvent = JSON.parse(rawText);
    } catch (error) {
      setPasteFeedback("Paste payload must be valid JSON.");
      if (pasteModal) {
        openEventModal(pasteModal);
      }
      return;
    }
    const pastePayload = buildPasteEventPayload(clipboardEvent, { dateKey, calendarId });
    if (!pastePayload?.calendarId) {
      setPasteFeedback("Paste payload missing calendar ID.");
      showCalendarToast(root, "Paste payload missing calendar ID.", "error");
      if (pasteModal) {
        openEventModal(pasteModal);
      }
      return;
    }
    try {
      await postJson("/api/events", pastePayload, { token: authState.token });
      setPasteFeedback("Event pasted to calendar.", "success");
      showCalendarToast(root, "Event pasted to calendar.", "success");
      if (pasteModal) {
        closeEventModal(pasteModal);
      }
    } catch (error) {
      setPasteFeedback("Unable to paste event.");
      showCalendarToast(root, "Unable to paste event.", "error");
    }
  };

  if (pasteForm) {
    pasteForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rawText = pasteForm.querySelector('[name="pastePayload"]')?.value?.trim() || "";
      if (!rawText) {
        setPasteFeedback("Paste event JSON to continue.");
        return;
      }
      const dateKey = pasteModal?.dataset.dateKey || "";
      const calendarId = pasteModal?.dataset.calendarId || "";
      await submitPastePayload({ rawText, dateKey, calendarId });
    });
  }

  if (copyForm) {
    copyForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!copyModal?.dataset.eventPayload) {
        setCopyFeedback("Select an event to copy.");
        return;
      }
      const eventData = decodeMenuPayload(copyModal.dataset.eventPayload);
      if (!eventData) {
        setCopyFeedback("Unable to read event details.");
        return;
      }
      const selectedFields = Array.from(copyForm.querySelectorAll('input[name="copyFields"]:checked')).map(
        (input) => input.value
      );
      if (!selectedFields.length) {
        setCopyFeedback("Choose at least one field to copy.");
        return;
      }
      const payload = createEventCopyPayload(eventData, selectedFields);
      try {
        await copyTextToClipboard(JSON.stringify(payload, null, 2));
        setCopyFeedback("Copied to clipboard.", "success");
        showCalendarToast(root, "Event settings copied to clipboard.", "success");
        closeEventModal(copyModal);
      } catch (error) {
        setCopyFeedback("Unable to copy to clipboard.");
      }
    });
  }

  root.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-calendar-menu-toggle]");
    if (toggle) {
      const menu = toggle.closest("[data-calendar-menu]");
      if (!menu) {
        return;
      }
      const shouldOpen = !menu.classList.contains("calendar-day-menu--open");
      closeMenus();
      if (shouldOpen) {
        menu.classList.add("calendar-day-menu--open");
        toggle.setAttribute("aria-expanded", "true");
        activeMenu = menu;
      }
      return;
    }

    const actionButton = event.target.closest("[data-day-action]");
    if (!actionButton) {
      return;
    }
    const action = actionButton.dataset.dayAction;
    const dateKey = actionButton.dataset.dateKey;
    const menuCalendarId = actionButton.dataset.calendarId || "";
    closeMenus();

    if (action === "new") {
      if (!eventForm || !eventModal) {
        return;
      }
      eventForm.reset();
      const calendarInput = eventForm.querySelector('[name="calendarId"]');
      if (calendarInput) {
        calendarInput.value = menuCalendarId;
      }
      const startsDate = eventForm.querySelector('[name="startsDate"]');
      const endsDate = eventForm.querySelector('[name="endsDate"]');
      const startsTime = eventForm.querySelector('[name="startsTime"]');
      const endsTime = eventForm.querySelector('[name="endsTime"]');
      if (startsDate && dateKey) {
        startsDate.value = dateKey;
      }
      if (endsDate && dateKey) {
        endsDate.value = dateKey;
      }
      if (startsTime && !startsTime.value) {
        startsTime.value = "09:00";
      }
      if (endsTime && !endsTime.value) {
        endsTime.value = "10:00";
      }
      openEventModal(eventModal);
      return;
    }

    if (action === "paste") {
      const authState = readAuthState();
      if (!authState?.token) {
        showCalendarToast(root, "Sign in to paste events.", "error");
        return;
      }
      if (pasteModal) {
        pasteModal.dataset.dateKey = dateKey || "";
        pasteModal.dataset.calendarId = menuCalendarId || "";
      }
      try {
        const clipboardText = await readClipboardText();
        if (!clipboardText) {
          if (pasteModal) {
            if (pasteFeedback) {
              pasteFeedback.classList.add("is-hidden");
            }
            openEventModal(pasteModal);
            setPasteFeedback("Clipboard is empty. Paste event JSON below.");
          } else {
            showCalendarToast(root, "Clipboard is empty.", "error");
          }
          return;
        }
        await submitPastePayload({
          rawText: clipboardText,
          dateKey,
          calendarId: menuCalendarId
        });
      } catch (error) {
        if (pasteModal) {
          pasteModal.dataset.dateKey = dateKey || "";
          pasteModal.dataset.calendarId = menuCalendarId || "";
          openEventModal(pasteModal);
          setPasteFeedback("Unable to read clipboard. Paste event JSON below.");
        } else {
          showCalendarToast(root, "Unable to paste event.", "error");
        }
      }
      return;
    }

    const payload = decodeMenuPayload(actionButton.dataset.eventPayload);
    if (!payload) {
      showCalendarToast(root, "Unable to load event details.", "error");
      return;
    }

    if (action === "edit") {
      if (!editModal || !editDetails) {
        return;
      }
      editDetails.innerHTML = `
        <div class="calendar-edit-details__card">
          <strong>${payload.title || "Untitled"}</strong>
          <p class="muted">${formatEventDateLabel(payload.startsAt)} · ${payload.startsAt ? payload.startsAt : "Unscheduled"}</p>
          <p>${payload.description || "No description added yet."}</p>
        </div>
      `;
      openEventModal(editModal);
      return;
    }

    if (action === "copy") {
      if (!copyModal || !copySummary) {
        return;
      }
      copyModal.dataset.eventPayload = actionButton.dataset.eventPayload;
      copySummary.textContent = `Copy fields from "${payload.title || "Untitled"}".`;
      if (copyFeedback) {
        copyFeedback.classList.add("is-hidden");
      }
      openEventModal(copyModal);
      return;
    }
  });

  documentRef.addEventListener("click", (event) => {
    if (!activeMenu) {
      return;
    }
    if (activeMenu.contains(event.target)) {
      return;
    }
    closeMenus();
  });

  documentRef.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenus();
    }
  });

  return { enabled: true };
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

async function resolveAuthState(storage) {
  const storedState = readAuthState(storage);
  if (storedState?.token) {
    return storedState;
  }
  try {
    const session = await fetchJson("/api/auth/session", { includeCredentials: true });
    if (session?.session?.token && session?.user) {
      const nextState = {
        token: session.session.token,
        user: session.user,
        permissions: session.permissions || []
      };
      writeAuthState(nextState, storage);
      return nextState;
    }
  } catch (error) {
    return storedState;
  }
  return storedState;
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

  const authState = await resolveAuthState();
  if (authState?.token) {
    updateAuthStatus(authState);
  }
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
          events: overview.events,
          calendarId: overview.primaryCalendar?.id
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
        initCalendarViewSwitcher();
        initCalendarDayMenus();
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
  buildPasteEventPayload,
  buildCalendarSelectorMarkup,
  addHourToTime,
  copyTextToClipboard,
  createEventId,
  createEventCopyPayload,
  decodeMenuPayload,
  encodeMenuPayload,
  getTimeFromIso,
  parseEventDateTime,
  refreshEventList,
  setEventListFeedback,
  showCalendarToast,
  openEventModal,
  closeEventModal,
  updateAuthStatus,
  writeAuthState,
  getSelectedPermissions,
  getAccountHighlights,
  initCalendarControls,
  initCalendarViewSwitcher,
  initCalendarDayMenus,
  initEventCreation,
  initEventManagement,
  initEventModal,
  initSharingControls,
  initProfileManagement,
  loadCalendarOverview,
  postJson,
  hydrateCalendarSelectors,
  redirectToCalendar,
  updateAccountSections
};
