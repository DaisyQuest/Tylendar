function parseAuthorizationHeader(header) {
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

function parseSessionCookie(cookieHeader) {
  if (!cookieHeader) {
    return null;
  }
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("session="));
  return match ? match.slice("session=".length) : null;
}

function parseToken(req) {
  return parseAuthorizationHeader(req.headers.authorization) || parseSessionCookie(req.headers.cookie);
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
    if (!user) {
      req.session = null;
      req.user = null;
      return next();
    }
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
  parseAuthorizationHeader,
  parseSessionCookie,
  requireAuth
};
