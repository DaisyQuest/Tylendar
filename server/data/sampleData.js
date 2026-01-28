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
  messageBoard: true,
  embedWidget: true,
  socialSharing: true,
  auditHistory: true,
  faultTolerance: true,
  roleManagement: true,
  developerPortal: true,
  observability: true
};

const auditHistory = [
  {
    id: "audit-100",
    action: "calendar_embed_loaded",
    actor: "Guest Viewer",
    status: "success",
    summary: "Public embed widget loaded",
    occurredAt: "Today, 8:15 AM"
  },
  {
    id: "audit-200",
    action: "role_assignment",
    actor: "Avery Chen",
    status: "success",
    summary: "Assigned Event Coordinator role to Riley Patel",
    occurredAt: "Today, 7:05 AM"
  },
  {
    id: "audit-300",
    action: "share_export",
    actor: "Riley Patel",
    status: "warning",
    summary: "Exported calendar with 2 redacted events",
    occurredAt: "Yesterday, 4:20 PM"
  }
];

const embedWidgets = [
  {
    id: "embed-1",
    calendarId: "cal-1",
    title: "Community Events Embed",
    theme: "Lavender Glow",
    visibility: "Public",
    endpoint: "/api/calendars/cal-1/embed",
    sampleSnippet: "<iframe src=\"https://tylendar.app/embed/cal-1\" />"
  }
];

const sharingOptions = [
  {
    id: "share-1",
    calendarId: "cal-1",
    channel: "Social Link",
    description: "Shareable preview with RSVP buttons",
    link: "https://tylendar.app/share/cal-1"
  },
  {
    id: "share-2",
    calendarId: "cal-1",
    channel: "Export",
    description: "ICS, CSV, and PDF exports with time zones",
    formats: ["ICS", "CSV", "PDF"]
  }
];

const roleDefinitions = [
  {
    id: "role-1",
    orgId: "org-1",
    name: "Event Coordinator",
    permissions: ["Create Events", "Comment on Calendar", "View Calendar"],
    summary: "Plans and moderates community gatherings"
  },
  {
    id: "role-2",
    orgId: "org-1",
    name: "Calendar Steward",
    permissions: ["Manage Calendar", "Add to Calendar", "View Calendar"],
    summary: "Owns calendar quality and access reviews"
  }
];

const roleAssignments = [
  {
    id: "assign-1",
    roleId: "role-1",
    user: "Riley Patel",
    assignedBy: "Avery Chen",
    assignedAt: "Today, 7:00 AM"
  },
  {
    id: "assign-2",
    roleId: "role-2",
    user: "Jordan Lee",
    assignedBy: "Avery Chen",
    assignedAt: "Yesterday, 2:30 PM"
  }
];

const faultToleranceSnapshots = [
  {
    id: "resilience-1",
    pattern: "Retries",
    status: "Healthy",
    detail: "Median retry count under 1.2 attempts"
  },
  {
    id: "resilience-2",
    pattern: "Circuit Breakers",
    status: "Monitoring",
    detail: "1 circuit opened and recovered in last 24h"
  },
  {
    id: "resilience-3",
    pattern: "Graceful Degradation",
    status: "Active",
    detail: "Fallback content served for 3 degraded requests"
  }
];

const developerPortal = {
  headline: "Developer Hub",
  description: "API references, SDK guides, and webhooks for Tylendar integrators.",
  resources: [
    {
      title: "API Reference",
      detail: "REST endpoints with request/response samples"
    },
    {
      title: "Webhook Guides",
      detail: "Subscribe to calendar changes and audit events"
    },
    {
      title: "Embed Toolkit",
      detail: "Drop-in widgets with theming guidance"
    }
  ],
  status: "Updated 2 days ago"
};

const observabilityOverview = {
  uptime: "99.98%",
  latencyP95: "210ms",
  errorRate: "0.3%",
  highlights: ["Embed traffic +18%", "Event exports stable", "Alert noise reduced"]
};

const operationalAlerts = [
  {
    id: "alert-1",
    severity: "info",
    message: "Share link delivery latency returned to baseline.",
    status: "resolved"
  },
  {
    id: "alert-2",
    severity: "warning",
    message: "Calendar sync retries spiked for EU region.",
    status: "monitoring"
  }
];

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

function getAuditHistory() {
  return auditHistory;
}

function getEmbedWidget(calendarId = "cal-1") {
  const widget = embedWidgets.find((entry) => entry.calendarId === calendarId) || embedWidgets[0];
  return {
    ...widget,
    calendarId: widget.calendarId,
    shareLink: `https://tylendar.app/embed/${widget.calendarId}`
  };
}

function getSharingOptions(calendarId = "cal-1") {
  return sharingOptions.filter((option) => option.calendarId === calendarId);
}

function getRoleManagement(orgId = "org-1") {
  return {
    orgId,
    roles: roleDefinitions.filter((role) => role.orgId === orgId),
    assignments: roleAssignments
  };
}

function getFaultToleranceSnapshots() {
  return faultToleranceSnapshots;
}

function getDeveloperPortal() {
  return developerPortal;
}

function getObservabilityOverview() {
  return observabilityOverview;
}

function getOperationalAlerts() {
  return operationalAlerts;
}

module.exports = {
  getAccessMatrix,
  getAuditHistory,
  getCalendarView,
  getDeveloperPortal,
  getEmbedWidget,
  getEventListView,
  getFeatureFlags,
  getFaultToleranceSnapshots,
  getHomeHighlights,
  getObservabilityOverview,
  getOperationalAlerts,
  getMessageBoard,
  getOrganizationDashboard,
  getRoleManagement,
  getSharingOptions,
  getUserDashboard,
  getUserProfile
};
