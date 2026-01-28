const baseUsers = [
  {
    id: "user-1",
    name: "Avery Chen",
    role: "Community Host",
    title: "Events & Friends",
    location: "Seattle, WA"
  },
  {
    id: "user-2",
    name: "Riley Patel",
    role: "Event Coordinator",
    title: "Community Moments",
    location: "Austin, TX"
  }
];

const eventCatalog = [
  {
    id: "evt-100",
    title: "Brunch Planning",
    calendar: "Friends",
    day: "Tue",
    time: "10:00 AM",
    range: "week",
    owner: "Avery Chen"
  },
  {
    id: "evt-200",
    title: "Game Night",
    calendar: "Hangouts",
    day: "Thu",
    time: "3:00 PM",
    range: "month",
    owner: "Riley Patel"
  },
  {
    id: "evt-300",
    title: "Weekend Hike",
    calendar: "Outdoors",
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
    calendar: "Friends",
    permissions: ["View Calendar", "Add to Calendar", "Manage Calendar"]
  },
  {
    id: "perm-2",
    user: "Riley Patel",
    calendar: "Hangouts",
    permissions: ["View Calendar - Times Only", "Comment on Calendar"]
  },
  {
    id: "perm-3",
    user: "Jordan Lee",
    calendar: "Outdoors",
    permissions: ["View Calendar", "Add to Calendar"]
  }
];

const messageBoard = {
  "evt-100": [
    {
      id: "c-1",
      author: "Avery Chen",
      message: "Bring your favorite snacks!",
      time: "2 hours ago"
    },
    {
      id: "c-2",
      author: "Riley Patel",
      message: "I'll bring playlists for the vibe.",
      time: "30 minutes ago"
    }
  ],
  "evt-200": [
    {
      id: "c-3",
      author: "Jordan Lee",
      message: "Route looks great — can't wait!",
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
      title: "Your social calendar, together",
      description: "Blend friend groups, clubs, and communities with gentle access controls."
    },
    {
      title: "Kind boundaries",
      description: "Granular permissions keep everyone comfortable and in the loop."
    },
    {
      title: "Soft, welcoming design",
      description: "Pastel visuals and cozy spaces for planning together."
    }
  ];
}

function getUserProfile(userId) {
  const user = baseUsers.find((entry) => entry.id === userId) || baseUsers[0];

  return {
    ...user,
    lastActive: "Today, 9:45 AM",
    notifications: [
      "3 invites waiting for your RSVP",
      "2 permission updates",
      "New message on Game Night"
    ]
  };
}

function getUserDashboard() {
  return {
    focusLabel: "Today with friends",
    highlights: [
      "2 upcoming invites",
      "4 events with new comments",
      "8 friends online"
    ],
    milestones: [
      "Finalize weekend plans",
      "Prep game night",
      "Review group availability"
    ]
  };
}

function getOrganizationDashboard() {
  return {
    name: "Tylendar Community",
    activeCalendars: 12,
    upcomingEvents: 48,
    complianceScore: "98%",
    departments: ["Friends", "Clubs", "Neighborhood", "Wellness"]
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
