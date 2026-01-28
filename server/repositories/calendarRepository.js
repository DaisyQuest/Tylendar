const { BaseRepository } = require('./baseRepository');

class CalendarRepository extends BaseRepository {
  async findByOwner(userId) {
    return this.collection.find({ ownerIds: userId }).toArray();
  }
}

module.exports = {
  CalendarRepository,
};
