/**
 * @jest-environment jsdom
 */
const {
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

  test("renderCalendarView includes summary", () => {
    const html = renderCalendarView({
      label: "Month",
      summary: "Month view",
      days: ["Mon"],
      featuredEvents: [{ title: "Event", day: "Mon", time: "9" }]
    });

    expect(html).toContain("Month Calendar View");
    expect(html).toContain("Event");
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
  });
});
