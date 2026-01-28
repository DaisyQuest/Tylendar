const crypto = require("crypto");

function createSessionStore() {
  const sessions = new Map();

  return {
    createSession({ userId }) {
      const token = crypto.randomBytes(16).toString("hex");
      const session = {
        token,
        userId,
        createdAt: new Date().toISOString()
      };
      sessions.set(token, session);
      return session;
    },
    getSession(token) {
      return sessions.get(token) || null;
    },
    deleteSession(token) {
      return sessions.delete(token);
    },
    clear() {
      sessions.clear();
    }
  };
}

module.exports = {
  createSessionStore
};
