const { PERMISSIONS } = require("../models/calendarPermissions");

function createSharingService() {
  function getSharingOptions(calendarId) {
    if (!calendarId) {
      return [];
    }

    return [
      {
        channel: "Share link",
        description: "Generate a secure share link for this calendar.",
        permissions: PERMISSIONS
      },
      {
        channel: "Export",
        description: "Export calendar data for backup or migration.",
        formats: ["ICS", "CSV"]
      }
    ];
  }

  return {
    getSharingOptions
  };
}

module.exports = {
  createSharingService
};
