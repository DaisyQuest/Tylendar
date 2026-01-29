const { createObservabilityService } = require("../server/services/observabilityService");

describe("observability service", () => {
  test("returns dashboard data", () => {
    const service = createObservabilityService({
      now: () => "2024-01-01T00:00:00.000Z",
      uptimeSeconds: () => 120
    });
    const dashboard = service.getDashboard();

    expect(dashboard.generatedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(dashboard.uptimeSeconds).toBe(120);
    expect(dashboard.highlights).toHaveLength(0);
  });

  test("returns alerts", () => {
    const service = createObservabilityService();
    const alerts = service.getAlerts();

    expect(alerts).toHaveLength(0);
  });
});
