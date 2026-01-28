const express = require("express");
const crypto = require("crypto");
const { hashPassword, verifyPassword } = require("../auth/passwords");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { addError, validateRequiredString } = require("../validation/validators");

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function validateLoginPayload({ email, password }) {
  const errors = [];
  validateRequiredString(email, "email", errors);
  validateRequiredString(password, "password", errors);
  return errors;
}

function validateRegistrationPayload({ name, email, password, organizationId }) {
  const errors = [];
  validateRequiredString(name, "name", errors);
  validateRequiredString(email, "email", errors);
  validateRequiredString(password, "password", errors);
  validateRequiredString(organizationId, "organizationId", errors);
  if (typeof password === "string" && password.trim().length > 0 && password.trim().length < 8) {
    addError(errors, "password", "password must be at least 8 characters");
  }
  return errors;
}

function createAuthRouter({
  flags,
  sessionStore,
  userRepository,
  organizationsRepository,
  auditService
}) {
  const router = express.Router();

  router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const errors = validateLoginPayload({ email, password });
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    const normalizedEmail = normalizeEmail(email);
    const matches = await userRepository.list({ email: normalizedEmail });
    const user = matches[0] || null;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const session = sessionStore.createSession({ userId: user.id });
    await auditService.record({
      action: "login",
      actorId: user.id,
      targetId: user.id,
      status: "success",
      details: "User logged in"
    });

    return res.json({ token: session.token, user: sanitizeUser(user) });
  }));

  router.post("/register", asyncHandler(async (req, res) => {
    const { name, email, password, organizationId, role } = req.body;
    const errors = validateRegistrationPayload({ name, email, password, organizationId });
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation failed", details: errors });
    }
    const normalizedEmail = normalizeEmail(email);
    const existing = await userRepository.list({ email: normalizedEmail });
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    if (organizationsRepository) {
      const org = await organizationsRepository.getById(organizationId);
      if (!org) {
        return res.status(404).json({ error: "Organization not found" });
      }
    }

    const userId = `user-${crypto.randomBytes(8).toString("hex")}`;
    const user = await userRepository.create({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      organizationId,
      role,
      passwordHash: hashPassword(password)
    });

    const session = sessionStore.createSession({ userId: user.id });
    await auditService.record({
      action: "register",
      actorId: user.id,
      targetId: user.id,
      status: "success",
      details: "User registered"
    });

    return res.status(201).json({ token: session.token, user: sanitizeUser(user) });
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
