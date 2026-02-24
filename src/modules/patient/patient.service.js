import prisma from "../../prisma/client.js";
import { createHttpError } from "../../utils/httpError.js";

export const listPatients = async () => {
  return prisma.patient.findMany({
    include: {
      appointments: true,
    },
  });
};

const trimField = (value) => (typeof value === "string" ? value.trim() : undefined);

export const createPatient = async ({ name, email }) => {
  const trimmedName = trimField(name);
  const trimmedEmail = trimField(email);

  if (!trimmedName) {
    throw createHttpError(400, "Patient name is required");
  }
  if (!trimmedEmail) {
    throw createHttpError(400, "Patient email is required");
  }

  try {
    return await prisma.patient.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw createHttpError(409, "Patient with this email already exists");
    }
    throw error;
  }
};
