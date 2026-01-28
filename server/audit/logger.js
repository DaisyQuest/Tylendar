const AUDIT_LOG = [];

function createAuditEntry({ actorId, action, targetId, timestamp = Date.now() }) {
  if (!actorId || !action) {
    throw new Error('actorId and action are required');
  }

  return {
    actorId,
    action,
    targetId: targetId || null,
    timestamp,
  };
}

function recordAudit(entry) {
  if (!entry) {
    throw new Error('audit entry is required');
  }
  AUDIT_LOG.push(entry);
  return entry;
}

function listAuditEntries() {
  return [...AUDIT_LOG];
}

function clearAuditEntries() {
  AUDIT_LOG.length = 0;
}

module.exports = {
  createAuditEntry,
  recordAudit,
  listAuditEntries,
  clearAuditEntries,
  _AUDIT_LOG: AUDIT_LOG,
};
