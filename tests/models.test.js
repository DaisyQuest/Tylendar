const { createUser } = require('../server/models/user');
const { createOrganization } = require('../server/models/organization');
const { createCalendar } = require('../server/models/calendar');
const { createCalendarPermissions } = require('../server/models/calendarPermissions');
const { createEvent } = require('../server/models/event');

const { PERMISSIONS } = require('../shared/permissions');

describe('domain models', () => {
  test('creates user', () => {
    const user = createUser({
      id: 'user-1',
      email: 'user@example.com',
      name: 'User One',
    });
    expect(user).toMatchObject({ id: 'user-1', email: 'user@example.com', name: 'User One' });
  });

  test('rejects invalid user', () => {
    expect(() => createUser({ id: '', email: 'bad', name: '' })).toThrow('Invalid user');
  });

  test('creates organization', () => {
    const org = createOrganization({ id: 'org-1', name: 'Org', memberIds: ['user-1'] });
    expect(org).toMatchObject({ id: 'org-1', name: 'Org', memberIds: ['user-1'] });
  });

  test('rejects invalid organization', () => {
    expect(() => createOrganization({ id: '', name: '', memberIds: 'bad' })).toThrow(
      'Invalid organization',
    );
  });

  test('creates calendar', () => {
    const calendar = createCalendar({ id: 'cal-1', name: 'Calendar', ownerIds: ['user-1'] });
    expect(calendar).toMatchObject({ id: 'cal-1', name: 'Calendar', ownerIds: ['user-1'] });
  });

  test('rejects invalid calendar', () => {
    expect(() => createCalendar({ id: '', name: '', ownerIds: 'bad' })).toThrow(
      'Invalid calendar',
    );
  });

  test('creates calendar permissions', () => {
    const permissions = createCalendarPermissions({
      userId: 'user-1',
      calendarId: 'cal-1',
      permissions: [PERMISSIONS.VIEW_ALL, PERMISSIONS.ADD],
    });
    expect(permissions.permissions).toContain(PERMISSIONS.VIEW_ALL);
  });

  test('rejects invalid calendar permissions', () => {
    expect(() =>
      createCalendarPermissions({
        userId: '',
        calendarId: '',
        permissions: ['invalid'],
      }),
    ).toThrow('Invalid calendar permissions');
  });

  test('creates event', () => {
    const event = createEvent({
      id: 'event-1',
      title: 'Standup',
      calendarIds: ['cal-1'],
      startsAt: 1,
      endsAt: 2,
    });
    expect(event.title).toBe('Standup');
  });

  test('rejects invalid event', () => {
    expect(() => createEvent({ id: '', title: '', calendarIds: 'bad' })).toThrow('Invalid event');
    expect(() =>
      createEvent({
        id: 'event-1',
        title: 'Event',
        calendarIds: ['cal-1'],
        startsAt: 3,
        endsAt: 2,
      }),
    ).toThrow('Invalid event');
  });
});
