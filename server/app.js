const express = require("express");
const path = require("path");

const {
  getAccessMatrix,
  getCalendarView,
  getEventListView,
  getFeatureFlags,
  getHomeHighlights,
  getMessageBoard,
  getOrganizationDashboard,
  getUserDashboard,
  getUserProfile
} = require("./data/sampleData");

function createApp({ featureOverrides } = {}) {
  const app = express();
  const flags = getFeatureFlags(featureOverrides);

  app.use("/static", express.static(path.join(__dirname, "..", "client")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "client", "index.html"));
  });

  app.get("/api/flags", (req, res) => {
    res.json(flags);
  });

  app.get("/api/home", (req, res) => {
    res.json({
      highlights: getHomeHighlights()
    });
  });

  app.get("/api/profile/:userId", (req, res) => {
    res.json(getUserProfile(req.params.userId));
  });

  app.get("/api/dashboard/user", (req, res) => {
    res.json(getUserDashboard());
  });

  app.get("/api/dashboard/org", (req, res) => {
    res.json(getOrganizationDashboard());
  });

  app.get("/api/calendar/view", (req, res) => {
    res.json(getCalendarView(req.query.view));
  });

  app.get("/api/events/list", (req, res) => {
    res.json(getEventListView(req.query.range));
  });

  app.get("/api/access", (req, res) => {
    res.json({
      entries: getAccessMatrix()
    });
  });

  app.get("/api/events/:eventId/comments", (req, res) => {
    res.json(getMessageBoard(req.params.eventId));
  });

  return app;
}

module.exports = { createApp };
