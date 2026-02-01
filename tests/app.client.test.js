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
  buildPasteEventPayload,
  buildCalendarSelectorMarkup,
  buildSessionMeta,
  addHourToTime,
  copyTextToClipboard,
  createEventId,
  createEventCopyPayload,
  decodeMenuPayload,
  encodeMenuPayload,
  formatSessionSyncLabel,
  getTimeFromIso,
  parseEventDateTime,
  refreshEventList,
  refreshSessionState,
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
  hydrateCalendarSelectors,
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

    expect(html).toContain("No session yet");
    expect(html).not.toContain("Log out");
  });

  test("renderAuthStatus returns signed-in label and logout", () => {
    const html = renderAuthStatus({ user: { name: "Avery" } });

    expect(html).toContain("Session steady with Avery");
    expect(html).toContain("Log out");
  });

  test("renderAuthStatus falls back to email and account label", () => {
    const htmlWithEmail = renderAuthStatus({ user: { email: "user@example.com" } });
    const htmlWithFallback = renderAuthStatus({ user: {} });

    expect(htmlWithEmail).toContain("Session steady with user@example.com");
    expect(htmlWithFallback).toContain("Session steady with Account");
  });

  test("formatSessionSyncLabel falls back to syncing when no timestamp", () => {
    expect(formatSessionSyncLabel()).toBe("Syncing now");
    expect(formatSessionSyncLabel("not-a-date")).toBe("Syncing now");
  });

  test("formatSessionSyncLabel returns friendly relative labels", () => {
    const now = new Date("2024-01-01T00:10:00.000Z");
    expect(formatSessionSyncLabel("2024-01-01T00:09:45.000Z", now)).toBe("Synced just now");
    expect(formatSessionSyncLabel("2024-01-01T00:07:30.000Z", now)).toBe("Synced a moment ago");
    expect(formatSessionSyncLabel("2024-01-01T00:00:00.000Z", now)).toBe("Synced 10m ago");
    expect(formatSessionSyncLabel("2023-12-31T22:10:00.000Z", now)).toBe("Synced 2h ago");
  });

  test("buildSessionMeta combines sync label and source", () => {
    const now = new Date();
    const meta = buildSessionMeta({ lastSync: now.toISOString(), syncSource: "secure cookie" });

    expect(meta).toContain("Synced");
    expect(meta).toContain("via secure cookie");
    expect(buildSessionMeta({})).toContain("via device cache");
  });

  test("renderHighlights renders empty state without items", () => {
    const html = renderHighlights([]);

    expect(html).toContain("No session details yet. Sign in to see your highlights.");
  });

  test("renderHighlights uses defaults when highlights are missing", () => {
    const html = renderHighlights();

    expect(html).toContain("No session details yet. Sign in to see your highlights.");
  });

  test("renderHighlights renders account summary items", () => {
    const html = renderHighlights([
      { title: "Email", description: "user@example.com" }
    ]);

    expect(html).toContain("Session snapshot");
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
    expect(html).toContain("calendar-month__grid");
  });

  test("renderCalendarView includes day action menus and modals", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    expect(html).toContain("calendar-day-menu");
    expect(html).toContain("Paste from clipboard");
    expect(html).toContain("calendar-copy-modal");
    expect(html).toContain("calendar-paste-modal");
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
    expect(html).toContain("calendar-view__header");
  });

  test("renderCalendarView handles invalid reference dates", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "not-a-date",
      events: []
    });

    expect(html).toContain("Calendar");
    expect(html).toContain("calendar-month__grid");
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
    expect(html).toContain("January");
  });

  test("renderCalendarView renders week focus slots with events", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      events: [{ title: "Standup", startsAt: "2024-01-05T10:00:00.000Z" }]
    });

    expect(html).toContain("calendar-grid");
    expect(html).toContain("calendar-event__title");
    expect(html).toContain("Standup");
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

  test("renderCalendarView includes unscheduled agenda entries without titles", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ description: "No date yet." }]
    });

    expect(html).toContain("Untitled");
  });

  test("renderCalendarView shows untitled focus slot events", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      events: [{ startsAt: "2024-01-05T10:00:00.000Z" }]
    });

    expect(html).toContain("calendar-event__title");
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

  test("encodeMenuPayload and decodeMenuPayload round trip event data", () => {
    const encoded = encodeMenuPayload({ title: "Check-in" });
    const decoded = decodeMenuPayload(encoded);

    expect(decoded).toEqual({ title: "Check-in" });
    expect(decodeMenuPayload("")).toBeNull();
  });

  test("encodeMenuPayload handles null and circular payloads", () => {
    expect(encodeMenuPayload(null)).toBe("");
    const circular = {};
    circular.self = circular;
    expect(encodeMenuPayload(circular)).toBe("");
  });

  test("decodeMenuPayload returns null for invalid data", () => {
    expect(decodeMenuPayload("not-json")).toBeNull();
  });

  test("createEventCopyPayload filters fields and returns empty object", () => {
    const payload = createEventCopyPayload(
      { title: "Standup", description: "Daily", startsAt: "2024-01-01T09:00:00.000Z" },
      ["title", "startsAt"]
    );

    expect(payload).toEqual({ title: "Standup", startsAt: "2024-01-01T09:00:00.000Z" });
    expect(createEventCopyPayload(null, ["title"])).toEqual({});
  });

  test("createEventCopyPayload uses default fields array", () => {
    expect(createEventCopyPayload({ title: "Note" })).toEqual({});
  });

  test("getTimeFromIso uses fallback and addHourToTime advances hours", () => {
    expect(getTimeFromIso("", "07:45")).toBe("07:45");
    expect(getTimeFromIso("not-a-date", "08:15")).toBe("08:15");
    expect(getTimeFromIso("2024-01-01T14:30:00.000Z", "08:15")).toBe("14:30");
    expect(addHourToTime("09:30")).toBe("10:30");
  });

  test("getTimeFromIso uses default fallback and addHourToTime defaults inputs", () => {
    expect(getTimeFromIso("2024-01-01T00:00:00.000Z")).toBe("00:00");
    expect(addHourToTime()).toBe("10:00");
    expect(addHourToTime("23:45")).toBe("00:45");
  });

  test("buildPasteEventPayload applies date and defaults", () => {
    const payload = buildPasteEventPayload(
      {
        id: "evt-copy",
        title: "Copied",
        startsAt: "2024-01-02T14:00:00.000Z",
        endsAt: "2024-01-02T15:00:00.000Z",
        calendarId: "cal-1"
      },
      { dateKey: "2024-02-10" }
    );

    expect(payload.startsAt).toBe("2024-02-10T14:00:00.000Z");
    expect(payload.endsAt).toBe("2024-02-10T15:00:00.000Z");
    expect(buildPasteEventPayload(null)).toBeNull();
  });

  test("buildPasteEventPayload preserves original dates and defaults title", () => {
    const payload = buildPasteEventPayload({
      id: "evt-2",
      title: "",
      startsAt: "2024-01-02T09:00:00.000Z",
      endsAt: "2024-01-02T10:00:00.000Z",
      calendarId: "cal-1"
    });

    expect(payload.startsAt).toBe("2024-01-02T09:00:00.000Z");
    expect(payload.title).toBe("Copied event");
  });

  test("buildPasteEventPayload falls back to provided calendar id", () => {
    const payload = buildPasteEventPayload(
      { title: "Clipboard", startsAt: "2024-01-02T14:00:00.000Z" },
      { dateKey: "2024-02-11", calendarId: "cal-2" }
    );

    expect(payload.calendarId).toBe("cal-2");
    expect(payload.calendarIds).toEqual(["cal-2"]);
  });

  test("renderCalendarView treats invalid startsAt values as unscheduled", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      events: [{ title: "Mystery", startsAt: "not-a-date" }]
    });

    expect(html).toContain("Unscheduled");
  });

  test("renderCalendarView uses event dates when reference date is invalid", () => {
    const html = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "not-a-date",
      events: [{ title: "Launch", startsAt: "2024-02-02T10:00:00.000Z" }]
    });

    expect(html).toContain("February");
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

  test("renderAccessMatrix handles payload objects with missing fields", () => {
    const html = renderAccessMatrix({ defaults: null, notes: null });

    expect(html).toContain("No one else has access");
  });

  test("renderAccessMatrix defaults access levels for missing permissions", () => {
    const html = renderAccessMatrix([
      { user: "Jamie", calendar: "Ops" }
    ]);

    expect(html).toContain("No access");
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

  test("initProfileManagement falls back on empty error messages", async () => {
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

    global.fetch = jest.fn(() => Promise.reject(Object.assign(new Error(), { message: "" })));

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

  test("buildCalendarSelectorMarkup marks default calendar as selected", () => {
    const { optionsMarkup, listMarkup, selectedId } = buildCalendarSelectorMarkup(
      [
        { id: "cal-1", name: "Primary Calendar" },
        { id: "cal-2", name: "Team Calendar" }
      ],
      ""
    );

    expect(optionsMarkup).toContain("Primary Calendar (Default)");
    expect(listMarkup).toContain("calendar-option--active");
    expect(selectedId).toBe("cal-1");
  });

  test("buildCalendarSelectorMarkup handles empty calendars", () => {
    const { optionsMarkup, listMarkup, selectedId } = buildCalendarSelectorMarkup([], "");

    expect(optionsMarkup).toContain("No calendars available");
    expect(listMarkup).toContain("No calendars available");
    expect(selectedId).toBe("");
  });

  test("hydrateCalendarSelectors populates calendar lists", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <select name="calendarId" data-calendar-select></select>
        <div data-calendar-selector></div>
      </form>
    `;

    window.localStorage.setItem(
      "tylendar-auth",
      JSON.stringify({ token: "token-1", user: { id: "user-1" } })
    );

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            calendars: [
              { id: "cal-1", name: "Primary Calendar" },
              { id: "cal-2", name: "Team Calendar" }
            ]
          })
      })
    );

    await hydrateCalendarSelectors({ authState: readAuthState() });
    const select = document.querySelector("[data-calendar-select]");
    const selector = document.querySelector("[data-calendar-selector]");
    expect(select.value).toBe("cal-1");
    expect(selector.textContent).toContain("Primary Calendar");

    global.fetch.mockRestore();
  });

  test("hydrateCalendarSelectors shows sign-in prompt when unauthenticated", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <select name="calendarId" data-calendar-select></select>
        <div data-calendar-selector></div>
      </form>
    `;

    await hydrateCalendarSelectors({ authState: null });

    expect(document.querySelector("[data-calendar-selector]").textContent).toContain("Sign in to load calendars");
  });

  test("hydrateCalendarSelectors handles failed calendar loading", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <select name="calendarId" data-calendar-select></select>
        <div data-calendar-selector></div>
      </form>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({})
      })
    );

    await hydrateCalendarSelectors({ authState: { token: "token-1" } });
    expect(document.querySelector("[data-calendar-selector]").textContent).toContain("Unable to load calendars");

    global.fetch.mockRestore();
  });

  test("hydrateCalendarSelectors ignores calendar options without ids", async () => {
    document.body.innerHTML = `
      <form data-permission-create>
        <select name="calendarId" data-calendar-select></select>
        <div data-calendar-selector></div>
      </form>
    `;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            calendars: [{ id: "cal-1", name: "Primary Calendar" }]
          })
      })
    );

    await hydrateCalendarSelectors({ authState: { token: "token-1" } });
    const select = document.querySelector("[data-calendar-select]");
    const optionButton = document.querySelector("[data-calendar-option]");
    optionButton.removeAttribute("data-calendar-id");
    optionButton.click();
    expect(select.value).toBe("cal-1");

    global.fetch.mockRestore();
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

  test("initCalendarControls defaults owner type and handles empty errors", async () => {
    document.body.innerHTML = `
      <form data-calendar-create>
        <input name="name" value="My Calendar" />
        <input name="ownerId" value="" />
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

    const [, request] = global.fetch.mock.calls[0];
    const body = JSON.parse(request.body);
    expect(body.ownerType).toBe("user");

    global.fetch.mockRestore();

    global.fetch = jest.fn(() => Promise.reject(Object.assign(new Error(), { message: "" })));
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Create failed");
    global.fetch.mockRestore();
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary Calendar" }] })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Calendar ID and User ID");

    global.fetch.mockRestore();
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
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary Calendar" }] })
      })
    );

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Select at least one permission");

    global.fetch.mockRestore();
  });

  test("initCalendarControls falls back on permission assignment errors", async () => {
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

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary Calendar" }] })
      })
      .mockRejectedValueOnce(Object.assign(new Error(), { message: "" }));

    initCalendarControls();
    const form = document.querySelector("[data-permission-create]");
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(form.querySelector("[data-form-feedback]").textContent).toContain("Permission failed");

    global.fetch.mockRestore();
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

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary Calendar" }] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: "ok" })
      });

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

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary Calendar" }] })
      })
      .mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Permission failed" })
      });

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

  test("initSharingControls falls back on share errors without messages", async () => {
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

    global.fetch = jest.fn(() => Promise.reject(Object.assign(new Error(), { message: "" })));

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

  test("parseEventDateTime falls back when time is empty", () => {
    const result = parseEventDateTime("2024-02-20", "");

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

  test("buildEventPayload flags missing time entries with dates present", () => {
    document.body.innerHTML = `
      <form data-event-create>
        <input name="title" value="Planning" />
        <input name="calendarId" value="cal-1" />
        <input name="startsDate" value="2024-02-20" />
        <input name="startsTime" value="" />
        <input name="endsDate" value="2024-02-20" />
        <input name="endsTime" value="" />
      </form>
    `;

    const form = document.querySelector("[data-event-create]");
    const result = buildEventPayload(form, { user: { id: "user-1" } });

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

  test("openEventModal and closeEventModal toggle visibility", () => {
    document.body.innerHTML = `
      <div class="event-modal" id="event-modal" data-event-modal aria-hidden="true"></div>
    `;

    const modal = document.getElementById("event-modal");
    openEventModal(modal);
    expect(modal.classList.contains("event-modal--open")).toBe(true);

    closeEventModal(modal);
    expect(modal.classList.contains("event-modal--open")).toBe(false);
  });

  test("showCalendarToast updates the toast state", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast class="calendar-toast"></div>
      </div>
    `;

    const root = document.querySelector("[data-calendar-view]");
    showCalendarToast(root, "Copied", "success");

    const toast = document.querySelector("[data-calendar-toast]");
    expect(toast.textContent).toBe("Copied");
    expect(toast.classList.contains("calendar-toast--visible")).toBe(true);
  });

  test("showCalendarToast handles missing toasts and reuses timers", () => {
    jest.useFakeTimers();
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast class="calendar-toast"></div>
      </div>
    `;
    showCalendarToast(document.querySelector("[data-calendar-view]"), "First");
    showCalendarToast(document.querySelector("[data-calendar-view]"), "Second");
    jest.runOnlyPendingTimers();
    jest.useRealTimers();

    document.body.innerHTML = `<div data-calendar-view></div>`;
    expect(() => showCalendarToast(document.querySelector("[data-calendar-view]"), "Missing")).not.toThrow();
  });

  test("copyTextToClipboard uses navigator clipboard when available", async () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } },
      configurable: true
    });

    await expect(copyTextToClipboard("hello")).resolves.toBe(true);
    expect(global.navigator.clipboard.writeText).toHaveBeenCalledWith("hello");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("copyTextToClipboard uses execCommand fallback when clipboard is unavailable", async () => {
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", { value: undefined, configurable: true });
    const originalExecCommand = document.execCommand;
    document.execCommand = jest.fn().mockReturnValue(true);

    await expect(copyTextToClipboard("fallback")).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith("copy");

    document.execCommand = originalExecCommand;
    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarViewSwitcher toggles calendar panels", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: []
    });

    const result = initCalendarViewSwitcher();
    expect(result.enabled).toBe(true);
    const weekToggle = document.querySelector('[data-calendar-view-toggle="week"]');
    weekToggle.click();
    expect(weekToggle.classList.contains("calendar-pill--active")).toBe(true);
    expect(
      document.querySelector('[data-calendar-view-panel="week"]').classList.contains("calendar-view__panel--active")
    ).toBe(true);
  });

  test("initCalendarViewSwitcher returns disabled when panels are missing", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <button data-calendar-view-toggle="month"></button>
      </div>
    `;

    expect(initCalendarViewSwitcher().enabled).toBe(false);
  });

  test("openEventModal handles null inputs", () => {
    expect(() => openEventModal(null)).not.toThrow();
    expect(() => closeEventModal(null)).not.toThrow();
  });

  test("initCalendarDayMenus returns disabled without a calendar view", () => {
    document.body.innerHTML = "";

    const result = initCalendarDayMenus();
    expect(result.enabled).toBe(false);
  });

  test("initCalendarDayMenus toggles menus and closes on outside clicks", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const toggle = document.querySelector("[data-calendar-menu-toggle]");
    const menu = toggle.closest("[data-calendar-menu]");
    toggle.click();
    expect(menu.classList.contains("calendar-day-menu--open")).toBe(true);

    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(menu.classList.contains("calendar-day-menu--open")).toBe(false);
  });

  test("initCalendarDayMenus validates copy form selection", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const copyModal = document.getElementById("calendar-copy-modal");
    const copyForm = copyModal.querySelector("[data-calendar-copy-form]");
    copyForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(copyModal.querySelector("[data-calendar-copy-feedback]").textContent).toContain("Select an event");

    copyModal.dataset.eventPayload = "bad-json";
    copyForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(copyModal.querySelector("[data-calendar-copy-feedback]").textContent).toContain("Unable to read event details");

    copyModal.dataset.eventPayload = encodeMenuPayload({
      id: "evt-1",
      title: "Kickoff"
    });
    copyForm.querySelectorAll('input[name="copyFields"]').forEach((input) => {
      input.checked = false;
    });
    copyForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    expect(copyModal.querySelector("[data-calendar-copy-feedback]").textContent).toContain("Choose at least one field");
  });

  test("initCalendarDayMenus copies event payload and handles clipboard errors", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { writeText: jest.fn().mockRejectedValue(new Error("fail")) } },
      configurable: true
    });

    initCalendarDayMenus();

    const copyModal = document.getElementById("calendar-copy-modal");
    copyModal.dataset.eventPayload = encodeMenuPayload({ id: "evt-1", title: "Kickoff" });
    const copyForm = copyModal.querySelector("[data-calendar-copy-form]");
    copyForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise(process.nextTick);
    expect(copyModal.querySelector("[data-calendar-copy-feedback]").textContent).toContain("Unable to copy");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus copies event payload to clipboard", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } },
      configurable: true
    });

    initCalendarDayMenus();

    const copyModal = document.getElementById("calendar-copy-modal");
    copyModal.dataset.eventPayload = encodeMenuPayload({ id: "evt-1", title: "Kickoff" });
    const copyForm = copyModal.querySelector("[data-calendar-copy-form]");
    copyForm.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise(process.nextTick);
    expect(global.navigator.clipboard.writeText).toHaveBeenCalled();

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus sets default times when blank", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    const modal = document.getElementById("calendar-event-modal");
    const startsTime = modal.querySelector('[name="startsTime"]');
    const endsTime = modal.querySelector('[name="endsTime"]');
    startsTime.removeAttribute("value");
    endsTime.removeAttribute("value");
    startsTime.value = "";
    endsTime.value = "";

    initCalendarDayMenus();

    document.querySelector('[data-day-action="new"][data-date-key="2024-01-10"]').click();
    expect(startsTime.value).toBe("09:00");
    expect(endsTime.value).toBe("10:00");
  });

  test("initCalendarDayMenus handles paste clipboard edge cases", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { readText: jest.fn().mockResolvedValue("") } },
      configurable: true
    });
    initCalendarDayMenus();

    const pasteButton = document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]');
    pasteButton.click();
    await new Promise(process.nextTick);
    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Clipboard is empty");

    global.navigator.clipboard.readText.mockResolvedValue("not-json");
    pasteButton.click();
    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("valid JSON");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus opens paste modal when clipboard read fails", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          readText: jest.fn().mockRejectedValue(new Error("denied"))
        }
      },
      configurable: true
    });

    initCalendarDayMenus();
    document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]').click();
    await new Promise(process.nextTick);

    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Clipboard is empty");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus surfaces clipboard access errors in modal", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    const clipboard = {};
    Object.defineProperty(clipboard, "readText", {
      get() {
        throw new Error("blocked");
      }
    });
    Object.defineProperty(global, "navigator", {
      value: { clipboard },
      configurable: true
    });

    initCalendarDayMenus();
    document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]').click();
    await new Promise(process.nextTick);
    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Unable to read clipboard");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus handles paste submissions without payloads", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();
    const pasteModal = document.getElementById("calendar-paste-modal");
    openEventModal(pasteModal);
    pasteModal.querySelector("[data-calendar-paste-form]").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Paste event JSON");
  });

  test("initCalendarDayMenus tolerates missing paste feedback blocks", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    document.querySelector("[data-calendar-paste-feedback]").remove();
    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { readText: jest.fn().mockResolvedValue("") } },
      configurable: true
    });

    initCalendarDayMenus();
    document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]').click();
    await new Promise(process.nextTick);
    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus requires auth for paste submissions", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();
    const pasteModal = document.getElementById("calendar-paste-modal");
    pasteModal.dataset.calendarId = "cal-1";
    pasteModal.dataset.dateKey = "2024-01-10";
    pasteModal.querySelector('[name="pastePayload"]').value = JSON.stringify({ title: "Clipboard" });
    pasteModal.querySelector("[data-calendar-paste-form]").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Sign in to paste events");
  });

  test("initCalendarDayMenus surfaces paste submission failures", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    global.fetch = jest.fn(() => Promise.reject(new Error("fail")));

    initCalendarDayMenus();
    const pasteModal = document.getElementById("calendar-paste-modal");
    pasteModal.dataset.calendarId = "cal-1";
    pasteModal.dataset.dateKey = "2024-01-10";
    pasteModal.querySelector('[name="pastePayload"]').value = JSON.stringify({ title: "Clipboard" });
    pasteModal.querySelector("[data-calendar-paste-form]").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Unable to paste event");

    global.fetch.mockRestore();
  });

  test("initCalendarDayMenus falls back to toast when paste modal is missing", async () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="paste" data-date-key="2024-01-10"></button>
      </div>
    `;

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: { clipboard: { readText: jest.fn().mockResolvedValue("") } },
      configurable: true
    });

    initCalendarDayMenus();
    document.querySelector('[data-day-action="paste"]').click();
    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Clipboard is empty");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus reports paste errors without a modal", async () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="paste" data-date-key="2024-01-10"></button>
      </div>
    `;

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    const clipboard = {};
    Object.defineProperty(clipboard, "readText", {
      get() {
        throw new Error("no clipboard");
      }
    });
    Object.defineProperty(global, "navigator", {
      value: { clipboard },
      configurable: true
    });

    initCalendarDayMenus();
    document.querySelector('[data-day-action="paste"]').click();
    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Unable to paste event");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus reports missing calendar ids and pastes events", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalFetch = global.fetch;
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", {
      value: {
        clipboard: {
          readText: jest.fn().mockResolvedValue(JSON.stringify({ title: "Clipboard" }))
        }
      },
      configurable: true
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    initCalendarDayMenus();

    const pasteButton = document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]');
    pasteButton.click();
    await new Promise(process.nextTick);
    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Paste payload missing calendar ID");
    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);

    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();
    const pasteButtonWithCalendar = document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]');
    pasteButtonWithCalendar.click();
    await new Promise(process.nextTick);
    expect(global.fetch).toHaveBeenCalled();
    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Event pasted to calendar");

    global.fetch = originalFetch;
    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus reports missing event payloads", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="edit" data-event-payload="bad"></button>
      </div>
    `;

    initCalendarDayMenus();
    document.querySelector('[data-day-action="edit"]').click();
    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Unable to load event details");
  });

  test("initCalendarDayMenus opens new event modal and pre-fills date", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const newButton = document.querySelector('[data-day-action="new"][data-date-key="2024-01-10"]');
    newButton.click();

    const modal = document.getElementById("calendar-event-modal");
    expect(modal.classList.contains("event-modal--open")).toBe(true);
    expect(modal.querySelector('[name="calendarId"]').value).toBe("cal-1");
    expect(modal.querySelector('[name="startsDate"]').value).toBe("2024-01-10");
  });

  test("initCalendarDayMenus opens copy modal with summary", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const copyButton = document.querySelector('[data-day-action="copy"][data-event-payload]');
    copyButton.click();

    const copyModal = document.getElementById("calendar-copy-modal");
    const summary = copyModal.querySelector("[data-calendar-copy-summary]");
    expect(copyModal.classList.contains("event-modal--open")).toBe(true);
    expect(summary.textContent).toContain("Kickoff");
  });

  test("initCalendarDayMenus handles copy actions without feedback blocks", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    document.querySelector("[data-calendar-copy-feedback]").remove();

    initCalendarDayMenus();

    const copyButton = document.querySelector('[data-day-action="copy"][data-event-payload]');
    copyButton.click();

    const summary = document.querySelector("[data-calendar-copy-summary]");
    expect(summary.textContent).toContain("Untitled");
  });

  test("initCalendarDayMenus warns when pasting without auth", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const pasteButton = document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]');
    pasteButton.click();

    expect(document.querySelector("[data-calendar-toast]").textContent).toContain("Sign in to paste events");
  });

  test("initCalendarDayMenus handles paste when navigator is missing", async () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    writeAuthState({ token: "token-1", user: { id: "user-1" } });
    const originalNavigator = global.navigator;
    Object.defineProperty(global, "navigator", { value: undefined, configurable: true });

    initCalendarDayMenus();

    const pasteButton = document.querySelector('[data-day-action="paste"][data-date-key="2024-01-10"]');
    pasteButton.click();
    await new Promise(process.nextTick);
    expect(document.getElementById("calendar-paste-modal").classList.contains("event-modal--open")).toBe(true);
    expect(document.querySelector("[data-calendar-paste-feedback]").textContent).toContain("Clipboard is empty");

    Object.defineProperty(global, "navigator", { value: originalNavigator, configurable: true });
  });

  test("initCalendarDayMenus handles missing modals for actions", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="new" data-date-key="2024-01-10"></button>
        <button data-day-action="copy" data-event-payload="${encodeMenuPayload({ id: "evt-1" })}"></button>
      </div>
    `;

    initCalendarDayMenus();
    document.querySelector('[data-day-action="new"]').click();
    document.querySelector('[data-day-action="copy"]').click();

    expect(document.querySelector("[data-calendar-toast]").textContent).toBe("");
  });

  test("initCalendarDayMenus handles new actions without date keys", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="new" data-calendar-id="cal-1"></button>
      </div>
      <div class="event-modal" id="calendar-event-modal" data-event-modal aria-hidden="true">
        <form data-calendar-event-form>
          <input name="calendarId" value="" />
          <input name="startsDate" value="" />
          <input name="endsDate" value="" />
          <input name="startsTime" value="" />
          <input name="endsTime" value="" />
        </form>
      </div>
    `;

    initCalendarDayMenus();
    document.querySelector('[data-day-action="new"]').click();

    const modal = document.getElementById("calendar-event-modal");
    expect(modal.classList.contains("event-modal--open")).toBe(true);
  });

  test("initCalendarDayMenus handles missing feedback and menu context", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <div data-calendar-menu></div>
        <button data-calendar-menu-toggle></button>
        <button data-day-action="copy" data-event-payload="${encodeMenuPayload({ id: "evt-1" })}"></button>
      </div>
      <div id="calendar-copy-modal">
        <form data-calendar-copy-form></form>
      </div>
    `;

    initCalendarDayMenus();
    document.querySelector("[data-calendar-menu-toggle]").click();
    document.querySelector("[data-calendar-view]").dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.querySelector('[data-day-action="copy"]').click();
    document.querySelector("[data-calendar-copy-form]").dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    expect(document.querySelector("[data-calendar-toast]").textContent).toBe("");
  });

  test("initCalendarDayMenus opens edit modal with event details", () => {
    document.body.innerHTML = renderCalendarView({
      label: "Calendar",
      summary: "Summary",
      referenceDate: "2024-01-05T12:00:00.000Z",
      calendarId: "cal-1",
      events: [{ id: "evt-1", title: "Kickoff", description: "Details", startsAt: "2024-01-10T10:00:00.000Z" }]
    });

    initCalendarDayMenus();

    const editButton = document.querySelector('[data-day-action="edit"][data-event-payload]');
    editButton.click();

    const editModal = document.getElementById("calendar-event-detail-modal");
    const details = editModal.querySelector("[data-calendar-edit-details]");
    expect(editModal.classList.contains("event-modal--open")).toBe(true);
    expect(details.textContent).toContain("Kickoff");
  });

  test("initCalendarDayMenus renders edit fallbacks for missing fields", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button
          data-day-action="edit"
          data-event-payload="${encodeMenuPayload({ id: "evt-1", title: "", description: "", startsAt: null })}"
        >
          Edit
        </button>
      </div>
      <div class="event-modal" id="calendar-event-detail-modal" data-event-modal aria-hidden="true">
        <div data-calendar-edit-details></div>
      </div>
    `;

    initCalendarDayMenus();

    const editButton = document.querySelector('[data-day-action="edit"][data-event-payload]');
    editButton.click();

    const details = document.querySelector("[data-calendar-edit-details]");
    expect(details.textContent).toContain("Untitled");
    expect(details.textContent).toContain("Unscheduled");
    expect(details.textContent).toContain("No description added yet.");
  });

  test("initCalendarDayMenus skips edit when modal is missing", () => {
    document.body.innerHTML = `
      <div data-calendar-view>
        <div data-calendar-toast></div>
        <button data-day-action="edit" data-event-payload="${encodeMenuPayload({ id: "evt-1", title: "Kickoff" })}"></button>
      </div>
    `;

    initCalendarDayMenus();
    document.querySelector('[data-day-action="edit"]').click();

    expect(document.querySelector("[data-calendar-toast]").textContent).toBe("");
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

  test("renderEventManagementList uses defaults when called without args", () => {
    const html = renderEventManagementList();

    expect(html).toContain("No events found yet");
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

  test("initEventCreation falls back when error messages are empty", async () => {
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

    global.fetch = jest.fn(() => Promise.reject(Object.assign(new Error(), { message: "" })));

    initEventCreation();
    document.querySelector("[data-event-create]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-form-feedback]").textContent).toContain("Unable to create event");

    global.fetch.mockRestore();
  });

  test("initEventCreation skips modal close when modal is missing", async () => {
    document.body.innerHTML = `
      <form data-event-create data-event-modal-close-on-success>
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
        ok: true,
        json: () => Promise.resolve({ id: "evt-1", title: "Sync" })
      })
    );

    initEventCreation();
    document.querySelector("[data-event-create]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-form-feedback]").textContent).toContain("Event created successfully");

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

  test("refreshEventList handles missing event arrays", async () => {
    document.body.innerHTML = `<div id="event-list"></div>`;
    const container = document.getElementById("event-list");

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({})
      })
    );

    await refreshEventList(container, "cal-1", "token");

    expect(container.innerHTML).toContain("Event Management");

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

  test("initEventManagement handles filters without list targets", async () => {
    document.body.innerHTML = `
      <form data-event-filter>
        <input name="calendarId" value="cal-1" />
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
        json: () => Promise.resolve({ events: [] })
      })
    );

    initEventManagement();
    document.querySelector("[data-event-filter]")
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(global.fetch).not.toHaveBeenCalled();

    global.fetch.mockRestore();
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

  test("loadCalendarOverview defaults when events payload is missing", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn((url) => {
      if (url.startsWith("/api/calendars")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ calendars: [{ id: "cal-1", name: "Primary" }] })
        });
      }
      if (url.startsWith("/api/events")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    const result = await loadCalendarOverview({ token: "token" });

    expect(result.events).toEqual([]);

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

  test("resolveAuthState refreshes stored auth state when token exists", async () => {
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
        ok: false,
        json: () => Promise.resolve({})
      })
    );

    const result = await resolveAuthState(storage);

    expect(result.token).toBe("stored-token");
    expect(result.syncSource).toBe("device cache");
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", {
      credentials: "same-origin",
      headers: {}
    });

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
    expect(result.syncSource).toBe("secure cookie");
    expect(JSON.parse(storage.getItem("tylendar-auth")).token).toBe("session-token");
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session", {
      credentials: "same-origin",
      headers: {}
    });

    global.fetch.mockRestore();
  });

  test("resolveAuthState defaults permissions when missing from session", async () => {
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
          session: { token: "session-token" }
        })
      })
    );

    const result = await resolveAuthState(storage);

    expect(result.permissions).toEqual([]);

    global.fetch.mockRestore();
  });

  test("resolveAuthState returns stored state when session payload is incomplete", async () => {
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
        json: () => Promise.resolve({ user: { id: "user-8" } })
      })
    );

    const result = await resolveAuthState(storage);

    expect(result).toBeNull();
    expect(storage.getItem("tylendar-auth")).toBeNull();

    global.fetch.mockRestore();
  });

  test("refreshSessionState updates session details from the server", async () => {
    const storage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      }
    };
    const authState = { token: "old-token", user: { id: "user-1" } };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          user: { id: "user-1", name: "Fresh" },
          session: { token: "fresh-token" },
          permissions: ["View Calendar"]
        })
      })
    );

    const result = await refreshSessionState(authState, storage);

    expect(result.token).toBe("fresh-token");
    expect(result.user.name).toBe("Fresh");
    expect(result.syncSource).toBe("secure cookie");
    expect(JSON.parse(storage.getItem("tylendar-auth")).token).toBe("fresh-token");

    global.fetch.mockRestore();
  });

  test("refreshSessionState falls back to stored state on errors", async () => {
    const storage = {
      data: {},
      getItem(key) {
        return this.data[key] || null;
      },
      setItem(key, value) {
        this.data[key] = value;
      }
    };
    const authState = { token: "old-token", user: { id: "user-1" } };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({})
      })
    );

    const result = await refreshSessionState(authState, storage);

    expect(result.token).toBe("old-token");
    expect(result.syncSource).toBe("device cache");
    expect(JSON.parse(storage.getItem("tylendar-auth")).token).toBe("old-token");

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

  test("postJson falls back to generic error messages when API message is missing", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({})
      })
    );

    await expect(postJson("/api/auth/login", { email: "bad" })).rejects.toThrow("Request failed");
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

  test("clearAuthState handles missing window storage", () => {
    const originalWindow = global.window;
    Object.defineProperty(global, "window", { value: undefined, configurable: true });

    expect(clearAuthState()).toBeNull();

    Object.defineProperty(global, "window", { value: originalWindow, configurable: true });
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
    expect(document.querySelector("[data-auth-status]").textContent).toContain("Session steady with");
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

  test("initAuthUI falls back to Account when user details are missing", async () => {
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

    const originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: "token", user: {} })
      })
    );

    initAuthUI();
    document.querySelector('form[data-auth-panel="login"]').dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("Account");
    global.fetch = originalFetch;
  });

  test("initAuthUI falls back to generic error message when none provided", async () => {
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

    const originalFetch = global.fetch;
    global.fetch = jest.fn(() => Promise.reject(new Error()));
    initAuthUI();

    document.querySelector('form[data-auth-panel="login"]').dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("Authentication failed");
    global.fetch = originalFetch;
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

  test("updateAccountSections clears missing profile values", () => {
    document.body.innerHTML = `
      <div id="profile-card"></div>
      <div id="home-highlights"></div>
      <div id="profile-management">
        <form data-profile-form>
          <input name="name" value="Old" />
          <input name="email" value="old@example.com" />
          <input name="organizationId" value="org-old" />
          <input name="role" value="admin" />
        </form>
      </div>
    `;

    updateAccountSections({
      name: "",
      email: "",
      organizationId: "",
      role: ""
    });

    const form = document.querySelector("[data-profile-form]");
    expect(form.querySelector('[name="name"]').value).toBe("");
    expect(form.querySelector('[name="email"]').value).toBe("");
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

  test("updateAuthStatus falls back to default logout error messaging", async () => {
    document.body.innerHTML = `
      <span data-auth-status></span>
      <div data-auth-feedback></div>
    `;

    const storage = createStorage();
    writeAuthState({ token: "token", user: { email: "user@example.com" } }, storage);

    const emptyError = new Error();
    emptyError.message = "";
    global.fetch = jest.fn(() => Promise.reject(emptyError));

    updateAuthStatus(readAuthState(storage), storage);
    document.querySelector("[data-auth-logout]").click();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(document.querySelector("[data-auth-feedback]").textContent).toContain("Logout failed");
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
