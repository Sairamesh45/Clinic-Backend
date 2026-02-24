import prisma from "../../prisma/client.js";

const getDayRange = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    throw Object.assign(new Error("Invalid appointment date"), { status: 400 });
  }

  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  return { startOfDay, endOfDay };
};

const statusTransitions = {
  BOOKED: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["IN_CONSULTATION"],
  IN_CONSULTATION: ["COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

const ensureTransition = (current, next) => {
  if (!statusTransitions[current]?.includes(next)) {
    throw Object.assign(
      new Error(`Transition from ${current} to ${next} is not allowed`),
      { status: 409 }
    );
  }
};

const getTodayRange = () => {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  return { startOfDay, endOfDay };
};

const APPOINTMENT_INCLUDE = {
  doctor: {
    include: {
      clinic: true,
    },
  },
  patient: true,
};

const normalizeRoles = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles])
    .map((role) => String(role ?? "").trim().toLowerCase())
    .filter(Boolean);

const parseNumberParam = (value, name) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw Object.assign(new Error(`${name} must be a valid number`), { status: 400 });
  }
  return num;
};

const parseBooleanParam = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

const buildUserAppointmentWhere = ({ user, patientIdFilter, statusFilter, upcoming }) => {
  const normalizedRoles = normalizeRoles(user.roles);
  const isDoctor = normalizedRoles.includes("doctor");
  const isPatient = normalizedRoles.includes("patient");

  if (!isDoctor && !isPatient) {
    throw Object.assign(new Error("User role not authorized"), { status: 403 });
  }

  const where = {};

  if (isPatient) {
    const patientIdClaim = user.patientId ?? user.id;
    const patientId = parseNumberParam(patientIdClaim, "patientId");
    if (patientId === undefined) {
      throw Object.assign(new Error("Unable to resolve patient identity"), { status: 400 });
    }
    where.patientId = patientId;
  } else if (isDoctor) {
    const doctorIdClaim = user.doctorId ?? user.id;
    const doctorId = parseNumberParam(doctorIdClaim, "doctorId");
    if (doctorId === undefined) {
      throw Object.assign(new Error("Unable to resolve doctor identity"), { status: 400 });
    }
    where.doctorId = doctorId;
    if (patientIdFilter !== undefined) {
      where.patientId = patientIdFilter;
    }
  }

  if (statusFilter) {
    where.status = statusFilter;
  }

  if (upcoming) {
    // Use start of today so that appointments booked for today still appear;
    // exclude already-finished or cancelled appointments
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    where.date = { gte: startOfToday };
    if (!statusFilter) {
      where.status = { notIn: ["COMPLETED", "CANCELLED"] };
    }
  }

  return where;
};

export const listAppointments = async (filters = {}) => {
  return prisma.appointment.findMany({
    where: filters,
    include: {
      doctor: {
        include: {
          clinic: true,
        },
      },
      patient: true,
    },
  });
};

export const listAppointmentsForUser = async ({ user, filters = {}, pagination = {} }) => {
  const patientIdFilter = parseNumberParam(filters.patientId, "patientId");
  const statusFilter = typeof filters.status === "string" && filters.status.trim()
    ? filters.status.trim()
    : undefined;
  const upcoming = parseBooleanParam(filters.upcoming);

  const where = buildUserAppointmentWhere({
    user,
    patientIdFilter,
    statusFilter,
    upcoming,
  });

  const parsedPage = Number.parseInt(pagination.page, 10);
  const parsedLimit = Number.parseInt(pagination.limit, 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 25;
  const skip = (page - 1) * limit;

  const total = await prisma.appointment.count({ where });
  const items = await prisma.appointment.findMany({
    where,
    include: APPOINTMENT_INCLUDE,
    orderBy: {
      date: "asc",
    },
    skip,
    take: limit,
  });

  return {
    items,
    meta: {
      total,
      page,
      limit,
    },
  };
};

export const createAppointmentRecord = async (payload) => {
  const { doctorId, patientId, date } = payload;
  const { startOfDay, endOfDay } = getDayRange(date);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.appointment.findFirst({
      where: {
        doctorId,
        patientId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (existing) {
      throw Object.assign(new Error("Patient already has an appointment with this doctor on the requested date"), { status: 409 });
    }

    const lastTokenForDay = await tx.appointment.findFirst({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        tokenNumber: "desc",
      },
      select: {
        tokenNumber: true,
      },
    });

    const tokenNumber = (lastTokenForDay?.tokenNumber ?? 0) + 1;

    return tx.appointment.create({
      data: {
        ...payload,
        tokenNumber,
        dateOnly: startOfDay,
      },
    });
  });
};

export const markAppointmentArrived = async (appointmentId) => {
  const id = Number(appointmentId);
  if (Number.isNaN(id)) {
    throw Object.assign(new Error("Invalid appointment id"), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw Object.assign(new Error("Appointment not found"), { status: 404 });
    }

    ensureTransition(appointment.status, "ARRIVED");

    return tx.appointment.update({
      where: { id },
      data: {
        status: "ARRIVED",
        arrivalTime: new Date(),
      },
    });
  });
};

