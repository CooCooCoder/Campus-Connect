function logger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;
  const reqId = req.id || 'N/A';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logMessage = `[${new Date().toISOString()}] [${reqId}] ${method} ${url} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      console.error(logMessage);
    } else if (statusCode >= 400) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
}

module.exports = logger;
