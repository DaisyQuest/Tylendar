const { BaseRepository } = require('./baseRepository');

class EventRepository extends BaseRepository {
  async findByCalendar(calendarId) {
    return this.collection.find({ calendarIds: calendarId }).toArray();
  }
}

module.exports = {
  EventRepository,
};
