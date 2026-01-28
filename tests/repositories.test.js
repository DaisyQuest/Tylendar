const { BaseRepository } = require('../server/repositories/baseRepository');
const { UserRepository } = require('../server/repositories/userRepository');
const { OrganizationRepository } = require('../server/repositories/organizationRepository');
const { CalendarRepository } = require('../server/repositories/calendarRepository');
const { EventRepository } = require('../server/repositories/eventRepository');
const {
  CalendarPermissionsRepository,
} = require('../server/repositories/calendarPermissionsRepository');
const { createInMemoryCollection } = require('./utils');

describe('repositories', () => {
  test('base repository requires collection', () => {
    expect(() => new BaseRepository()).toThrow('collection is required');
  });

  test('base repository CRUD', async () => {
    const collection = createInMemoryCollection();
    const repo = new BaseRepository(collection);
    await repo.create({ id: '1', name: 'Doc' });
    const doc = await repo.findById('1');
    expect(doc.name).toBe('Doc');
    const docs = await repo.findAll();
    expect(docs).toHaveLength(1);
  });

  test('base repository handles missing insertedId', async () => {
    const collection = {
      insertOne: async () => ({ insertedId: null }),
      findOne: async () => null,
      find: () => ({ toArray: async () => [] }),
    };
    const repo = new BaseRepository(collection);
    const doc = await repo.create({ id: 'no-id' });
    expect(doc).toEqual({ id: 'no-id' });
  });

  test('user repository queries by email', async () => {
    const collection = createInMemoryCollection([{ id: '1', email: 'a@b.com' }]);
    const repo = new UserRepository(collection);
    const doc = await repo.findByEmail('a@b.com');
    expect(doc.id).toBe('1');
  });

  test('organization repository queries by member', async () => {
    const collection = createInMemoryCollection([{ id: 'org-1', memberIds: ['user-1'] }]);
    const repo = new OrganizationRepository(collection);
    const docs = await repo.findByMember('user-1');
    expect(docs).toHaveLength(1);
  });

  test('calendar repository queries by owner', async () => {
    const collection = createInMemoryCollection([{ id: 'cal-1', ownerIds: ['user-1'] }]);
    const repo = new CalendarRepository(collection);
    const docs = await repo.findByOwner('user-1');
    expect(docs[0].id).toBe('cal-1');
  });

  test('event repository queries by calendar', async () => {
    const collection = createInMemoryCollection([{ id: 'event-1', calendarIds: ['cal-1'] }]);
    const repo = new EventRepository(collection);
    const docs = await repo.findByCalendar('cal-1');
    expect(docs[0].id).toBe('event-1');
  });

  test('calendar permissions repository queries by calendar and user', async () => {
    const collection = createInMemoryCollection([
      { id: 'perm-1', calendarId: 'cal-1', userId: 'user-1' },
    ]);
    const repo = new CalendarPermissionsRepository(collection);
    const byCalendar = await repo.findByCalendar('cal-1');
    const byUser = await repo.findByUser('user-1');
    expect(byCalendar).toHaveLength(1);
    expect(byUser).toHaveLength(1);
  });
});
