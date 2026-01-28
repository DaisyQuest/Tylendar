const { createUser } = require('../server/models/user');
const { createOrganization } = require('../server/models/organization');

function buildSeedData() {
  const user = createUser({
    id: 'user-1',
    email: 'seed@example.com',
    name: 'Seed User',
    organizationIds: ['org-1'],
  });

  const organization = createOrganization({
    id: 'org-1',
    name: 'Seed Org',
    memberIds: ['user-1'],
  });

  return { user, organization };
}

module.exports = {
  buildSeedData,
};
