const { validateOrganization } = require('../validation/organization');

function createOrganization(payload) {
  const result = validateOrganization(payload);
  if (!result.valid) {
    throw new Error(`Invalid organization: ${result.errors.join(' ')}`);
  }

  return {
    id: payload.id,
    name: payload.name.trim(),
    memberIds: payload.memberIds,
    roles: payload.roles || {},
  };
}

module.exports = {
  createOrganization,
};
