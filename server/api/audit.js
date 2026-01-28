const express = require("express");
const { requireAuth } = require("../middleware/auth");

function createAuditRouter({ auditService }) {
  const router = express.Router();

  router.get("/logs", requireAuth, (req, res) => {
    res.json({ entries: auditService.list() });
  });

  return router;
}

module.exports = {
  createAuditRouter
};
