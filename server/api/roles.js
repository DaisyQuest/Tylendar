const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createRolesRouter({ rolesRepository, roleAssignmentsRepository, auditService }) {
  const router = express.Router();

  router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.orgId) {
      filter.orgId = req.query.orgId;
    }
    const roles = await rolesRepository.list(filter);
    return res.json({ roles });
  }));

  router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const role = await rolesRepository.create(req.body);
    await auditService.record({
      action: "role_create",
      actorId: req.user.id,
      targetId: role.id,
      status: "success",
      details: "Role created"
    });
    return res.status(201).json(role);
  }));

  router.get("/assignments", requireAuth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.orgId) {
      filter.orgId = req.query.orgId;
    }
    if (req.query.roleId) {
      filter.roleId = req.query.roleId;
    }
    if (req.query.userId) {
      filter.userId = req.query.userId;
    }
    const assignments = await roleAssignmentsRepository.list(filter);
    return res.json({ assignments });
  }));

  router.post("/assignments", requireAuth, asyncHandler(async (req, res) => {
    const assignment = await roleAssignmentsRepository.create(req.body);
    await auditService.record({
      action: "role_assign",
      actorId: req.user.id,
      targetId: assignment.id,
      status: "success",
      details: "Role assigned"
    });
    return res.status(201).json(assignment);
  }));

  return router;
}

module.exports = {
  createRolesRouter
};
