import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCoordinatesToClinics() {
  console.log('Adding coordinates to existing clinics...');

  try {
    // Sample coordinates for New York City area for testing
    const clinicUpdates = [
      {
        name: 'City Care Medical Center',
        latitude: 40.7589,
        longitude: -73.9851,
        rating: 4.7,
        patientCount: 1250
      },
      {
        name: 'Sunrise Family Clinic',
        latitude: 40.7505,
        longitude: -73.9934,
        rating: 4.3,
        patientCount: 850
      },
      {
        name: 'HealthPlus Multispecialty Hospital',
        latitude: 40.7614,
        longitude: -73.9776,
        rating: 4.8,
        patientCount: 2100
      },
      {
        name: 'Green Valley Wellness Center',
        latitude: 40.7549,
        longitude: -73.9840,
        rating: 4.2,
        patientCount: 650
      },
      {
        name: 'Quick Care Walk-In Clinic',
        latitude: 40.7580,
        longitude: -73.9865,
        rating: 4.1,
        patientCount: 320
      }
    ];

    for (const update of clinicUpdates) {
      await prisma.clinic.updateMany({
        where: {
          name: update.name
        },
        data: {
          latitude: update.latitude,
          longitude: update.longitude,
          rating: update.rating,
          patientCount: update.patientCount
        }
      });
      console.log(`Updated clinic: ${update.name}`);
    }

    console.log('Successfully added coordinates to all clinics!');
  } catch (error) {
    console.error('Error updating clinics:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCoordinatesToClinics();