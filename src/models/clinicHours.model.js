import prisma from "../prisma/client.js";

// Prisma @db.Time fields require a full ISO-8601 DateTime; use a fixed epoch date.
const toTimeDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const trimmed = String(value).trim();
  return new Date(`1970-01-01T${trimmed.length === 5 ? trimmed + ':00' : trimmed}.000Z`);
};

const ClinicHoursModel = {
  listForClinic(clinicId) {
    return prisma.clinicHour.findMany({
      where: { clinicId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  findForDay(clinicId, dayOfWeek) {
    return prisma.clinicHour.findUnique({
      where: {
        clinicId_dayOfWeek: {
          clinicId,
          dayOfWeek,
        },
      },
    });
  },

  upsertDay(payload) {
    const { clinicId, dayOfWeek, openTime, closeTime, ...rest } = payload;
    const normalizedData = {
      ...rest,
      openTime: toTimeDate(openTime),
      closeTime: toTimeDate(closeTime),
    };
    return prisma.clinicHour.upsert({
      where: {
        clinicId_dayOfWeek: {
          clinicId,
          dayOfWeek,
        },
      },
      create: { clinicId, dayOfWeek, ...normalizedData },
      update: normalizedData,
    });
  },

  deleteDay(clinicId, dayOfWeek) {
    return prisma.clinicHour.delete({
      where: {
        clinicId_dayOfWeek: {
          clinicId,
          dayOfWeek,
        },
      },
    });
  },
};

export default ClinicHoursModel;
