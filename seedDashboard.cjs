const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const revenueData = [
  { name: 'Mon', value: 2000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2500 },
  { name: 'Thu', value: 4000 },
  { name: 'Fri', value: 3500 },
  { name: 'Sat', value: 4500 },
  { name: 'Sun', value: 3000 },
];

const patientVisitsData = [
  { time: '08:00', visits: 10 },
  { time: '10:00', visits: 30 },
  { time: '12:00', visits: 45 },
  { time: '14:00', visits: 25 },
  { time: '16:00', visits: 20 },
  { time: '18:00', visits: 40 },
  { time: '20:00', visits: 60 },
];

async function seed() {
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Downtown Medical Center',
      address: '123 Main St, Cityville',
      rating: 4.8,
      patientCount: 1200
    }
  });

  const doctor = await prisma.doctor.create({
    data: {
      name: 'Dr. Julian Vance',
      specialty: 'Cardiology Specialist',
      clinicId: clinic.id,
      revenueData: revenueData,
      patientVisitsData: patientVisitsData,
      totalAppointmentsCount: 24,
      completedAppointments: 16,
      remainingAppointments: 8,
      appointmentGrowth: '+12%'
    }
  });

  console.log('Created clinic:', clinic.name);
  console.log('Created doctor:', doctor.name);
}

seed().catch(console.error).finally(() => prisma.$disconnect());
