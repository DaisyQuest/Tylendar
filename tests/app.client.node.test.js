/**
 * @jest-environment node
 */

describe("client module in node", () => {
  test("exports functions without window", () => {
    jest.resetModules();
    const client = require("../client/app");

    expect(typeof client.renderProfile).toBe("function");
    expect(typeof client.init).toBe("function");
    expect(typeof client.renderEmbedWidget).toBe("function");
  });

  test("auth storage helpers return null without window", () => {
    jest.resetModules();
    const { readAuthState, writeAuthState, clearAuthState } = require("../client/app");

    expect(readAuthState()).toBeNull();
    expect(writeAuthState({ token: "token" })).toBeNull();
    expect(clearAuthState()).toBeNull();
  });
});
