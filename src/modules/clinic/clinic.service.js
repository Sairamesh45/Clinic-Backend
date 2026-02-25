import prisma from "../../prisma/client.js";

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c; // Distance in kilometers
  return d;
};

// Helper function to get clinic stats
const getClinicStats = async (clinic) => {
  const doctorIds = clinic.doctors.map((d) => d.id);

  // Get today's date range
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
    totalInQueue,
    inConsultation,
    waiting,
    booked,
    estimatedWaitTime, // in minutes
    nextToken,
  };
};

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

  // For each clinic, calculate queue stats
  const clinicsWithStats = await Promise.all(
    clinics.map(async (clinic) => {
      const stats = await getClinicStats(clinic);

      return {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        rating: clinic.rating || 4.5,
        patientCount: clinic.patientCount || 0,
        doctors: clinic.doctors,
        stats,
      };
    })
  );

  return clinicsWithStats;
};

export const getNearByClinics = async (userLat, userLng, radius = 50) => {
  const clinics = await prisma.clinic.findMany({
    where: {
      latitude: { not: null },
      longitude: { not: null },
    },
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

  // Filter clinics within the specified radius and add distance
  const nearbyClinics = [];
  
  for (const clinic of clinics) {
    const distance = calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude);
    
    if (distance <= radius) {
      const stats = await getClinicStats(clinic);
      
      nearbyClinics.push({
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        rating: clinic.rating || 4.5,
        patientCount: clinic.patientCount || 0,
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        doctors: clinic.doctors,
        stats,
      });
    }
  }

  // Sort by distance (closest first)
  nearbyClinics.sort((a, b) => a.distance - b.distance);

  return nearbyClinics;
};

export const searchClinics = async (searchQuery) => {
  const clinics = await prisma.clinic.findMany({
    where: {
      name: {
        contains: searchQuery,
        mode: 'insensitive',
      },
    },
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

  // For each clinic, calculate queue stats
  const clinicsWithStats = await Promise.all(
    clinics.map(async (clinic) => {
      const stats = await getClinicStats(clinic);

      return {
        id: clinic.id,
        name: clinic.name,
        address: clinic.address,
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        rating: clinic.rating || 4.5,
        patientCount: clinic.patientCount || 0,
        doctors: clinic.doctors,
        stats,
      };
    })
  );

  return clinicsWithStats;
};
