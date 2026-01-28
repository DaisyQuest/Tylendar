const { createAuditService } = require("../server/services/auditService");

describe("audit service", () => {
  test("records and lists entries", async () => {
    const audit = createAuditService();
    await audit.record({
      action: "test",
      actorId: "user-1",
      targetId: "target",
      status: "success",
      details: "done"
    });

    const entries = audit.list();
    expect(entries).toHaveLength(1);
    expect(entries[0].action).toBe("test");
  });
});
