const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createOrgRouter({ organizationsRepository, auditService }) {
  const router = express.Router();

  router.get("/:orgId", requireAuth, asyncHandler(async (req, res) => {
    const organization = await organizationsRepository.getById(req.params.orgId);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    return res.json(organization);
  }));

  router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const organization = await organizationsRepository.create(req.body);
    await auditService.record({
      action: "organization_create",
      actorId: req.user.id,
      targetId: organization.id,
      status: "success",
      details: "Organization created"
    });
    return res.status(201).json(organization);
  }));

  return router;
}

module.exports = {
  createOrgRouter
};
