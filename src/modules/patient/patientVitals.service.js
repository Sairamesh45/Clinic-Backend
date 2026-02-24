import prisma from "../../prisma/client.js";

const normalizeRoles = (roles = []) =>
  (Array.isArray(roles) ? roles : [roles])
    .map((role) => String(role ?? "").trim().toLowerCase())
    .filter(Boolean);

const parseNumberParam = (value, name) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw Object.assign(new Error(`${name} must be a valid number`), { status: 400 });
  }
  return parsed;
};

const ensureDoctorPatientAssignment = async (doctorId, patientId) => {
  const assignment = await prisma.appointment.findFirst({
    where: {
      doctorId,
      patientId,
    },
    select: { id: true },
  });
  return Boolean(assignment);
};

export const listPatientVitalsForUser = async ({ patientIdParam, user, limitParam }) => {
  const patientId = parseNumberParam(patientIdParam, "patientId");
  if (patientId === undefined) {
    throw Object.assign(new Error("Patient id is required"), { status: 400 });
  }

  if (!user) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  const roles = normalizeRoles(user.roles);
  const isPatient = roles.includes("patient");
  const isDoctor = roles.includes("doctor");

  if (!isPatient && !isDoctor) {
    throw Object.assign(new Error("User role not authorized"), { status: 403 });
  }

  let authorized = false;

  if (isPatient) {
    const patientClaim = parseNumberParam(user.patientId ?? user.id, "patientId");
    if (patientClaim !== patientId) {
      throw Object.assign(new Error("Patients can only fetch their own vitals"), { status: 403 });
    }
    authorized = true;
  }

  if (!authorized && isDoctor) {
    const doctorId = parseNumberParam(user.doctorId ?? user.id, "doctorId");
    if (doctorId === undefined) {
      throw Object.assign(new Error("Unable to resolve doctor identity"), { status: 400 });
    }

    const hasAccess = await ensureDoctorPatientAssignment(doctorId, patientId);
    if (!hasAccess) {
      throw Object.assign(new Error("Doctor not assigned to this patient"), { status: 403 });
    }
    authorized = true;
  }

  if (!authorized) {
    throw Object.assign(new Error("User not authorized"), { status: 403 });
  }

  const limit = parseNumberParam(limitParam, "limit");
  const take = limit !== undefined ? Math.min(Math.max(limit, 1), 100) : 20;

  const vitals = await prisma.vital.findMany({
    where: {
      patientId,
    },
    include: {
      doctor: {
        select: {
          id: true,
          name: true,
          specialty: true,
        },
      },
    },
    orderBy: {
      recordedAt: "desc",
    },
    take,
  });

  return vitals;
};
