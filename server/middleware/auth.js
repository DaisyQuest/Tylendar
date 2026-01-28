function parseToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  if (req.headers.cookie) {
    const match = req.headers.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("session="));
    if (match) {
      return match.slice("session=".length);
    }
  }

  return null;
}

function attachSession({ sessionStore, userRepository }) {
  return async (req, res, next) => {
    const token = parseToken(req);
    if (!token) {
      req.session = null;
      req.user = null;
      return next();
    }

    const session = sessionStore.getSession(token);
    if (!session) {
      req.session = null;
      req.user = null;
      return next();
    }

    const user = await userRepository.getById(session.userId);
    req.session = session;
    req.user = user;
    return next();
  };
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  return next();
}

module.exports = {
  attachSession,
  parseToken,
  requireAuth
};
