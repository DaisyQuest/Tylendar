function createMemoryRepository({ createModel }) {
  const store = new Map();

  return {
    async create(payload) {
      const model = createModel(payload);
      store.set(model.id, model);
      return model;
    },
    async getById(id) {
      return store.get(id) || null;
    },
    async list(filter = {}) {
      const items = Array.from(store.values());
      const keys = Object.keys(filter);
      if (keys.length === 0) {
        return items;
      }

      return items.filter((item) =>
        keys.every((key) => {
          const value = item[key];
          const expected = filter[key];
          if (Array.isArray(value)) {
            return value.includes(expected);
          }
          return value === expected;
        })
      );
    },
    async update(id, updates) {
      const current = store.get(id);
      if (!current) {
        return null;
      }
      const next = createModel({ ...current, ...updates, id });
      store.set(id, next);
      return next;
    },
    async remove(id) {
      const existing = store.get(id);
      store.delete(id);
      return existing || null;
    },
    async clear() {
      store.clear();
    },
    async seed(items) {
      await Promise.all(items.map((item) => this.create(item)));
    }
  };
}

module.exports = {
  createMemoryRepository
};
