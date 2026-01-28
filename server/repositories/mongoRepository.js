function createMongoRepository({ collectionName, createModel, getCollection }) {
  return {
    async create(payload) {
      const model = createModel(payload);
      const collection = await getCollection();
      await collection.insertOne({ ...model });
      return model;
    },
    async getById(id) {
      const collection = await getCollection();
      return collection.findOne({ id });
    },
    async list(filter = {}) {
      const collection = await getCollection();
      return collection.find(filter).toArray();
    },
    async update(id, updates) {
      const collection = await getCollection();
      const current = await collection.findOne({ id });
      if (!current) {
        return null;
      }
      const next = createModel({ ...current, ...updates, id });
      await collection.replaceOne({ id }, next);
      return next;
    },
    async remove(id) {
      const collection = await getCollection();
      const existing = await collection.findOne({ id });
      if (!existing) {
        return null;
      }
      await collection.deleteOne({ id });
      return existing;
    }
  };
}

module.exports = {
  createMongoRepository
};
