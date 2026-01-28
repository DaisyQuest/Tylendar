const { buildHealthPayload } = require('./metrics');

function healthCheck({ mongoConnected = false, auditEnabled = false } = {}) {
  return buildHealthPayload({ mongoConnected, auditEnabled });
}

module.exports = {
  healthCheck,
};
