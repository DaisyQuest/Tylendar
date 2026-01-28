const baseUsers = [
  {
    id: "user-1",
    name: "Avery Chen",
    role: "Calendar Admin",
    title: "Director of Operations",
    location: "Seattle, WA"
  },
  {
    id: "user-2",
    name: "Riley Patel",
    role: "Event Coordinator",
    title: "Community Programs",
    location: "Austin, TX"
  }
];

const eventCatalog = [
  {
    id: "evt-100",
    title: "Q2 Roadmap Sync",
    calendar: "Product",
    day: "Tue",
    time: "10:00 AM",
    range: "week",
    owner: "Avery Chen"
  },
  {
    id: "evt-200",
    title: "Partner Summit",
    calendar: "All Hands",
    day: "Thu",
    time: "3:00 PM",
    range: "month",
    owner: "Riley Patel"
  },
  {
    id: "evt-300",
    title: "Executive Review",
    calendar: "Leadership",
    day: "Fri",
    time: "1:00 PM",
    range: "year",
    owner: "Avery Chen"
  }
];

const accessMatrix = [
  {
    id: "perm-1",
    user: "Avery Chen",
    calendar: "Executive",
    permissions: ["View Calendar", "Add to Calendar", "Manage Calendar"]
  },
  {
    id: "perm-2",
    user: "Riley Patel",
    calendar: "Community",
    permissions: ["View Calendar - Times Only", "Comment on Calendar"]
  },
  {
    id: "perm-3",
    user: "Jordan Lee",
    calendar: "Marketing",
    permissions: ["View Calendar", "Add to Calendar"]
  }
];

const messageBoard = {
  "evt-100": [
    {
      id: "c-1",
      author: "Avery Chen",
      message: "Please add agenda items by Monday.",
      time: "2 hours ago"
    },
    {
      id: "c-2",
      author: "Riley Patel",
      message: "Adding customer feedback segment.",
      time: "30 minutes ago"
    }
  ],
  "evt-200": [
    {
      id: "c-3",
      author: "Jordan Lee",
      message: "Confirming keynote logistics.",
      time: "1 day ago"
    }
  ]
};

const featureFlags = {
  homePage: true,
  userManagement: true,
  userDashboard: true,
  organizationDashboard: true,
  calendarViews: true,
  eventListViews: true,
  manageAccess: true,
  messageBoard: true
};

const viewLabels = {
  month: "Month",
  "2-week": "2-Week",
  week: "Week",
  day: "Day"
};

function getFeatureFlags(overrides = {}) {
  return {
    ...featureFlags,
    ...overrides
  };
}

function getHomeHighlights() {
  return [
    {
      title: "Unified calendar intelligence",
      description: "Blend personal, team, and org calendars with clear permission controls."
    },
    {
      title: "Access you can trust",
      description: "Granular permissions and audit-ready change history keep teams aligned."
    },
    {
      title: "Experience-forward design",
      description: "Beautiful layouts across dashboards, views, and collaboration surfaces."
    }
  ];
}

function getUserProfile(userId) {
  const user = baseUsers.find((entry) => entry.id === userId) || baseUsers[0];

  return {
    ...user,
    lastActive: "Today, 9:45 AM",
    notifications: [
      "3 events awaiting response",
      "2 permission updates",
      "New message on Partner Summit"
    ]
  };
}

function getUserDashboard() {
  return {
    focusLabel: "Today at a glance",
    highlights: [
      "2 upcoming approvals",
      "4 events with pending comments",
      "8 team members online"
    ],
    milestones: [
      "Finalize Q2 planning",
      "Prep executive sync",
      "Review staffing calendar"
    ]
  };
}

function getOrganizationDashboard() {
  return {
    name: "Tylendar Labs",
    activeCalendars: 12,
    upcomingEvents: 48,
    complianceScore: "98%",
    departments: ["Operations", "Product", "People", "Marketing"]
  };
}

function getCalendarView(view = "month") {
  const label = viewLabels[view] || viewLabels.month;
  const days = view === "day" ? ["Tue"] : ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return {
    view,
    label,
    days,
    summary: `${label} view with ${days.length} focus days`,
    featuredEvents: eventCatalog.filter((event) => event.range === view || view === "month")
  };
}

function getEventListView(range = "month") {
  const normalizedRange = ["year", "n-month", "month", "week", "day"].includes(range)
    ? range
    : "month";

  const listTitle = normalizedRange === "n-month" ? "Rolling 3-month" : normalizedRange;
  const items = eventCatalog.filter((event) => {
    if (normalizedRange === "n-month") {
      return event.range === "month" || event.range === "year";
    }

    return event.range === normalizedRange;
  });

  return {
    range: normalizedRange,
    title: listTitle,
    items
  };
}

function getAccessMatrix() {
  return accessMatrix.map((entry) => ({
    ...entry,
    permissionCount: entry.permissions.length
  }));
}

function getMessageBoard(eventId = "evt-100") {
  const fallbackId = messageBoard[eventId] ? eventId : "evt-100";
  const entries = messageBoard[fallbackId];

  return {
    eventId: fallbackId,
    entries,
    total: entries.length
  };
}

module.exports = {
  getAccessMatrix,
  getCalendarView,
  getEventListView,
  getFeatureFlags,
  getHomeHighlights,
  getMessageBoard,
  getOrganizationDashboard,
  getUserDashboard,
  getUserProfile
};
