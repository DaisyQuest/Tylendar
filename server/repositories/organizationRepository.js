const { BaseRepository } = require('./baseRepository');

class OrganizationRepository extends BaseRepository {
  async findByMember(userId) {
    return this.collection.find({ memberIds: userId }).toArray();
  }
}

module.exports = {
  OrganizationRepository,
};
