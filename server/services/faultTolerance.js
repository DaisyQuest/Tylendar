function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(task, options = {}) {
  const {
    retries = 2,
    delayMs = 50,
    backoffFactor = 2,
    onRetry
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt <= retries) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await task(attempt);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) {
        break;
      }
      if (onRetry) {
        onRetry({ attempt, error });
      }
      const delay = delayMs * Math.pow(backoffFactor, attempt);
      // eslint-disable-next-line no-await-in-loop
      await wait(delay);
    }
    attempt += 1;
  }

  throw lastError;
}

function createCircuitBreaker(options = {}) {
  const {
    failureThreshold = 3,
    successThreshold = 2,
    cooldownMs = 1000,
    now = () => Date.now()
  } = options;

  let state = "closed";
  let failureCount = 0;
  let successCount = 0;
  let openedAt = null;

  function canAttempt() {
    if (state !== "open") {
      return true;
    }
    if (openedAt === null) {
      return false;
    }
    return now() - openedAt >= cooldownMs;
  }

  function recordSuccess() {
    if (state === "half-open") {
      successCount += 1;
      if (successCount >= successThreshold) {
        state = "closed";
        failureCount = 0;
        successCount = 0;
        openedAt = null;
      }
      return;
    }
    failureCount = 0;
  }

  function recordFailure() {
    failureCount += 1;
    if (failureCount >= failureThreshold) {
      state = "open";
      openedAt = now();
      successCount = 0;
    }
  }

  async function execute(task) {
    if (!canAttempt()) {
      const error = new Error("Circuit breaker open");
      error.code = "CIRCUIT_OPEN";
      throw error;
    }

    if (state === "open") {
      state = "half-open";
      failureCount = 0;
      successCount = 0;
    }

    try {
      const result = await task();
      recordSuccess();
      return result;
    } catch (error) {
      recordFailure();
      throw error;
    }
  }

  return {
    execute,
    getState: () => state,
    getSnapshot: () => ({
      state,
      failureCount,
      successCount,
      openedAt
    })
  };
}

function createGracefulError(error, fallbackMessage = "Temporarily unavailable") {
  return {
    message: fallbackMessage,
    reason: error?.message || "unknown",
    status: "degraded"
  };
}

module.exports = {
  createCircuitBreaker,
  createGracefulError,
  withRetries
};
