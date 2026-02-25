import { PrismaClient } from "@prisma/client";

// Create Prisma client with error handling
const createPrismaClient = () => {
  try {
    return new PrismaClient({
      log: ['error'],
      errorFormat: 'pretty',
    });
  } catch (error) {
    console.error('❌ Failed to create Prisma client:', error.message);
    return null;
  }
};

const prisma = createPrismaClient();

if (prisma) {
  console.log('✅ Prisma client created successfully');
  
  // Connect to database
  prisma.$connect()
    .then(() => console.log('🗄️  Database connected'))
    .catch(error => console.error('❌ Database connection failed:', error.message));
} else {
  console.error('❌ Prisma client creation failed');
}

const shutdown = async () => {
  if (prisma) {
    try {
      await prisma.$disconnect();
      console.log('🔌 Database disconnected');
    } catch (error) {
      console.error('Error during shutdown:', error.message);
    }
  }
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default prisma;
