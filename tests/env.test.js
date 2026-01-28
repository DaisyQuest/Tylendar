const { getEnv, parseJsonEnv } = require("../server/config/env");

describe("env loader", () => {
  test("parseJsonEnv handles invalid json", () => {
    expect(parseJsonEnv("bad", { ok: true })).toEqual({ ok: true });
  });

  test("parseJsonEnv returns parsed json", () => {
    expect(parseJsonEnv("{\"flag\":true}", {})).toEqual({ flag: true });
  });

  test("getEnv merges overrides", () => {
    const env = getEnv({ mongoUri: "mongo", useInMemoryDb: false });
    expect(env.mongoUri).toBe("mongo");
    expect(env.useInMemoryDb).toBe(false);
  });
});
