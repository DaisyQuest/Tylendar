const { getMongoConnectionString, loadConfig } = require('../server/config/env');
const {
  DEFAULT_FLAGS,
  parseBuildTimeFlags,
  resolveAccountFlags,
  resolveFlags,
  isFeatureEnabled,
} = require('../server/config/featureFlags');

describe('env config', () => {
  test('loads mongo connection string from env', () => {
    const env = { MONGODB_URI: 'mongodb://localhost:27017/test', NODE_ENV: 'test' };
    expect(getMongoConnectionString(env)).toBe(env.MONGODB_URI);
    expect(loadConfig(env)).toEqual({ mongoUri: env.MONGODB_URI, nodeEnv: 'test' });
  });

  test('falls back to MONGO_URL', () => {
    const env = { MONGO_URL: 'mongodb://localhost:27017/alt' };
    expect(getMongoConnectionString(env)).toBe(env.MONGO_URL);
    expect(loadConfig(env)).toEqual({ mongoUri: env.MONGO_URL, nodeEnv: 'development' });
  });

  test('throws on missing connection string', () => {
    expect(() => getMongoConnectionString({})).toThrow('MongoDB connection string');
    expect(() => loadConfig({})).toThrow('Missing required environment variable');
  });

  test('throws on non-string connection string', () => {
    expect(() => getMongoConnectionString({ MONGODB_URI: 123 })).toThrow(
      'MongoDB connection string',
    );
  });

  test('throws on empty connection string', () => {
    expect(() => getMongoConnectionString({ MONGODB_URI: '   ' })).toThrow(
      'MongoDB connection string',
    );
  });

  test('uses process.env defaults', () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/default-env';
    expect(getMongoConnectionString()).toBe(process.env.MONGODB_URI);
    expect(loadConfig()).toEqual({ mongoUri: process.env.MONGODB_URI, nodeEnv: 'test' });
  });
});

describe('feature flags', () => {
  test('parses build-time flags', () => {
    const flags = parseBuildTimeFlags({ FEATURE_FLAGS: 'enableUiShell=false,custom=true' });
    expect(flags.enableUiShell).toBe(false);
    expect(flags.custom).toBe(true);
  });

  test('defaults when no flags provided', () => {
    const flags = parseBuildTimeFlags({ FEATURE_FLAGS: '' });
    expect(flags).toEqual(DEFAULT_FLAGS);
  });

  test('ignores empty or unnamed flags', () => {
    const flags = parseBuildTimeFlags({ FEATURE_FLAGS: ' , =false,flag=' });
    expect(flags.flag).toBe(true);
  });

  test('resolves account flags', () => {
    expect(resolveAccountFlags({ a: true })).toEqual({ a: true });
  });

  test('merges flags with account overrides', () => {
    const resolved = resolveFlags({
      buildTimeFlags: { featureA: true },
      accountFlags: { featureA: false, featureB: true },
    });
    expect(resolved.featureA).toBe(false);
    expect(resolved.featureB).toBe(true);
  });

  test('resolveFlags handles missing account flags', () => {
    const resolved = resolveFlags({ buildTimeFlags: { featureA: true } });
    expect(resolved.featureA).toBe(true);
    expect(resolved.enableAudit).toBe(true);
  });

  test('resolveAccountFlags defaults to empty object', () => {
    expect(resolveAccountFlags()).toEqual({});
  });

  test('isFeatureEnabled handles missing flag name', () => {
    expect(isFeatureEnabled('')).toBe(false);
  });

  test('isFeatureEnabled uses provided context', () => {
    expect(
      isFeatureEnabled('featureX', {
        buildTimeFlags: { featureX: true },
        accountFlags: { featureX: true },
      }),
    ).toBe(true);
  });

  test('isFeatureEnabled falls back to defaults', () => {
    expect(isFeatureEnabled('enableAudit')).toBe(true);
  });
});
