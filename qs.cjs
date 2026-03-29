const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "revenueData" JSONB, ADD COLUMN IF NOT EXISTS "patientVisitsData" JSONB, ADD COLUMN IF NOT EXISTS "totalAppointmentsCount" INT DEFAULT 24, ADD COLUMN IF NOT EXISTS "completedAppointments" INT DEFAULT 16, ADD COLUMN IF NOT EXISTS "remainingAppointments" INT DEFAULT 8, ADD COLUMN IF NOT EXISTS "appointmentGrowth" TEXT DEFAULT \'+12%\'');
  console.log('Altered Doctor table!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
