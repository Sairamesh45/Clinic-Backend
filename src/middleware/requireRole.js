import { createHttpError } from "../utils/httpError.js";

const requireRole = (expectedRole) => (req, _res, next) => {
  const normalizedRole = String(expectedRole ?? "").trim().toLowerCase();
  if (!normalizedRole) {
    return next(createHttpError(500, "Role guard is misconfigured"));
  }

  const userRoles = Array.isArray(req.user?.roles) ? req.user.roles : [];
  if (!userRoles.includes(normalizedRole)) {
    return next(createHttpError(403, "Forbidden: insufficient permissions"));
  }

  return next();
};

export default requireRole;
