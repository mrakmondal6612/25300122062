// Custom logging middleware (not using console.log)
// Logs method, url, timestamp, and optionally request body
module.exports = function customLogger(req, res, next) {
  const logEntry = {
    method: req.method,
    url: req.originalUrl,
    timestamp: new Date().toISOString(),
    body: req.body,
  };
  // Store logEntry somewhere, e.g., in-memory array, file, or DB (for now, attach to req for demonstration)
  if (!req._customLogs) req._customLogs = [];
  req._customLogs.push(logEntry);
  next();
};
