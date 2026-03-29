const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const doctor = await prisma.doctor.findFirst();
  if(!doctor) return;
  const patient1 = await prisma.patient.create({ data: { name: 'Robert Fox' } });
  const patient2 = await prisma.patient.create({ data: { name: 'Jenny Wilson' } });
  const patient3 = await prisma.patient.create({ data: { name: 'Albert Flores' } });
  const patient4 = await prisma.patient.create({ data: { name: 'Dianne Russell' } });
  
  await prisma.appointment.create({
    data: {
      doctorId: doctor.id, patientId: patient1.id, clinicId: doctor.clinicId,
      date: new Date(new Date().setHours(9, 30, 0, 0)),
      status: 'BOOKED', reason: 'Annual Checkup'
    }
  });
  await prisma.appointment.create({
    data: {
      doctorId: doctor.id, patientId: patient2.id, clinicId: doctor.clinicId,
      date: new Date(new Date().setHours(10, 15, 0, 0)),
      status: 'BOOKED', reason: 'Lab Results Review'
    }
  });
  await prisma.appointment.create({
    data: {
      doctorId: doctor.id, patientId: patient3.id, clinicId: doctor.clinicId,
      date: new Date(new Date().setHours(11, 0, 0, 0)),
      status: 'BOOKED', reason: 'Urgent Follow-up'
    }
  });
  await prisma.appointment.create({
    data: {
      doctorId: doctor.id, patientId: patient4.id, clinicId: doctor.clinicId,
      date: new Date(new Date().setHours(11, 45, 0, 0)),
      status: 'BOOKED', reason: 'Routine Screen'
    }
  });
  console.log('Seeded appointments for Doctor!');
}
seed().finally(()=>prisma.$disconnect());
