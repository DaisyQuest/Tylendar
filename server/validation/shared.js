function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateId(value, fieldName = 'id') {
  if (!isNonEmptyString(value)) {
    return [`${fieldName} must be a non-empty string.`];
  }
  return [];
}

function validateEmail(value) {
  if (!isNonEmptyString(value)) {
    return ['email must be a non-empty string.'];
  }

  if (!value.includes('@')) {
    return ['email must contain @.'];
  }

  return [];
}

module.exports = {
  isNonEmptyString,
  validateEmail,
  validateId,
};
