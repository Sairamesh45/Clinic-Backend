import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.js";
import { toSafeUser } from "../user/user.service.js";
import { createHttpError } from "../../utils/httpError.js";

const normalizeEmail = (value) => {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed || null;
};

const buildRoles = (value) => {
  if (!value) return ["patient"];
  return String(value)
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
};

const signToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const algorithm = process.env.JWT_ALGORITHM ?? "HS256";
  if (!secret) {
    console.error("FATAL: JWT_SECRET not available when signing token");
    throw createHttpError(500, "Authentication is not configured");
  }

  console.log("Signing token for user:", user.id, "with algorithm:", algorithm);
  
  const payload = {
    sub: user.id,
    roles: buildRoles(user.roles),
  };
  
  // Include patientId and doctorId if they exist
  if (user.patientId) {
    payload.patientId = user.patientId;
  }
  if (user.doctorId) {
    payload.doctorId = user.doctorId;
  }
  
  return jwt.sign(
    payload,
    secret,
    {
      algorithm,
      expiresIn: "8h",
    }
  );
};

const ensurePassword = async (candidate, hash) => {
  const match = await bcrypt.compare(candidate, hash);
  if (!match) {
    throw createHttpError(401, "Invalid credentials");
  }
};

export const login = async ({ identifier, password }) => {
  const email = normalizeEmail(identifier);
  if (!email) {
    throw createHttpError(400, "Email is required");
  }
  if (!password) {
    throw createHttpError(400, "Password is required");
  }

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: {
      patient: true,
      doctor: true,
    }
  });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  await ensurePassword(password, user.password);

  // Add patientId/doctorId to user object before signing token
  const userWithIds = {
    ...user,
    patientId: user.patient?.id || user.patientId,
    doctorId: user.doctor?.id || user.doctorId,
  };

  const token = signToken(userWithIds);
  return {
    token,
    role: user.roles,
    user: toSafeUser(userWithIds),
  };
};

export const register = async ({ name, identifier, password, role }) => {
  const email = normalizeEmail(identifier);
  if (!email) {
    throw createHttpError(400, "Email is required");
  }
  if (!name?.trim()) {
    throw createHttpError(400, "Name is required");
  }
  if (!password || password.length < 6) {
    throw createHttpError(400, "Password must be at least 6 characters");
  }

  const hashed = await bcrypt.hash(password, 10);
  const userRole = role || "patient";

  try {
    // Use transaction to create user and patient together
    const user = await prisma.$transaction(async (tx) => {
      let patientId = null;

      // If registering as a patient, create patient record first
      if (userRole.toLowerCase().includes('patient')) {
        const patient = await tx.patient.create({
          data: {
            name: name.trim(),
            email,
          },
        });
        patientId = patient.id;
      }

      // Create user with optional patient link
      return await tx.user.create({
        data: {
          name: name.trim(),
          email,
          password: hashed,
          roles: userRole,
          patientId,
        },
      });
    });

    return toSafeUser(user);
  } catch (error) {
    if (error?.code === "P2002") {
      throw createHttpError(409, "Email already registered");
    }
    throw error;
  }
};
