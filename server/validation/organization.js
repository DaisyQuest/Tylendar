const { isNonEmptyString, validateId } = require('./shared');

function validateOrganization(org) {
  const errors = [];
  if (!org) {
    return { valid: false, errors: ['organization payload is required.'] };
  }

  errors.push(...validateId(org.id || '', 'organization.id'));

  if (!isNonEmptyString(org.name)) {
    errors.push('organization.name must be a non-empty string.');
  }

  if (!Array.isArray(org.memberIds)) {
    errors.push('organization.memberIds must be an array.');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  validateOrganization,
};
