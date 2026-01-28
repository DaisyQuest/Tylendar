const { createApp } = require("../server/app");

describe("app error handler", () => {
  test("handles errors with status", () => {
    const app = createApp();
    const errorHandler = app._router.stack.find((layer) => layer.handle.length === 4).handle;

    const err = { status: 400, message: "Bad", details: [{ field: "x" }] };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Bad", details: [{ field: "x" }] });
  });

  test("defaults error details when missing", () => {
    const app = createApp();
    const errorHandler = app._router.stack.find((layer) => layer.handle.length === 4).handle;

    const err = { status: 400, message: "Bad" };
    const res = {
      status: jest.fn(() => res),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(res.json).toHaveBeenCalledWith({ error: "Bad", details: [] });
  });

  test("passes through errors without status", () => {
    const app = createApp();
    const errorHandler = app._router.stack.find((layer) => layer.handle.length === 4).handle;

    const err = new Error("boom");
    const res = { status: jest.fn(() => res), json: jest.fn() };
    const next = jest.fn();

    errorHandler(err, {}, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
