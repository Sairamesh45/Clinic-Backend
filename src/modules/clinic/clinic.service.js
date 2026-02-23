import prisma from "../../prisma/client.js";

export const listClinics = async () => {
  return prisma.clinic.findMany();
};
