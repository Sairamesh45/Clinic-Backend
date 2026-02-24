import { sendErrorResponse } from "../utils/httpError.js";
export const notFoundHandler = (_req, res) => {
  return sendErrorResponse(res, { status: 404, message: "Route not found" });
};

export const errorHandler = (err, _req, res, _next) => {
  const status = err?.status ?? 500;
  if (status >= 500) {
    console.error(err);
  } else {
    console.warn(err?.message ?? "Handled error", err?.details ?? "");
  }
  return sendErrorResponse(res, err);
};
