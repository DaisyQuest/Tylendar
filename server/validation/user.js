const { isNonEmptyString, validateEmail, validateId } = require('./shared');

function validateUser(user) {
  const errors = [];
  if (!user) {
    return { valid: false, errors: ['user payload is required.'] };
  }

  errors.push(...validateId(user.id || '', 'user.id'));
  errors.push(...validateEmail(user.email));

  if (!isNonEmptyString(user.name)) {
    errors.push('user.name must be a non-empty string.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateUser,
};
