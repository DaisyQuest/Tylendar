const { asyncHandler } = require("../server/middleware/asyncHandler");

describe("asyncHandler", () => {
  test("passes errors to next", async () => {
    const error = new Error("boom");
    const handler = asyncHandler(async () => {
      throw error;
    });

    const next = jest.fn();
    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
