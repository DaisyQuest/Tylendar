const { validateUser } = require('../validation/user');

function createUser(payload) {
  const result = validateUser(payload);
  if (!result.valid) {
    throw new Error(`Invalid user: ${result.errors.join(' ')}`);
  }

  return {
    id: payload.id,
    email: payload.email.trim(),
    name: payload.name.trim(),
    organizationIds: payload.organizationIds || [],
  };
}

module.exports = {
  createUser,
};
