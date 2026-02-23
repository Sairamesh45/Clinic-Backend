export const notFoundHandler = (_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
};

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  const status = err?.status ?? 500;
  res.status(status).json({
    status: "error",
    message: err?.message ?? "Internal server error",
  });
};
