const REQUIRED_KEYS = ['MONGODB_URI'];

function getMongoConnectionString(env = process.env) {
  const candidate = env.MONGODB_URI || env.MONGO_URL;
  if (!candidate || typeof candidate !== 'string' || candidate.trim().length === 0) {
    throw new Error('MongoDB connection string is required.');
  }

  return candidate.trim();
}

function loadConfig(env = process.env) {
  REQUIRED_KEYS.forEach((key) => {
    if (!env[key] && !env.MONGO_URL) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  });

  return {
    mongoUri: getMongoConnectionString(env),
    nodeEnv: env.NODE_ENV || 'development',
  };
}

module.exports = {
  getMongoConnectionString,
  loadConfig,
};
