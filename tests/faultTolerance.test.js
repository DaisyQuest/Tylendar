const {
  createCircuitBreaker,
  createGracefulError,
  withRetries
} = require("../server/services/faultTolerance");

describe("fault tolerance utilities", () => {
  test("withRetries retries before succeeding", async () => {
    let attempts = 0;
    const result = await withRetries(async () => {
      attempts += 1;
      if (attempts < 2) {
        throw new Error("fail");
      }
      return "ok";
    }, { retries: 2, delayMs: 1 });

    expect(result).toBe("ok");
    expect(attempts).toBe(2);
  });

  test("withRetries calls onRetry and throws after exhausting retries", async () => {
    const onRetry = jest.fn();
    let attempts = 0;

    await expect(withRetries(async () => {
      attempts += 1;
      throw new Error("still failing");
    }, { retries: 1, delayMs: 1, onRetry })).rejects.toThrow("still failing");

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(2);
  });

  test("circuit breaker opens on failures", async () => {
    const breaker = createCircuitBreaker({ failureThreshold: 1, cooldownMs: 1000, now: () => 0 });

    await expect(breaker.execute(async () => {
      throw new Error("fail");
    })).rejects.toThrow("fail");

    await expect(breaker.execute(async () => "ok")).rejects.toThrow("Circuit breaker open");
    expect(breaker.getSnapshot().state).toBe("open");
  });

  test("circuit breaker recovers after cooldown", async () => {
    let current = 0;
    const breaker = createCircuitBreaker({
      failureThreshold: 1,
      successThreshold: 1,
      cooldownMs: 1,
      now: () => current
    });

    await expect(breaker.execute(async () => {
      throw new Error("fail");
    })).rejects.toThrow("fail");

    current = 2;
    const result = await breaker.execute(async () => "ok");

    expect(result).toBe("ok");
    expect(breaker.getSnapshot().state).toBe("closed");
  });

  test("createGracefulError returns fallback details", () => {
    const fallback = createGracefulError(new Error("timeout"), "Service degraded");

    expect(fallback.message).toBe("Service degraded");
    expect(fallback.reason).toBe("timeout");
    expect(fallback.status).toBe("degraded");
  });
});
