import prisma from "../../prisma/client.js";

export const listDoctors = async () => {
  return prisma.doctor.findMany({
    include: {
      clinic: true,
    },
  });
};

export const getDoctorById = async (id) => {
  return prisma.doctor.findUnique({
    where: { id: parseInt(id) },
    include: { clinic: true },
  });
};

