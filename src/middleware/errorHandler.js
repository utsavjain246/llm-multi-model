module.exports = function errorHandler(err, req, res, _next) {
  console.error('[UnhandledError]', err);
  res.status(500).json({ error: err.message || 'Internal error' });
};