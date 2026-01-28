const { createAuditEntry } = require("../models/auditEntry");

function createAuditService({ auditRepository } = {}) {
  const entries = [];

  return {
    async record({ action, actorId, targetId, status, details }) {
      const entry = createAuditEntry({
        id: `audit-${entries.length + 1}`,
        action,
        actorId,
        targetId,
        status,
        details
      });
      entries.push(entry);
      if (auditRepository) {
        await auditRepository.create(entry);
      }
      return entry;
    },
    list() {
      return [...entries];
    }
  };
}

module.exports = {
  createAuditService
};
