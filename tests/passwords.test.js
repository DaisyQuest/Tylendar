const { hashPassword, verifyPassword } = require("../server/auth/passwords");

describe("password utilities", () => {
  test("hashPassword and verifyPassword round trip", () => {
    const hash = hashPassword("StrongPass1!");
    expect(hash).toContain(":");
    expect(verifyPassword("StrongPass1!", hash)).toBe(true);
    expect(verifyPassword("WrongPass1!", hash)).toBe(false);
  });

  test("verifyPassword handles invalid stored hash", () => {
    expect(verifyPassword("Password123!", null)).toBe(false);
    expect(verifyPassword("Password123!", "not-a-hash")).toBe(false);
  });
});
