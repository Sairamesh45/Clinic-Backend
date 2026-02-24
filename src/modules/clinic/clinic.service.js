import prisma from "../../prisma/client.js";

export const listClinics = async () => {
  const clinics = await prisma.clinic.findMany({
    include: {
      doctors: {
        select: {
          id: true,
          name: true,
          specialty: true,
        },
      },
    },
  });

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // For each clinic, calculate queue stats
  const clinicsWithStats = await Promise.all(
    clinics.map(async (clinic) => {
      const doctorIds = clinic.doctors.map((d) => d.id);

      // Get today's appointments for this clinic's doctors
      const appointments = await prisma.appointment.findMany({
        where: {
          doctorId: { in: doctorIds },
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: { in: ['BOOKED', 'ARRIVED', 'IN_CONSULTATION'] },
        },
      });

      // Calculate stats
      const totalInQueue = appointments.length;
      const inConsultation = appointments.filter((a) => a.status === 'IN_CONSULTATION').length;
      const waiting = appointments.filter((a) => a.status === 'ARRIVED').length;
      const booked = appointments.filter((a) => a.status === 'BOOKED').length;

      // Calculate approximate waiting time (15 mins per person in queue)
      const avgConsultationTime = 15; // minutes
      const estimatedWaitTime = totalInQueue * avgConsultationTime;

      // Get next token number (max token + 1)
      const maxToken = appointments.reduce((max, a) => Math.max(max, a.tokenNumber || 0), 0);
      const nextToken = maxToken + 1;

      return {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        doctors: clinic.doctors,
        stats: {
          totalInQueue,
          inConsultation,
          waiting,
          booked,
          estimatedWaitTime, // in minutes
          nextToken,
        },
      };
    })
  );

  return clinicsWithStats;
};
