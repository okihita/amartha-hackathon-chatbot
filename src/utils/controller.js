module.exports = {
  handle: (fn) => async (req, res) => {
    try {
      await fn(req, res);
    } catch (error) {
      // Log error details for debugging (in production, use proper logging service)
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Error]', error.message, error.stack);
      }
      res.status(error.status || 500).json({ error: error.message || 'Internal error' });
    }
  }
};
