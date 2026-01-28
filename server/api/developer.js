const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");

function createDeveloperRouter({ developerProvider }) {
  const router = express.Router();

  router.get("/portal", asyncHandler(async (req, res) => {
    res.json(developerProvider.getDeveloperPortal());
  }));

  return router;
}

module.exports = {
  createDeveloperRouter
};
