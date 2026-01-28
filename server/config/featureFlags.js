const DEFAULT_FLAGS = Object.freeze({
  enableAudit: true,
  enableMonitoring: true,
  enableUiShell: true,
});

function parseBuildTimeFlags(env = process.env) {
  const raw = env.FEATURE_FLAGS || '';
  if (!raw.trim()) {
    return { ...DEFAULT_FLAGS };
  }

  return raw.split(',').reduce((flags, flag) => {
    const trimmed = flag.trim();
    if (!trimmed) {
      return flags;
    }

    const [name, value] = trimmed.split('=');
    if (!name) {
      return flags;
    }

    const normalized = name.trim();
    const enabled = value ? value.trim() !== 'false' : true;
    return {
      ...flags,
      [normalized]: enabled,
    };
  }, {});
}

function resolveAccountFlags(accountConfig = {}) {
  return {
    ...accountConfig,
  };
}

function resolveFlags({ buildTimeFlags, accountFlags }) {
  const resolved = {
    ...DEFAULT_FLAGS,
    ...buildTimeFlags,
  };

  return Object.keys(accountFlags || {}).reduce((acc, key) => {
    acc[key] = Boolean(accountFlags[key]);
    return acc;
  }, resolved);
}

function isFeatureEnabled(flagName, { buildTimeFlags, accountFlags } = {}) {
  if (!flagName) {
    return false;
  }

  const flags = resolveFlags({
    buildTimeFlags: buildTimeFlags || parseBuildTimeFlags(),
    accountFlags: resolveAccountFlags(accountFlags || {}),
  });

  return Boolean(flags[flagName]);
}

module.exports = {
  DEFAULT_FLAGS,
  parseBuildTimeFlags,
  resolveAccountFlags,
  resolveFlags,
  isFeatureEnabled,
};
