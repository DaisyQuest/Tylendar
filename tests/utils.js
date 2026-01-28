function createInMemoryCollection(initial = []) {
  const data = [...initial];
  return {
    insertOne: async (doc) => {
      const _id = `mock-${data.length + 1}`;
      data.push({ ...doc, _id });
      return { insertedId: _id };
    },
    findOne: async (query) => {
      const key = Object.keys(query)[0];
      return data.find((item) => item[key] === query[key]) || null;
    },
    find: (query) => {
      const entries = query && Object.keys(query).length
        ? data.filter((item) => {
            const key = Object.keys(query)[0];
            return Array.isArray(item[key])
              ? item[key].includes(query[key])
              : item[key] === query[key];
          })
        : [...data];
      return {
        toArray: async () => entries,
      };
    },
  };
}

module.exports = {
  createInMemoryCollection,
};
