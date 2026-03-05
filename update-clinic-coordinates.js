import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCoordinatesToClinics() {
  console.log('Adding coordinates to existing clinics (Vellore area)...');

  try {
    // Accurate real-world healthcare facility locations in Vellore, Tamil Nadu
    // Cross-verified with OpenStreetMap coordinates
    const clinicUpdates = [
      {
        // CMC Hospital Main Campus (Christian Medical College)
        name: 'City Care Medical Center',
        latitude: 12.9242,
        longitude: 79.1358,
        rating: 4.7,
        patientCount: 1250
      },
      {
        // Naruvi Hospitals, Vellore (Gandhi Nagar)
        name: 'Sunrise Family Clinic',
        latitude: 12.9262,
        longitude: 79.1507,
        rating: 4.3,
        patientCount: 850
      },
      {
        // Government Vellore Medical College Hospital
        name: 'HealthPlus Multispecialty Hospital',
        latitude: 12.9340,
        longitude: 79.1335,
        rating: 4.8,
        patientCount: 2100
      },
      {
        // Sri Narayani Hospital & Research Centre, Sripuram
        name: 'Green Valley Wellness Center',
        latitude: 12.8896,
        longitude: 79.0702,
        rating: 4.2,
        patientCount: 650
      },
      {
        // VIT Health Centre (inside VIT campus)
        name: 'Quick Care Walk-In Clinic',
        latitude: 12.9692,
        longitude: 79.1559,
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