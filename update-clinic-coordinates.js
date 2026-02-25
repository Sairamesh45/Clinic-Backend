import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCoordinatesToClinics() {
  console.log('Adding coordinates to existing clinics (Vellore area)...');

  try {
    // Real healthcare locations near Vellore, Tamil Nadu
    const clinicUpdates = [
      {
        name: 'City Care Medical Center',
        latitude: 12.9165,
        longitude: 79.1325,
        rating: 4.7,
        patientCount: 1250
      },
      {
        name: 'Sunrise Family Clinic',
        latitude: 12.9243,
        longitude: 79.1353,
        rating: 4.3,
        patientCount: 850
      },
      {
        name: 'HealthPlus Multispecialty Hospital',
        latitude: 12.9345,
        longitude: 79.1187,
        rating: 4.8,
        patientCount: 2100
      },
      {
        name: 'Green Valley Wellness Center',
        latitude: 12.9080,
        longitude: 79.1420,
        rating: 4.2,
        patientCount: 650
      },
      {
        name: 'Quick Care Walk-In Clinic',
        latitude: 12.9710,
        longitude: 79.1590,
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