function requireFeature(flag, flags) {
  return (req, res, next) => {
    if (!flags[flag]) {
      return res.status(404).json({ error: `${flag} feature disabled` });
    }
    return next();
  };
}

module.exports = {
  requireFeature
};
