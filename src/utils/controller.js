module.exports = {
  handle: (fn) => async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      console.error(error);
      res.status(error.status || 500).json({ error: error.message || 'Internal error' });
    }
  }
};
