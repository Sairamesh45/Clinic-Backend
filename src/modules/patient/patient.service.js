import prisma from "../../prisma/client.js";

export const listPatients = async () => {
  return prisma.patient.findMany({
    include: {
      appointments: true,
    },
  });
};
