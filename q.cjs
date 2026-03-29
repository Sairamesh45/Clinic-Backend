const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Doctor" ADD COLUMN IF NOT EXISTS "revenueGrowth" TEXT DEFAULT \'+8.4%\'');
  console.log('Altered Doctor');
}
main().finally(()=>prisma.$disconnect());