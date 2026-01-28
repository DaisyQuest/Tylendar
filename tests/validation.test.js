const { validateUser } = require('../server/validation/user');
const { validateOrganization } = require('../server/validation/organization');
const { validateCalendar } = require('../server/validation/calendar');
const { validateCalendarPermissions } = require('../server/validation/calendarPermissions');
const { validateEvent } = require('../server/validation/event');
const { validateEmail, validateId, isNonEmptyString } = require('../server/validation/shared');

describe('validation', () => {
  test('handles missing payloads', () => {
    expect(validateUser()).toEqual({ valid: false, errors: ['user payload is required.'] });
    expect(validateOrganization()).toEqual({
      valid: false,
      errors: ['organization payload is required.'],
    });
    expect(validateCalendar()).toEqual({ valid: false, errors: ['calendar payload is required.'] });
    expect(validateCalendarPermissions()).toEqual({
      valid: false,
      errors: ['calendarPermissions payload is required.'],
    });
    expect(validateEvent()).toEqual({ valid: false, errors: ['event payload is required.'] });
  });

  test('rejects invalid permissions list', () => {
    const result = validateCalendarPermissions({
      userId: 'user-1',
      calendarId: 'cal-1',
      permissions: ['bad'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('invalid permission');
  });

  test('rejects permissions payload when not array', () => {
    const result = validateCalendarPermissions({
      userId: 'user-1',
      calendarId: 'cal-1',
      permissions: 'bad',
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('calendarPermissions.permissions must be an array.');
  });

  test('rejects missing event timestamps', () => {
    const result = validateEvent({
      id: 'event-1',
      title: 'Event',
      calendarIds: ['cal-1'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('event.startsAt and event.endsAt are required.');
  });

  test('rejects invalid time ordering', () => {
    const result = validateEvent({
      id: 'event-1',
      title: 'Event',
      calendarIds: ['cal-1'],
      startsAt: 3,
      endsAt: 2,
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('event.startsAt must be before event.endsAt.');
  });

  test('validates shared helpers', () => {
    expect(validateEmail('')).toContain('email must be a non-empty string.');
    expect(validateEmail('bademail')).toContain('email must contain @.');
    expect(validateEmail('good@example.com')).toEqual([]);
    expect(validateId('')).toContain('id must be a non-empty string.');
    expect(validateId('abc')).toEqual([]);
    expect(isNonEmptyString('ok')).toBe(true);
    expect(isNonEmptyString('')).toBe(false);
  });
});
