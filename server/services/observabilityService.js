function createObservabilityService({ now = () => new Date().toISOString() } = {}) {
  function getDashboard() {
    return {
      uptime: "99.98%",
      latencyP95: "210ms",
      errorRate: "0.3%",
      tracesSampled: "42k/day",
      generatedAt: now(),
      highlights: [
        "Embed widget traffic +18%",
        "Export throughput stable",
        "Audit queries optimized"
      ]
    };
  }

  function getAlerts() {
    return [
      {
        id: "alert-1",
        severity: "info",
        message: "Share link delivery latency returned to baseline.",
        status: "resolved"
      },
      {
        id: "alert-2",
        severity: "warning",
        message: "Calendar sync retries spiked for EU region.",
        status: "monitoring"
      }
    ];
  }

  return {
    getAlerts,
    getDashboard
  };
}

module.exports = {
  createObservabilityService
};
