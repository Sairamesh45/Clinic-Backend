import prisma from "../../prisma/client.js";

export const listDoctors = async () => {
  return prisma.doctor.findMany({
    include: {
      clinic: true,
    },
  });
};
