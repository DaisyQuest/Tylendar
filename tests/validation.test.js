const {
  addError,
  createValidationError,
  ensureValid,
  validateArray,
  validateBoolean,
  validateDate,
  validateOptionalString,
  validateRequiredString
} = require("../server/validation/validators");

describe("validation helpers", () => {
  test("validateRequiredString tracks missing values", () => {
    const errors = [];
    validateRequiredString("", "name", errors);
    validateRequiredString(null, "title", errors);
    expect(errors).toHaveLength(2);
  });

  test("validateOptionalString ignores undefined but flags non-string", () => {
    const errors = [];
    validateOptionalString(undefined, "note", errors);
    validateOptionalString(42, "note", errors);
    expect(errors).toHaveLength(1);
  });

  test("validateBoolean ensures boolean", () => {
    const errors = [];
    validateBoolean("yes", "enabled", errors);
    expect(errors[0].message).toContain("boolean");
  });

  test("validateArray enforces minimum length", () => {
    const errors = [];
    validateArray("nope", "list", errors, { minLength: 1 });
    validateArray([], "list", errors, { minLength: 1 });
    expect(errors).toHaveLength(2);
  });

  test("validateDate rejects invalid dates", () => {
    const errors = [];
    validateDate("", "startsAt", errors);
    validateDate("invalid", "startsAt", errors);
    expect(errors).toHaveLength(2);
  });

  test("ensureValid throws validation error", () => {
    const errors = [];
    addError(errors, "field", "bad");
    const result = { valid: false, errors };
    expect(() => ensureValid(result)).toThrow(createValidationError(errors));
  });
});
