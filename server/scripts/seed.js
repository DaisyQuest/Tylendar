const { createRepositories } = require("../repositories");
const { seedDatabase } = require("../migrations/seed");

async function run({ useInMemory = false, repositories, seed = seedDatabase } = {}) {
  const resolvedRepositories = repositories || createRepositories({ useInMemory });
  await seed(resolvedRepositories);
  if (resolvedRepositories.client && resolvedRepositories.client.close) {
    await resolvedRepositories.client.close();
  }
  return resolvedRepositories;
}

/* istanbul ignore if */
if (require.main === module) {
  run().then(() => {
    console.log("Database seeded.");
  }).catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  });
}

module.exports = { run };
