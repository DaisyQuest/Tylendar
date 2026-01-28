function addError(errors, field, message) {
  errors.push({ field, message });
}

function validateRequiredString(value, field, errors) {
  if (typeof value !== "string" || value.trim().length === 0) {
    addError(errors, field, `${field} must be a non-empty string`);
  }
}

function validateOptionalString(value, field, errors) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value !== "string") {
    addError(errors, field, `${field} must be a string`);
  }
}

function validateBoolean(value, field, errors) {
  if (typeof value !== "boolean") {
    addError(errors, field, `${field} must be a boolean`);
  }
}

function validateArray(value, field, errors, { minLength = 0 } = {}) {
  if (!Array.isArray(value)) {
    addError(errors, field, `${field} must be an array`);
    return;
  }

  if (value.length < minLength) {
    addError(errors, field, `${field} must have at least ${minLength} entries`);
  }
}

function validateDate(value, field, errors) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {
    addError(errors, field, `${field} must be a valid date`);
  }
}

function createValidationError(errors) {
  const error = new Error("Validation failed");
  error.status = 400;
  error.details = errors;
  return error;
}

function ensureValid(result) {
  if (!result.valid) {
    throw createValidationError(result.errors);
  }
}

module.exports = {
  addError,
  createValidationError,
  ensureValid,
  validateArray,
  validateBoolean,
  validateDate,
  validateOptionalString,
  validateRequiredString
};
