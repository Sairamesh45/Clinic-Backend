import prisma from "../prisma/client.js";

// Prisma @db.Time fields require an ISO-8601 DateTime value; we use a fixed epoch date.
const toTimeDate = (value) => {
  if (!value) return null;
  // Already a Date
  if (value instanceof Date) return value;
  // "HH:MM" or "HH:MM:SS"
  const trimmed = String(value).trim();
  return new Date(`1970-01-01T${trimmed.length === 5 ? trimmed + ':00' : trimmed}.000Z`);
};

const normalizeTimeFields = (data) => ({
  ...data,
  ...(data.startTime !== undefined ? { startTime: toTimeDate(data.startTime) } : {}),
  ...(data.endTime !== undefined ? { endTime: toTimeDate(data.endTime) } : {}),
});

const DoctorAvailabilityModel = {
  listForDoctor(doctorId) {
    return prisma.doctorAvailability.findMany({
      where: { doctorId },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });
  },

  listForClinic(clinicId) {
    return prisma.doctorAvailability.findMany({
      where: { clinicId },
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });
  },

  createBlock(data) {
    return prisma.doctorAvailability.create({ data: normalizeTimeFields(data) });
  },
  
  findById(id) {
    return prisma.doctorAvailability.findUnique({ where: { id } });
  },
  
  updateBlock(id, data) {
    return prisma.doctorAvailability.update({ where: { id }, data: normalizeTimeFields(data) });
  },
  
  deleteBlock(id) {
    return prisma.doctorAvailability.delete({ where: { id } });
  },
};

export default DoctorAvailabilityModel;
