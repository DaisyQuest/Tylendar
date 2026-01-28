const { BaseRepository } = require('./baseRepository');

class CalendarPermissionsRepository extends BaseRepository {
  async findByCalendar(calendarId) {
    return this.collection.find({ calendarId }).toArray();
  }

  async findByUser(userId) {
    return this.collection.find({ userId }).toArray();
  }
}

module.exports = {
  CalendarPermissionsRepository,
};
