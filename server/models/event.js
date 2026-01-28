const {
  ensureValid,
  validateArray,
  validateDate,
  validateOptionalString,
  validateRequiredString
} = require("../validation/validators");

function validateEvent(payload = {}) {
  const errors = [];

  validateRequiredString(payload.id, "id", errors);
  validateRequiredString(payload.title, "title", errors);
  validateRequiredString(payload.createdBy, "createdBy", errors);
  validateArray(payload.calendarIds || [], "calendarIds", errors, { minLength: 1 });
  validateDate(payload.startsAt, "startsAt", errors);
  validateDate(payload.endsAt, "endsAt", errors);
  validateOptionalString(payload.description, "description", errors);

  if (payload.startsAt && payload.endsAt) {
    const start = new Date(payload.startsAt).getTime();
    const end = new Date(payload.endsAt).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      errors.push({ field: "endsAt", message: "endsAt must be after startsAt" });
    }
  }

  return { valid: errors.length === 0, errors };
}

function createEvent(payload = {}) {
  const event = {
    id: payload.id,
    title: payload.title,
    description: payload.description || "",
    calendarIds: payload.calendarIds || [],
    startsAt: payload.startsAt,
    endsAt: payload.endsAt,
    createdBy: payload.createdBy,
    createdAt: payload.createdAt || new Date().toISOString()
  };

  ensureValid(validateEvent(event));

  return event;
}

module.exports = {
  createEvent,
  validateEvent
};
