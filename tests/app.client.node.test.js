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
});
