const { createObservabilityService } = require("../server/services/observabilityService");

describe("observability service", () => {
  test("returns dashboard data", () => {
    const service = createObservabilityService({ now: () => "2024-01-01T00:00:00.000Z" });
    const dashboard = service.getDashboard();

    expect(dashboard.generatedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(dashboard.highlights.length).toBeGreaterThan(0);
  });

  test("returns alerts", () => {
    const service = createObservabilityService();
    const alerts = service.getAlerts();

    expect(alerts.length).toBeGreaterThan(0);
    expect(alerts[0]).toHaveProperty("severity");
  });
});
