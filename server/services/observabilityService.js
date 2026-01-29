function createObservabilityService({
  now = () => new Date().toISOString(),
  uptimeSeconds = () => Math.round(process.uptime())
} = {}) {
  function getDashboard() {
    return {
      uptimeSeconds: uptimeSeconds(),
      latencyP95Ms: null,
      errorRate: null,
      tracesSampled: 0,
      generatedAt: now(),
      highlights: []
    };
  }

  function getAlerts() {
    return [];
  }

  return {
    getAlerts,
    getDashboard
  };
}

module.exports = {
  createObservabilityService
};
