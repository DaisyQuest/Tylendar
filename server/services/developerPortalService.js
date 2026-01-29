function createDeveloperPortalService() {
  function getDeveloperPortal() {
    return {
      headline: "Developer Portal",
      description: "API documentation is available for approved integrations.",
      resources: [],
      status: "No public releases published."
    };
  }

  return {
    getDeveloperPortal
  };
}

module.exports = {
  createDeveloperPortalService
};
