const { API_MODULES, listModules } = require('../server/api/modules');

const { buildSeedData } = require('../scripts/seed');

describe('api modules', () => {
  test('lists modules', () => {
    const modules = listModules();
    expect(modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'auth', prefix: API_MODULES.auth.prefix }),
      ]),
    );
  });
});

describe('seed data', () => {
  test('builds seed data', () => {
    const seed = buildSeedData();
    expect(seed.user.id).toBe('user-1');
    expect(seed.organization.memberIds).toContain('user-1');
  });
});
