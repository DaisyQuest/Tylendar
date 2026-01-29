const { PERMISSIONS } = require("../models/calendarPermissions");

const PERMISSION_SETS = {
  view: [PERMISSIONS[0], PERMISSIONS[1], PERMISSIONS[2]],
  shareView: [PERMISSIONS[0], PERMISSIONS[1]]
};

function normalizeRequirement(requirement) {
  if (!requirement) {
    return { anyOf: [], allOf: [] };
  }
  if (typeof requirement === "string") {
    return { anyOf: [requirement], allOf: [] };
  }
  if (Array.isArray(requirement)) {
    return { anyOf: requirement, allOf: [] };
  }
  return {
    anyOf: Array.isArray(requirement.anyOf) ? requirement.anyOf : [],
    allOf: Array.isArray(requirement.allOf) ? requirement.allOf : []
  };
}

function describeRequirement(requirement) {
  const normalized = normalizeRequirement(requirement);
  const parts = [];
  if (normalized.anyOf.length > 0) {
    parts.push(`anyOf: ${normalized.anyOf.join(", ")}`);
  }
  if (normalized.allOf.length > 0) {
    parts.push(`allOf: ${normalized.allOf.join(", ")}`);
  }
  return parts.join(" | ");
}

function evaluatePermissions(permissions, requirement) {
  const normalized = normalizeRequirement(requirement);
  if (normalized.anyOf.length === 0 && normalized.allOf.length === 0) {
    return false;
  }
  const permissionList = Array.isArray(permissions) ? permissions : [];
  const anyAllowed = normalized.anyOf.length === 0 || normalized.anyOf.some((perm) => permissionList.includes(perm));
  const allAllowed = normalized.allOf.every((perm) => permissionList.includes(perm));
  return anyAllowed && allAllowed;
}

function flattenPermissions(entries = []) {
  return entries.flatMap((entry) => (Array.isArray(entry.permissions) ? entry.permissions : []));
}

function createPermissionEvaluator({ calendarPermissionsRepository, auditService } = {}) {
  async function listPermissions({ userId, calendarId } = {}) {
    if (!calendarPermissionsRepository || !userId) {
      return [];
    }
    const filter = { userId };
    if (calendarId) {
      filter.calendarId = calendarId;
    }
    const entries = await calendarPermissionsRepository.list(filter);
    return flattenPermissions(entries);
  }

  async function evaluate({ userId, calendarId, requirement, auditContext } = {}) {
    const actorId = auditContext?.actorId || (userId || "anonymous");
    const targetId = auditContext?.targetId || (calendarId || "unknown");
    const logAllowed = auditContext?.logAllowed ?? true;
    const logDenied = auditContext?.logDenied ?? true;
    const requirementDescription = describeRequirement(requirement) || "unspecified permission requirement";

    if (!userId || !calendarId) {
      if (auditService && logDenied) {
        await auditService.record({
          action: auditContext?.action || "permission_check",
          actorId,
          targetId,
          status: "denied",
          details: auditContext?.details || "Missing user or calendar"
        });
      }
      return { allowed: false, permissions: [], reason: "Missing user or calendar" };
    }

    const permissions = await listPermissions({ userId, calendarId });
    const allowed = evaluatePermissions(permissions, requirement);
    const shouldLog = allowed ? logAllowed : logDenied;
    if (auditService && shouldLog) {
      await auditService.record({
        action: auditContext?.action || "permission_check",
        actorId,
        targetId,
        status: allowed ? "allowed" : "denied",
        details: allowed
          ? auditContext?.details || `Permission granted (${requirementDescription})`
          : auditContext?.details || `Missing permission (${requirementDescription})`
      });
    }

    return { allowed, permissions, reason: allowed ? "allowed" : "missing permission" };
  }

  return {
    evaluate,
    listPermissions,
    normalizeRequirement,
    evaluatePermissions,
    permissionSets: PERMISSION_SETS
  };
}

module.exports = {
  PERMISSION_SETS,
  createPermissionEvaluator,
  describeRequirement,
  evaluatePermissions,
  normalizeRequirement
};
