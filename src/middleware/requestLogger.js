const requestLogger = (req, _res, next) => {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[Request] ${req.method} ${req.originalUrl}`);
  }
  next();
};

export default requestLogger;
