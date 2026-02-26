import prisma from "../../prisma/client.js";

export const getUserById = async (id) => {
  if (!id) return null;
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    include: {
      doctor: {
        include: {
          clinic: true,
        },
      },
      patient: true,
    },
  });
  return attachReceptionClinic(user);
};

export const toSafeUser = (user) => {
  if (!user) return null;
  // remove sensitive fields like password
  // leave other fields as-is
  // shallow copy to avoid mutating original
  const { password, ...safe } = user;
  return safe;
};

export const attachReceptionClinic = async (user) => {
  if (!user) return null;
  const roles = String(user.roles || "").toLowerCase();
  if (!roles.includes("reception")) return user;

  // Infer clinic by receptionist email domain based on seed data
  const email = String(user.email || "").toLowerCase();
  const candidates = [
    { key: "citycare", nameFragment: "City Care" },
    { key: "sunrise", nameFragment: "Sunrise" },
    { key: "healthplus", nameFragment: "HealthPlus" },
    { key: "greenvalley", nameFragment: "Green Valley" },
    { key: "quickcare", nameFragment: "Quick Care" },
  ];

  const match = candidates.find((c) => email.includes(c.key));
  if (!match) return user;

  const clinic = await prisma.clinic.findFirst({
    where: { name: { contains: match.nameFragment, mode: "insensitive" } },
  });

  if (!clinic) return user;

  return {
    ...user,
    receptionClinicId: clinic.id,
    receptionClinic: clinic,
  };
};

const validateStringField = (value, name) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  const trimmed = String(value).trim();
  if (trimmed === "") {
    throw Object.assign(new Error(`${name} cannot be empty`), { status: 400 });
  }
  return trimmed;
};

export const buildProfileUpdates = (payload) => {
  const updates = {};
  if (Object.prototype.hasOwnProperty.call(payload, "name")) {
    updates.name = validateStringField(payload.name, "name");
  }
  if (Object.prototype.hasOwnProperty.call(payload, "phone")) {
    const phone = validateStringField(payload.phone, "phone");
    const normalizedPhone = phone.replace(/[^0-9+\-\s()]/g, "").trim();
    if (normalizedPhone === "") {
      throw Object.assign(new Error("phone must contain digits"), { status: 400 });
    }
    updates.phone = normalizedPhone;
  }
  if (Object.prototype.hasOwnProperty.call(payload, "profilePicture")) {
    updates.profilePicture = validateStringField(payload.profilePicture, "profilePicture");
  }

  if (Object.keys(updates).length === 0) {
    throw Object.assign(new Error("No valid fields provided"), { status: 400 });
  }

  return updates;
};

export const updateUserProfile = async (id, payload) => {
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    throw Object.assign(new Error("Invalid user id"), { status: 400 });
  }

  const updates = buildProfileUpdates(payload);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updates,
  });

  return toSafeUser(updated);
};
