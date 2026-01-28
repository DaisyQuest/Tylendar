function parseJsonEnv(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function getEnv(overrides = {}) {
  const env = {
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URL || "",
    sessionSecret: process.env.SESSION_SECRET || "tylendar-dev-secret",
    useInMemoryDb: process.env.USE_IN_MEMORY_DB === "true" || process.env.NODE_ENV === "test",
    featureFlags: parseJsonEnv(process.env.FEATURE_FLAGS, {})
  };

  return {
    ...env,
    ...overrides
  };
}

module.exports = {
  getEnv,
  parseJsonEnv
};
