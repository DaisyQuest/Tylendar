const {
  createAuditEntry,
  recordAudit,
  listAuditEntries,
  clearAuditEntries,
} = require('../server/audit/logger');
const { buildHealthPayload } = require('../server/monitoring/metrics');
const { healthCheck } = require('../server/monitoring/routes');

describe('audit logger', () => {
  afterEach(() => {
    clearAuditEntries();
  });

  test('creates and records audit entry', () => {
    const entry = createAuditEntry({ actorId: 'user-1', action: 'create', targetId: 'cal-1' });
    recordAudit(entry);
    expect(listAuditEntries()).toHaveLength(1);
  });

  test('creates audit entry without targetId', () => {
    const entry = createAuditEntry({ actorId: 'user-1', action: 'login' });
    expect(entry.targetId).toBeNull();
  });

  test('requires actor and action', () => {
    expect(() => createAuditEntry({ actorId: '', action: '' })).toThrow(
      'actorId and action are required',
    );
    expect(() => createAuditEntry({ actorId: 'user-1' })).toThrow(
      'actorId and action are required',
    );
    expect(() => createAuditEntry({ action: 'create' })).toThrow(
      'actorId and action are required',
    );
    expect(() => recordAudit()).toThrow('audit entry is required');
  });
});

describe('monitoring', () => {
  test('builds health payload', () => {
    const payload = buildHealthPayload({ mongoConnected: true, auditEnabled: false, timestamp: 10 });
    expect(payload).toEqual({
      status: 'ok',
      mongoConnected: true,
      auditEnabled: false,
      timestamp: 10,
    });
  });

  test('health check defaults', () => {
    const payload = healthCheck();
    expect(payload.status).toBe('degraded');
  });
});
