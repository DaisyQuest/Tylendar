const crypto = require("crypto");

function createSessionStore({ ttlMs = 1000 * 60 * 60 * 8, now = () => Date.now() } = {}) {
  const sessions = new Map();

  function isExpired(session) {
    if (!session || typeof session.expiresAt !== "number") {
      return true;
    }
    return session.expiresAt <= now();
  }

  function prune() {
    for (const [token, session] of sessions.entries()) {
      if (isExpired(session)) {
        sessions.delete(token);
      }
    }
  }

  return {
    createSession({ userId }) {
      prune();
      const token = crypto.randomBytes(16).toString("hex");
      const timestamp = now();
      const session = {
        token,
        userId,
        createdAt: new Date(timestamp).toISOString(),
        expiresAt: timestamp + ttlMs
      };
      sessions.set(token, session);
      return session;
    },
    getSession(token) {
      const session = sessions.get(token) || null;
      if (!session) {
        return null;
      }
      if (isExpired(session)) {
        sessions.delete(token);
        return null;
      }
      return session;
    },
    deleteSession(token) {
      return sessions.delete(token);
    },
    getTtlMs() {
      return ttlMs;
    },
    clear() {
      sessions.clear();
    }
  };
}

module.exports = {
  createSessionStore
};
