class BaseRepository {
  constructor(collection) {
    if (!collection) {
      throw new Error('collection is required');
    }
    this.collection = collection;
  }

  async create(doc) {
    const result = await this.collection.insertOne(doc);
    return result.insertedId ? { ...doc, _id: result.insertedId } : doc;
  }

  async findById(id) {
    return this.collection.findOne({ id });
  }

  async findAll() {
    return this.collection.find({}).toArray();
  }
}

module.exports = {
  BaseRepository,
};
