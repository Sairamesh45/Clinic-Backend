import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data...');
  try {
    await prisma.appointment.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.vital.deleteMany();
    await prisma.user.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.clinic.deleteMany();
  } catch (error) {
    console.error('Error cleaning data:', error);
  }

  console.log('Seeding database...');

  // 1. Create Clinics with realistic locations
  const clinic1 = await prisma.clinic.create({
    data: {
      name: 'City Care Medical Center',
      address: '123 Downtown Ave, Metro City - 2.5 km away',
    },
  });

  const clinic2 = await prisma.clinic.create({
    data: {
      name: 'Sunrise Family Clinic',
      address: '456 Oak Street, Sunrise District - 3.8 km away',
    },
  });

  const clinic3 = await prisma.clinic.create({
    data: {
      name: 'HealthPlus Multispecialty Hospital',
      address: '789 Medical Plaza, Central Square - 1.2 km away',
    },
  });

  const clinic4 = await prisma.clinic.create({
    data: {
      name: 'Green Valley Wellness Center',
      address: '321 Valley Road, Green Park - 4.5 km away',
    },
  });

  const clinic5 = await prisma.clinic.create({
    data: {
      name: 'Quick Care Walk-In Clinic',
      address: '654 Market Street, Shopping District - 0.8 km away',
    },
  });

  console.log('Created Clinics:', [clinic1, clinic2, clinic3, clinic4, clinic5]);

  // 2. Create Doctors (2-3 per clinic)
  // Clinic 1 - City Care Medical Center
  const doctor1 = await prisma.doctor.create({
    data: {
      name: 'Dr. John Doe',
      specialty: 'General Practitioner',
      clinicId: clinic1.id,
    },
  });

  const doctor2 = await prisma.doctor.create({
    data: {
      name: 'Dr. Emily Johnson',
      specialty: 'Cardiologist',
      clinicId: clinic1.id,
    },
  });

  const doctor3 = await prisma.doctor.create({
    data: {
      name: 'Dr. Michael Chen',
      specialty: 'Orthopedic Surgeon',
      clinicId: clinic1.id,
    },
  });

  // Clinic 2 - Sunrise Family Clinic
  const doctor4 = await prisma.doctor.create({
    data: {
      name: 'Dr. Sarah Smith',
      specialty: 'Pediatrician',
      clinicId: clinic2.id,
    },
  });

  const doctor5 = await prisma.doctor.create({
    data: {
      name: 'Dr. Robert Williams',
      specialty: 'General Practitioner',
      clinicId: clinic2.id,
    },
  });

  // Clinic 3 - HealthPlus Multispecialty Hospital
  const doctor6 = await prisma.doctor.create({
    data: {
      name: 'Dr. Priya Patel',
      specialty: 'Dermatologist',
      clinicId: clinic3.id,
    },
  });

  const doctor7 = await prisma.doctor.create({
    data: {
      name: 'Dr. James Anderson',
      specialty: 'ENT Specialist',
      clinicId: clinic3.id,
    },
  });

  const doctor8 = await prisma.doctor.create({
    data: {
      name: 'Dr. Lisa Martinez',
      specialty: 'Neurologist',
      clinicId: clinic3.id,
    },
  });

  // Clinic 4 - Green Valley Wellness Center
  const doctor9 = await prisma.doctor.create({
    data: {
      name: 'Dr. David Kim',
      specialty: 'Internal Medicine',
      clinicId: clinic4.id,
    },
  });

  const doctor10 = await prisma.doctor.create({
    data: {
      name: 'Dr. Amanda Foster',
      specialty: 'Gynecologist',
      clinicId: clinic4.id,
    },
  });

  // Clinic 5 - Quick Care Walk-In Clinic
  const doctor11 = await prisma.doctor.create({
    data: {
      name: 'Dr. Christopher Lee',
      specialty: 'General Practitioner',
      clinicId: clinic5.id,
    },
  });

  const doctor12 = await prisma.doctor.create({
    data: {
      name: 'Dr. Rachel Green',
      specialty: 'Family Medicine',
      clinicId: clinic5.id,
    },
  });

  console.log('Created 12 Doctors across 5 Clinics');

  // 3. Create Patients
  const patient1 = await prisma.patient.create({
    data: {
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      name: 'Charlie Davis',
      email: 'charlie.davis@example.com',
    },
  });

  const patient4 = await prisma.patient.create({
    data: {
      name: 'Diana Moore',
      email: 'diana.moore@example.com',
    },
  });

  const patient5 = await prisma.patient.create({
    data: {
      name: 'Ethan Taylor',
      email: 'ethan.taylor@example.com',
    },
  });

  const patient6 = await prisma.patient.create({
    data: {
      name: 'Fiona Harris',
      email: 'fiona.harris@example.com',
    },
  });

  const patient7 = await prisma.patient.create({
    data: {
      name: 'George Clark',
      email: 'george.clark@example.com',
    },
  });

  const patient8 = await prisma.patient.create({
    data: {
      name: 'Hannah White',
      email: 'hannah.white@example.com',
    },
  });

  const patient9 = await prisma.patient.create({
    data: {
      name: 'Isaac Lewis',
      email: 'isaac.lewis@example.com',
    },
  });

  const patient10 = await prisma.patient.create({
    data: {
      name: 'Julia Walker',
      email: 'julia.walker@example.com',
    },
  });

  console.log('Created 10 Patients');

  // Create User accounts for Patients, Doctors, and Receptionists
  const hashedPassword = await bcrypt.hash('password123', 10); // Simple password for testing

  // Patient user account (linked to patient1)
  const patientUser = await prisma.user.create({
    data: {
      email: 'alice.patient@example.com',
      name: 'Alice Patient',
      password: hashedPassword,
      roles: 'patient',
      phone: '+15550001111',
      patientId: patient1.id,
    },
  });

  // Doctor user accounts (linked to doctor records)
  const doctorUser1 = await prisma.user.create({
    data: {
      email: 'john.doe@clinic.com',
      name: 'Dr. John Doe',
      password: hashedPassword,
      roles: 'doctor',
      phone: '+15550002222',
      doctorId: doctor1.id,
    },
  });

  const doctorUser2 = await prisma.user.create({
    data: {
      email: 'emily.johnson@clinic.com',
      name: 'Dr. Emily Johnson',
      password: hashedPassword,
      roles: 'doctor',
      phone: '+15550002223',
      doctorId: doctor2.id,
    },
  });

  const doctorUser3 = await prisma.user.create({
    data: {
      email: 'sarah.smith@clinic.com',
      name: 'Dr. Sarah Smith',
      password: hashedPassword,
      roles: 'doctor',
      phone: '+15550002224',
      doctorId: doctor4.id,
    },
  });

  const doctorUser4 = await prisma.user.create({
    data: {
      email: 'christopher.lee@clinic.com',
      name: 'Dr. Christopher Lee',
      password: hashedPassword,
      roles: 'doctor',
      phone: '+15550002225',
      doctorId: doctor11.id,
    },
  });

  // Receptionist accounts for each clinic
  const receptionist1 = await prisma.user.create({
    data: {
      email: 'reception@citycare.com',
      name: 'City Care Reception',
      password: hashedPassword,
      roles: 'reception',
      phone: '+15550003001',
    },
  });

  const receptionist2 = await prisma.user.create({
    data: {
      email: 'reception@sunrise.com',
      name: 'Sunrise Clinic Reception',
      password: hashedPassword,
      roles: 'reception',
      phone: '+15550003002',
    },
  });

  const receptionist3 = await prisma.user.create({
    data: {
      email: 'reception@healthplus.com',
      name: 'HealthPlus Reception',
      password: hashedPassword,
      roles: 'reception',
      phone: '+15550003003',
    },
  });

  const receptionist4 = await prisma.user.create({
    data: {
      email: 'reception@greenvalley.com',
      name: 'Green Valley Reception',
      password: hashedPassword,
      roles: 'reception',
      phone: '+15550003004',
    },
  });

  const receptionist5 = await prisma.user.create({
    data: {
      email: 'reception@quickcare.com',
      name: 'Quick Care Reception',
      password: hashedPassword,
      roles: 'reception',
      phone: '+15550003005',
    },
  });

  console.log('Created User Accounts:');
  console.log('  Patient: alice.patient@example.com / password123');
  console.log('  Doctors:');
  console.log('    - john.doe@clinic.com / password123 (Dr. John Doe - City Care)');
  console.log('    - emily.johnson@clinic.com / password123 (Dr. Emily Johnson - City Care)');
  console.log('    - sarah.smith@clinic.com / password123 (Dr. Sarah Smith - Sunrise Clinic)');
  console.log('    - christopher.lee@clinic.com / password123 (Dr. Christopher Lee - Quick Care)');
  console.log('  Receptionists:');
  console.log('    - reception@citycare.com / password123 (City Care Medical Center)');
  console.log('    - reception@sunrise.com / password123 (Sunrise Family Clinic)');
  console.log('    - reception@healthplus.com / password123 (HealthPlus Hospital)');
  console.log('    - reception@greenvalley.com / password123 (Green Valley Center)');
  console.log('    - reception@quickcare.com / password123 (Quick Care Clinic)');


  // 4. Create Appointments with realistic queues
  // Helper to get start of day for uniqueness constraint
  const getStartOfDay = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Create appointments for TODAY to simulate active queues
  // Dr. John Doe (doctor1) - City Care Medical Center - Busy queue
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'COMPLETED',
      doctorId: doctor1.id,
      patientId: patient1.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 2,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'IN_CONSULTATION',
      arrivalTime: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      doctorId: doctor1.id,
      patientId: patient2.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 3,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'ARRIVED',
      arrivalTime: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
      doctorId: doctor1.id,
      patientId: patient3.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 4,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'ARRIVED',
      arrivalTime: new Date(),
      doctorId: doctor1.id,
      patientId: patient4.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 5,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'BOOKED',
      doctorId: doctor1.id,
      patientId: patient5.id,
    },
  });

  // Dr. Emily Johnson (doctor2) - City Care Medical Center - Medium queue
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'COMPLETED',
      doctorId: doctor2.id,
      patientId: patient6.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 2,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'ARRIVED',
      arrivalTime: new Date(Date.now() - 10 * 60 * 1000),
      doctorId: doctor2.id,
      patientId: patient7.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 3,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'BOOKED',
      doctorId: doctor2.id,
      patientId: patient8.id,
    },
  });

  // Dr. Sarah Smith (doctor4) - Sunrise Family Clinic - Light queue
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'IN_CONSULTATION',
      arrivalTime: new Date(Date.now() - 20 * 60 * 1000),
      doctorId: doctor4.id,
      patientId: patient9.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 2,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'BOOKED',
      doctorId: doctor4.id,
      patientId: patient10.id,
    },
  });

  // Dr. Priya Patel (doctor6) - HealthPlus - Available
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'COMPLETED',
      doctorId: doctor6.id,
      patientId: patient1.id,
    },
  });

  // Dr. Christopher Lee (doctor11) - Quick Care Walk-In - Very busy
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'COMPLETED',
      doctorId: doctor11.id,
      patientId: patient2.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 2,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'COMPLETED',
      doctorId: doctor11.id,
      patientId: patient3.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 3,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'IN_CONSULTATION',
      arrivalTime: new Date(Date.now() - 8 * 60 * 1000),
      doctorId: doctor11.id,
      patientId: patient4.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 4,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'ARRIVED',
      arrivalTime: new Date(Date.now() - 3 * 60 * 1000),
      doctorId: doctor11.id,
      patientId: patient5.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 5,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'ARRIVED',
      arrivalTime: new Date(),
      doctorId: doctor11.id,
      patientId: patient6.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 6,
      date: today,
      dateOnly: getStartOfDay(today),
      status: 'BOOKED',
      doctorId: doctor11.id,
      patientId: patient7.id,
    },
  });

  // TOMORROW's appointments
  await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: tomorrow,
      dateOnly: getStartOfDay(tomorrow),
      status: 'BOOKED',
      doctorId: doctor1.id,
      patientId: patient1.id,
    },
  });

  await prisma.appointment.create({
    data: {
      tokenNumber: 2,
      date: tomorrow,
      dateOnly: getStartOfDay(tomorrow),
      status: 'BOOKED',
      doctorId: doctor2.id,
      patientId: patient2.id,
    },
  });

  const appointment1 = await prisma.appointment.create({
    data: {
      tokenNumber: 1,
      date: tomorrow,
      dateOnly: getStartOfDay(tomorrow),
      status: 'BOOKED',
      doctorId: doctor4.id,
      patientId: patient3.id,
    },
  });

  console.log('Created Appointments with realistic queues');

  await prisma.vital.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        systolic: 118,
        diastolic: 76,
        heartRate: 72,
        temperature: 36.7,
        respiration: 16,
        notes: 'Routine follow-up vitals',
      },
      {
        patientId: patient2.id,
        doctorId: doctor1.id,
        systolic: 125,
        diastolic: 82,
        heartRate: 78,
        temperature: 37.0,
        respiration: 18,
        notes: 'Post-visit vitals review',
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: patientUser.id,
        title: 'Appointment Reminder',
        message: 'You have an appointment tomorrow.',
      },
      {
        userId: doctorUser1.id,
        title: 'New Patient Checked In',
        message: 'A patient has arrived for their appointment.',
      },
      {
        userId: receptionist1.id,
        title: 'Queue Update',
        message: 'Dr. John Doe has 5 patients in queue.',
      },
    ],
  });

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📋 LOGIN CREDENTIALS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('PATIENT:');
  console.log('  Email: alice.patient@example.com');
  console.log('  Password: password123');
  console.log('\nDOCTORS:');
  console.log('  Email: john.doe@clinic.com | Password: password123');
  console.log('  Email: emily.johnson@clinic.com | Password: password123');
  console.log('  Email: sarah.smith@clinic.com | Password: password123');
  console.log('  Email: christopher.lee@clinic.com | Password: password123');
  console.log('\nRECEPTIONISTS:');
  console.log('  Email: reception@citycare.com | Password: password123');
  console.log('  Email: reception@sunrise.com | Password: password123');
  console.log('  Email: reception@healthplus.com | Password: password123');
  console.log('  Email: reception@greenvalley.com | Password: password123');
  console.log('  Email: reception@quickcare.com | Password: password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
