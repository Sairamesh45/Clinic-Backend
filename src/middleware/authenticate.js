import jwt from "jsonwebtoken";
import * as userService from "../modules/user/user.service.js";
import { createHttpError } from "../utils/httpError.js";

const parseRoles = (...inputs) => {
  const normalized = [];
  inputs.forEach((value) => {
    if (!value) return;
    const entries = Array.isArray(value) ? value : String(value).split(",");
    entries.forEach((entry) => {
      const trimmed = String(entry ?? "").trim().toLowerCase();
      if (trimmed) normalized.push(trimmed);
    });
  });
  return Array.from(new Set(normalized));
};

const getTokenFromHeader = (header) => {
  if (!header) return null;
  const normalized = header.trim();
  if (!normalized.toLowerCase().startsWith("bearer ")) return null;
  return normalized.split(" ")[1] ?? null;
};

const authenticate = async (req, _res, next) => {
  try {
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw createHttpError(401, "Authorization header missing");
    }

    const secret = process.env.JWT_SECRET;
    const algorithm = process.env.JWT_ALGORITHM ?? "HS256";
    if (!secret) {
      console.error("FATAL: JWT_SECRET not available in authenticate middleware");
      throw createHttpError(500, "Authentication is not configured");
    }

    let payload;
    try {
      payload = jwt.verify(token, secret, { algorithms: [algorithm] });
    } catch (error) {
      console.log("JWT verification failed:", error.message);
      const message = error?.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
      throw createHttpError(401, message);
    }

    const userId = Number(payload?.sub ?? payload?.userId ?? payload?.id);
    if (Number.isNaN(userId)) {
      throw createHttpError(401, "Invalid token payload");
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      throw createHttpError(401, "User no longer exists");
    }

    const safeUser = userService.toSafeUser(user);
    const roles = parseRoles(safeUser.roles, payload?.roles, payload?.role, payload?.account?.roles);

    req.user = {
      ...safeUser,
      roles,
      patientId: payload?.patientId ? Number(payload.patientId) : safeUser.patientId,
      doctorId: payload?.doctorId ? Number(payload.doctorId) : safeUser.doctorId,
    };

    return next();
  } catch (error) {
    return next(error.status ? error : createHttpError(401, "Unauthorized"));
  }
};

export default authenticate;
