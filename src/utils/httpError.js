export const createHttpError = (status, message, details) => {
  const error = new Error(message);
  error.status = status;
  if (details) {
    error.details = details;
  }
  return error;
};

export const sendErrorResponse = (res, error) => {
  const status = error?.status ?? 500;
  const payload = {
    status: "error",
    message: error?.message ?? "Internal server error",
  };
  if (error?.details) {
    payload.details = error.details;
  }
  return res.status(status).json(payload);
};