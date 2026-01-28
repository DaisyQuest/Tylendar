const { BaseRepository } = require('./baseRepository');

class UserRepository extends BaseRepository {
  async findByEmail(email) {
    return this.collection.findOne({ email });
  }
}

module.exports = {
  UserRepository,
};
