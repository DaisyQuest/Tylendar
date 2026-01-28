const { PERMISSIONS, PERMISSION_DESCRIPTIONS } = require('../shared/permissions');

describe('shared permissions', () => {
  test('has descriptions for permissions', () => {
    Object.values(PERMISSIONS).forEach((perm) => {
      expect(PERMISSION_DESCRIPTIONS[perm]).toBeDefined();
    });
  });
});
