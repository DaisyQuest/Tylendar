const ACTIVE_SESSIONS = new Map();

function createSession({ userId, issuedAt = Date.now() }) {
  if (!userId) {
    throw new Error('userId is required');
  }
  const token = `${userId}-${issuedAt}`;
  ACTIVE_SESSIONS.set(token, { userId, issuedAt });
  return token;
}

function validateSession(token, now = Date.now()) {
  if (!token) {
    return { valid: false, reason: 'missing token' };
  }
  const session = ACTIVE_SESSIONS.get(token);
  if (!session) {
    return { valid: false, reason: 'unknown token' };
  }
  if (now - session.issuedAt > 1000 * 60 * 60 * 12) {
    ACTIVE_SESSIONS.delete(token);
    return { valid: false, reason: 'expired token' };
  }
  return { valid: true, session };
}

function revokeSession(token) {
  return ACTIVE_SESSIONS.delete(token);
}

module.exports = {
  createSession,
  validateSession,
  revokeSession,
  _ACTIVE_SESSIONS: ACTIVE_SESSIONS,
};