export const moveNextAppointmentToConsultation = async (doctorIdParam) => {
  const doctorId = Number(doctorIdParam);
  if (Number.isNaN(doctorId)) {
    throw Object.assign(new Error("Invalid doctor id"), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const nextAppointment = await tx.appointment.findFirst({
      where: {
        doctorId,
        status: "ARRIVED",
      },
      orderBy: {
        tokenNumber: "asc",
      },
      include: {
        patient: true,
      },
    });

    if (!nextAppointment) {
      return null;
    }

    ensureTransition(nextAppointment.status, "IN_CONSULTATION");

    // Use a SELECT ... FOR UPDATE SKIP LOCKED pattern via a raw query to
    // atomically pick the next ARRIVED appointment and mark it IN_CONSULTATION.
    // This avoids races where concurrent callers pick the same row.
    const result = await tx.$queryRaw`
      WITH cte AS (
        SELECT id FROM "Appointment"
        WHERE "doctorId" = ${doctorId} AND status = 'ARRIVED'
        ORDER BY "tokenNumber" ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      UPDATE "Appointment"
      SET status = 'IN_CONSULTATION'
      WHERE id IN (SELECT id FROM cte)
      RETURNING id;
    `;

    // result will be an array of rows; if empty no appointment was moved
    if (!result || result.length === 0) {
      return null;
    }

    const movedId = result[0].id ?? (result[0].ID ?? null);
    if (!movedId) return null;

    const updated = await tx.appointment.findUnique({
      where: { id: movedId },
      include: { patient: true },
    });

    return updated;
  });
};

export const markAppointmentCompleted = async (appointmentId) => {
  const id = Number(appointmentId);
  if (Number.isNaN(id)) {
    throw Object.assign(new Error("Invalid appointment id"), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw Object.assign(new Error("Appointment not found"), { status: 404 });
    }

    ensureTransition(appointment.status, "COMPLETED");

    return tx.appointment.update({
      where: { id },
      data: {
        status: "COMPLETED",
      },
    });
  });
};

export const cancelAppointment = async (appointmentId) => {
  const id = Number(appointmentId);
  if (Number.isNaN(id)) {
    throw Object.assign(new Error("Invalid appointment id"), { status: 400 });
  }

  return prisma.$transaction(async (tx) => {
    const appointment = await tx.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw Object.assign(new Error("Appointment not found"), { status: 404 });
    }

    ensureTransition(appointment.status, "CANCELLED");

    return tx.appointment.update({
      where: { id },
      data: {
        status: "CANCELLED",
      },
    });
  });
};

export const getAppointmentQueue = async (doctorIdParam, patientIdParam) => {
  const doctorId = Number(doctorIdParam);
  if (Number.isNaN(doctorId)) {
    throw Object.assign(new Error("Invalid doctor id"), { status: 400 });
  }

  const patientIdProvided = patientIdParam !== undefined && patientIdParam !== null && patientIdParam !== "";
  const patientId = patientIdProvided ? Number(patientIdParam) : undefined;
  if (patientIdProvided && Number.isNaN(patientId)) {
    throw Object.assign(new Error("Invalid patient id"), { status: 400 });
  }

  const { startOfDay, endOfDay } = getTodayRange();

  return prisma.$transaction(async (tx) => {
    const currentInConsultation = await tx.appointment.findFirst({
      where: {
        doctorId,
        status: "IN_CONSULTATION",
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        tokenNumber: "asc",
      },
      include: {
        patient: true,
      },
    });

    const bookedToday = await tx.appointment.count({
      where: {
        doctorId,
        status: "BOOKED",
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const arrivedToday = await tx.appointment.count({
      where: {
        doctorId,
        status: "ARRIVED",
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const arrivedAppointments = await tx.appointment.findMany({
      where: {
        doctorId,
        status: "ARRIVED",
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: {
        tokenNumber: "asc",
      },
      include: {
        patient: true,
      },
    });

    let patientPosition;
    if (patientIdProvided) {
      const patientAppointment = await tx.appointment.findFirst({
        where: {
          doctorId,
          patientId,
          date: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
        orderBy: {
          tokenNumber: "asc",
        },
      });

      if (patientAppointment) {
        const arrivedBeforeCount = await tx.appointment.count({
          where: {
            doctorId,
            status: "ARRIVED",
            date: {
              gte: startOfDay,
              lt: endOfDay,
            },
            tokenNumber: {
              lt: patientAppointment.tokenNumber,
            },
          },
        });

        patientPosition = {
          tokenNumber: patientAppointment.tokenNumber,
          appointmentId: patientAppointment.id,
          arrivedTokensBefore: arrivedBeforeCount,
          estimatedWaitMinutes: arrivedBeforeCount * 10,
        };
      }
    }

    return {
      currentInConsultation: currentInConsultation
        ? {
            appointmentId: currentInConsultation.id,
            tokenNumber: currentInConsultation.tokenNumber,
            patient: currentInConsultation.patient,
          }
        : null,
      bookedToday,
      arrivedToday,
      arrived: arrivedAppointments.map((appointment) => ({
        appointmentId: appointment.id,
        tokenNumber: appointment.tokenNumber,
        patient: appointment.patient,
      })),
      patientPosition,
    };
  });
};
