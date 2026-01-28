function buildHealthPayload({ mongoConnected, auditEnabled, timestamp = Date.now() }) {
  return {
    status: mongoConnected ? 'ok' : 'degraded',
    mongoConnected,
    auditEnabled,
    timestamp,
  };
}

module.exports = {
  buildHealthPayload,
};
