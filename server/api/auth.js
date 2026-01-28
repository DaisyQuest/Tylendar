const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");

function createAuthRouter({ flags, sessionStore, userRepository, auditService }) {
  const router = express.Router();

  router.post("/login", asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await userRepository.getById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const session = sessionStore.createSession({ userId });
    await auditService.record({
      action: "login",
      actorId: userId,
      targetId: userId,
      status: "success",
      details: "User logged in"
    });

    return res.json({ token: session.token, user });
  }));

  router.post("/logout", requireAuth, asyncHandler(async (req, res) => {
    sessionStore.deleteSession(req.session.token);
    await auditService.record({
      action: "logout",
      actorId: req.user.id,
      targetId: req.user.id,
      status: "success",
      details: "User logged out"
    });
    return res.json({ status: "ok" });
  }));

  router.get("/session", requireAuth, (req, res) => {
    res.json({ user: req.user, session: req.session });
  });

  router.get("/flags", (req, res) => {
    res.json({ authEnabled: flags.auth });
  });

  return router;
}

module.exports = {
  createAuthRouter
};
