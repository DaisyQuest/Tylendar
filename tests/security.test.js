const { createSession, validateSession, revokeSession, _ACTIVE_SESSIONS } = require('../server/auth/session');
const { normalizePermissions, hasPermission, canViewCalendar } = require('../server/permissions/permissions');
const { requirePermission } = require('../server/permissions/middleware');
const { PERMISSIONS } = require('../shared/permissions');

describe('auth sessions', () => {
  afterEach(() => {
    _ACTIVE_SESSIONS.clear();
  });

  test('creates and validates session', () => {
    const token = createSession({ userId: 'user-1', issuedAt: 1000 });
    const result = validateSession(token, 1000 + 1000);
    expect(result.valid).toBe(true);
    expect(result.session.userId).toBe('user-1');
  });

  test('rejects missing userId', () => {
    expect(() => createSession({})).toThrow('userId is required');
  });

  test('rejects missing token', () => {
    expect(validateSession()).toEqual({ valid: false, reason: 'missing token' });
  });

  test('rejects unknown token', () => {
    expect(validateSession('bad-token')).toEqual({ valid: false, reason: 'unknown token' });
  });

  test('expires tokens after 12 hours', () => {
    const token = createSession({ userId: 'user-1', issuedAt: 0 });
    const result = validateSession(token, 1000 * 60 * 60 * 12 + 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('expired token');
  });

  test('revokes session', () => {
    const token = createSession({ userId: 'user-1', issuedAt: 0 });
    expect(revokeSession(token)).toBe(true);
    expect(validateSession(token).valid).toBe(false);
  });
});

describe('permissions', () => {
  test('normalizes permissions list', () => {
    expect(normalizePermissions(['a', null, 'b'])).toEqual(['a', 'b']);
    expect(normalizePermissions()).toEqual([]);
  });

  test('checks permission', () => {
    expect(hasPermission(PERMISSIONS.ADD, [PERMISSIONS.ADD])).toBe(true);
    expect(hasPermission(PERMISSIONS.ADD, [])).toBe(false);
    expect(hasPermission('', [PERMISSIONS.ADD])).toBe(false);
  });

  test('checks view permission', () => {
    expect(canViewCalendar([PERMISSIONS.VIEW_ALL])).toBe(true);
    expect(canViewCalendar([PERMISSIONS.VIEW_TIMES_ONLY])).toBe(true);
    expect(canViewCalendar([])).toBe(false);
  });

  test('requires permission middleware', () => {
    const requireAdd = requirePermission(PERMISSIONS.ADD);
    expect(requireAdd()).toEqual({ allowed: false, reason: 'missing permissions context' });
    expect(requireAdd({ permissions: [] })).toEqual({ allowed: false, reason: 'forbidden' });
    expect(requireAdd({ permissions: [PERMISSIONS.ADD] })).toEqual({ allowed: true });
  });
});
